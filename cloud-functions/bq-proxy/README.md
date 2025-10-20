# BigQuery Proxy (Cloud Functions or Cloud Run)

A minimal HTTP proxy that executes a BigQuery SQL query server-side via the BigQuery REST API and returns results, with CORS enabled for GitHub Pages.

- Endpoint: POST to the base URL (no path required)
- Body: { "query": string, "location"?: string, "projectId"?: string }
  - projectId is optional if the platform injects it (Functions: GCP_PROJECT, Cloud Run: GOOGLE_CLOUD_PROJECT). This proxy also accepts projectId in the request body for portability.
- Auth: Uses the runtime service account (metadata server). Do not send keys from the browser.
- CORS: Allows origin https://natureswaysoil.github.io by default, or configure via ALLOWED_ORIGINS env var.

## Deploy (Cloud Functions)

```bash
# Set your project
PROJECT_ID=amazon-ppc-474902
REGION=us-central1
gcloud config set project $PROJECT_ID

# Deploy HTTP function (Node.js Functions Framework)
cd cloud-functions/bq-proxy
gcloud functions deploy bq-proxy \
  --entry-point=query \
  --runtime=nodejs20 \
  --trigger-http \
  --allow-unauthenticated \
  --region=$REGION \
  --set-env-vars=NODE_OPTIONS=--enable-source-maps

# Get URL
gcloud functions describe bq-proxy --region=$REGION --format='value(httpsTrigger.url)'
```

## Deploy (Cloud Run)

```bash
gcloud run deploy bq-proxy \
  --source=. \
  --region=$REGION \
  --allow-unauthenticated \
  --set-env-vars=ALLOWED_ORIGINS=https://natureswaysoil.github.io \
  --set-env-vars=NODE_OPTIONS=--enable-source-maps

Note: For Cloud Run, GOOGLE_CLOUD_PROJECT should be populated automatically. If it's not, this proxy accepts projectId in the request body. This repo includes `server.js` (Express) as the entry for Cloud Run so the container can listen on `$PORT` and serve `/` and `/query`.

Health check:

```bash
curl -sS "$URL/healthz"
```
```

## IAM
Ensure the function's service account has:
- BigQuery Job User
- BigQuery Data Viewer

## Test locally or via curl

Replace $URL with your deployed URL:

```bash
curl -sS -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d '{"query":"SELECT 1 AS ok","location":"us-east4","projectId":"amazon-ppc-474902"}'
```

## Browser usage
Update the dashboard to POST to the function/Cloud Run URL. The dashboard already sends projectId in the request and handles CORS.
