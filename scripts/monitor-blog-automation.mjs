#!/usr/bin/env node

/**
 * Blog Automation Monitor
 * Monitors automated blog content generation and provides status dashboard
 */

import { promises as fs } from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'auto-blog-generation.log');
const BLOG_DATA_PATH = path.join(process.cwd(), 'data', 'blog.ts');
const VIDEOS_DIR = path.join(process.cwd(), 'public', 'videos', 'blog');

// Read and parse log file
async function readGenerationLog() {
  try {
    const content = await fs.readFile(LOG_FILE, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    
    return lines.map(line => {
      const match = line.match(/^(.+?) - (.+)$/);
      if (match) {
        return {
          timestamp: new Date(match[1]),
          message: match[2]
        };
      }
      return null;
    }).filter(Boolean);
  } catch (error) {
    return [];
  }
}

// Get blog statistics
async function getBlogStats() {
  try {
    const content = await fs.readFile(BLOG_DATA_PATH, 'utf-8');
    
    // Count articles by counting "id:" occurrences within the array
    const arrayMatch = content.match(/export const blogArticles: BlogArticle\[\] = \[([\s\S]*?)\];/);
    if (arrayMatch) {
      const arrayContent = arrayMatch[1];
      
      // Count objects by counting "id:" property declarations
      const idMatches = arrayContent.match(/\s+id:\s*['"]/g);
      const totalArticles = idMatches ? idMatches.length : 0;
      
      // Extract categories (simple pattern matching)
      const categoryMatches = arrayContent.match(/category:\s*['"]([^'"]+)['"]/g) || [];
      const categories = {};
      categoryMatches.forEach(match => {
        const category = match.match(/category:\s*['"]([^'"]+)['"]/)[1];
        categories[category] = (categories[category] || 0) + 1;
      });
      
      // Extract read times for average
      const readTimeMatches = arrayContent.match(/readTime:\s*(\d+)/g) || [];
      const readTimes = readTimeMatches.map(match => parseInt(match.match(/readTime:\s*(\d+)/)[1]));
      const averageReadTime = readTimes.length > 0 ? Math.round(readTimes.reduce((sum, time) => sum + time, 0) / readTimes.length) : 0;
      
      // Get latest article info (first in array)
      const firstArticleMatch = arrayContent.match(/\{\s*id:\s*['"]([^'"]+)['"],[\s\S]*?title:\s*['"]([^'"]+)['"],[\s\S]*?publishedAt:\s*['"]([^'"]+)['"]/);
      const latestArticle = firstArticleMatch ? {
        id: firstArticleMatch[1],
        title: firstArticleMatch[2],
        publishedAt: firstArticleMatch[3]
      } : null;
      
      // Monthly stats (simplified)
      const publishedAtMatches = arrayContent.match(/publishedAt:\s*['"]([^'"]+)['"]/g) || [];
      const monthlyStats = {};
      publishedAtMatches.forEach(match => {
        const date = match.match(/publishedAt:\s*['"]([^'"]+)['"]/)[1];
        const month = date.substring(0, 7); // YYYY-MM
        monthlyStats[month] = (monthlyStats[month] || 0) + 1;
      });
      
      return {
        totalArticles,
        categories,
        monthlyStats,
        latestArticle,
        averageReadTime
      };
    }
  } catch (error) {
    console.error('Error reading blog stats:', error);
  }
  
  return {
    totalArticles: 0,
    categories: {},
    monthlyStats: {},
    latestArticle: null,
    averageReadTime: 0
  };
}

// Get video statistics
async function getVideoStats() {
  try {
    const files = await fs.readdir(VIDEOS_DIR);
    const videoFiles = files.filter(f => f.endsWith('.mp4') || f.endsWith('.webm'));
    const posterFiles = files.filter(f => f.endsWith('-poster.jpg'));
    const scriptFiles = files.filter(f => f.endsWith('-script.json'));
    
    return {
      totalVideos: Math.floor(videoFiles.length / 2), // MP4 + WebM pairs
      posterImages: posterFiles.length,
      videoScripts: scriptFiles.length,
      lastGenerated: await getLastVideoGeneration()
    };
  } catch (error) {
    return {
      totalVideos: 0,
      posterImages: 0,
      videoScripts: 0,
      lastGenerated: null
    };
  }
}

// Get last video generation time
async function getLastVideoGeneration() {
  try {
    const files = await fs.readdir(VIDEOS_DIR);
    const scriptFiles = files.filter(f => f.endsWith('-script.json'));
    
    if (scriptFiles.length === 0) return null;
    
    const stats = await Promise.all(
      scriptFiles.map(async file => {
        const stat = await fs.stat(path.join(VIDEOS_DIR, file));
        return stat.mtime;
      })
    );
    
    return new Date(Math.max(...stats.map(d => d.getTime())));
  } catch (error) {
    return null;
  }
}

// Calculate next generation time
function getNextGenerationTime() {
  const now = new Date();
  const daysSinceEpoch = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
  const daysUntilNext = 2 - (daysSinceEpoch % 2);
  
  const nextDate = new Date(now);
  nextDate.setDate(nextDate.getDate() + daysUntilNext);
  nextDate.setHours(9, 0, 0, 0); // 9 AM UTC
  
  return nextDate;
}

// Display monitoring dashboard
async function showDashboard() {
  console.log('🎬 BLOG AUTOMATION MONITOR\n');
  console.log('═'.repeat(60));
  
  // System Status
  console.log('\n📊 SYSTEM STATUS');
  console.log('─'.repeat(40));
  
  const logs = await readGenerationLog();
  const latestLog = logs[logs.length - 1];
  
  if (latestLog) {
    console.log(`📝 Last Activity: ${latestLog.timestamp.toLocaleString()}`);
    console.log(`💬 Last Message: ${latestLog.message}`);
  } else {
    console.log('📝 No activity logged yet');
  }
  
  const nextGen = getNextGenerationTime();
  console.log(`⏰ Next Generation: ${nextGen.toLocaleString()}`);
  
  // Blog Statistics
  console.log('\n📚 BLOG STATISTICS');
  console.log('─'.repeat(40));
  
  const blogStats = await getBlogStats();
  console.log(`📄 Total Articles: ${blogStats.totalArticles}`);
  console.log(`⏱️  Average Read Time: ${blogStats.averageReadTime} minutes`);
  
  if (blogStats.latestArticle) {
    console.log(`📰 Latest Article: ${blogStats.latestArticle.title}`);
    console.log(`📅 Published: ${blogStats.latestArticle.publishedAt}`);
  }
  
  console.log('\n📂 Categories:');
  Object.entries(blogStats.categories).forEach(([category, count]) => {
    console.log(`   ${category}: ${count} articles`);
  });
  
  // Video Statistics
  console.log('\n🎥 VIDEO STATISTICS');
  console.log('─'.repeat(40));
  
  const videoStats = await getVideoStats();
  console.log(`🎬 Total Videos: ${videoStats.totalVideos}`);
  console.log(`🖼️  Poster Images: ${videoStats.posterImages}`);
  console.log(`📜 Video Scripts: ${videoStats.videoScripts}`);
  
  if (videoStats.lastGenerated) {
    console.log(`🕒 Last Generated: ${videoStats.lastGenerated.toLocaleString()}`);
  }
  
  // Recent Activity
  if (logs.length > 0) {
    console.log('\n📋 RECENT ACTIVITY');
    console.log('─'.repeat(40));
    
    logs.slice(-5).forEach(log => {
      const time = log.timestamp.toLocaleString();
      console.log(`${time}: ${log.message}`);
    });
  }
  
  // Monthly Trends
  console.log('\n📈 MONTHLY CONTENT GENERATION');
  console.log('─'.repeat(40));
  
  Object.entries(blogStats.monthlyStats)
    .sort()
    .slice(-6)
    .forEach(([month, count]) => {
      const bar = '█'.repeat(Math.min(count, 20));
      console.log(`${month}: ${bar} (${count} articles)`);
    });
  
  // Health Check
  console.log('\n🔍 SYSTEM HEALTH');
  console.log('─'.repeat(40));
  
  const checks = [
    { name: 'Blog data file exists', status: await checkFileExists(BLOG_DATA_PATH) },
    { name: 'Videos directory exists', status: await checkFileExists(VIDEOS_DIR) },
    { name: 'Generation log exists', status: await checkFileExists(LOG_FILE) },
    { name: 'Recent activity (last 7 days)', status: checkRecentActivity(logs) },
    { name: 'Article count growing', status: blogStats.totalArticles > 2 }
  ];
  
  checks.forEach(check => {
    const icon = check.status ? '✅' : '❌';
    console.log(`${icon} ${check.name}`);
  });
  
  console.log('\n═'.repeat(60));
  console.log('🚀 AUTOMATION COMMANDS');
  console.log('─'.repeat(40));
  console.log('npm run blog:auto     - Generate new content now');
  console.log('npm run blog:videos   - Regenerate all videos');
  console.log('npm run blog:monitor  - Show this dashboard');
  console.log('\n🔗 GitHub Actions: Auto-generates every 2 days at 9 AM UTC');
  console.log('📁 Logs: auto-blog-generation.log');
  console.log('📊 All content goes to natureswaysoil/best repository');
}

// Helper functions
async function checkFileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function checkRecentActivity(logs) {
  if (logs.length === 0) return false;
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return logs.some(log => log.timestamp > sevenDaysAgo);
}

// Export statistics for external use
async function exportStats() {
  const blogStats = await getBlogStats();
  const videoStats = await getVideoStats();
  const logs = await readGenerationLog();
  
  return {
    timestamp: new Date().toISOString(),
    blog: blogStats,
    videos: videoStats,
    automation: {
      nextGeneration: getNextGenerationTime(),
      recentActivity: logs.slice(-10),
      systemHealth: {
        blogDataExists: await checkFileExists(BLOG_DATA_PATH),
        videosDirectoryExists: await checkFileExists(VIDEOS_DIR),
        logFileExists: await checkFileExists(LOG_FILE),
        recentActivity: checkRecentActivity(logs)
      }
    }
  };
}

// Command line interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  if (command === 'json') {
    exportStats().then(stats => {
      console.log(JSON.stringify(stats, null, 2));
    });
  } else {
    showDashboard();
  }
}

export { showDashboard, exportStats, getBlogStats, getVideoStats };