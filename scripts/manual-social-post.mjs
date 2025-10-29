#!/usr/bin/env node

/**
 * Manual Social Media Post
 * Quick way to trigger social media posts manually
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🚀 Manual Social Media Posting');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

async function manualPost() {
  try {
    console.log('📤 Running social media automation...');
    
    const { stdout, stderr } = await execAsync('node scripts/social-media-auto-post.mjs');
    
    console.log('✅ Output:');
    console.log(stdout);
    
    if (stderr) {
      console.log('⚠️ Warnings:');
      console.log(stderr);
    }
    
    console.log('🎉 Manual posting complete!');
    
  } catch (error) {
    console.error('❌ Manual posting failed:', error.message);
    process.exit(1);
  }
}

manualPost();
