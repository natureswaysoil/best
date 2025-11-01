#!/usr/bin/env python3
"""
Simplified deployment verification without crewAI dependency.
Analyzes the deployment script, verifies configuration, and provides deployment guidance.
"""

import os
import sys
import json
import subprocess
import re
from typing import Dict, List, Tuple

def analyze_deployment_script(script_path: str) -> Dict:
    """Analyze the bash deployment script"""
    print(f"\n📝 Analyzing deployment script: {script_path}")
    print("=" * 70)
    
    try:
        with open(script_path, 'r') as f:
            content = f.read()
        
        analysis = {
            "project_id": None,
            "region": None,
            "service_name": None,
            "image_name": None,
            "required_apis": [],
            "secrets": [],
            "scheduler_jobs": [],
            "issues": [],
            "commands": {
                "enable_apis": [],
                "create_secrets": [],
                "deploy": [],
                "setup_scheduler": []
            }
        }
        
        # Extract configuration variables
        for line in content.split('\n'):
            line = line.strip()
            
            if line.startswith('PROJECT_ID='):
                analysis["project_id"] = line.split('=', 1)[1].strip('"').strip("'")
            elif line.startswith('REGION='):
                analysis["region"] = line.split('=', 1)[1].strip('"').strip("'")
            elif line.startswith('SERVICE_NAME='):
                analysis["service_name"] = line.split('=', 1)[1].strip('"').strip("'")
            elif line.startswith('IMAGE_NAME='):
                analysis["image_name"] = line.split('=', 1)[1].strip('"').strip("'")
            
            # Extract API services
            if 'gcloud services enable' in line:
                if '.googleapis.com' in line:
                    apis = re.findall(r'[\w-]+\.googleapis\.com', line)
                    analysis["required_apis"].extend(apis)
            
            # Extract secrets
            if 'gcloud secrets create' in line:
                match = re.search(r'gcloud secrets create\s+([^\s]+)', line)
                if match:
                    analysis["secrets"].append(match.group(1))
            
            # Extract scheduler jobs
            if 'gcloud scheduler jobs create http' in line:
                match = re.search(r'create http\s+([^\s]+)', line)
                if match:
                    analysis["scheduler_jobs"].append(match.group(1))
        
        # Remove duplicates
        analysis["required_apis"] = list(set(analysis["required_apis"]))
        analysis["secrets"] = list(set(analysis["secrets"]))
        analysis["scheduler_jobs"] = list(set(analysis["scheduler_jobs"]))
        
        # Check for issues
        if not analysis["project_id"]:
            analysis["issues"].append("❌ No PROJECT_ID found in script")
        else:
            print(f"✅ Project ID: {analysis['project_id']}")
            
        if not analysis["region"]:
            analysis["issues"].append("❌ No REGION found in script")
        else:
            print(f"✅ Region: {analysis['region']}")
            
        if not analysis["service_name"]:
            analysis["issues"].append("❌ No SERVICE_NAME found in script")
        else:
            print(f"✅ Service Name: {analysis['service_name']}")
            
        if not analysis["secrets"]:
            analysis["issues"].append("⚠️  No secrets configuration found")
        else:
            print(f"✅ Secrets to create: {len(analysis['secrets'])}")
            for secret in analysis["secrets"]:
                print(f"   - {secret}")
        
        if not analysis["required_apis"]:
            analysis["issues"].append("⚠️  No API services found")
        else:
            print(f"✅ APIs to enable: {len(analysis['required_apis'])}")
            for api in analysis["required_apis"]:
                print(f"   - {api}")
        
        if analysis["scheduler_jobs"]:
            print(f"✅ Scheduler jobs: {len(analysis['scheduler_jobs'])}")
            for job in analysis["scheduler_jobs"]:
                print(f"   - {job}")
        
        return analysis
        
    except Exception as e:
        print(f"❌ Error analyzing script: {str(e)}")
        return {"error": str(e)}

