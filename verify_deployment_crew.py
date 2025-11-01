#!/usr/bin/env python3
"""
crewAI-based deployment verification and video posting system.
Analyzes the deployment script, verifies configuration, and posts a test video.
"""

import os
import sys
import json
import subprocess
from typing import Dict, List, Any
from crewai import Agent, Task, Crew, Process
from crewai.tools import BaseTool

class ScriptAnalyzerTool(BaseTool):
    name: str = "Script Analyzer"
    description: str = "Analyzes bash deployment scripts for configuration, dependencies, and potential issues"
    
    def _run(self, script_path: str) -> str:
        """Analyze a bash deployment script"""
        try:
            with open(script_path, 'r') as f:
                content = f.read()
            
            analysis = {
                "project_id": None,
                "region": None,
                "service_name": None,
                "required_apis": [],
                "secrets": [],
                "scheduler_jobs": [],
                "issues": []
            }
            
            # Extract configuration
            for line in content.split('\n'):
                if 'PROJECT_ID=' in line and '=' in line:
                    analysis["project_id"] = line.split('=')[1].strip('"').strip("'")
                elif 'REGION=' in line and '=' in line:
                    analysis["region"] = line.split('=')[1].strip('"').strip("'")
                elif 'SERVICE_NAME=' in line and '=' in line:
                    analysis["service_name"] = line.split('=')[1].strip('"').strip("'")
                elif 'gcloud services enable' in line:
                    # Extract APIs being enabled
                    if '.googleapis.com' in line:
                        parts = line.split()
                        for part in parts:
                            if '.googleapis.com' in part:
                                analysis["required_apis"].append(part.strip('\\'))
                elif 'gcloud secrets create' in line:
                    # Extract secret names
                    parts = line.split()
                    if 'create' in parts:
                        idx = parts.index('create')
                        if idx + 1 < len(parts):
                            analysis["secrets"].append(parts[idx + 1])
                elif 'gcloud scheduler jobs create' in line:
                    # Extract scheduler job names
                    parts = line.split()
                    if 'create' in parts and 'http' in parts:
                        idx = parts.index('http')
                        if idx + 1 < len(parts):
                            analysis["scheduler_jobs"].append(parts[idx + 1])
            
            # Check for issues
            if not analysis["project_id"]:
                analysis["issues"].append("No PROJECT_ID found")
            if not analysis["region"]:
                analysis["issues"].append("No REGION found")
            if not analysis["service_name"]:
                analysis["issues"].append("No SERVICE_NAME found")
            if not analysis["secrets"]:
                analysis["issues"].append("No secrets configuration found")
            
            return json.dumps(analysis, indent=2)
            
        except Exception as e:
            return f"Error analyzing script: {str(e)}"

