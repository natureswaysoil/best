# Google API Keys Setup Guide

This document describes the environment variables that need to be configured after replacing hardcoded Google API keys with environment variable lookups.

## Overview

All hardcoded Google API keys have been removed from the google-cloud-sdk source code and replaced with environment variable lookups. This improves security by allowing keys to be managed externally and not committed to version control.

## Required Environment Variables

The following environment variables should be set before using the Google Cloud SDK:

### 1. Error Reporting Keys (crash_handling.py)

- **GOOGLE_API_KEY_ERROR_REPORTING**
  - Purpose: API key for Cloud SDK error reporting
  - Used by: `googlecloudsdk.command_lib.crash_handling`
  - Behavior if not set: Warning logged, error reporting may not function

- **GOOGLE_API_KEY_CRASH_REPORTING**
  - Purpose: API key for Cloud SDK crash reporting
  - Used by: `googlecloudsdk.command_lib.crash_handling`
  - Behavior if not set: Warning logged, crash reporting may not function

### 2. gsutil API Keys (anonymous requests)

These keys are used to identify gsutil during anonymous API requests:

- **GOOGLE_API_KEY_KMS**
  - Purpose: API key for Cloud KMS operations
  - Used by: `gslib.kms_api.KmsApi`
  - Behavior if not set: Warning logged, anonymous KMS requests may not function

- **GOOGLE_API_KEY_PUBSUB**
  - Purpose: API key for Cloud Pub/Sub operations
  - Used by: `gslib.pubsub_api.PubsubApi`
  - Behavior if not set: Warning logged, anonymous Pub/Sub requests may not function

- **GOOGLE_API_KEY_IAMCREDENTIALS**
  - Purpose: API key for IAM Credentials operations
  - Used by: `gslib.iamcredentials_api.IamcredentailsApi`
  - Behavior if not set: Warning logged, anonymous IAM Credentials requests may not function

- **GOOGLE_API_KEY_GCS**
  - Purpose: API key for Google Cloud Storage operations
  - Used by: `gslib.gcs_json_api.GcsJsonApi`
  - Behavior if not set: Warning logged, anonymous GCS requests may not function

## How to Set Environment Variables

### Linux/macOS

Add to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.):

```bash
export GOOGLE_API_KEY_ERROR_REPORTING="your-key-here"
export GOOGLE_API_KEY_CRASH_REPORTING="your-key-here"
export GOOGLE_API_KEY_KMS="your-key-here"
export GOOGLE_API_KEY_PUBSUB="your-key-here"
export GOOGLE_API_KEY_IAMCREDENTIALS="your-key-here"
export GOOGLE_API_KEY_GCS="your-key-here"
```

Then reload your shell configuration:
```bash
source ~/.bashrc  # or ~/.zshrc
```

### Windows (Command Prompt)

```cmd
setx GOOGLE_API_KEY_ERROR_REPORTING "your-key-here"
setx GOOGLE_API_KEY_CRASH_REPORTING "your-key-here"
setx GOOGLE_API_KEY_KMS "your-key-here"
setx GOOGLE_API_KEY_PUBSUB "your-key-here"
setx GOOGLE_API_KEY_IAMCREDENTIALS "your-key-here"
setx GOOGLE_API_KEY_GCS "your-key-here"
```

### Windows (PowerShell)

```powershell
[Environment]::SetEnvironmentVariable("GOOGLE_API_KEY_ERROR_REPORTING", "your-key-here", "User")
[Environment]::SetEnvironmentVariable("GOOGLE_API_KEY_CRASH_REPORTING", "your-key-here", "User")
[Environment]::SetEnvironmentVariable("GOOGLE_API_KEY_KMS", "your-key-here", "User")
[Environment]::SetEnvironmentVariable("GOOGLE_API_KEY_PUBSUB", "your-key-here", "User")
[Environment]::SetEnvironmentVariable("GOOGLE_API_KEY_IAMCREDENTIALS", "your-key-here", "User")
[Environment]::SetEnvironmentVariable("GOOGLE_API_KEY_GCS", "your-key-here", "User")
```

## Obtaining API Keys

To obtain Google API keys:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "API Key"
5. (Optional) Restrict the API key to specific APIs for better security

## Security Best Practices

1. **Never commit API keys to version control**
   - Use `.gitignore` to exclude files containing keys
   - Use environment variables or secret management systems

2. **Restrict API keys**
   - Limit API keys to only the necessary APIs
   - Use IP address restrictions when possible
   - Rotate keys regularly

3. **Use different keys for different environments**
   - Separate keys for development, staging, and production
   - Use different keys for different team members if needed

4. **Monitor API key usage**
   - Regularly check the Google Cloud Console for unusual activity
   - Set up billing alerts to detect unauthorized usage

## Troubleshooting

### Warning Messages

If you see warnings like:
```
WARNING: GOOGLE_API_KEY_KMS environment variable not set. Anonymous KMS API requests may not function properly.
```

This means the environment variable is not set. Follow the setup instructions above to configure it.

### Functionality Impact

- If keys are not set, the SDK will still attempt to function
- Authentication operations will fail gracefully with warnings
- Authenticated operations using service accounts or user credentials will continue to work normally

## Previous Hardcoded Keys

The following hardcoded keys were removed:
- `AIzaSyCUuWyME_r4XylltWNeydEjKSkgXkvpVyU` (Error Reporting)
- `AIzaSyAp4DSI_Z3-mK-B8U0t7GE34n74OWDJmak` (Crash Reporting)
- `AIzaSyDnacJHrKma0048b13sh8cgxNUwulubmJM` (KMS/Pub/Sub/IAM/GCS - anonymous)

**Note:** These keys should be rotated and replaced with new keys for security purposes.

## Modified Files

The following files were modified to use environment variables:
1. `google-cloud-sdk/lib/googlecloudsdk/command_lib/crash_handling.py`
2. `google-cloud-sdk/platform/gsutil/gslib/kms_api.py`
3. `google-cloud-sdk/platform/gsutil/gslib/pubsub_api.py`
4. `google-cloud-sdk/platform/gsutil/gslib/iamcredentials_api.py`
5. `google-cloud-sdk/platform/gsutil/gslib/gcs_json_api.py`
