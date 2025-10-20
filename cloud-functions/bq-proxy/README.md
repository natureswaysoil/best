# BigQuery Proxy Cloud Function

A minimal HTTP Cloud Function that executes a BigQuery SQL query server-side via the BigQuery REST API and returns results with CORS enabled for GitHub Pages.

- Endpoint: POST /query
- Body: { "query": string, "location"?: string }
- Auth: Uses the function's service account (deploy in your GCP project). Do not send keys from the browser.
- CORS: Allows origin https://natureswaysoil.github.io

## Deploy (gcloud)

```bash
# Set your project
PROJECT_ID=amazon-ppc-474902
REGION=us-central1
gcloud config set project $PROJECT_ID

# Deploy HTTP function
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

If you prefer Cloud Run:

```bash
gcloud run deploy bq-proxy \
  --source=. \
  --region=$REGION \
  --allow-unauthenticated \
  --set-env-vars=ALLOWED_ORIGINS=https://natureswaysoil.github.io
```

## IAM
Ensure the function's service account has:
- BigQuery Job User
- BigQuery Data Viewer

## Browser usage
Update the dashboard to POST to the function URL instead of calling BigQuery directly.