class CloudRunVerifierTool(BaseTool):
    name: str = "Cloud Run Verifier"
    description: str = "Verifies Cloud Run service deployment and configuration"
    
    def _run(self, service_name: str, region: str = "us-central1") -> str:
        """Check if a Cloud Run service exists and is accessible"""
        try:
            result = subprocess.run(
                ["gcloud", "run", "services", "describe", service_name, 
                 f"--region={region}", "--format=json"],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode == 0:
                service_info = json.loads(result.stdout)
                return json.dumps({
                    "status": "deployed",
                    "url": service_info.get("status", {}).get("url", ""),
                    "ready": service_info.get("status", {}).get("conditions", [{}])[0].get("status") == "True"
                }, indent=2)
            else:
                return json.dumps({"status": "not_deployed", "error": result.stderr}, indent=2)
                
        except subprocess.TimeoutExpired:
            return json.dumps({"status": "timeout", "error": "gcloud command timed out"}, indent=2)
        except Exception as e:
            return json.dumps({"status": "error", "error": str(e)}, indent=2)

class VideoGeneratorTool(BaseTool):
    name: str = "Video Generator"
    description: str = "Generates test video content for social media posting"
    
    def _run(self, service_url: str, product_id: str = "test") -> str:
        """Trigger video generation via the deployed service"""
        try:
            import requests
            
            payload = {
                "action": "generate_video",
                "product_id": product_id,
                "platform": "twitter"
            }
            
            response = requests.post(
                f"{service_url}/api/social-automation",
                json=payload,
                timeout=120
            )
            
            return json.dumps({
                "status_code": response.status_code,
                "response": response.json() if response.headers.get('content-type') == 'application/json' else response.text
            }, indent=2)
            
        except Exception as e:
            return json.dumps({"error": str(e)}, indent=2)

class SocialMediaPosterTool(BaseTool):
    name: str = "Social Media Poster"
    description: str = "Posts generated content to social media platforms"
    
    def _run(self, service_url: str, video_path: str = None) -> str:
        """Post video to social media via the deployed service"""
        try:
            import requests
            
            payload = {
                "action": "test_post",
                "platforms": ["twitter"],
                "video_path": video_path
            }
            
            response = requests.post(
                f"{service_url}/api/social-automation",
                json=payload,
                timeout=60
            )
            
            return json.dumps({
                "status_code": response.status_code,
                "response": response.json() if response.headers.get('content-type') == 'application/json' else response.text
            }, indent=2)
            
        except Exception as e:
            return json.dumps({"error": str(e)}, indent=2)

def create_deployment_verification_crew():
    """Create a crewAI crew to verify deployment and post test video"""
    
    # Create agents
    script_analyst = Agent(
        role="Deployment Script Analyst",
        goal="Analyze deployment scripts for configuration correctness and potential issues",
        backstory="Expert in bash scripting and Google Cloud deployment configurations",
        tools=[ScriptAnalyzerTool()],
        verbose=True
    )
    
    cloud_engineer = Agent(
        role="Cloud Infrastructure Engineer",
        goal="Verify Cloud Run deployments and infrastructure readiness",
        backstory="Specialist in Google Cloud Run, Secret Manager, and Cloud Scheduler",
        tools=[CloudRunVerifierTool()],
        verbose=True
    )
    
    video_producer = Agent(
        role="Video Content Producer",
        goal="Generate and verify video content for social media",
        backstory="Expert in automated video generation and content quality assurance",
        tools=[VideoGeneratorTool()],
        verbose=True
    )
    
    social_media_manager = Agent(
        role="Social Media Manager",
        goal="Post content to social media platforms and verify successful delivery",
        backstory="Experienced in multi-platform social media automation and engagement",
        tools=[SocialMediaPosterTool()],
        verbose=True
    )
    
    # Create tasks
    analyze_script = Task(
        description="Analyze the deployment script at './deploy-social-automation.sh' and extract all configuration details, required APIs, secrets, and potential issues",
        agent=script_analyst,
        expected_output="Detailed JSON report of script configuration and issues"
    )
    
    verify_deployment = Task(
        description="Verify that the Cloud Run service 'social-media-automation' is deployed in region 'us-central1' and is accessible",
        agent=cloud_engineer,
        expected_output="Deployment status report with service URL and readiness state"
    )
    
    generate_video = Task(
        description="Generate a test video using the deployed service for product 'test-product-001'",
        agent=video_producer,
        expected_output="Video generation result with path or URL"
    )
    
    post_to_social = Task(
        description="Post the generated video to Twitter as a test to verify the complete automation workflow",
        agent=social_media_manager,
        expected_output="Social media posting result with success confirmation and post URL"
    )
    
    # Create crew
    crew = Crew(
        agents=[script_analyst, cloud_engineer, video_producer, social_media_manager],
        tasks=[analyze_script, verify_deployment, generate_video, post_to_social],
        process=Process.sequential,
        verbose=True
    )
    
    return crew

def main():
    print("🤖 Initializing crewAI Deployment Verification System")
    print("=" * 70)
    
    # Check if deployment script exists
    script_path = "./deploy-social-automation.sh"
    if not os.path.exists(script_path):
        print(f"❌ Deployment script not found: {script_path}")
        print("Creating a reference copy from the provided script...")
        
        # Script will be created by the calling process
        return 1
    
    print("✅ Deployment script found")
    print("\n📋 Creating crewAI verification crew...")
    
    try:
        crew = create_deployment_verification_crew()
        
        print("\n🚀 Starting crew execution...")
        print("=" * 70)
        
        result = crew.kickoff()
        
        print("\n" + "=" * 70)
        print("✅ Crew execution completed!")
        print("\n📊 Final Result:")
        print(result)
        
        return 0
        
    except Exception as e:
        print(f"\n❌ Error during crew execution: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())
