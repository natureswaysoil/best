// BigQuery Proxy via Google Cloud Functions (HTTP)
// - Expects POST body: { query: string, location?: string }
// - Uses the runtime service account (metadata server) to obtain an access token
// - Calls BigQuery REST API and returns the raw JSON (includes rows: f[].v)
// - CORS enabled for GitHub Pages origin

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

    const projectId = process.env.GCP_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
    if (!projectId) {
      return res.status(500).json({ error: 'Project ID not found in environment' });
    }

    // Get access token from metadata server
    const tokenRes = await fetch('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token', {
      headers: { 'Metadata-Flavor': 'Google' }
    });
    if (!tokenRes.ok) {
      const t = await tokenRes.text();
      return res.status(500).json({ error: `Failed to obtain token: ${tokenRes.status} ${t}` });
    }
    const { access_token } = await tokenRes.json();

    // BigQuery REST API call
    const bqRes = await fetch(`https://bigquery.googleapis.com/bigquery/v2/projects/${projectId}/queries`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query, useLegacySql: false, location: location || 'US', maxResults: 1000 })
    });
    const json = await bqRes.json();
    if (!bqRes.ok) {
      return res.status(bqRes.status).json({ error: json.error?.message || 'BigQuery query failed' });
    }
    return res.status(200).json(json);
  } catch (err) {
    console.error('BQ Proxy Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
};
