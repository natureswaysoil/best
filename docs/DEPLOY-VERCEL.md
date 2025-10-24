# Deploy to Vercel (Static Site)

This repo is a static site. You can deploy it to Vercel via GitHub import or CLI.

## Option A: GitHub import (recommended)
1. Go to https://vercel.com/new and import the GitHub repo `natureswaysoil/best`.
2. Framework preset: "Other" (no build).
3. Build command: leave empty.
4. Output directory: leave empty.
5. Production branch: `gh-pages`.
6. Deploy.

After deploy, open your domain (e.g., https://<project>.vercel.app/?resetProxy=1) to ensure the dashboard uses the BigQuery proxy.

CORS: The BigQuery proxy already allows `https://*.vercel.app`.

## Option B: CLI deploy
Requirements:
- Node.js and npm
- Vercel CLI (`npm i -g vercel`) or use `npx vercel`
- Either interactive login (`npx vercel login`) or a token (preferred in CI)

Quick start (with token):
```bash
# From repo root
export VERCEL_TOKEN=YOUR_TOKEN
# Optional: deploy to a team org
# export VERCEL_ORG=your-team-slug

# Preview deploy
npx vercel --token "$VERCEL_TOKEN" --confirm \
  --name natureswaysoil-best ${VERCEL_ORG:+--scope $VERCEL_ORG}

# Production deploy
npx vercel --token "$VERCEL_TOKEN" --confirm --prod \
  --name natureswaysoil-best ${VERCEL_ORG:+--scope $VERCEL_ORG}
```

Notes:
- The included `vercel.json` configures static hosting for `index.html` and `public/*` and sets some security headers.
- If Vercel prompts to link or create a project, `--confirm` accepts defaults using the current directory.
- If you prefer interactive login, run `npx vercel login` first, then `npx vercel --confirm`.

## Post-deploy checks
- Open your Vercel URL with `?resetProxy=1` to clear any cached proxy URL in localStorage.
- Confirm charts populate. If you ever introduce a custom domain, ensure it’s added to the proxy CORS allowlist and redeploy the proxy.

## Proxy CORS & Health
- Proxy URL: https://bq-proxy-1009540130231.us-east4.run.app
- CORS allowlist accepts: `https://*.vercel.app`, `https://natureswaysoil.github.io`, and localhost dev ports used in this repo.
- Quick test:
```bash
curl -i -s -X POST "https://bq-proxy-1009540130231.us-east4.run.app/" \
  -H "Content-Type: application/json" \
  -H "Origin: https://example.vercel.app" \
  -d '{"query":"SELECT 1 AS ok","location":"US","projectId":"amazon-ppc-474902"}'
```