def check_gcloud_setup() -> Tuple[bool, str]:
    """Check if gcloud is installed and authenticated"""
    print("\n🔍 Checking gcloud setup...")
    print("=" * 70)
    
    # Check if gcloud is installed
    try:
        result = subprocess.run(
            ["gcloud", "version"],
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode != 0:
            return False, "gcloud command failed"
        print("✅ Google Cloud SDK is installed")
    except FileNotFoundError:
        return False, "gcloud not found - install from https://cloud.google.com/sdk/docs/install"
    except Exception as e:
        return False, f"Error checking gcloud: {str(e)}"
    
    # Check authentication
    try:
        result = subprocess.run(
            ["gcloud", "auth", "list", "--filter=status:ACTIVE", "--format=value(account)"],
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode == 0 and result.stdout.strip():
            account = result.stdout.strip().split('\n')[0]
            print(f"✅ Authenticated as: {account}")
            return True, account
        else:
            return False, "Not authenticated - run: gcloud auth login"
    except Exception as e:
        return False, f"Error checking authentication: {str(e)}"

def verify_project(project_id: str) -> bool:
    """Verify that the project exists and is accessible"""
    print(f"\n🔍 Verifying project: {project_id}")
    print("=" * 70)
    
    try:
        result = subprocess.run(
            ["gcloud", "projects", "describe", project_id],
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode == 0:
            print(f"✅ Project {project_id} is accessible")
            return True
        else:
            print(f"❌ Project {project_id} not found or not accessible")
            print(f"   Error: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error verifying project: {str(e)}")
        return False

def test_post_video(service_url: str) -> bool:
    """Test post a video to verify the deployment"""
    print(f"\n🎬 Testing video post to: {service_url}")
    print("=" * 70)
    
    try:
        import requests
        
        # Test endpoint availability
        print("Checking service health...")
        try:
            response = requests.get(f"{service_url}/health", timeout=10)
            print(f"Health check: {response.status_code}")
        except:
            print("⚠️  Health endpoint not available (may be normal)")
        
        # Test posting
        print("\nAttempting test post...")
        payload = {
            "action": "test_post",
            "platform": "twitter",
            "test_mode": True
        }
        
        response = requests.post(
            f"{service_url}/api/social-automation",
            json=payload,
            timeout=120
        )
        
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code == 200:
            print("✅ Test post successful!")
            return True
        else:
            print(f"⚠️  Test post returned {response.status_code}")
            return False
            
    except ImportError:
        print("❌ requests library not installed: pip install requests")
        return False
    except Exception as e:
        print(f"❌ Error testing post: {str(e)}")
        return False

def main():
    print("🚀 Deployment Verification System")
    print("=" * 70)
    
    script_path = "./deploy-social-automation.sh"
    
    # Step 1: Analyze script
    analysis = analyze_deployment_script(script_path)
    
    if "error" in analysis:
        print(f"\n❌ Failed to analyze script")
        return 1
    
    # Step 2: Check gcloud setup
    gcloud_ok, gcloud_msg = check_gcloud_setup()
    if not gcloud_ok:
        print(f"\n❌ gcloud setup issue: {gcloud_msg}")
        print("\n📋 Next steps:")
        print("1. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install")
        print("2. Authenticate: gcloud auth login")
        print("3. Set project: gcloud config set project natureswaysoil-video")
        return 1
    
    # Step 3: Verify project
    if analysis.get("project_id"):
        project_ok = verify_project(analysis["project_id"])
        if not project_ok:
            print(f"\n⚠️  Project {analysis['project_id']} is not accessible")
            print("   You may need to create it or check permissions")
    
    # Step 4: Provide deployment commands
    print("\n📋 Deployment Commands:")
    print("=" * 70)
    print("\n1. Enable required APIs:")
    if analysis.get("required_apis"):
        apis = " \\\n    ".join(analysis["required_apis"])
        print(f"   gcloud services enable \\\n    {apis}")
    
    print("\n2. Create secrets (replace with real values):")
    if analysis.get("secrets"):
        for secret in analysis["secrets"]:
            env_var = secret.upper().replace('-', '_')
            print(f"   echo -n \"YOUR_{env_var}\" | gcloud secrets create {secret} --data-file=-")
    
    print("\n3. Deploy the service:")
    print(f"   chmod +x {script_path}")
    print(f"   ./{script_path}")
    
    print("\n4. Test the deployment:")
    print("   # Get service URL first")
    if analysis.get("service_name") and analysis.get("region"):
        print(f"   SERVICE_URL=$(gcloud run services describe {analysis['service_name']} \\")
        print(f"                 --region={analysis['region']} --format='value(status.url)')")
        print("   ")
        print("   # Test post")
        print("   curl -X POST $SERVICE_URL/api/social-automation \\")
        print("        -H 'Content-Type: application/json' \\")
        print("        -d '{\"action\":\"test_post\",\"platform\":\"twitter\"}'")
    
    # Step 5: Offer to run test if service is already deployed
    print("\n🎯 Would you like to test an existing deployment?")
    print("   Run this script with the service URL as argument:")
    print(f"   python3 {sys.argv[0]} <SERVICE_URL>")
    
    # If service URL provided as argument, test it
    if len(sys.argv) > 1:
        service_url = sys.argv[1]
        test_post_video(service_url)
    
    print("\n✅ Verification complete!")
    print("\n📊 Summary:")
    print(f"   Project: {analysis.get('project_id', 'N/A')}")
    print(f"   Region: {analysis.get('region', 'N/A')}")
    print(f"   Service: {analysis.get('service_name', 'N/A')}")
    print(f"   APIs: {len(analysis.get('required_apis', []))}")
    print(f"   Secrets: {len(analysis.get('secrets', []))}")
    print(f"   Scheduler jobs: {len(analysis.get('scheduler_jobs', []))}")
    
    if analysis.get("issues"):
        print("\n⚠️  Issues found:")
        for issue in analysis["issues"]:
            print(f"   {issue}")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
