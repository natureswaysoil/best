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
const PRINT_DIR = process.env.PRINT_DOWNLOAD_DIR || path.join(os.tmpdir(), 'nws-packing-slips');

if (!PRINT_QUEUE_SECRET) {
  console.error('Missing PRINT_QUEUE_SECRET. Set it before running this printer agent.');
  process.exit(1);
}

fs.mkdirSync(PRINT_DIR, { recursive: true });

function loadPrinted() {
  try {
    return new Set(JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')));
  } catch {
    return new Set();
  }
}

function savePrinted(printed) {
  fs.writeFileSync(STATE_FILE, JSON.stringify([...printed].sort(), null, 2));
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
  const chrome = findChromeCommand();
  const args = [
    '--kiosk-printing',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `file://${filePath}`,
  ];

  console.log(`Printing ${filePath}`);
  const child = spawn(chrome, args, { detached: true, stdio: 'ignore' });
  child.unref();
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

async function checkForOrders() {
  const printed = loadPrinted();
  const queueUrl = `${SITE_URL.replace(/\/$/, '')}/api/print-queue?secret=${encodeURIComponent(PRINT_QUEUE_SECRET)}&limit=${PRINT_LIMIT}`;

  console.log(`[${new Date().toLocaleString()}] Checking ${queueUrl.replace(PRINT_QUEUE_SECRET, '***')}`);
  const response = await fetch(queueUrl);
  if (!response.ok) {
    throw new Error(`Print queue request failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const orders = Array.isArray(data.orders) ? data.orders : [];
  const newOrders = orders
    .filter((order) => order?.sessionId && !printed.has(order.sessionId))
    .sort((a, b) => Number(a.created || 0) - Number(b.created || 0));

  if (newOrders.length === 0) {
    console.log('No new paid orders to print.');
    return;
  }

  for (const order of newOrders) {
    console.log(`New paid order: ${order.sessionId} — ${order.productName || 'Product'} — $${Number(order.amountTotal || 0).toFixed(2)}`);
    const filePath = await downloadSlip(order);
    printHtmlFile(filePath);
    printed.add(order.sessionId);
    savePrinted(printed);
  }
}

async function main() {
  console.log('Nature’s Way Soil printer agent started.');
  console.log(`Site: ${SITE_URL}`);
  console.log(`Poll interval: ${POLL_SECONDS} seconds`);
  console.log(`State file: ${STATE_FILE}`);
  console.log(`Download folder: ${PRINT_DIR}`);
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
