# PPC Optimizer (Cloud Functions Gen2)

Automates Amazon PPC optimizations: pause/enable by ACOS, bid adjustments, keyword discovery, negatives, budget tuning, and dayparting. CORS is enabled for the dashboard and actions are logged to BigQuery.

## Deploy

```
cd automation/cloud-functions/ppc-optimizer
./deploy.sh amazon-ppc-474902 us-east4
```

The deploy script:
- Ensures required APIs are enabled
- Creates a `ppc-optimizer-sa` service account with minimal roles
- Deploys `amazon-ppc-optimizer` (Node 20, HTTP-triggered, unauthenticated allowed)
- Prints the function URL when done

## Schedule (every 2 hours)

Use Cloud Scheduler to invoke the optimizer every 2 hours.

```
cd automation/cloud-functions/ppc-optimizer
./setup-scheduler.sh amazon-ppc-474902 us-east4 https://REGION-PROJECT-FunctionURL
```

Notes:
- If the 3rd arg (function URL) is omitted, the script auto-discovers it with `gcloud functions describe`.
- Default cron: `0 */2 * * *` (every 2 hours). Override with env var `SCHEDULE_CRON` if needed.
- Default job name: `ppc-optimizer-2h` (override with `JOB_NAME`).
- Default time zone: `America/New_York` (override with `TIME_ZONE`).

Verify jobs:

```
gcloud scheduler jobs list --location=us-east4
```

Run on-demand:

```
gcloud scheduler jobs run ppc-optimizer-2h --location=us-east4
```

## Configure CORS

Allowed origins are controlled by env var `ALLOWED_ORIGINS` in `deploy.sh`.
Ensure it includes:
- https://natureswaysoil.github.io
- http://localhost:8086 (for local testing)

## BigQuery Logging

Actions the optimizer takes are written to `amazon_ppc.optimization_actions`.
Ensure the dataset exists and the function service account has `roles/bigquery.dataEditor` and `roles/bigquery.jobUser`.
