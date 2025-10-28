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
  PRIMARY_REFRESH_TOKEN: process.env.PINTEREST_REFRESH_TOKEN,
  BACKUP_REFRESH_TOKEN: process.env.PINTEREST_BACKUP_REFRESH_TOKEN,
  TERTIARY_REFRESH_TOKEN: process.env.PINTEREST_TERTIARY_REFRESH_TOKEN,
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000,
  TOKEN_FILE: './pinterest-tokens.json'
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

  for (const { token, type } of refreshTokens) {
    for (let attempt = 1; attempt <= CONFIG.MAX_RETRIES; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${CONFIG.MAX_RETRIES} for ${type} token...`);
        
        const tokenData = await refreshAccessToken(token, type);
        
        // Test the new access token
        const apiWorking = await testApiAccess(tokenData.access_token);
        
        if (apiWorking) {
          // Success! Save tokens and exit
          await saveTokensToFile(tokenData);
          
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

  // All tokens failed
  console.error('🚨 CRITICAL: All Pinterest refresh tokens failed!');
  console.error('🚨 REVENUE IMPACT: Pinterest automation stopped - 20-35 monthly sales at risk!');
  console.error('🔧 URGENT ACTION REQUIRED: Manual token refresh needed');
  
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

  try {
    switch (command) {
      case 'health':
      case 'check':
        const isHealthy = await quickHealthCheck();
        process.exit(isHealthy ? 0 : 1);
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

export { smartRefresh, quickHealthCheck, refreshAccessToken };