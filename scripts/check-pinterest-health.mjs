#!/usr/bin/env node

/**
 * Pinterest Health Monitor
 * Monitors Pinterest API health and revenue stream status
 * Revenue Protection: Pinterest generates 20-35 monthly sales
 */

import fetch from 'node-fetch';

// Configuration
const CONFIG = {
  ACCESS_TOKEN: process.env.PINTEREST_ACCESS_TOKEN,
  REVENUE_IMPACT: '20-35 monthly sales',
  HEALTH_ENDPOINTS: [
    'https://api.pinterest.com/v5/user_account',
    'https://api.pinterest.com/v5/boards'
  ]
};

/**
 * Test Pinterest API endpoint
 */
async function testEndpoint(url, name) {
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${CONFIG.ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    const status = response.ok ? '✅' : '❌';
    const statusCode = response.status;
    
    console.log(`${status} ${name}: ${statusCode} ${response.statusText}`);
    
    return response.ok;
  } catch (error) {
    console.log(`❌ ${name}: Error - ${error.message}`);
    return false;
  }
}

/**
 * Comprehensive Pinterest health check
 */
async function performHealthCheck() {
  console.log('🏥 Pinterest API Health Check Starting...');
  console.log('💰 Revenue Impact:', CONFIG.REVENUE_IMPACT);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (!CONFIG.ACCESS_TOKEN) {
    console.log('❌ CRITICAL: No Pinterest access token found!');
    console.log('🚨 REVENUE IMPACT: Pinterest automation stopped');
    console.log('🔧 ACTION REQUIRED: Run npm run pinterest:refresh');
    return false;
  }

  let allHealthy = true;

  // Test each endpoint
  for (const endpoint of CONFIG.HEALTH_ENDPOINTS) {
    const endpointName = endpoint.split('/').pop() || 'API';
    const isHealthy = await testEndpoint(endpoint, endpointName);
    
    if (!isHealthy) {
      allHealthy = false;
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (allHealthy) {
    console.log('🎉 Pinterest API is HEALTHY');
    console.log('💰 Revenue stream PROTECTED');
    console.log('📈 Pinterest automation operational');
  } else {
    console.log('🚨 Pinterest API has ISSUES');
    console.log('⚠️ Revenue stream at RISK');
    console.log('🔧 Run: npm run pinterest:fix');
    console.log('💡 Or: npm run pinterest:smart-refresh');
  }

  return allHealthy;
}

/**
 * Quick status check
 */
async function quickStatus() {
  if (!CONFIG.ACCESS_TOKEN) {
    console.log('❌ No Pinterest token');
    return false;
  }

  const response = await fetch('https://api.pinterest.com/v5/user_account', {
    headers: {
      'Authorization': `Bearer ${CONFIG.ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    timeout: 5000
  }).catch(() => null);

  const status = response?.ok ? '✅ HEALTHY' : '❌ UNHEALTHY';
  console.log(`Pinterest API: ${status}`);
  
  return response?.ok || false;
}

// Main execution
async function main() {
  const command = process.argv[2] || 'full';

  try {
    let result;
    
    switch (command) {
      case 'quick':
        result = await quickStatus();
        break;
      case 'full':
      default:
        result = await performHealthCheck();
        break;
    }

    process.exit(result ? 0 : 1);
  } catch (error) {
    console.error('💥 Health check failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { performHealthCheck, quickStatus };