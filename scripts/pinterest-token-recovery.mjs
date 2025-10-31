#!/usr/bin/env node

/**
 * Pinterest Token Recovery System
 * Finds and recovers Pinterest credentials from various sources
 * Critical: Pinterest generates 20-35 monthly sales
 */

import fetch from 'node-fetch';
import fs from 'fs/promises';

console.log('🔍 Pinterest Token Recovery Starting...');
console.log('💰 CRITICAL: 20-35 monthly sales depend on Pinterest automation');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

/**
 * Check all possible token sources
 */
async function findPinterestTokens() {
  const sources = [];
  
  console.log('\n🔎 Scanning for Pinterest credentials...');
  
  // Check environment variables
  const envTokens = {
    'PINTEREST_ACCESS_TOKEN': process.env.PINTEREST_ACCESS_TOKEN,
    'PINTEREST_TOKEN': process.env.PINTEREST_TOKEN,
    'PINTEREST_API_TOKEN': process.env.PINTEREST_API_TOKEN,
    'PINTEREST_CLIENT_ID': process.env.PINTEREST_CLIENT_ID,
    'PINTEREST_CLIENT_SECRET': process.env.PINTEREST_CLIENT_SECRET,
    'PINTEREST_REFRESH_TOKEN': process.env.PINTEREST_REFRESH_TOKEN,
    'PINTEREST_BACKUP_REFRESH_TOKEN': process.env.PINTEREST_BACKUP_REFRESH_TOKEN
  };
  
  for (const [key, value] of Object.entries(envTokens)) {
    if (value && value !== 'your_pinterest_access_token' && value !== 'your_pinterest_client_id') {
      sources.push({
        source: 'Environment Variable',
        key,
        value: value.substring(0, 20) + '...',
        fullValue: value,
        type: key.includes('ACCESS') ? 'access_token' : 
              key.includes('CLIENT_ID') ? 'client_id' :
              key.includes('CLIENT_SECRET') ? 'client_secret' :
              key.includes('REFRESH') ? 'refresh_token' : 'unknown'
      });
    }
  }
  
  // Check for token files
  const tokenFiles = [
    './pinterest-tokens.json',
    './pinterest-setup-complete.json',
    './.pinterest-config.json'
  ];
  
  for (const file of tokenFiles) {
    try {
      const content = await fs.readFile(file, 'utf8');
      const data = JSON.parse(content);
      if (data.access_token || data.refresh_token) {
        sources.push({
          source: 'Token File',
          key: file,
          value: 'Found stored tokens',
          fullValue: data,
          type: 'token_file'
        });
      }
    } catch {
      // File doesn't exist, skip
    }
  }
  
  return sources;
}

/**
 * Test Pinterest token validity
 */
async function testToken(token) {
  try {
    const response = await fetch('https://api.pinterest.com/v5/user_account', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const userData = await response.json();
      return {
        valid: true,
        user: userData.username || userData.account_type || 'Pinterest User',
        data: userData
      };
    } else {
      return {
        valid: false,
        error: `HTTP ${response.status}`,
        status: response.status
      };
    }
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}

/**
 * Attempt to use working credentials to generate new tokens
 */
async function generateWorkingSetup(credentials) {
  console.log('\n🔧 Attempting to restore Pinterest automation...');
  
  // Find access token
  const accessTokenCred = credentials.find(c => c.type === 'access_token');
  
  if (accessTokenCred) {
    console.log('🔑 Testing found access token...');
    const testResult = await testToken(accessTokenCred.fullValue);
    
    if (testResult.valid) {
      console.log(`✅ Access token WORKS for: ${testResult.user}`);
      
      // Update .env.local with working token
      try {
        let envContent = await fs.readFile('./.env.local', 'utf8');
        
        if (envContent.includes('PINTEREST_ACCESS_TOKEN=')) {
          envContent = envContent.replace(
            /PINTEREST_ACCESS_TOKEN=.*/,
            `PINTEREST_ACCESS_TOKEN=${accessTokenCred.fullValue}`
          );
        } else {
          envContent += `\nPINTEREST_ACCESS_TOKEN=${accessTokenCred.fullValue}`;
        }
        
        await fs.writeFile('./.env.local', envContent);
        console.log('✅ Updated .env.local with working token');
        
        // Create success marker
        await fs.writeFile('./pinterest-setup-complete.json', JSON.stringify({
          status: 'recovered',
          recoveredAt: new Date().toISOString(),
          user: testResult.user,
          revenueProtected: '20-35 monthly sales',
          source: accessTokenCred.source
        }, null, 2));
        
        console.log('🎉 SUCCESS! Pinterest automation restored');
        console.log('💰 Revenue stream: ACTIVE (20-35 monthly sales)');
        console.log('🤖 Automatic posting: READY');
        
        return true;
      } catch (error) {
        console.error('❌ Failed to update files:', error.message);
      }
    } else {
      console.log(`❌ Access token expired: ${testResult.error}`);
    }
  }
  
  return false;
}

/**
 * Provide manual setup instructions
 */
function provideManualInstructions() {
  console.log('\n🔧 Manual Pinterest Setup Required');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('🚨 URGENT: 20-35 monthly sales are at risk!');
  console.log('');
  console.log('📱 QUICK SETUP (2 minutes):');
  console.log('');
  console.log('1. Open: https://developers.pinterest.com/apps/');
  console.log('2. Select your existing app or create new one');
  console.log('3. Go to "Generate access token"');
  console.log('4. Select scopes: ads:read, ads:write, boards:read, boards:write, pins:read, pins:write, user_accounts:read');
  console.log('5. Copy the generated token');
  console.log('6. Add to .env.local:');
  console.log('   PINTEREST_ACCESS_TOKEN=your_token_here');
  console.log('7. Run: npm run pinterest:recovery');
  console.log('');
  console.log('💡 This will restore your 20-35 monthly sales revenue stream!');
}

/**
 * Main recovery flow
 */
async function main() {
  try {
    // Find existing credentials
    const credentials = await findPinterestTokens();
    
    console.log(`\n📊 Found ${credentials.length} potential Pinterest credentials:`);
    
    if (credentials.length === 0) {
      console.log('❌ No Pinterest credentials found');
      provideManualInstructions();
      process.exit(1);
    }
    
    // Display found credentials
    for (const cred of credentials) {
      console.log(`   ${cred.source}: ${cred.key} (${cred.type})`);
    }
    
    // Try to restore with found credentials
    const success = await generateWorkingSetup(credentials);
    
    if (success) {
      console.log('\n✅ Pinterest automation restored successfully!');
      process.exit(0);
    } else {
      console.log('\n❌ Could not restore with found credentials');
      provideManualInstructions();
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n💥 Recovery error:', error.message);
    provideManualInstructions();
    process.exit(1);
  }
}

// Run recovery
main();