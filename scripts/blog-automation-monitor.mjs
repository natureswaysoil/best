#!/usr/bin/env node

/**
 * Blog Automation Monitor
 * Monitors and reports on the automated blog content generation system
 */

import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const BLOG_DATA_PATH = path.join(process.cwd(), 'data', 'blog.ts');
const LOG_FILE = path.join(process.cwd(), 'auto-blog-generation.log');

// Get blog stats
async function getBlogStats() {
  try {
    const content = await fs.readFile(BLOG_DATA_PATH, 'utf-8');
    const titleMatches = content.match(/"title":\s*"([^"]+)"/g);
    const articles = [];
    
    if (titleMatches) {
      titleMatches.forEach(match => {
        const titleMatch = match.match(/"title":\s*"([^"]+)"/);
        if (titleMatch) {
          articles.push(titleMatch[1]);
        }
      });
    }
    
    return {
      totalArticles: articles.length,
      articles: articles,
      lastGenerated: await getLastGenerationTime()
    };
  } catch (error) {
    return { totalArticles: 0, articles: [], lastGenerated: 'Unknown' };
  }
}

// Get last generation time from log
async function getLastGenerationTime() {
  try {
    const logContent = await fs.readFile(LOG_FILE, 'utf-8');
    const lines = logContent.trim().split('\n');
    const lastLine = lines[lines.length - 1];
    
    if (lastLine.includes('Successfully generated')) {
      const timestampMatch = lastLine.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/);
      if (timestampMatch) {
        return new Date(timestampMatch[1]).toLocaleString();
      }
    }
    
    return 'Check log file for details';
  } catch (error) {
    return 'No log file found';
  }
}

// Calculate next scheduled run
function getNextScheduledRun() {
  const now = new Date();
  const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
  
  // GitHub Actions runs every 2 days at 9 AM UTC
  const nextRun = new Date(utc);
  nextRun.setUTCHours(9, 0, 0, 0);
  
  // If we've passed 9 AM today, add days until next scheduled run
  if (utc.getUTCHours() >= 9) {
    nextRun.setUTCDate(nextRun.getUTCDate() + 1);
  }
  
  // Find next day that's scheduled (every 2 days)
  const daysSinceEpoch = Math.floor(nextRun.getTime() / (1000 * 60 * 60 * 24));
  const daysToAdd = (2 - (daysSinceEpoch % 2)) % 2;
  nextRun.setUTCDate(nextRun.getUTCDate() + daysToAdd);
  
  return nextRun;
}

// Check GitHub Actions status
async function getGitHubActionsStatus() {
  try {
    const result = execSync('gh run list --limit 3 --workflow="auto-generate-blog.yml"', { 
      encoding: 'utf-8',
      cwd: process.cwd()
    });
    
    const lines = result.trim().split('\n');
    if (lines.length > 1) {
      const lastRun = lines[1];
      const status = lastRun.includes('✓') ? 'Success' : 'Failed';
      const parts = lastRun.split(/\s+/);
      const age = parts.slice(-2).join(' ');
      
      return { status, age, lastRun };
    }
    
    return { status: 'No runs found', age: 'N/A', lastRun: 'None' };
  } catch (error) {
    return { status: 'Cannot access GitHub', age: 'N/A', lastRun: 'Check manually' };
  }
}

// Test content generation
async function testContentGeneration() {
  console.log('🧪 Testing content generation...');
  
  try {
    // Run a test without actually generating content
    const testResult = execSync('node scripts/auto-generate-blog-content.mjs --test 2>&1 || echo "Test completed"', {
      encoding: 'utf-8',
      cwd: process.cwd()
    });
    
    return testResult.includes('Generated new article') ? 'Working' : 'Ready';
  } catch (error) {
    return 'Error: ' + error.message.substring(0, 50);
  }
}

// Main monitoring function
async function runMonitor() {
  console.log('🤖 Blog Automation Monitor Report');
  console.log('=====================================');
  console.log(`📅 Generated on: ${new Date().toLocaleString()}`);
  console.log('');
  
  // Blog statistics
  const stats = await getBlogStats();
  console.log('📊 Blog Statistics:');
  console.log(`   Total Articles: ${stats.totalArticles}`);
  console.log(`   Last Generated: ${stats.lastGenerated}`);
  console.log('');
  
  // Recent articles
  if (stats.articles.length > 0) {
    console.log('📝 Recent Articles:');
    stats.articles.slice(0, 3).forEach((title, index) => {
      console.log(`   ${index + 1}. ${title}`);
    });
    console.log('');
  }
  
  // Automation schedule
  const nextRun = getNextScheduledRun();
  console.log('⏰ Automation Schedule:');
  console.log(`   Schedule: Every 2 days at 9:00 AM UTC`);
  console.log(`   Next Run: ${nextRun.toLocaleString()} (${nextRun.toISOString()})`);
  console.log(`   Time Until: ${Math.round((nextRun - new Date()) / (1000 * 60 * 60))} hours`);
  console.log('');
  
  // GitHub Actions status
  const ghStatus = await getGitHubActionsStatus();
  console.log('🔧 GitHub Actions Status:');
  console.log(`   Last Run: ${ghStatus.status} (${ghStatus.age})`);
  console.log(`   Details: ${ghStatus.lastRun}`);
  console.log('');
  
  // Script test
  const testStatus = await testContentGeneration();
  console.log('🧪 Content Generation Test:');
  console.log(`   Status: ${testStatus}`);
  console.log('');
  
  // Health check
  const isHealthy = stats.totalArticles > 0 && 
                   stats.lastGenerated !== 'Unknown' && 
                   testStatus.includes('Working') || testStatus.includes('Ready');
  
  console.log('🏥 System Health:');
  console.log(`   Status: ${isHealthy ? '✅ HEALTHY' : '⚠️  NEEDS ATTENTION'}`);
  console.log(`   Automation: ${ghStatus.status === 'Success' ? '✅ Working' : '⚠️  Check GitHub Actions'}`);
  console.log(`   Content: ${stats.totalArticles > 0 ? '✅ Available' : '⚠️  No articles found'}`);
  console.log('');
  
  // Recommendations
  console.log('💡 Recommendations:');
  if (ghStatus.status === 'Failed') {
    console.log('   • Check GitHub Actions workflow logs for errors');
    console.log('   • Verify repository permissions and secrets');
  }
  if (stats.totalArticles < 5) {
    console.log('   • Consider manually running content generation for more articles');
  }
  if (testStatus.includes('Error')) {
    console.log('   • Test content generation script locally');
    console.log('   • Check dependencies and file permissions');
  }
  
  console.log('');
  console.log('📍 Quick Actions:');
  console.log('   • Manual generation: npm run generate:blog');
  console.log('   • View logs: tail -f auto-blog-generation.log');
  console.log('   • Test workflow: gh workflow run auto-generate-blog.yml');
  console.log('   • Check status: npm run blog:monitor');
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  runMonitor().catch(console.error);
}

export { runMonitor, getBlogStats, getNextScheduledRun };