#!/usr/bin/env node
/**
 * Google Secret Manager Integration
 * Fetches API credentials from Google Secret Manager
 * 
 * Usage:
 *   node scripts/fetch-secrets-from-google.mjs
 * 
 * Prerequisites:
 *   - Google Cloud SDK installed
 *   - Authenticated with: gcloud auth application-default login
 *   - Project ID set in GOOGLE_CLOUD_PROJECT env var
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

class GoogleSecretManagerFetcher {
  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT;
    this.secrets = {
      // Google Ads
      'GOOGLE_ADS_DEVELOPER_TOKEN': 'google-ads-developer-token',
      'GOOGLE_ADS_CLIENT_ID': 'google-ads-client-id',
      'GOOGLE_ADS_CLIENT_SECRET': 'google-ads-client-secret',
      'GOOGLE_ADS_REFRESH_TOKEN': 'google-ads-refresh-token',
      'GOOGLE_ADS_CUSTOMER_ID': 'google-ads-customer-id',
      
      // Meta (Facebook/Instagram)
      'META_ACCESS_TOKEN': 'meta-access-token',
      'META_AD_ACCOUNT_ID': 'meta-ad-account-id',
      
      // Pinterest
      'PINTEREST_ACCESS_TOKEN': 'pinterest-access-token',
      'PINTEREST_AD_ACCOUNT_ID': 'pinterest-ad-account-id'
    };
  }

  log(message, type = 'INFO') {
    console.log(`[${type}] ${message}`);
  }

  /**
   * Check if gcloud CLI is available
   */
  checkGcloudInstalled() {
    try {
      execSync('which gcloud', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Fetch a secret from Google Secret Manager
   */
  fetchSecret(secretName) {
    try {
      const command = `gcloud secrets versions access latest --secret="${secretName}" --project="${this.projectId}"`;
      const value = execSync(command, { encoding: 'utf8' }).trim();
      return value;
    } catch (error) {
      this.log(`Failed to fetch secret "${secretName}": ${error.message}`, 'WARN');
      return null;
    }
  }

  /**
   * Fetch all secrets and write to .env.local
   */
  async fetchAllSecrets() {
    this.log('🔐 Fetching credentials from Google Secret Manager');

    if (!this.projectId) {
      this.log('GOOGLE_CLOUD_PROJECT or GCP_PROJECT not set', 'ERROR');
      this.log('Set it with: export GOOGLE_CLOUD_PROJECT=your-project-id', 'ERROR');
      return false;
    }

    if (!this.checkGcloudInstalled()) {
      this.log('gcloud CLI not found. Install from: https://cloud.google.com/sdk/docs/install', 'ERROR');
      return false;
    }

    this.log(`Using project: ${this.projectId}`);

    const envVars = [];
    let successCount = 0;
    let skipCount = 0;

    for (const [envVar, secretName] of Object.entries(this.secrets)) {
      const value = this.fetchSecret(secretName);
      if (value) {
        envVars.push(`${envVar}=${value}`);
        successCount++;
        this.log(`✅ Fetched: ${envVar}`);
      } else {
        skipCount++;
        this.log(`⏭️  Skipped: ${envVar} (secret not found)`, 'WARN');
      }
    }

    if (envVars.length === 0) {
      this.log('No secrets found. Make sure secrets exist in Google Secret Manager.', 'ERROR');
      return false;
    }

    // Write to .env.local
    const envPath = path.join(PROJECT_ROOT, '.env.local');
    const envContent = envVars.join('\n') + '\n';

    // Preserve existing .env.local content if it exists
    let existingContent = '';
    if (fs.existsSync(envPath)) {
      existingContent = fs.readFileSync(envPath, 'utf8');
      
      // Remove old ad-related variables
      const lines = existingContent.split('\n').filter(line => {
        const varName = line.split('=')[0];
        return !Object.keys(this.secrets).includes(varName);
      });
      existingContent = lines.join('\n') + '\n';
    }

    const finalContent = existingContent + '\n# Ad Platform Credentials (from Google Secret Manager)\n' + envContent;
    fs.writeFileSync(envPath, finalContent);

    this.log(`\n✅ Successfully fetched ${successCount} secrets`);
    if (skipCount > 0) {
      this.log(`⚠️  Skipped ${skipCount} secrets (not found in Secret Manager)`, 'WARN');
    }
    this.log(`📝 Credentials written to: ${envPath}`);
    this.log('\n🚀 You can now run: npm run ads:generate');

    return true;
  }

  /**
   * List available secrets in the project
   */
  listSecrets() {
    if (!this.projectId) {
      this.log('GOOGLE_CLOUD_PROJECT not set', 'ERROR');
      return;
    }

    try {
      this.log(`\n📋 Listing secrets in project: ${this.projectId}\n`);
      const command = `gcloud secrets list --project="${this.projectId}"`;
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      this.log(`Failed to list secrets: ${error.message}`, 'ERROR');
    }
  }
}

// CLI Interface
const args = process.argv.slice(2);
const command = args[0] || 'fetch';

const fetcher = new GoogleSecretManagerFetcher();

if (command === 'fetch') {
  fetcher.fetchAllSecrets().then(success => {
    process.exit(success ? 0 : 1);
  });
} else if (command === 'list') {
  fetcher.listSecrets();
} else {
  console.log('Usage:');
  console.log('  node scripts/fetch-secrets-from-google.mjs fetch  # Fetch secrets to .env.local');
  console.log('  node scripts/fetch-secrets-from-google.mjs list   # List available secrets');
  process.exit(1);
}
