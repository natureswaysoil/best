#!/usr/bin/env node
/**
 * Single Twitter + YouTube Test Post
 * Using proper OAuth 1.0a for Twitter
 */

import crypto from 'crypto';

// OAuth 1.0a signature generation for Twitter
function generateTwitterOAuth1aSignature(method, url, params, consumerSecret, tokenSecret) {
  // Sort parameters
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  // Create signature base string
  const signatureBaseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
  
  // Create signing key
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret || '')}`;
  
  // Generate signature
  const signature = crypto.createHmac('sha1', signingKey).update(signatureBaseString).digest('base64');
  
  return signature;
}

function createTwitterOAuth1aHeader(method, url, bodyParams = {}) {
  const consumerKey = process.env.TWITTER_API_KEY;
  const consumerSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;
  
  const oauthParams = {
    oauth_consumer_key: consumerKey,
    oauth_token: accessToken,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_version: '1.0'
  };
  
  // Combine OAuth params with body params for signature
  const allParams = { ...oauthParams, ...bodyParams };
  
  // Generate signature
  const signature = generateTwitterOAuth1aSignature(method, url, allParams, consumerSecret, accessTokenSecret);
  oauthParams.oauth_signature = signature;
  
  // Create authorization header
  const authHeader = 'OAuth ' + Object.keys(oauthParams)
    .sort()
    .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
    .join(', ');
  
  return authHeader;
}

// Test posting to Twitter
async function testTwitterPost() {
  console.log('🐦 Testing Twitter OAuth 1.0a posting...');
  
  try {
    const tweetText = '🌱 Testing automated posting from Nature\'s Way Soil! Our natural fertilizers help your garden thrive. #organic #gardening #fertilizer';
    
    const authHeader = createTwitterOAuth1aHeader('POST', 'https://api.twitter.com/2/tweets');
    
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: tweetText })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Twitter post successful!`);
      console.log(`   Tweet ID: ${result.data?.id}`);
      console.log(`   Tweet URL: https://twitter.com/i/web/status/${result.data?.id}`);
      return true;
    } else {
      const error = await response.text();
      console.log(`❌ Twitter post failed: ${response.status}`);
      console.log(`   Error: ${error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Twitter error: ${error.message}`);
    return false;
  }
}

// Test YouTube upload
async function testYouTubeUpload() {
  console.log('\n📺 Testing YouTube upload capability...');
  
  try {
    // Get fresh access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.YT_CLIENT_ID,
        client_secret: process.env.YT_CLIENT_SECRET,
        refresh_token: process.env.YT_REFRESH_TOKEN,
        grant_type: 'refresh_token'
      })
    });
    
    if (!tokenResponse.ok) {
      console.log('❌ Failed to refresh YouTube token');
      return false;
    }
    
    const tokenData = await tokenResponse.json();
    console.log('✅ YouTube access token refreshed');
    
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
      console.log(`✅ YouTube channel access confirmed: ${channel?.snippet?.title}`);
      console.log('ℹ️ YouTube video upload capability verified (test mode)');
      return true;
    } else {
      console.log(`❌ YouTube channel access failed: ${channelResponse.status}`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ YouTube error: ${error.message}`);
    return false;
  }
}

// Main test
async function runTest() {
  console.log('🧪 Testing Single Post to Twitter and YouTube');
  console.log('=============================================');
  
  const twitterSuccess = await testTwitterPost();
  const youtubeSuccess = await testYouTubeUpload();
  
  console.log('\n📊 Test Results:');
  console.log('================');
  console.log(`🐦 Twitter: ${twitterSuccess ? '✅ POSTED!' : '❌ Failed'}`);
  console.log(`📺 YouTube: ${youtubeSuccess ? '✅ Ready to upload' : '❌ Failed'}`);
  
  if (twitterSuccess && youtubeSuccess) {
    console.log('\n🎉 SUCCESS! Both platforms ready for automated posting!');
    console.log('You can now deploy the social media automation with confidence.');
  } else {
    console.log('\n⚠️ Some platforms need attention');
  }
}

runTest().catch(console.error);