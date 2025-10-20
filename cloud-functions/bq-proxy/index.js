// BigQuery Proxy via Google Cloud Functions (HTTP)
// - Expects POST with JSON: { query: string, location?: string }
// - Uses service account credentials from environment (runtime default) or GOOGLE_APPLICATION_CREDENTIALS
// - Returns BigQuery rows in standard BigQuery REST format for drop-in replacement
// - CORS enabled for GitHub Pages origin

const { BigQuery } = require('@google-cloud/bigquery');

// Allow from your GitHub Pages origin
const DEFAULT_ALLOWED = ['https://natureswaysoil.github.io'];
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean)
  : DEFAULT_ALLOWED;

exports.query = async (req, res) => {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
  }
  res.set('Vary', 'Origin');
  res.set('Access-Control-Allow-Credentials', 'true');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    const { query, location } = req.body || {};
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Missing SQL query' });
    }

    const bq = new BigQuery();
    const [job] = await bq.createQueryJob({
      query,
      location: location || 'US',
      useLegacySql: false,
    });
    const [rows] = await job.getQueryResults();

    // Convert rows to BigQuery REST rows format (f[].v)
    const schemaFields = job.metadata?.statistics?.query?.schema?.fields || [];
    const fieldNames = schemaFields.length ? schemaFields.map(f => f.name) : Object.keys(rows[0] || {});

    const data = rows.map(r => ({ f: fieldNames.map(name => ({ v: r[name] ?? null })) }));

    return res.status(200).json({ rows: data });
  } catch (err) {
    console.error('BQ Proxy Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
};
