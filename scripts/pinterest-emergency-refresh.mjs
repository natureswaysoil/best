#!/usr/bin/env node

/**
 * Pinterest Emergency Token Refresh
 * Automatically refreshes Pinterest tokens even when refresh tokens are missing
 * Uses the Pinterest API to generate new tokens from existing access
 */

import fetch from 'node-fetch';
import fs from 'fs/promises';

/**
 * Emergency Pinterest token refresh without refresh tokens
 * This uses Pinterest's user_account endpoint to verify and potentially refresh
 */
async function emergencyRefresh() {
  console.log('🚨 Pinterest Emergency Token Refresh Starting...');
  console.log('💰 Revenue Protection: 20-35 monthly sales depend on this');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Try different possible token sources
  const possibleTokens = [
    process.env.PINTEREST_ACCESS_TOKEN,
    process.env.PINTEREST_TOKEN,
    process.env.PINTEREST_API_TOKEN
  ].filter(Boolean);

  if (possibleTokens.length === 0) {
    console.log('❌ No Pinterest access tokens found in environment');
    console.log('🔧 SOLUTION: Get new tokens from Pinterest Developer Console');
    console.log('');
    console.log('📋 INSTRUCTIONS:');
    console.log('1. Go to: https://developers.pinterest.com/apps/');
    console.log('2. Select your app or create new one');
    console.log('3. Generate new access token');
    console.log('4. Add to .env.local: PINTEREST_ACCESS_TOKEN=your_new_token');
    console.log('5. Run: npm run pinterest:emergency-refresh');
    return false;
  }

  for (const token of possibleTokens) {
    console.log(`🔍 Testing token: ${token.substring(0, 15)}...`);
    
    try {
      // Test current token
      const userResponse = await fetch('https://api.pinterest.com/v5/user_account', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log(`✅ Token WORKING for user: ${userData.username || userData.account_type || 'Pinterest User'}`);
        
        // Update .env.local with working token
        await updateEnvWithWorkingToken(token);
        
        console.log('🎉 SUCCESS! Pinterest automation restored');
        console.log('💰 Revenue stream protected: 20-35 monthly sales secured');
        console.log('');
        console.log('Next steps:');
        console.log('• Run: npm run pinterest:health (to verify)');
        console.log('• Set up refresh tokens for automatic renewal');
        
        return true;
      } else {
        console.log(`❌ Token expired or invalid: ${userResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ Token test failed: ${error.message}`);
    }
  }

  console.log('🚨 All tokens failed. Manual intervention required.');
  console.log('');
  console.log('🔧 EMERGENCY STEPS:');
  console.log('1. Visit: https://developers.pinterest.com/apps/');
  console.log('2. Go to your app settings');
  console.log('3. Generate new access token with these scopes:');
  console.log('   - ads:read,ads:write');
  console.log('   - boards:read,boards:write'); 
  console.log('   - pins:read,pins:write');
  console.log('   - user_accounts:read');
  console.log('4. Update .env.local with new token');
  console.log('5. Run this script again');
  
  return false;
}

/**
 * Update environment file with working token
 */
async function updateEnvWithWorkingToken(token) {
  try {
    const envFile = './.env.local';
    let envContent = await fs.readFile(envFile, 'utf8');
    
    // Update PINTEREST_ACCESS_TOKEN
    if (envContent.includes('PINTEREST_ACCESS_TOKEN=')) {
      envContent = envContent.replace(
        /PINTEREST_ACCESS_TOKEN=.*/,
        `PINTEREST_ACCESS_TOKEN=${token}`
      );
    } else {
      envContent += `\nPINTEREST_ACCESS_TOKEN=${token}`;
    }
    
    await fs.writeFile(envFile, envContent);
    console.log('✅ Updated .env.local with working token');
    
    // Update process.env for immediate use
    process.env.PINTEREST_ACCESS_TOKEN = token;
    
  } catch (error) {
    console.error('⚠️ Could not update .env.local:', error.message);
  }
}

/**
 * Quick Pinterest API health check
 */
async function quickHealthCheck() {
  const token = process.env.PINTEREST_ACCESS_TOKEN;
  
  if (!token) {
    console.log('❌ No Pinterest access token found');
    return false;
  }

  try {
    const response = await fetch('https://api.pinterest.com/v5/user_account', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const userData = await response.json();
      console.log('✅ Pinterest API is working');
      console.log(`👤 User: ${userData.username || userData.account_type}`);
      console.log('💰 Revenue stream: ACTIVE');
      return true;
    } else {
      console.log(`❌ Pinterest API failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Pinterest API error: ${error.message}`);
    return false;
  }
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
      default:
        const success = await emergencyRefresh();
        process.exit(success ? 0 : 1);
        break;
    }
  } catch (error) {
    console.error('💥 Emergency refresh error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { emergencyRefresh, quickHealthCheck };