#!/usr/bin/env node

/**
 * Quick Twitter Test
 * Test Twitter posting with just Bearer Token
 */

import fetch from 'node-fetch';

async function testTwitter() {
  console.log('🐦 Quick Twitter Test');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;
  
  if (!bearerToken || bearerToken === 'your_twitter_bearer_token') {
    console.log('❌ No Twitter Bearer Token found');
    console.log('');
    console.log('🔧 QUICK SETUP:');
    console.log('1. Go to: https://developer.twitter.com/en/portal/dashboard');
    console.log('2. Select your app');
    console.log('3. Go to "Keys and tokens"');
    console.log('4. Copy "Bearer Token"');
    console.log('5. Add to .env.local:');
    console.log('   TWITTER_BEARER_TOKEN=your_actual_bearer_token');
    console.log('6. Run: npm run twitter:test');
    process.exit(1);
  }
  
  try {
    console.log('🔍 Testing Twitter API access...');
    
    // Test API access
    const response = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const userData = await response.json();
      const username = userData.data?.username || 'Unknown';
      
      console.log(`✅ Twitter API working!`);
      console.log(`👤 Account: @${username}`);
      console.log(`🆔 User ID: ${userData.data?.id}`);
      
      console.log('');
      console.log('🎉 SUCCESS! Twitter is ready for posting');
      console.log('⚡ Next: Test posting with npm run social:manual');
      
      return true;
    } else {
      const error = await response.text();
      console.log(`❌ Twitter API failed: ${response.status}`);
      console.log(`Error: ${error}`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Twitter test error: ${error.message}`);
    return false;
  }
}

testTwitter();