#!/usr/bin/env node
/**
 * Social Media Automation Server for Google Cloud Run
 * Handles automated posting to Twitter and YouTube with HeyGen video generation
 */

import express from 'express';
import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'social-media-automation',
    version: '1.0.0'
  });
});

// Status endpoint
app.get('/api/status', async (req, res) => {
  try {
    const videoCount = await countVideos();
    const lastPosted = await getLastPostedTime();
    
    res.json({
      status: 'operational',
      videoCount,
      lastPosted,
      platforms: {
        twitter: process.env.TWITTER_BEARER_TOKEN ? 'configured' : 'missing',
        youtube: process.env.YT_CLIENT_ID ? 'configured' : 'missing',
        heygen: process.env.HEYGEN_API_KEY ? 'configured' : 'missing'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Manual posting trigger endpoint
app.post('/api/post/manual', async (req, res) => {
  try {
    console.log('Manual posting triggered');
    const result = await runSocialMediaPost();
    res.json({
      status: 'success',
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Manual posting failed:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Cloud Scheduler endpoint for automated posting
app.post('/api/post/scheduled', async (req, res) => {
  try {
    console.log('Scheduled posting triggered');
    const result = await runSocialMediaPost();
    res.json({
      status: 'success',
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Scheduled posting failed:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Video generation endpoint
app.post('/api/videos/generate', async (req, res) => {
  try {
    const { product, force = false } = req.body;
    console.log('Video generation triggered for:', product || 'all products');
    
    const command = product 
      ? `npm run videos:product -- "${product}"`
      : 'npm run videos';
    
    if (force) {
      command += ' -- --force';
    }
    
    const result = execSync(command, { 
      encoding: 'utf8',
      timeout: 300000, // 5 minutes timeout
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });
    
    res.json({
      status: 'success',
      result: result.trim(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Video generation failed:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Single post test endpoint
app.post('/api/test/single-post', async (req, res) => {
  try {
    console.log('Single post test triggered');
    const result = execSync('node test-single-post.mjs', { 
      encoding: 'utf8',
      timeout: 60000,
      cwd: '/app'
    });
    
    res.json({
      status: 'success',
      result: result.trim(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Single post test failed:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test credentials endpoint
app.post('/api/test/credentials', async (req, res) => {
  try {
    console.log('Credential testing triggered');
    const result = execSync('node test-credentials.mjs', { 
      encoding: 'utf8',
      timeout: 60000,
      cwd: '/app'
    });
    
    res.json({
      status: 'success',
      result: result.trim(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Credential test failed:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// HeyGen test endpoint
app.post('/api/heygen/test', async (req, res) => {
  try {
    console.log('HeyGen test triggered');
    const result = execSync('npm run heygen:test', { 
      encoding: 'utf8',
      timeout: 60000
    });
    
    res.json({
      status: 'success',
      result: result.trim(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('HeyGen test failed:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Logs endpoint
app.get('/api/logs', async (req, res) => {
  try {
    const logFile = '/app/logs/social-automation.log';
    const exists = await fs.access(logFile).then(() => true).catch(() => false);
    
    if (!exists) {
      res.json({
        status: 'no-logs',
        message: 'No log file found',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    const logs = await fs.readFile(logFile, 'utf8');
    const lines = logs.split('\n').slice(-100); // Last 100 lines
    
    res.json({
      status: 'success',
      logs: lines,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Helper functions
async function runSocialMediaPost() {
  try {
    // Run the social media automation script
    const result = execSync('./scripts/social-media-auto-post.mjs', {
      encoding: 'utf8',
      timeout: 600000, // 10 minutes timeout
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      cwd: '/app'
    });
    
    // Log the posting activity
    await logActivity('social-post', result);
    
    return result.trim();
  } catch (error) {
    await logActivity('social-post-error', error.message);
    throw error;
  }
}

async function countVideos() {
  try {
    const videosDir = '/app/public/videos';
    const files = await fs.readdir(videosDir);
    return files.filter(file => file.endsWith('.mp4')).length;
  } catch {
    return 0;
  }
}

async function getLastPostedTime() {
  try {
    const logFile = '/app/social-posted-content.json';
    const exists = await fs.access(logFile).then(() => true).catch(() => false);
    
    if (!exists) {
      return null;
    }
    
    const content = await fs.readFile(logFile, 'utf8');
    const data = JSON.parse(content);
    
    // Find the most recent post
    let lastTime = null;
    Object.values(data).forEach(platform => {
      if (typeof platform === 'object' && platform.lastPosted) {
        if (!lastTime || new Date(platform.lastPosted) > new Date(lastTime)) {
          lastTime = platform.lastPosted;
        }
      }
    });
    
    return lastTime;
  } catch {
    return null;
  }
}

async function logActivity(type, message) {
  try {
    const logsDir = '/app/logs';
    await fs.mkdir(logsDir, { recursive: true });
    
    const logFile = path.join(logsDir, 'social-automation.log');
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${type}: ${message}\n`;
    
    await fs.appendFile(logFile, logEntry);
  } catch (error) {
    console.error('Failed to write log:', error);
  }
}

// Error handling middleware
app.use((error, req, res) => {
  console.error('Server error:', error);
  res.status(500).json({
    status: 'error',
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'not-found',
    message: 'Endpoint not found',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(port, () => {
  console.log(`Social Media Automation Server running on port ${port}`);
  console.log('Available endpoints:');
  console.log('  GET  /api/health - Health check');
  console.log('  GET  /api/status - Service status');
  console.log('  POST /api/post/manual - Manual posting trigger');
  console.log('  POST /api/post/scheduled - Scheduled posting (for Cloud Scheduler)');
  console.log('  POST /api/videos/generate - Generate videos');
  console.log('  POST /api/heygen/test - Test HeyGen integration');
  console.log('  GET  /api/logs - View recent logs');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  process.exit(0);
});