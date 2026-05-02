#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT = path.resolve(__dirname, '..');

const PERFORMANCE_FILE = path.join(PROJECT, 'config', 'social-performance.json');
const TOP_PRODUCTS_FILE = path.join(PROJECT, 'config', 'top-products.json');

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

function normalizeSalesInput() {
  if (process.env.SALES_JSON) return JSON.parse(process.env.SALES_JSON);
  const salesFile = process.env.SALES_FILE || path.join(PROJECT, 'data', 'social-sales.json');
  if (fs.existsSync(salesFile)) return readJson(salesFile, {});
  return {};
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

const perf = readJson(PERFORMANCE_FILE, {
  mode: 'weighted', minWeight: 1, maxWeight: 8, defaultWeight: 3,
  weights: {}, performance: {}, rules: { ordersWeight: 4, revenueWeight: 0.05, clicksWeight: 0.1 }
});

const topProducts = readJson(TOP_PRODUCTS_FILE, { topProducts: [] }).topProducts || [];
const sales = normalizeSalesInput();

for (const product of topProducts) {
  const productSales = sales[product.id] || {};
  const previous = perf.performance?.[product.id] || { clicks: 0, orders: 0, revenue: 0, score: 0 };
  const merged = {
    clicks: Number(productSales.clicks ?? previous.clicks ?? 0),
    orders: Number(productSales.orders ?? previous.orders ?? 0),
    revenue: Number(productSales.revenue ?? previous.revenue ?? 0)
  };
  merged.score = calculateScore(merged, perf.rules || {});
  perf.performance = perf.performance || {};
  perf.weights = perf.weights || {};
  perf.performance[product.id] = merged;
  perf.weights[product.id] = scoreToWeight(merged.score, perf);
}

perf.updatedAt = new Date().toISOString();
writeJson(PERFORMANCE_FILE, perf);
console.log('Updated social performance weights from sales data:');
console.log(JSON.stringify({ weights: perf.weights, performance: perf.performance, updatedAt: perf.updatedAt }, null, 2));
