import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..', '..', '..');

export const PATHS = {
  root: ROOT,
  productsFile: path.join(ROOT, 'data', 'products.ts'),
  asinScriptsFile: path.join(ROOT, 'content', 'video-scripts', 'asin-scripts.json'),
  videoConfigFile: path.join(ROOT, 'content', 'video-scripts', 'video-config.json'),
  videosDir: path.join(ROOT, 'public', 'videos'),
  videoGeneratorScript: path.join(ROOT, 'scripts', 'generate-product-videos.mjs'),
};

function extractProductsLiteral(contents) {
  const match = contents.match(/export const allProducts: ProductData\[] = (\[[\s\S]*?\n\]);/);
  if (!match) {
    throw new Error('Unable to locate product array in data/products.ts');
  }
  const literal = match[1];
  // Remove trailing semicolon to prepare for evaluation
  return literal.replace(/;\s*$/, '');
}

export function loadProducts() {
  const contents = fs.readFileSync(PATHS.productsFile, 'utf8');
  const literal = extractProductsLiteral(contents);
  // eslint-disable-next-line no-new-func
  const factory = new Function(`return (${literal});`);
  const products = factory();
  if (!Array.isArray(products)) {
    throw new Error('Product data did not evaluate to an array');
  }
  return products;
}

export function loadAsinScripts() {
  const contents = fs.readFileSync(PATHS.asinScriptsFile, 'utf8');
  return JSON.parse(contents);
}

export function readVideoConfig() {
  const contents = fs.readFileSync(PATHS.videoConfigFile, 'utf8');
  return JSON.parse(contents);
}

export function listVideoAssets() {
  if (!fs.existsSync(PATHS.videosDir)) {
    return { files: [], map: new Map() };
  }
  const files = fs.readdirSync(PATHS.videosDir);
  const map = new Map();

  for (const file of files) {
    const ext = path.extname(file);
    const id = path.basename(file, ext);
    if (!map.has(id)) {
      map.set(id, { mp4: false, webm: false, poster: false });
    }
    const entry = map.get(id);
    if (ext === '.mp4') {
      entry.mp4 = true;
    } else if (ext === '.webm') {
      entry.webm = true;
    } else if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
      entry.poster = true;
    }
  }

  return { files, map };
}

export function requireEnvVars(vars) {
  const missing = [];
  const empty = [];

  for (const name of vars) {
    if (!(name in process.env)) {
      missing.push(name);
    } else if (!process.env[name]) {
      empty.push(name);
    }
  }

  return { missing, empty };
}

export function hasCommand(command) {
  try {
    const result = spawnSync(command, ['--version'], { stdio: 'ignore' });
    return result.status === 0;
  } catch (error) {
    return false;
  }
}
