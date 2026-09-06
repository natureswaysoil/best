#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const SITE_URL = process.env.NWS_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://natureswaysoil.com';
const PRINT_QUEUE_SECRET = process.env.PRINT_QUEUE_SECRET;
const POLL_SECONDS = Number(process.env.PRINT_POLL_SECONDS || 60);
const PRINT_LIMIT = Number(process.env.PRINT_QUEUE_LIMIT || 20);
const CHROME_PATH = process.env.CHROME_PATH || '';
const STATE_FILE = process.env.PRINT_STATE_FILE || path.join(process.cwd(), '.printed-orders.json');
const PRINT_DIR = process.env.PRINT_DOWNLOAD_DIR || path.join(process.cwd(), 'packing-slips');
const PRINT_CONFIRM_SECONDS = Number(process.env.PRINT_CONFIRM_SECONDS || 8);

if (!PRINT_QUEUE_SECRET) {
  console.error('Missing PRINT_QUEUE_SECRET. Set it before running this printer agent.');
  process.exit(1);
}

fs.mkdirSync(PRINT_DIR, { recursive: true });

function loadState() {
  try {
    const parsed = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    if (Array.isArray(parsed)) {
      return { version: 1, printed: new Set(parsed), legacy: true };
    }
    return {
      version: 2,
      printed: new Set(Array.isArray(parsed?.printed) ? parsed.printed : []),
      legacy: false,
    };
  } catch {
    return { version: 2, printed: new Set(), legacy: false };
  }
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify({
    version: 2,
    printed: [...state.printed].sort(),
    updatedAt: new Date().toISOString(),
  }, null, 2));
}

function findChromeCommand() {
  if (CHROME_PATH) return CHROME_PATH;

  if (process.platform === 'win32') {
    const candidates = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
      'msedge',
    ];
    return candidates.find((candidate) => candidate === 'msedge' || fs.existsSync(candidate)) || 'chrome';
  }

  if (process.platform === 'darwin') {
    return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  }

  return 'google-chrome';
}

function printHtmlFile(filePath) {
  return new Promise((resolve, reject) => {
    const chrome = findChromeCommand();
    const args = [
      '--kiosk-printing',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--new-window',
      `file://${filePath}`,
    ];

    console.log(`Sending to printer: ${filePath}`);
    let settled = false;
    const child = spawn(chrome, args, { detached: false, stdio: 'ignore' });

    const finish = (error) => {
      if (settled) return;
      settled = true;
      if (error) reject(error);
      else resolve();
    };

    child.once('error', (error) => finish(error));
    child.once('spawn', () => {
      // Chrome can hand the print request to an already-running browser process and
      // exit immediately. Give it a short grace period before declaring dispatch successful.
      setTimeout(() => finish(), Math.max(3, PRINT_CONFIRM_SECONDS) * 1000);
    });
  });
}

async function downloadSlip(order) {
  const response = await fetch(order.printableUrl);
  if (!response.ok) {
    throw new Error(`Failed to download packing slip ${order.sessionId}: ${response.status}`);
  }

  const html = await response.text();
  const filePath = path.join(PRINT_DIR, `${order.sessionId}.html`);
  fs.writeFileSync(filePath, html);
  return filePath;
}

function recoverLegacyMisses(state, orders) {
  if (!state.legacy) return;

  const newestMarked = orders
    .filter((order) => order?.sessionId && state.printed.has(order.sessionId))
    .sort((a, b) => Number(b.created || 0) - Number(a.created || 0))
    .slice(0, 2);

  if (newestMarked.length) {
    console.log(`Legacy printer state detected. Retrying the newest ${newestMarked.length} previously-marked order(s).`);
    for (const order of newestMarked) state.printed.delete(order.sessionId);
  }

  state.version = 2;
  state.legacy = false;
  saveState(state);
}

async function checkForOrders() {
  const state = loadState();
  const queueUrl = `${SITE_URL.replace(/\/$/, '')}/api/print-queue?secret=${encodeURIComponent(PRINT_QUEUE_SECRET)}&limit=${PRINT_LIMIT}`;

  console.log(`[${new Date().toLocaleString()}] Checking ${queueUrl.replace(PRINT_QUEUE_SECRET, '***')}`);
  const response = await fetch(queueUrl);
  if (!response.ok) {
    throw new Error(`Print queue request failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const orders = Array.isArray(data.orders) ? data.orders : [];

  // The old agent marked orders printed immediately after merely launching Chrome.
  // On the first run after this upgrade, retry the two newest marked orders once.
  recoverLegacyMisses(state, orders);

  const newOrders = orders
    .filter((order) => order?.sessionId && !state.printed.has(order.sessionId))
    .sort((a, b) => Number(a.created || 0) - Number(b.created || 0));

  if (newOrders.length === 0) {
    console.log('No new paid orders to print.');
    return;
  }

  for (const order of newOrders) {
    console.log(`New paid order: ${order.sessionId} — ${order.productName || 'Product'} — $${Number(order.amountTotal || 0).toFixed(2)}`);
    try {
      const filePath = await downloadSlip(order);
      await printHtmlFile(filePath);
      state.printed.add(order.sessionId);
      saveState(state);
      console.log(`Print dispatched and recorded: ${order.sessionId}`);
    } catch (error) {
      console.error(`Order ${order.sessionId} was NOT marked printed and will retry on the next poll.`);
      throw error;
    }
  }
}

async function main() {
  console.log('Nature’s Way Soil printer agent started.');
  console.log(`Site: ${SITE_URL}`);
  console.log(`Poll interval: ${POLL_SECONDS} seconds`);
  console.log(`State file: ${STATE_FILE}`);
  console.log(`Packing-slip folder: ${PRINT_DIR}`);
  console.log('Leave this window open on the printer-connected computer.');

  while (true) {
    try {
      await checkForOrders();
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
    }

    await new Promise((resolve) => setTimeout(resolve, Math.max(15, POLL_SECONDS) * 1000));
  }
}

main();
