# Quick Start — Scheduled Blog + Video Workflow

## Deploy (One Command)
```bash
./deploy-scheduled-workflow.sh
```

## Test Immediately
```bash
gcloud scheduler jobs run blog-video-workflow-9am \
  --project=natureswaysoil-video \
  --location=us-central1
```

## View Logs
```bash
gcloud logging tail "resource.type=cloud_run_revision AND resource.labels.service_name=blog-video-workflow" \
  --project=natureswaysoil-video
```

## Pause/Resume
```bash
# Pause
gcloud scheduler jobs pause blog-video-workflow-9am --project=natureswaysoil-video --location=us-central1
gcloud scheduler jobs pause blog-video-workflow-6pm --project=natureswaysoil-video --location=us-central1

# Resume
gcloud scheduler jobs resume blog-video-workflow-9am --project=natureswaysoil-video --location=us-central1
gcloud scheduler jobs resume blog-video-workflow-6pm --project=natureswaysoil-video --location=us-central1
```

## Monitor
- **Console:** https://console.cloud.google.com/cloudscheduler?project=natureswaysoil-video
- **Logs:** https://console.cloud.google.com/logs?project=natureswaysoil-video

---

**Schedule:** 9:00 AM and 6:00 PM daily (Eastern Time)  
**Full Guide:** See `SCHEDULED_DEPLOYMENT_GUIDE.md`
