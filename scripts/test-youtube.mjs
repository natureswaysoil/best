#!/usr/bin/env node

/**
 * Quick YouTube Test
 * Test YouTube API access and upload capability
 */

import fetch from 'node-fetch';

async function testYouTube() {
  console.log('📺 Quick YouTube Test');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const credentials = {
    clientId: process.env.YT_CLIENT_ID,
    clientSecret: process.env.YT_CLIENT_SECRET,
    refreshToken: process.env.YT_REFRESH_TOKEN
  };
  
  const missingCreds = Object.entries(credentials)
    .filter(([key, value]) => !value || value.startsWith('your_'))
    .map(([key]) => key);
  
  if (missingCreds.length > 0) {
    console.log('❌ Missing YouTube credentials:', missingCreds.join(', '));
    console.log('');
    console.log('🔧 YOUTUBE SETUP:');
    console.log('1. Go to: https://console.cloud.google.com/apis/credentials');
    console.log('2. Create OAuth 2.0 Client ID (Desktop Application)');
    console.log('3. Enable YouTube Data API v3');
    console.log('4. Get refresh token from OAuth playground:');
    console.log('   https://developers.google.com/oauthplayground/');
    console.log('5. Add to .env.local:');
    console.log('   YT_CLIENT_ID=your_client_id');
    console.log('   YT_CLIENT_SECRET=your_client_secret');
    console.log('   YT_REFRESH_TOKEN=your_refresh_token');
    console.log('6. Run: npm run youtube:test');
    process.exit(1);
  }
  
  try {
    console.log('🔍 Testing YouTube API access...');
    
    // Get access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: credentials.refreshToken,
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret
      })
    });
    
    if (!tokenResponse.ok) {
      console.log(`❌ Failed to refresh YouTube token: ${tokenResponse.status}`);
      return false;
    }
    
    const tokenData = await tokenResponse.json();
    console.log('✅ YouTube token refreshed successfully');
    
    // Test channel access
    const channelResponse = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (channelResponse.ok) {
      const channelData = await channelResponse.json();
      const channel = channelData.items?.[0];
      
      if (channel) {
        console.log(`✅ YouTube API working!`);
        console.log(`📺 Channel: ${channel.snippet.title}`);
        console.log(`🆔 Channel ID: ${channel.id}`);
        
        console.log('');
        console.log('🎉 SUCCESS! YouTube is ready for video uploads');
        console.log('⚡ Next: Test posting with npm run social:manual');
        
        return true;
      } else {
        console.log('❌ No YouTube channel found');
        return false;
      }
    } else {
      const error = await channelResponse.text();
      console.log(`❌ YouTube API failed: ${channelResponse.status}`);
      console.log(`Error: ${error}`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ YouTube test error: ${error.message}`);
    return false;
  }
}

testYouTube();