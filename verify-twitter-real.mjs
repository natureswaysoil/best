#!/usr/bin/env node
/**
 * Verify Twitter posting with detailed error checking
 */

import crypto from 'crypto';

function generateTwitterOAuth1aSignature(method, url, params, consumerSecret, tokenSecret) {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  const signatureBaseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret || '')}`;
  const signature = crypto.createHmac('sha1', signingKey).update(signatureBaseString).digest('base64');
  
  return signature;
}

function createTwitterOAuth1aHeader(method, url, bodyParams = {}) {
  const consumerKey = process.env.TWITTER_API_KEY;
  const consumerSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;
  
  if (!consumerKey || !consumerSecret || !accessToken || !accessTokenSecret) {
    throw new Error('Missing Twitter OAuth 1.0a credentials');
  }
  
  const oauthParams = {
    oauth_consumer_key: consumerKey,
    oauth_token: accessToken,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_version: '1.0'
  };
  
  const allParams = { ...oauthParams, ...bodyParams };
  const signature = generateTwitterOAuth1aSignature(method, url, allParams, consumerSecret, accessTokenSecret);
  oauthParams.oauth_signature = signature;
  
  const authHeader = 'OAuth ' + Object.keys(oauthParams)
    .sort()
    .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
    .join(', ');
  
  return authHeader;
}

async function verifyTwitterPosting() {
  console.log('🐦 Verifying Twitter posting with detailed checks...');
  console.log('===================================================');
  
  // First, verify we can authenticate
  try {
    console.log('\n1. 🔑 Checking credentials...');
    const creds = {
      TWITTER_API_KEY: process.env.TWITTER_API_KEY?.substring(0, 10) + '...',
      TWITTER_API_SECRET: process.env.TWITTER_API_SECRET ? 'Present' : 'Missing',
      TWITTER_ACCESS_TOKEN: process.env.TWITTER_ACCESS_TOKEN?.substring(0, 10) + '...',
      TWITTER_ACCESS_TOKEN_SECRET: process.env.TWITTER_ACCESS_TOKEN_SECRET ? 'Present' : 'Missing'
    };
    
    console.log('Credentials:', JSON.stringify(creds, null, 2));
    
    // Test authentication with user info
    console.log('\n2. 🔍 Testing authentication...');
    const authHeader = createTwitterOAuth1aHeader('GET', 'https://api.twitter.com/1.1/account/verify_credentials.json');
    
    const verifyResponse = await fetch('https://api.twitter.com/1.1/account/verify_credentials.json', {
      method: 'GET',
      headers: {
        'Authorization': authHeader
      }
    });
    
    if (verifyResponse.ok) {
      const user = await verifyResponse.json();
      console.log(`✅ Authentication successful!`);
      console.log(`   Username: @${user.screen_name}`);
      console.log(`   User ID: ${user.id}`);
      console.log(`   Followers: ${user.followers_count}`);
      
      // Now try to post a test tweet
      console.log('\n3. 📝 Attempting to post a test tweet...');
      const tweetText = `🧪 Test post from Nature's Way Soil automation system - ${new Date().toISOString()}`;
      
      const postAuthHeader = createTwitterOAuth1aHeader('POST', 'https://api.twitter.com/2/tweets');
      
      const postResponse = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Authorization': postAuthHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: tweetText })
      });
      
      console.log(`   Response status: ${postResponse.status}`);
      const responseText = await postResponse.text();
      console.log(`   Response body: ${responseText}`);
      
      if (postResponse.ok) {
        const result = JSON.parse(responseText);
        console.log(`\n✅ Tweet posted successfully!`);
        console.log(`   Tweet ID: ${result.data?.id}`);
        console.log(`   Tweet URL: https://twitter.com/${user.screen_name}/status/${result.data?.id}`);
        return true;
      } else {
        console.log(`\n❌ Tweet posting failed`);
        return false;
      }
      
    } else {
      const errorText = await verifyResponse.text();
      console.log(`❌ Authentication failed: ${verifyResponse.status}`);
      console.log(`   Error: ${errorText}`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    console.log(`   Stack: ${error.stack}`);
    return false;
  }
}

verifyTwitterPosting().catch(console.error);