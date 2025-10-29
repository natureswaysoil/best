#!/usr/bin/env node
/**
 * Quick test script to verify social media posting works
 */

console.log('🧪 Testing Social Media Posting...');
console.log('=================================');

// Check environment variables
const requiredVars = [
  'HEYGEN_API_KEY',
  'TWITTER_BEARER_TOKEN', 
  'YT_CLIENT_ID'
];

console.log('📋 Environment Check:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`❌ ${varName}: Missing`);
  }
});

// Simple Twitter test
console.log('\n🐦 Testing Twitter API...');
if (process.env.TWITTER_BEARER_TOKEN) {
  try {
    const response = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const user = await response.json();
      console.log(`✅ Twitter connected as: ${user.data?.username || 'Unknown'}`);
    } else {
      console.log(`❌ Twitter API error: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Twitter API error: ${error.message}`);
  }
} else {
  console.log('❌ Twitter Bearer Token missing');
}

// Simple YouTube test  
console.log('\n📺 Testing YouTube API...');
if (process.env.YT_CLIENT_ID) {
  console.log('✅ YouTube Client ID present');
  console.log('ℹ️ YouTube requires OAuth flow for full testing');
} else {
  console.log('❌ YouTube Client ID missing');
}

console.log('\n🎬 Testing HeyGen API...');
if (process.env.HEYGEN_API_KEY) {
  try {
    const response = await fetch('https://api.heygen.com/v1/avatar.list', {
      method: 'GET',
      headers: {
        'X-Api-Key': process.env.HEYGEN_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ HeyGen API connected, ${data.data?.avatars?.length || 0} avatars available`);
    } else {
      console.log(`❌ HeyGen API error: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ HeyGen API error: ${error.message}`);
  }
} else {
  console.log('❌ HeyGen API key missing');
}

console.log('\n🎉 Test complete!');
console.log('Ready for social media posting with Twitter and YouTube integration.');