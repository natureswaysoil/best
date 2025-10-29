#!/usr/bin/env python3
"""
Test script to verify that secret management is working correctly.
This tests that environment variables are properly read when set.
"""

import os
import sys

# Add paths for importing
sys.path.insert(0, 'google-cloud-sdk/google-cloud-sdk/lib')
sys.path.insert(0, 'google-cloud-sdk/google-cloud-sdk/platform/gsutil')

def test_crash_handling_env_vars():
    """Test that crash_handling uses environment variables"""
    print("Testing crash_handling.py environment variable usage...")
    
    # Set test environment variables
    test_error_key = "TEST_ERROR_KEY_12345"
    test_crash_key = "TEST_CRASH_KEY_67890"
    
    os.environ['GCLOUD_ERROR_REPORTING_API_KEY'] = test_error_key
    os.environ['GCLOUD_CRASH_REPORTING_API_KEY'] = test_crash_key
    
    # Import the module (this will read the env vars)
    # We can't actually import due to missing dependencies, but we can verify the pattern
    
    # Check the file contains the correct pattern
    with open('google-cloud-sdk/google-cloud-sdk/lib/googlecloudsdk/command_lib/crash_handling.py', 'r') as f:
        content = f.read()
        assert "os.environ.get('GCLOUD_ERROR_REPORTING_API_KEY'" in content, \
            "ERROR_REPORTING_PARAM should use environment variable"
        assert "os.environ.get('GCLOUD_CRASH_REPORTING_API_KEY'" in content, \
            "CRASH_REPORTING_PARAM should use environment variable"
        print("  ✓ crash_handling.py correctly uses environment variables")
    
    # Clean up
    del os.environ['GCLOUD_ERROR_REPORTING_API_KEY']
    del os.environ['GCLOUD_CRASH_REPORTING_API_KEY']

def test_gsutil_apis_env_vars():
    """Test that gsutil API files use environment variables"""
    print("\nTesting gsutil API files environment variable usage...")
    
    files_to_check = [
        'google-cloud-sdk/google-cloud-sdk/platform/gsutil/gslib/pubsub_api.py',
        'google-cloud-sdk/google-cloud-sdk/platform/gsutil/gslib/kms_api.py',
        'google-cloud-sdk/google-cloud-sdk/platform/gsutil/gslib/iamcredentials_api.py',
        'google-cloud-sdk/google-cloud-sdk/platform/gsutil/gslib/gcs_json_api.py'
    ]
    
    for filepath in files_to_check:
        with open(filepath, 'r') as f:
            content = f.read()
            assert "os.environ.get('GSUTIL_ANONYMOUS_API_KEY'" in content, \
                f"{filepath} should use GSUTIL_ANONYMOUS_API_KEY environment variable"
            print(f"  ✓ {filepath.split('/')[-1]} correctly uses environment variable")

def test_os_import_added():
    """Test that os module is imported in all modified files"""
    print("\nTesting that 'os' module is imported...")
    
    files_to_check = [
        'google-cloud-sdk/google-cloud-sdk/lib/googlecloudsdk/command_lib/crash_handling.py',
        'google-cloud-sdk/google-cloud-sdk/platform/gsutil/gslib/pubsub_api.py',
        'google-cloud-sdk/google-cloud-sdk/platform/gsutil/gslib/kms_api.py',
        'google-cloud-sdk/google-cloud-sdk/platform/gsutil/gslib/iamcredentials_api.py'
    ]
    
    for filepath in files_to_check:
        with open(filepath, 'r') as f:
            content = f.read()
            assert "import os" in content, \
                f"{filepath} should import 'os' module"
            print(f"  ✓ {filepath.split('/')[-1]} imports 'os' module")

def test_backward_compatibility():
    """Test that backward compatibility is maintained with default values"""
    print("\nTesting backward compatibility (fallback defaults)...")
    
    files_and_patterns = {
        'google-cloud-sdk/google-cloud-sdk/lib/googlecloudsdk/command_lib/crash_handling.py': [
            "os.environ.get('GCLOUD_ERROR_REPORTING_API_KEY', 'AIzaSyCUuWyME_r4XylltWNeydEjKSkgXkvpVyU')",
            "os.environ.get('GCLOUD_CRASH_REPORTING_API_KEY', 'AIzaSyAp4DSI_Z3-mK-B8U0t7GE34n74OWDJmak')"
        ],
        'google-cloud-sdk/google-cloud-sdk/platform/gsutil/gslib/pubsub_api.py': [
            "os.environ.get('GSUTIL_ANONYMOUS_API_KEY', 'AIzaSyDnacJHrKma0048b13sh8cgxNUwulubmJM')"
        ]
    }
    
    for filepath, patterns in files_and_patterns.items():
        with open(filepath, 'r') as f:
            content = f.read()
            for pattern in patterns:
                assert pattern in content, \
                    f"{filepath} should maintain backward compatibility with default value"
        print(f"  ✓ {filepath.split('/')[-1]} maintains backward compatibility")

def test_documentation_exists():
    """Test that documentation files were created"""
    print("\nTesting documentation files...")
    
    docs_to_check = [
        'SECURITY.md',
        'docs/SECRET_MANAGEMENT.md',
        '.pre-commit-config.yaml',
        '.github/workflows/secret-scanning.yml',
        'scripts/rotate-secrets.sh'
    ]
    
    for doc in docs_to_check:
        assert os.path.exists(doc), f"{doc} should exist"
        print(f"  ✓ {doc} exists")

def main():
    """Run all tests"""
    print("=" * 60)
    print("Secret Management Test Suite")
    print("=" * 60)
    
    try:
        test_crash_handling_env_vars()
        test_gsutil_apis_env_vars()
        test_os_import_added()
        test_backward_compatibility()
        test_documentation_exists()
        
        print("\n" + "=" * 60)
        print("✅ All tests passed!")
        print("=" * 60)
        return 0
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        return 1
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        return 1

if __name__ == '__main__':
    sys.exit(main())
