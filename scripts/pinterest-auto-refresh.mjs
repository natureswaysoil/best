#!/usr/bin/env node

/**
 * Pinterest Automatic Token Refresh System
 * Handles automatic refresh of Pinterest API tokens with backup system
 * Revenue Protection: Pinterest generates 20-35 monthly sales
 */

import fetch from 'node-fetch';
import fs from 'fs/promises';

// Configuration
const CONFIG = {
  CLIENT_ID: process.env.PINTEREST_CLIENT_ID,
  CLIENT_SECRET: process.env.PINTEREST_CLIENT_SECRET,
  REDIRECT_URI: process.env.PINTEREST_REDIRECT_URI || 'https://best-tau-swart.vercel.app/',
  CURRENT_ACCESS_TOKEN: process.env.PINTEREST_ACCESS_TOKEN,
  PRIMARY_REFRESH_TOKEN: process.env.PINTEREST_REFRESH_TOKEN,
  BACKUP_REFRESH_TOKEN: process.env.PINTEREST_BACKUP_REFRESH_TOKEN,
  TERTIARY_REFRESH_TOKEN: process.env.PINTEREST_TERTIARY_REFRESH_TOKEN,
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000,
  TOKEN_FILE: './pinterest-tokens.json',
  ENV_FILE: './.env.local'
};

/**
 * Sleep utility for delays
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Refresh Pinterest access token using refresh token
 */
