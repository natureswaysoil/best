# Security Policy

## Handling Secrets and Sensitive Data

This repository has automated systems in place to prevent the exposure of secrets and sensitive data. Please follow these guidelines to maintain security.

### ⚠️ Never Commit Secrets

**Do NOT commit the following types of sensitive data:**

- API keys (Google Cloud, AWS, Azure, etc.)
- Access tokens (OAuth, Personal Access Tokens, etc.)
- Secret keys and passwords
- Private keys (SSH, SSL/TLS, etc.)
- Database credentials
- Service account credentials
- Any other sensitive authentication data

### ✅ Using Environment Variables

All secrets and sensitive configuration must be stored as environment variables, never hardcoded in source files.

#### For Local Development

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Add your secrets to `.env.local` (this file is gitignored):
   ```env
   # Google Cloud SDK API Keys
   GCLOUD_ERROR_REPORTING_API_KEY=your_error_reporting_key_here
   GCLOUD_CRASH_REPORTING_API_KEY=your_crash_reporting_key_here
   GSUTIL_ANONYMOUS_API_KEY=your_anonymous_api_key_here
   
   # Add other secrets as needed
   ```

3. Access environment variables in your code:
   ```python
   import os
   api_key = os.environ.get('GCLOUD_ERROR_REPORTING_API_KEY')
   ```
   
   ```javascript
   const apiKey = process.env.NEXT_PUBLIC_API_KEY;
   ```

#### For Production

Store secrets in:
- **Vercel**: Use [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- **Google Cloud**: Use [Secret Manager](https://cloud.google.com/secret-manager)
- **GitHub Actions**: Use [Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

### 🔍 Automated Secret Detection

This repository uses multiple layers of secret detection:

#### 1. Pre-commit Hooks
Install pre-commit hooks to scan for secrets before committing:

```bash
# Install pre-commit
pip install pre-commit

# Install the git hook scripts
pre-commit install

# (Optional) Run against all files
pre-commit run --all-files
```

The pre-commit hooks will:
- Scan for secrets using TruffleHog
- Detect private keys
- Check for AWS credentials
- Search for Google API key patterns

#### 2. GitHub Actions
On every push and pull request, automated workflows scan for:
- Exposed API keys and tokens (using TruffleHog)
- Leaked credentials (using Gitleaks)
- Secret patterns (using detect-secrets)
- Custom patterns for known secret formats

#### 3. GitHub Secret Scanning
GitHub's native [secret scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning) is enabled to automatically detect known secret patterns.

### 🚨 If You Accidentally Commit a Secret

If you accidentally commit a secret to the repository:

1. **Immediately rotate/revoke the exposed secret** in the relevant service (Google Cloud Console, AWS Console, etc.)

2. **Remove the secret from your code** and replace it with an environment variable reference

3. **Clean the Git history** to remove all traces of the secret:
   
   ```bash
   # Option 1: Using BFG Repo-Cleaner (recommended for large repos)
   # Download BFG from https://rtyley.github.io/bfg-repo-cleaner/
   java -jar bfg.jar --replace-text passwords.txt
   git reflog expire --expire=now --all && git gc --prune=now --aggressive
   git push --force
   
   # Option 2: Using git filter-repo
   pip install git-filter-repo
   git filter-repo --path path/to/file --invert-paths
   git push --force
   ```

4. **Notify the security team** if the secret was exposed in a public repository

5. **Force all contributors to re-clone** the repository after history rewriting

### 📋 Environment Variables Reference

#### Google Cloud SDK Keys
- `GCLOUD_ERROR_REPORTING_API_KEY` - API key for error reporting to Google Cloud
- `GCLOUD_CRASH_REPORTING_API_KEY` - API key for crash reporting to Google Cloud
- `GSUTIL_ANONYMOUS_API_KEY` - API key for anonymous gsutil requests

#### Application Keys (Examples)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (public)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (public)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (secret, server-only)
- `STRIPE_SECRET_KEY` - Stripe secret key (secret, server-only)
- `RESEND_API_KEY` - Resend API key for email sending

### 🔐 Secret Rotation Policy

1. **Regular Rotation**: Rotate all secrets at least every 90 days
2. **Incident Rotation**: Immediately rotate secrets if:
   - A secret is accidentally committed
   - A team member with secret access leaves
   - Suspicious activity is detected
3. **Documentation**: Keep an internal log of when secrets were last rotated

### 📚 Additional Resources

- [GitHub: Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [TruffleHog - Find Secrets in Git](https://github.com/trufflesecurity/trufflehog)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

### 📞 Reporting Security Vulnerabilities

If you discover a security vulnerability, please email security@example.com or create a private security advisory on GitHub.

**Do NOT create public issues for security vulnerabilities.**

---

Last updated: 2025-10-29
