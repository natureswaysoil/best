#!/usr/bin/env node

/**
 * YouTube & Twitter Recovery System
 * Restores YouTube and Twitter automation without Pinterest
 * Focus: Get social media posting back online immediately
 */

import fetch from 'node-fetch';
import fs from 'fs/promises';

console.log('🚀 YouTube & Twitter Recovery System');
console.log('🎯 Goal: Restore social media automation immediately');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

/**
 * Check if we can test local credentials
 */
async function testLocalCredentials() {
  console.log('\n🔍 Testing available credentials...');
  
  const platforms = {
    twitter: {
      credentials: {
        bearer: process.env.TWITTER_BEARER_TOKEN,
        apiKey: process.env.TWITTER_API_KEY,
        apiSecret: process.env.TWITTER_API_SECRET,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: process.env.TWITTER_ACCESS_SECRET
      },
      hasAny: false,
      working: false
    },
    youtube: {
      credentials: {
        clientId: process.env.YT_CLIENT_ID,
        clientSecret: process.env.YT_CLIENT_SECRET,
        refreshToken: process.env.YT_REFRESH_TOKEN
      },
      hasAny: false,
      working: false
    }
  };
  
  // Check Twitter
  platforms.twitter.hasAny = Object.values(platforms.twitter.credentials).some(
    cred => cred && cred !== 'your_twitter_api_key' && cred !== 'your_twitter_bearer_token'
  );
  
  // Check YouTube
  platforms.youtube.hasAny = Object.values(platforms.youtube.credentials).some(
    cred => cred && cred !== 'your_youtube_client_id'
  );
  
  console.log(`🐦 Twitter credentials: ${platforms.twitter.hasAny ? '✅ Found' : '❌ Missing'}`);
  console.log(`📺 YouTube credentials: ${platforms.youtube.hasAny ? '✅ Found' : '❌ Missing'}`);
  
  return platforms;
}

/**
 * Set up local environment for testing
 */
async function setupLocalEnvironment() {
  console.log('\n🔧 Setting up local environment...');
  
  const envTemplate = `
# YouTube & Twitter Credentials for Local Testing
# Add your actual credentials below

# Twitter API v2 Credentials
TWITTER_BEARER_TOKEN=your_twitter_bearer_token
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_SECRET=your_twitter_access_secret

# YouTube API Credentials
YT_CLIENT_ID=your_youtube_client_id
YT_CLIENT_SECRET=your_youtube_client_secret
YT_REFRESH_TOKEN=your_youtube_refresh_token
`;

  try {
    let envContent = await fs.readFile('./.env.local', 'utf8');
    
    // Add Twitter/YouTube section if not present
    if (!envContent.includes('TWITTER_BEARER_TOKEN')) {
      envContent += envTemplate;
      await fs.writeFile('./.env.local', envContent);
      console.log('✅ Updated .env.local with Twitter/YouTube template');
    } else {
      console.log('⚠️ Credentials section already exists in .env.local');
    }
    
  } catch (error) {
    console.error('❌ Failed to update .env.local:', error.message);
  }
}

/**
 * Create manual posting script
 */
async function createManualPostingScript() {
  console.log('\n📝 Creating manual posting script...');
  
  const manualScript = `#!/usr/bin/env node

/**
 * Manual Social Media Post
 * Quick way to trigger social media posts manually
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🚀 Manual Social Media Posting');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

async function manualPost() {
  try {
    console.log('📤 Running social media automation...');
    
    const { stdout, stderr } = await execAsync('node scripts/social-media-auto-post.mjs');
    
    console.log('✅ Output:');
    console.log(stdout);
    
    if (stderr) {
      console.log('⚠️ Warnings:');
      console.log(stderr);
    }
    
    console.log('🎉 Manual posting complete!');
    
  } catch (error) {
    console.error('❌ Manual posting failed:', error.message);
    process.exit(1);
  }
}

manualPost();
`;

  try {
    await fs.writeFile('./scripts/manual-social-post.mjs', manualScript);
    console.log('✅ Created manual posting script: scripts/manual-social-post.mjs');
    return true;
  } catch (error) {
    console.error('❌ Failed to create manual script:', error.message);
    return false;
  }
}

/**
 * Provide setup instructions
 */
function provideSetupInstructions() {
  console.log('\n📋 SETUP INSTRUCTIONS FOR YOUTUBE & TWITTER');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('\n🐦 TWITTER SETUP:');
  console.log('1. Go to: https://developer.twitter.com/en/portal/dashboard');
  console.log('2. Select your app or create one');
  console.log('3. Get these credentials:');
  console.log('   • Bearer Token (from "Keys and tokens")');
  console.log('   • API Key & Secret');
  console.log('   • Access Token & Secret');
  console.log('4. Add to .env.local (template already added)');
  
  console.log('\n📺 YOUTUBE SETUP:');
  console.log('1. Go to: https://console.cloud.google.com/apis/credentials');
  console.log('2. Select your project or create one');
  console.log('3. Create OAuth 2.0 Client ID for "Desktop Application"');
  console.log('4. Enable YouTube Data API v3');
  console.log('5. Get refresh token using OAuth 2.0 playground');
  console.log('6. Add credentials to .env.local');
  
  console.log('\n⚡ QUICK TEST COMMANDS:');
  console.log('• npm run youtube:test   # Test YouTube posting');
  console.log('• npm run twitter:test   # Test Twitter posting');
  console.log('• npm run social:manual  # Manual post to all platforms');
  
  console.log('\n🔄 RESTORE AUTOMATION:');
  console.log('Once credentials are added:');
  console.log('1. Test locally: npm run social:manual');
  console.log('2. Deploy to production with working credentials');
  console.log('3. Resume twice-daily posting schedule');
}

/**
 * Main recovery process
 */
async function main() {
  try {
    // Test current state
    const platforms = await testLocalCredentials();
    
    // Set up environment
    await setupLocalEnvironment();
    
    // Create manual tools
    await createManualPostingScript();
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Provide instructions
    provideSetupInstructions();
    
    console.log('\n🎯 NEXT STEPS:');
    
    if (!platforms.twitter.hasAny && !platforms.youtube.hasAny) {
      console.log('🔴 SETUP REQUIRED: Add Twitter and YouTube credentials');
      console.log('📝 Template added to .env.local - fill in your actual credentials');
      console.log('⚡ Then run: npm run social:manual');
    } else {
      console.log('🟡 PARTIAL SETUP: Some credentials found');
      console.log('🧪 Test current setup: npm run social:manual');
    }
    
    console.log('\n💡 PRIORITY ORDER:');
    console.log('1. 🐦 Twitter: Fastest to set up (just need Bearer Token)');
    console.log('2. 📺 YouTube: Requires OAuth setup (more complex)');
    console.log('3. 🤖 Automate: Deploy working credentials to Cloud Run');
    
  } catch (error) {
    console.error('\n💥 Recovery error:', error.message);
    process.exit(1);
  }
}

// Run recovery
main();