async function refreshAccessToken(refreshToken, tokenType = 'primary') {
  if (!refreshToken) {
    throw new Error(`No ${tokenType} refresh token provided`);
  }

  console.log(`🔄 Attempting to refresh ${tokenType} Pinterest token...`);

  const tokenEndpoint = 'https://api.pinterest.com/v5/oauth/token';
  
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    scope: 'ads:read,ads:write,boards:read,boards:write,pins:read,pins:write,user_accounts:read'
  });

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${CONFIG.CLIENT_ID}:${CONFIG.CLIENT_SECRET}`).toString('base64')}`
    },
    body: params.toString()
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pinterest token refresh failed for ${tokenType}: ${response.status} - ${errorText}`);
  }

  const tokenData = await response.json();
  console.log(`✅ Successfully refreshed ${tokenType} Pinterest token`);

  return {
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token || refreshToken, // Use new refresh token if provided
    expires_in: tokenData.expires_in,
    token_type: tokenData.token_type,
    scope: tokenData.scope,
    refreshed_at: new Date().toISOString(),
    token_source: tokenType
  };
}

/**
 * Save tokens to local file for backup
 */
async function saveTokensToFile(tokenData) {
  try {
    await fs.writeFile(CONFIG.TOKEN_FILE, JSON.stringify(tokenData, null, 2));
    console.log(`💾 Tokens saved to ${CONFIG.TOKEN_FILE}`);
  } catch (error) {
    console.error('❌ Failed to save tokens to file:', error.message);
  }
}

/**
 * Update .env.local file with new tokens
 */
async function updateEnvFile(tokenData) {
  try {
    let envContent = await fs.readFile(CONFIG.ENV_FILE, 'utf8');
    
    // Update PINTEREST_ACCESS_TOKEN
    if (envContent.includes('PINTEREST_ACCESS_TOKEN=')) {
      envContent = envContent.replace(
        /PINTEREST_ACCESS_TOKEN=.*/,
        `PINTEREST_ACCESS_TOKEN=${tokenData.access_token}`
      );
    } else {
      envContent += `\nPINTEREST_ACCESS_TOKEN=${tokenData.access_token}`;
    }
    
    // Add/Update PINTEREST_REFRESH_TOKEN if we have one
    if (tokenData.refresh_token) {
      if (envContent.includes('PINTEREST_REFRESH_TOKEN=')) {
        envContent = envContent.replace(
          /PINTEREST_REFRESH_TOKEN=.*/,
          `PINTEREST_REFRESH_TOKEN=${tokenData.refresh_token}`
        );
      } else {
        envContent += `\nPINTEREST_REFRESH_TOKEN=${tokenData.refresh_token}`;
      }
    }
    
    await fs.writeFile(CONFIG.ENV_FILE, envContent);
    console.log(`✅ Updated ${CONFIG.ENV_FILE} with new tokens`);
    
    // Update process.env for immediate use
    process.env.PINTEREST_ACCESS_TOKEN = tokenData.access_token;
    if (tokenData.refresh_token) {
      process.env.PINTEREST_REFRESH_TOKEN = tokenData.refresh_token;
    }
    
  } catch (error) {
    console.error('❌ Failed to update .env.local:', error.message);
  }
}

/**
 * Generate new authorization URL for manual token generation
 */
function generateAuthUrl() {
  const baseUrl = 'https://www.pinterest.com/oauth/';
  const params = new URLSearchParams({
    client_id: CONFIG.CLIENT_ID,
    redirect_uri: CONFIG.REDIRECT_URI,
    response_type: 'code',
    scope: 'ads:read,ads:write,boards:read,boards:write,pins:read,pins:write,user_accounts:read'
  });
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
async function exchangeCodeForTokens(authCode) {
  console.log('🔄 Exchanging authorization code for tokens...');
  
  const tokenEndpoint = 'https://api.pinterest.com/v5/oauth/token';
  
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code: authCode,
    redirect_uri: CONFIG.REDIRECT_URI
  });

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${CONFIG.CLIENT_ID}:${CONFIG.CLIENT_SECRET}`).toString('base64')}`
    },
    body: params.toString()
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
  }

  const tokenData = await response.json();
  console.log('✅ Successfully exchanged code for tokens');

  return {
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_in: tokenData.expires_in,
    token_type: tokenData.token_type,
    scope: tokenData.scope,
    created_at: new Date().toISOString()
  };
}

/**
 * Automatic token generation when no refresh tokens exist
 */
async function autoGenerateTokens() {
  console.log('🔧 No refresh tokens found. Starting automatic token generation...');
  console.log('💰 CRITICAL: Pinterest generates 20-35 monthly sales - automation must be restored!');
  
  // Check if we have required credentials
  if (!CONFIG.CLIENT_ID || !CONFIG.CLIENT_SECRET) {
    console.error('❌ PINTEREST_CLIENT_ID and PINTEREST_CLIENT_SECRET are required');
    console.error('🔧 Please add these to your .env.local file');
    return false;
  }
  
  const authUrl = generateAuthUrl();
  console.log('\n📋 AUTOMATIC TOKEN GENERATION INSTRUCTIONS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. Open this URL in your browser:');
  console.log(`   ${authUrl}`);
  console.log('\n2. Log in to Pinterest and authorize the app');
  console.log('3. Copy the authorization code from the URL after redirect');
  console.log('4. Run: npm run pinterest:auth [YOUR_AUTH_CODE]');
  console.log('\nThis will automatically set up all refresh tokens for future use.');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  return false;
}

/**
 * Test Pinterest API access with token
 */
async function testApiAccess(accessToken) {
  try {
    const response = await fetch('https://api.pinterest.com/v5/user_account', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const userData = await response.json();
      console.log(`✅ API test successful for user: ${userData.username || 'Unknown'}`);
      return true;
    } else {
      console.error(`❌ API test failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ API test error:', error.message);
    return false;
  }
}

/**
 * Smart refresh with automatic fallback to backup tokens
 */
