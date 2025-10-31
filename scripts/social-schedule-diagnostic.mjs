#!/usr/bin/env node

/**
 * Social Media Schedule Diagnostic
 * Analyzes posting schedules and detects missed posts
 * Helps identify why automation may have stopped
 */

import fs from 'fs';

console.log('📅 Social Media Schedule Diagnostic');
console.log(`🕐 Current time: ${new Date().toISOString()}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

/**
 * Analyze expected posting schedule
 */
function analyzeSchedule() {
  console.log('\n📊 EXPECTED POSTING SCHEDULE:');
  console.log('Based on "Cloud Run jobs twice daily" from instructions');
  
  // Typical twice-daily schedule would be:
  const schedules = [
    { time: '06:00 UTC', description: 'Morning post' },
    { time: '18:00 UTC', description: 'Evening post' }
  ];
  
  const now = new Date();
  const currentUTC = now.toISOString();
  const currentHour = now.getUTCHours();
  
  console.log(`🕐 Current UTC time: ${currentUTC}`);
  console.log(`⏰ Current UTC hour: ${currentHour}:00`);
  console.log('');
  
  schedules.forEach((schedule, index) => {
    const scheduleHour = parseInt(schedule.time.split(':')[0]);
    const timeDiff = currentHour - scheduleHour;
    
    console.log(`${index + 1}. ${schedule.description} (${schedule.time})`);
    if (timeDiff >= 0) {
      console.log(`   ⏱️  ${timeDiff} hours since scheduled time`);
      if (timeDiff > 1) {
        console.log(`   ⚠️  MISSED: Should have posted ${timeDiff} hours ago`);
      }
    } else {
      console.log(`   ⏳ Next post in ${24 + timeDiff} hours`);
    }
    console.log('');
  });
  
  return { currentHour, schedules };
}

/**
 * Check for recent posts based on user report
 */
function analyzeRecentActivity() {
  console.log('📈 RECENT ACTIVITY ANALYSIS:');
  console.log('Based on user report: "last post on youtube was 13 hours ago"');
  
  const now = new Date();
  const thirteenHoursAgo = new Date(now.getTime() - (13 * 60 * 60 * 1000));
  
  console.log(`📺 Last YouTube post: ${thirteenHoursAgo.toISOString()}`);
  console.log(`🕐 That was: ${thirteenHoursAgo.toLocaleString('en-US', { timeZone: 'UTC' })} UTC`);
  
  // Check if this aligns with expected schedule
  const lastPostHour = thirteenHoursAgo.getUTCHours();
  console.log(`⏰ Last post hour: ${lastPostHour}:00 UTC`);
  
  // Analyze gap
  const hoursSinceLastPost = 13;
  const expectedPostingInterval = 12; // twice daily = every 12 hours
  
  if (hoursSinceLastPost > expectedPostingInterval + 2) {
    console.log('🚨 ISSUE DETECTED: Significant gap in posting schedule');
    console.log(`   Expected: Posts every ${expectedPostingInterval} hours`);
    console.log(`   Actual: ${hoursSinceLastPost} hours since last post`);
    console.log(`   Gap: ${hoursSinceLastPost - expectedPostingInterval} hours overdue`);
  } else {
    console.log('✅ Timeline appears normal for twice-daily schedule');
  }
  
  return { lastPostHour, hoursSinceLastPost };
}

/**
 * Check for potential issues
 */
function diagnosePotentialIssues() {
  console.log('\n🔍 POTENTIAL ISSUES ANALYSIS:');
  
  const issues = [];
  
  // Check local environment
  const hasLocalCreds = process.env.YT_CLIENT_ID || process.env.TWITTER_BEARER_TOKEN;
  if (!hasLocalCreds) {
    console.log('⚠️  No local social media credentials');
    console.log('   📍 This is expected - production runs on Cloud Run');
    console.log('   ✅ Not an issue for production automation');
  }
  
  // Check for content availability
  try {
    const videosDir = './public/videos';
    const videoFiles = fs.readdirSync(videosDir).filter(file => 
      file.endsWith('.mp4') && !file.includes('hero')
    );
    
    console.log(`🎥 Available videos: ${videoFiles.length} files`);
    if (videoFiles.length < 5) {
      issues.push('Low video content - may need more videos for consistent posting');
    } else {
      console.log('✅ Sufficient video content available');
    }
  } catch {
    console.log('⚠️  Could not check video availability');
    issues.push('Video directory access issue');
  }
  
  // Check for posted content tracking
  try {
    const postedFile = './social-posted-content.json';
    if (fs.existsSync(postedFile)) {
      const posted = JSON.parse(fs.readFileSync(postedFile, 'utf8'));
      const totalPosts = Object.keys(posted).length;
      console.log(`📊 Tracked posts: ${totalPosts} posts in history`);
      
      if (totalPosts > 50) {
        issues.push('Large posting history - may need cleanup to prevent duplicates');
      }
    } else {
      console.log('📝 No posting history file found');
      console.log('   💡 This might indicate first-time setup or reset');
    }
  } catch {
    console.log('⚠️  Could not check posting history');
  }
  
  return issues;
}

/**
 * Provide recommendations
 */
function provideRecommendations(issues) {
  console.log('\n💡 RECOMMENDATIONS:');
  
  console.log('\n🔧 IMMEDIATE ACTIONS:');
  console.log('1. 🚨 Fix Pinterest first (revenue critical):');
  console.log('   npm run pinterest:quick-setup [TOKEN]');
  
  console.log('\n2. 📺 Check YouTube & Twitter production status:');
  console.log('   • Verify posts on @JamesJones90703 (Twitter)');
  console.log('   • Check your YouTube channel for recent uploads');
  console.log('   • If no recent posts, Cloud Run job may need restart');
  
  console.log('\n3. 🔄 Test local automation (for debugging):');
  console.log('   npm run social:test  # Test all platforms');
  
  if (issues.length > 0) {
    console.log('\n⚠️  POTENTIAL ISSUES TO ADDRESS:');
    issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
  }
  
  console.log('\n📊 MONITORING:');
  console.log('• Run npm run social:health every few hours');
  console.log('• Check actual social media accounts for posts');
  console.log('• Pinterest revenue: 20-35 monthly sales at risk until fixed');
}

/**
 * Main diagnostic
 */
function main() {
  try {
    analyzeSchedule();
    console.log('\n' + '━'.repeat(50));
    
    const activity = analyzeRecentActivity();
    console.log('\n' + '━'.repeat(50));
    
    const issues = diagnosePotentialIssues();
    console.log('\n' + '━'.repeat(50));
    
    provideRecommendations(issues);
    
    // Determine if there's a real issue using actual activity data
    const hoursSincePost = activity.hoursSinceLastPost;
    const isLateForSchedule = hoursSincePost > 14; // More than 14 hours = definitely missed
    
    console.log('\n🎯 SUMMARY:');
    if (isLateForSchedule) {
      console.log('🔴 ACTION REQUIRED: Posting schedule appears disrupted');
      console.log('💰 Pinterest revenue at risk + possible YouTube/Twitter issues');
    } else {
      console.log('🟡 MONITORING: May be normal schedule variation');
      console.log('🚨 Pinterest still needs immediate attention for revenue');
    }
    
    process.exit(isLateForSchedule ? 1 : 0);
    
  } catch (error) {
    console.error('\n💥 Diagnostic error:', error.message);
    process.exit(1);
  }
}

// Run diagnostic
main();