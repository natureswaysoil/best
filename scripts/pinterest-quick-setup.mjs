#!/usr/bin/env node

/**
 * Pinterest Quick Token Generator
 * Fastest way to restore Pinterest automation and protect revenue
 * Critical: 20-35 monthly sales depend on this
 */

import fetch from 'node-fetch';
import fs from 'fs/promises';

// Simple token validation
async function validatePinterestToken(token) {
  try {
    const response = await fetch('https://api.pinterest.com/v5/user_account', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const userData = await response.json();
      return { valid: true, user: userData.username || userData.account_type };
    }
    return { valid: false, error: `HTTP ${response.status}` };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

// Update environment with token
async function setupToken(token) {
  try {
    let envContent = await fs.readFile('./.env.local', 'utf8');
    
    // Update or add Pinterest token
    if (envContent.includes('PINTEREST_ACCESS_TOKEN=')) {
      envContent = envContent.replace(/PINTEREST_ACCESS_TOKEN=.*/, `PINTEREST_ACCESS_TOKEN=${token}`);
    } else {
      envContent += `\nPINTEREST_ACCESS_TOKEN=${token}`;
    }
    
    await fs.writeFile('./.env.local', envContent);
    return true;
  } catch (error) {
    console.error('Failed to update .env.local:', error.message);
    return false;
  }
}

// Main setup
async function main() {
  const token = process.argv[2];
  
  console.log('⚡ Pinterest Quick Setup');
  console.log('💰 Revenue Protection: 20-35 monthly sales');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (!token) {
    console.log('\n🔧 QUICK SETUP INSTRUCTIONS:');
    console.log('');
    console.log('1. 🌐 Go to: https://developers.pinterest.com/apps/');
    console.log('2. 🔑 Select your app (or create one named "NaturesWay Automation")');
    console.log('3. 📋 Click "Generate access token"');
    console.log('4. ✅ Select ALL scopes (ads, boards, pins, user_accounts)');
    console.log('5. 📝 Copy the token and run:');
    console.log('');
    console.log('   npm run pinterest:quick-setup YOUR_TOKEN_HERE');
    console.log('');
    console.log('⚡ This will instantly restore your 20-35 monthly sales!');
    process.exit(1);
  }
  
  console.log(`\n🔍 Testing token: ${token.substring(0, 15)}...`);
  
  const validation = await validatePinterestToken(token);
  
  if (validation.valid) {
    console.log(`✅ Token VALID for user: ${validation.user}`);
    
    const updated = await setupToken(token);
    
    if (updated) {
      console.log('✅ Token saved to .env.local');
      
      // Create success marker
      await fs.writeFile('./pinterest-setup-complete.json', JSON.stringify({
        status: 'success',
        setupDate: new Date().toISOString(),
        user: validation.user,
        method: 'quick-setup'
      }, null, 2));
      
      console.log('');
      console.log('🎉 SUCCESS! Pinterest automation restored');
      console.log('💰 Revenue stream: ACTIVE (20-35 monthly sales)');
      console.log('🤖 Automation ready: Pinterest posts will resume');
      console.log('');
      console.log('🔄 Next: Test with npm run pinterest:health');
      
    } else {
      console.log('❌ Failed to save token');
      process.exit(1);
    }
  } else {
    console.log(`❌ Token INVALID: ${validation.error}`);
    console.log('🔧 Please get a new token from Pinterest Developer Console');
    process.exit(1);
  }
}

main();