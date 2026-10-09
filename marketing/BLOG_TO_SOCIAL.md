# Blog → video → social automation

Every new blog post becomes a 25-second vertical video posted to Instagram,
Facebook, YouTube Shorts, X, Pinterest and TikTok, with a tracked link back to
the post.

## How it runs

1. `Auto-Generate Blog Content` publishes a post (every 2 days).
2. `Blog to Social Video` (`.github/workflows/blog-to-social.yml`) starts when it finishes. A daily 15:30 UTC run also catches posts added by hand.
3. **render job** (`node scripts/blog-social/job.mjs render`):
   - Picks the newest post from the last 14 days that hasn't been handled.
   - Writes a script and captions with OpenAI, using `marketing/brand-context.md` as the copywriter's rules.
   - Runs the claim check (`scripts/blog-social/claims.mjs`). If the script still breaks a rule after one retry, the post is marked `held` and nothing is rendered.
   - Shows the best-matching product with a real image at the end. If nothing matches, it shows NWS_011.
   - Renders the video with the existing quality video generator and OpenAI voiceover, and runs the same video QA checks as product videos.
   - Uploads the video to `gs://<VIDEO_OUTPUT_BUCKET>/<prefix>/blog/`.
4. **post job** runs in the `blog-social` GitHub environment, so it can wait for approval:
   - Checks that the blog post is live on the site first.
   - Posts to every platform that has credentials, and skips any platform already done for that post.
5. Results are recorded in `gs://<bucket>/blog-social/state.json`, keyed by slug, with status `rendered`, `held`, `posted`, `partial` or `failed`.

## One-time setup

| Step | Where |
|---|---|
| Approval gate: add yourself as a required reviewer on environment `blog-social`. Remove the reviewer later to post fully automatically. | GitHub → Settings → Environments |
| `GCP_SERVICE_ACCOUNT_JSON` GitHub secret (already used by other workflows) | GitHub → Settings → Secrets |
| TikTok secrets: `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `TIKTOK_REFRESH_TOKEN`, or a short-lived `TIKTOK_ACCESS_TOKEN` | Google Secret Manager |
| Instagram and Facebook download the video from Cloud Storage, so the `blog/` folder must be publicly readable (or set `MAKE_GCS_VIDEOS_PUBLIC=1`). | Google Cloud Storage |

TikTok notes:
- The service account needs `secretmanager.versions.add` on `TIKTOK_REFRESH_TOKEN`, because TikTok rotates refresh tokens and the job saves the new one.
- Until TikTok approves the app in its audit, posts can only be private (`SELF_ONLY`). The job automatically uses the most public setting TikTok allows.

## Run by hand

GitHub → Actions → **Blog to Social Video** → Run workflow. Optionally enter a slug, for example to re-run a `held` post after editing it.


## Recovery and verification

The `video` repository owns scheduled product posting. The `best` product
workflow is a manual fallback; this blog workflow only posts blog videos.

Each confirmed platform ID is saved immediately. Interrupted and partial jobs
resume their existing render from Cloud Storage and skip completed platforms.
TikTok processing IDs are retained and checked again instead of uploaded again.
Any enabled platform failure makes the job fail visibly. A green Vercel build
is not evidence of a social post: verify the platform IDs and Actions job logs.

The Google credential secret is `GCP_SERVICE_ACCOUNT_JSON`. If bucket writes
fail, an administrator must grant `roles/storage.objectUser` to
`natureswaysoil-video@appspot.gserviceaccount.com` on the
`natureswaysoil-videos` bucket. This allows reading, creating, updating, and
replacing pipeline assets and state; it does not grant project-wide admin.
The catalog workflow checks those permissions before spending time rendering.

```bash
gcloud storage buckets add-iam-policy-binding gs://natureswaysoil-videos \
  --member=serviceAccount:natureswaysoil-video@appspot.gserviceaccount.com \
  --role=roles/storage.objectUser
```

The `seed-videos/blog/` output must be publicly reachable for platforms that
fetch it by URL. Do not expose credentials or private state files. Verify the
video URL before treating a publish result as successful.
