#!/usr/bin/env node
/**
 * Simple Twitter and YouTube credential test
 */

console.log('🔑 Testing API Credentials...');

// Test Twitter Bearer Token
if (process.env.TWITTER_BEARER_TOKEN) {
  console.log('\n🐦 Testing Twitter API...');
  try {
    const response = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const user = await response.json();
      console.log(`✅ Twitter API connected as: @${user.data?.username || 'Unknown'}`);
      console.log(`   Account ID: ${user.data?.id}`);
    } else {
      console.log(`❌ Twitter API error: ${response.status}`);
      const error = await response.text();
      console.log(`   Error: ${error}`);
    }
  } catch (error) {
    console.log(`❌ Twitter API error: ${error.message}`);
  }
} else {
  console.log('❌ TWITTER_BEARER_TOKEN not found');
}

// Test Twitter OAuth 1.0a credentials
if (process.env.TWITTER_API_KEY && process.env.TWITTER_ACCESS_TOKEN) {
  console.log('\n🔐 Twitter OAuth 1.0a credentials present:');
  console.log(`   API Key: ${process.env.TWITTER_API_KEY.substring(0, 10)}...`);
  console.log(`   Access Token: ${process.env.TWITTER_ACCESS_TOKEN.substring(0, 10)}...`);
} else {
  console.log('\n❌ Twitter OAuth 1.0a credentials missing');
}

// Test YouTube OAuth
if (process.env.YT_CLIENT_ID && process.env.YT_REFRESH_TOKEN) {
  console.log('\n📺 Testing YouTube API...');
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.YT_CLIENT_ID,
        client_secret: process.env.YT_CLIENT_SECRET,
        refresh_token: process.env.YT_REFRESH_TOKEN,
        grant_type: 'refresh_token'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ YouTube OAuth token refresh successful');
      
      // Test YouTube API with the fresh token
      const channelResponse = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
        headers: {
          'Authorization': `Bearer ${data.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (channelResponse.ok) {
        const channelData = await channelResponse.json();
        const channel = channelData.items?.[0];
        console.log(`✅ YouTube API connected as: ${channel?.snippet?.title || 'Unknown'}`);
        console.log(`   Channel ID: ${channel?.id}`);
      } else {
        console.log(`❌ YouTube API error: ${channelResponse.status}`);
      }
    } else {
      console.log(`❌ YouTube token refresh failed: ${response.status}`);
      const error = await response.text();
      console.log(`   Error: ${error}`);
    }
  } catch (error) {
    console.log(`❌ YouTube API error: ${error.message}`);
  }
} else {
  console.log('\n❌ YouTube credentials missing');
}

console.log('\n🎯 Credential Test Complete!');
console.log('If both platforms show ✅, you can proceed with posting.');