async function smartRefresh() {
  const refreshTokens = [
    { token: CONFIG.PRIMARY_REFRESH_TOKEN, type: 'primary' },
    { token: CONFIG.BACKUP_REFRESH_TOKEN, type: 'backup' },
    { token: CONFIG.TERTIARY_REFRESH_TOKEN, type: 'tertiary' }
  ].filter(item => item.token); // Only use tokens that exist

  console.log(`🚀 Starting smart Pinterest token refresh with ${refreshTokens.length} available tokens...`);

  // If no refresh tokens exist, trigger automatic token generation
  if (refreshTokens.length === 0) {
    return await autoGenerateTokens();
  }

  for (const { token, type } of refreshTokens) {
    for (let attempt = 1; attempt <= CONFIG.MAX_RETRIES; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${CONFIG.MAX_RETRIES} for ${type} token...`);
        
        const tokenData = await refreshAccessToken(token, type);
        
        // Test the new access token
        const apiWorking = await testApiAccess(tokenData.access_token);
        
        if (apiWorking) {
          // Success! Save tokens and update environment
          await saveTokensToFile(tokenData);
          await updateEnvFile(tokenData);
          
          console.log(`🎉 SUCCESS! Pinterest token refreshed using ${type} token`);
          console.log(`🔑 New Access Token: ${tokenData.access_token.substring(0, 20)}...`);
          console.log(`📅 Expires in: ${tokenData.expires_in} seconds`);
          console.log(`💰 Revenue stream protected: Pinterest generates 20-35 monthly sales`);
          
          return {
            success: true,
            tokenData,
            source: type,
            attempts: attempt
          };
        } else {
          console.log(`⚠️ Token refreshed but API test failed for ${type} token`);
        }
        
      } catch (error) {
        console.error(`❌ Failed to refresh ${type} token (attempt ${attempt}): ${error.message}`);
        
        if (attempt < CONFIG.MAX_RETRIES) {
          console.log(`⏳ Waiting ${CONFIG.RETRY_DELAY}ms before retry...`);
          await sleep(CONFIG.RETRY_DELAY);
        }
      }
    }
    
    console.log(`💥 All attempts failed for ${type} token, trying next token...`);
  }

  // All tokens failed - trigger automatic token generation
  console.error('🚨 CRITICAL: All Pinterest refresh tokens failed!');
  console.error('🚨 REVENUE IMPACT: Pinterest automation stopped - 20-35 monthly sales at risk!');
  await autoGenerateTokens();
  
  return {
    success: false,
    error: 'All refresh tokens failed',
    impact: 'Revenue stream interrupted - immediate action required'
  };
}

/**
 * Quick token check without full refresh
 */
async function quickHealthCheck() {
  const accessToken = process.env.PINTEREST_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.log('⚠️ No access token found for health check');
    return false;
  }

  console.log('🏥 Performing Pinterest health check...');
  return await testApiAccess(accessToken);
}

// Main execution
async function main() {
  const command = process.argv[2] || 'refresh';
  const authCode = process.argv[3]; // For auth command

  try {
    switch (command) {
      case 'health':
      case 'check':
        const isHealthy = await quickHealthCheck();
        process.exit(isHealthy ? 0 : 1);
        break;
        
      case 'auth':
      case 'authorize':
        if (!authCode) {
          console.error('❌ Authorization code required');
          console.error('Usage: npm run pinterest:auth [AUTH_CODE]');
          process.exit(1);
        }
        
        try {
          const tokenData = await exchangeCodeForTokens(authCode);
          await saveTokensToFile(tokenData);
          await updateEnvFile(tokenData);
          
          console.log('🎉 SUCCESS! Pinterest tokens configured');
          console.log('💰 Revenue stream restored: Pinterest automation ready');
          console.log('🔄 Automatic refresh system now active');
          process.exit(0);
        } catch (error) {
          console.error('❌ Authorization failed:', error.message);
          process.exit(1);
        }
        break;
        
      case 'generate':
      case 'setup':
        await autoGenerateTokens();
        process.exit(1); // Exit with error since manual action required
        break;
        
      case 'refresh':
      case 'smart-refresh':
      default:
        const result = await smartRefresh();
        process.exit(result.success ? 0 : 1);
        break;
    }
  } catch (error) {
    console.error('💥 Pinterest refresh system error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { smartRefresh, quickHealthCheck, refreshAccessToken, exchangeCodeForTokens, autoGenerateTokens, updateEnvFile };