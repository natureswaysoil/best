#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT = path.resolve(__dirname, '..');

const PERFORMANCE_FILE = path.join(PROJECT, 'config', 'social-performance.json');
const TOP_PRODUCTS_FILE = path.join(PROJECT, 'config', 'top-products.json');

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const LOOKBACK_DAYS = Number(process.env.SALES_LOOKBACK_DAYS || 14);

function readJson(file, fallback = {}) {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    console.warn(`Could not read ${file}: ${error.message}`);
  }
  return fallback;
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function productIdFromText(value = '') {
  const match = String(value).match(/NWS_\d{3}/);
  return match ? match[0] : null;
}

function productIdFromPaymentIntent(intent) {
  const metadata = intent.metadata || {};
  return metadata.productId || metadata.product_id || metadata.product || productIdFromText(JSON.stringify(metadata)) || null;
}

async function stripeGet(pathname, params = {}) {
  if (!STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is missing. Load it from Google Secret Manager first.');

  const url = new URL(`https://api.stripe.com/v1/${pathname}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Stripe API failed ${response.status}: ${text}`);
  }

  return response.json();
}

async function fetchRecentSales() {
  const createdGte = Math.floor((Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000) / 1000);
  let startingAfter = undefined;
  const sales = {};

  for (let page = 0; page < 20; page++) {
    const data = await stripeGet('payment_intents', {
      limit: 100,
      'created[gte]': createdGte,
      starting_after: startingAfter,
    });

    for (const intent of data.data || []) {
      if (intent.status !== 'succeeded') continue;

      const productId = productIdFromPaymentIntent(intent);
      if (!productId) continue;

      sales[productId] = sales[productId] || { clicks: 0, orders: 0, revenue: 0 };
      sales[productId].orders += 1;
      sales[productId].revenue += Number(intent.amount_received || intent.amount || 0) / 100;
    }

    if (!data.has_more || !data.data?.length) break;
    startingAfter = data.data[data.data.length - 1].id;
  }

  return sales;
}

function calculateScore(record, rules) {
  const clicks = Number(record.clicks || 0);
  const orders = Number(record.orders || 0);
  const revenue = Number(record.revenue || 0);
  return orders * Number(rules.ordersWeight || 4) + revenue * Number(rules.revenueWeight || 0.05) + clicks * Number(rules.clicksWeight || 0.1);
}

function scoreToWeight(score, perf) {
  const minWeight = Number(perf.minWeight || 1);
  const maxWeight = Number(perf.maxWeight || 8);
  const defaultWeight = Number(perf.defaultWeight || 3);
  if (!Number.isFinite(score) || score <= 0) return Math.max(minWeight, Math.min(maxWeight, defaultWeight));
  return Math.max(minWeight, Math.min(maxWeight, Math.round(score)));
}

async function main() {
  const perf = readJson(PERFORMANCE_FILE, {
    mode: 'weighted', minWeight: 1, maxWeight: 8, defaultWeight: 3,
    weights: {}, performance: {}, rules: { ordersWeight: 4, revenueWeight: 0.05, clicksWeight: 0.1 }
  });

  const topProducts = readJson(TOP_PRODUCTS_FILE, { topProducts: [] }).topProducts || [];
  const sales = await fetchRecentSales();

  for (const product of topProducts) {
    const productSales = sales[product.id] || {};
    const previous = perf.performance?.[product.id] || { clicks: 0, orders: 0, revenue: 0, score: 0 };

    const merged = {
      clicks: Number(productSales.clicks ?? previous.clicks ?? 0),
      orders: Number(productSales.orders ?? 0),
      revenue: Number(productSales.revenue ?? 0),
    };

    merged.score = calculateScore(merged, perf.rules || {});
    perf.performance = perf.performance || {};
    perf.weights = perf.weights || {};
    perf.performance[product.id] = merged;
    perf.weights[product.id] = scoreToWeight(merged.score, perf);
  }

  perf.updatedAt = new Date().toISOString();
  perf.source = 'stripe_payment_intents';
  perf.lookbackDays = LOOKBACK_DAYS;
  writeJson(PERFORMANCE_FILE, perf);

  console.log('Updated social performance weights from Stripe:');
  console.log(JSON.stringify({ weights: perf.weights, performance: perf.performance, updatedAt: perf.updatedAt, sales }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
