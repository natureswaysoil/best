# Secret Management Guide

This guide explains how secrets are managed in this repository and how to work with them safely.

## Overview

All secrets and API keys have been externalized to environment variables. No secrets should ever be committed to the repository.

## Changed Files

The following files were updated to use environment variables instead of hardcoded API keys:

1. **google-cloud-sdk/google-cloud-sdk/lib/googlecloudsdk/command_lib/crash_handling.py**
   - `ERROR_REPORTING_PARAM` now uses `GCLOUD_ERROR_REPORTING_API_KEY` env var
   - `CRASH_REPORTING_PARAM` now uses `GCLOUD_CRASH_REPORTING_API_KEY` env var

2. **google-cloud-sdk/google-cloud-sdk/platform/gsutil/gslib/pubsub_api.py**
   - Anonymous API key now uses `GSUTIL_ANONYMOUS_API_KEY` env var

3. **google-cloud-sdk/google-cloud-sdk/platform/gsutil/gslib/kms_api.py**
   - Anonymous API key now uses `GSUTIL_ANONYMOUS_API_KEY` env var

4. **google-cloud-sdk/google-cloud-sdk/platform/gsutil/gslib/iamcredentials_api.py**
   - Anonymous API key now uses `GSUTIL_ANONYMOUS_API_KEY` env var

5. **google-cloud-sdk/google-cloud-sdk/platform/gsutil/gslib/gcs_json_api.py**
   - Anonymous API key now uses `GSUTIL_ANONYMOUS_API_KEY` env var

## Environment Variables

### Required for Google Cloud SDK

```bash
# Error and crash reporting API keys
export GCLOUD_ERROR_REPORTING_API_KEY="your_key_here"
export GCLOUD_CRASH_REPORTING_API_KEY="your_key_here"

# Anonymous requests API key
export GSUTIL_ANONYMOUS_API_KEY="your_key_here"
```

### Setting Up Environment Variables

#### Local Development

1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your actual API keys in `.env.local`

3. The `.env.local` file is gitignored and will never be committed

#### Production Deployments

**Vercel:**
```bash
vercel env add GCLOUD_ERROR_REPORTING_API_KEY
vercel env add GCLOUD_CRASH_REPORTING_API_KEY
vercel env add GSUTIL_ANONYMOUS_API_KEY
```

**Google Cloud Run:**
```bash
gcloud run deploy SERVICE_NAME \
  --set-env-vars GCLOUD_ERROR_REPORTING_API_KEY="key1" \
  --set-env-vars GCLOUD_CRASH_REPORTING_API_KEY="key2" \
  --set-env-vars GSUTIL_ANONYMOUS_API_KEY="key3"
```

**GitHub Actions:**
Add secrets in: Repository Settings → Secrets and variables → Actions

## Backward Compatibility

All the modified files maintain backward compatibility by providing default values:

```python
# Example from crash_handling.py
ERROR_REPORTING_PARAM = os.environ.get('GCLOUD_ERROR_REPORTING_API_KEY', 'AIzaSyCUuWyME_r4XylltWNeydEjKSkgXkvpVyU')
```

This means:
- If the environment variable is set, it will be used
- If not set, the original hardcoded key is used as a fallback
- Existing deployments continue to work without immediate changes

**⚠️ Important:** The fallback keys should be rotated and the environment variables should be properly set in all environments.

## Automated Secret Detection

### Pre-commit Hooks

Install and use pre-commit hooks:

```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Run manually
pre-commit run --all-files
```

### CI/CD Pipeline

Every push and pull request runs automated secret scanning:
- TruffleHog - Finds secrets in git history
- Gitleaks - Detects hardcoded credentials
- detect-secrets - Finds secrets in code
- Custom pattern matching - Checks for specific key formats

See `.github/workflows/secret-scanning.yml` for details.

## Secret Rotation

To rotate secrets:

1. Run the helper script:
   ```bash
   ./scripts/rotate-secrets.sh
   ```

2. Follow the instructions to:
   - Generate new keys in respective services
   - Update environment variables in all environments
   - Verify the old keys are deactivated

## Cleaning Git History

If a secret was accidentally committed:

### Using BFG Repo-Cleaner (Recommended)

```bash
# Download BFG
wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar

# Create a file with secrets to remove
echo "AIzaSyCUuWyME_r4XylltWNeydEjKSkgXkvpVyU" > secrets.txt

# Clean the repository
java -jar bfg-1.14.0.jar --replace-text secrets.txt

# Clean up and force push
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

### Using git-filter-repo

```bash
# Install
pip install git-filter-repo

# Remove specific file from history
git filter-repo --path path/to/file --invert-paths

# Force push
git push --force
```

**⚠️ Warning:** Rewriting git history requires all team members to re-clone the repository.

## Best Practices

1. **Never commit secrets** - Always use environment variables
2. **Use the pre-commit hooks** - They catch secrets before they're committed
3. **Rotate regularly** - Change secrets every 90 days
4. **Use different keys per environment** - Dev, staging, and production should have different keys
5. **Monitor secret usage** - Review access logs regularly
6. **Revoke immediately** - If a secret is compromised, revoke it right away

## Additional Resources

- [SECURITY.md](../SECURITY.md) - Full security policy
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

## Troubleshooting

### "API key not found" errors

If you get errors about missing API keys:

1. Check that your `.env.local` file exists and contains the keys
2. Verify the environment variable names match exactly
3. For Next.js, public variables must start with `NEXT_PUBLIC_`
4. Restart your development server after adding new variables

### Pre-commit hooks failing

If pre-commit hooks are blocking your commits:

1. Make sure you're not committing any secrets
2. Run `pre-commit run --all-files` to see specific issues
3. Update `.secrets.baseline` if needed for false positives

### GitHub Actions failing on secret scan

1. Check the workflow logs for specific secret patterns found
2. Remove the secrets from your code
3. Update the PR after cleaning the secrets
