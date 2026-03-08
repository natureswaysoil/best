#!/usr/bin/env node
/**
 * Social Media Automation Server for Google Cloud Run
 * Fixed version - corrects endpoint mismatch, Twitter auth, execSync blocking
 */

import express from 'express';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'social-media-automation',
    version: '2.0.0'
  });
});

// ─── Status ──────────────────────────────────────────────────────────────────
app.get('/api/status', async (req, res) => {
  try {
    const videoCount = await countVideos();
    res.json({
      status: 'operational',
      videoCount,
      platforms: {
        twitter: (process.env.TWITTER_API_KEY && process.env.TWITTER_ACCESS_TOKEN) ? 'configured' : 'missing',
        youtube: process.env.YT_CLIENT_ID ? 'configured' : 'missing',
        heygen: process.env.HEYGEN_API_KEY ? 'configured' : 'missing'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// ─── FIX #1: Add /api/social-automation endpoint that Cloud Scheduler calls ──
// This is the missing endpoint — scheduler was getting 404 on every run
app.post('/api/social-automation', async (req, res) => {
  console.log('[Scheduler] /api/social-automation triggered', req.body);
  // Run the job and wait for it — Cloud Run stays alive until we respond
  try {
    const result = await runSocialMediaPost();
    res.json({
      status: 'completed',
      message: 'Social automation job finished',
      schedule: req.body?.schedule || 'manual',
      timestamp: new Date().toISOString(),
      result: result?.slice(0, 500)
    });
  } catch (err) {
    console.error('[Scheduler] Post job error:', err.message);
    res.status(500).json({
      status: 'error',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Manual trigger (also fix: respond first, then run)
app.post('/api/post/manual', async (req, res) => {
  console.log('[Manual] Posting triggered');
  res.json({ status: 'accepted', message: 'Manual post job started', timestamp: new Date().toISOString() });
  runSocialMediaPost().catch(err =>
    console.error('[Manual] Post job error:', err.message)
  );
});

// Scheduled endpoint (kept for backward compat)
app.post('/api/post/scheduled', async (req, res) => {
  res.json({ status: 'accepted', message: 'Scheduled post job started', timestamp: new Date().toISOString() });
  runSocialMediaPost().catch(err =>
    console.error('[Scheduled] Post job error:', err.message)
  );
});

// HeyGen test
app.post('/api/heygen/test', async (req, res) => {
  try {
    const result = await runScript('node', ['scripts/test-heygen-integration.mjs'], 60000);
    res.json({ status: 'success', result, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// Logs
app.get('/api/logs', async (req, res) => {
  try {
    const logFile = '/app/logs/social-automation.log';
    const exists = await fs.access(logFile).then(() => true).catch(() => false);
    if (!exists) return res.json({ logs: [], message: 'No logs yet' });
    const content = await fs.readFile(logFile, 'utf8');
    const lines = content.trim().split('\n').slice(-100); // last 100 lines
    res.json({ logs: lines, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({ status: 'not-found', path: req.path });
});

// ─── FIX #2: Use spawn instead of execSync so it's non-blocking ──────────────
function runScript(cmd, args, timeoutMs = 600000) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, {
      cwd: '/app',
      env: { ...process.env },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', d => { stdout += d.toString(); });
    proc.stderr.on('data', d => { stderr += d.toString(); });

    const timer = setTimeout(() => {
      proc.kill('SIGTERM');
      reject(new Error(`Script timeout after ${timeoutMs / 1000}s`));
    }, timeoutMs);

    proc.on('close', code => {
      clearTimeout(timer);
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(`Script exited ${code}: ${stderr.trim() || stdout.trim()}`));
      }
    });

    proc.on('error', err => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

// ─── Main post runner ─────────────────────────────────────────────────────────
async function runSocialMediaPost() {
  const start = Date.now();
  console.log(`[Post] Starting social media post run at ${new Date().toISOString()}`);

  try {
    // FIX #3: Call with explicit `node` + path, don't rely on shebang
    const result = await runScript('node', ['scripts/social-media-auto-post.mjs'], 600000);
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`[Post] Completed in ${elapsed}s`);
    await logActivity('social-post-success', `Completed in ${elapsed}s: ${result.slice(0, 200)}`);
    return result;
  } catch (error) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.error(`[Post] Failed after ${elapsed}s: ${error.message}`);
    await logActivity('social-post-error', `Failed after ${elapsed}s: ${error.message}`);
    throw error;
  }
}

async function countVideos() {
  try {
    const files = await fs.readdir('/app/public/videos');
    return files.filter(f => f.endsWith('.mp4')).length;
  } catch {
    return 0;
  }
}

async function logActivity(type, message) {
  try {
    await fs.mkdir('/app/logs', { recursive: true });
    const entry = `[${new Date().toISOString()}] ${type}: ${message}\n`;
    await fs.appendFile('/app/logs/social-automation.log', entry);
  } catch {}
}

app.listen(port, () => {
  console.log(`Social Media Automation Server v2.0 running on port ${port}`);
  console.log('Endpoints: /api/health  /api/status  /api/social-automation  /api/post/manual  /api/logs');
});

process.on('SIGTERM', () => { console.log('SIGTERM received, shutting down'); process.exit(0); });
process.on('SIGINT', () => { console.log('SIGINT received, shutting down'); process.exit(0); });
