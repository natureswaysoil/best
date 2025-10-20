// Express wrapper for Cloud Run deployment
const express = require('express');
const { query } = require('./index');

const app = express();
app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/healthz', (req, res) => res.status(200).send('ok'));

// Main endpoint: accept POST at root or /query
app.options('*', (req, res) => query(req, res));
app.post('/', (req, res) => query(req, res));
app.post('/query', (req, res) => query(req, res));

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`BQ Proxy listening on port ${port}`);
});
