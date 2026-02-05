# Catan Online - Deployment Guide

Complete guide to deploying the Catan game application to Google Cloud Run using Docker and Terraform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial GCP Setup](#initial-gcp-setup)
3. [Build Container Image](#build-container-image)
4. [Configure Terraform](#configure-terraform)
5. [Deploy Infrastructure](#deploy-infrastructure)
6. [Verify Deployment](#verify-deployment)
7. [Cost Management](#cost-management)
8. [Updating Deployment](#updating-deployment)
9. [Troubleshooting](#troubleshooting)
10. [Teardown](#teardown)

---

## Prerequisites

Before deploying, ensure you have:

- **GCP Account** with billing enabled
- **gcloud CLI** installed and authenticated
  - Install: https://cloud.google.com/sdk/docs/install
  - Authenticate: `gcloud auth login`
- **Docker** installed locally
  - Install: https://docs.docker.com/get-docker/
- **Terraform** installed (>= 1.0)
  - Install: https://developer.hashicorp.com/terraform/install
- **GCP Project** created in GCP Console

---

## Initial GCP Setup

These steps are performed **once** for initial setup.

### 1. Create GCP Project (if needed)

```bash
# Set your desired project ID
export PROJECT_ID="catan-online-prod"

# Create project
gcloud projects create $PROJECT_ID

# Set as active project
gcloud config set project $PROJECT_ID
```

### 2. Enable Required APIs

```bash
# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable Artifact Registry API
gcloud services enable artifactregistry.googleapis.com

# Enable Cloud Build API
gcloud services enable cloudbuild.googleapis.com
```

### 3. Create Artifact Registry Repository

```bash
# Create Docker repository in europe-west1
gcloud artifacts repositories create catan \
  --repository-format=docker \
  --location=europe-west1 \
  --description="Catan game container images"
```

### 4. Create GCS Bucket for Terraform State

```bash
# Create bucket in EU region
gsutil mb -l EU gs://catan-terraform-state

# Enable versioning for state history
gsutil versioning set on gs://catan-terraform-state
```

### 5. Get Billing Account ID

```bash
# List billing accounts
gcloud billing accounts list

# Note the ACCOUNT_ID (format: 012345-ABCDEF-678901)
# You'll need this for terraform.tfvars
```

---

## Build Container Image

### 1. Build Docker Image Locally

```bash
# Build image from project root
docker build -t catan:latest .

# Verify build succeeded
docker images | grep catan
```

Expected image size: < 400MB (Alpine Node.js base)

### 2. Test Container Locally (Optional)

```bash
# Run container on port 8080
docker run -p 8080:8080 -e PORT=8080 catan:latest

# In another terminal, test endpoints
curl http://localhost:8080/api  # Should return JSON welcome message
curl http://localhost:8080      # Should return HTML (frontend)

# Stop container: Ctrl+C
```

### 3. Tag Image for Artifact Registry

```bash
# Replace PROJECT_ID with your actual project ID
export PROJECT_ID="catan-online-prod"

# Tag image for Artifact Registry
docker tag catan:latest \
  europe-west1-docker.pkg.dev/$PROJECT_ID/catan/catan:latest
```

### 4. Authenticate Docker with GCP

```bash
# Configure Docker to use gcloud credentials
gcloud auth configure-docker europe-west1-docker.pkg.dev
```

### 5. Push Image to Artifact Registry

```bash
# Push image to GCP
docker push europe-west1-docker.pkg.dev/$PROJECT_ID/catan/catan:latest

# Verify image was pushed
gcloud artifacts docker images list \
  --repository=catan \
  --location=europe-west1
```

---

## Configure Terraform

### 1. Create terraform.tfvars

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

### 2. Edit terraform.tfvars

Open `terraform/terraform.tfvars` and fill in your values:

```hcl
# Required: Your GCP project ID
project_id = "catan-online-prod"

# Required: Full Artifact Registry image URL
image_url = "europe-west1-docker.pkg.dev/catan-online-prod/catan/catan:latest"

# Required: Billing account ID for budget alerts
billing_account_id = "012345-ABCDEF-678901"

# Required: Email for budget alert notifications
alert_email = "your-email@example.com"

# Optional: Override defaults (uncomment to change)
# region = "europe-west1"
# service_name = "catan-game"
# min_instances = 0
# max_instances = 1
# cpu_limit = "1"
# memory_limit = "512Mi"
# max_concurrency = 20
# monthly_budget_euros = 5
```

### 3. Review Configuration

**Default settings:**

- **Region:** europe-west1 (Belgium, Tier 1 pricing)
- **Scaling:** 0-1 instances (scale to zero when idle)
- **Timeout:** 3600s (1 hour for full game sessions)
- **Concurrency:** 20 requests per instance (conservative for WebSocket)
- **Budget:** EUR 5/month with alerts at 50%, 80%, 100%, 120%

---

## Deploy Infrastructure

### 1. Initialize Terraform

```bash
cd terraform
terraform init
```

This downloads the Google provider and configures the GCS backend.

### 2. Review Deployment Plan

```bash
terraform plan
```

Review the resources that will be created:

- Cloud Run v2 service
- IAM policy for public access
- Notification channel for budget alerts
- Budget monitoring

### 3. Apply Configuration

```bash
terraform apply
```

Type `yes` when prompted to confirm.

Expected output:

```
Apply complete! Resources: 4 added, 0 changed, 0 destroyed.

Outputs:

service_location = "europe-west1"
service_name = "catan-game"
service_url = "https://catan-game-abc123-ew.a.run.app"
```

**Save the `service_url` - this is your production URL!**

---

## Verify Deployment

### 1. Visit Service URL

Open the `service_url` from Terraform output in your browser:

```
https://catan-game-abc123-ew.a.run.app
```

You should see the Catan lobby interface.

### 2. Test Game Flow

1. **Create a room** - Click "Create Room", note the room code
2. **Join as second player** - Open an incognito window, join the room with a different nickname
3. **Select colors and ready up** - Both players choose colors and mark ready
4. **Start game** - Countdown should begin, game should start
5. **Test WebSocket** - Both players should see real-time updates

### 3. Verify WebSocket Connection

In browser DevTools Console, you should see:

- WebSocket connection established
- No disconnection errors
- Real-time state updates

### 4. Test API Endpoint

```bash
curl https://catan-game-abc123-ew.a.run.app/api
```

Should return JSON:

```json
{
  "message": "Catan API is running",
  "timestamp": "..."
}
```

### 5. Check Service Status

```bash
gcloud run services describe catan-game \
  --region=europe-west1 \
  --format="yaml(status)"
```

Should show `status.conditions.status: "True"` for Ready condition.

---

## Cost Management

### 1. Monitor Current Costs

```bash
# Check billing status
gcloud billing projects describe $PROJECT_ID

# View current month's costs in GCP Console
```

### 2. View Cloud Run Metrics

**GCP Console > Cloud Run > catan-game > Metrics**

Key metrics to monitor:

- **Request count** - Should stay under 2M/month for free tier (US regions only)
- **Instance count** - Should scale to 0 when idle
- **CPU utilization** - Monitor for optimization opportunities
- **Memory utilization** - Ensure 512Mi is sufficient

### 3. Check Budget Alerts

**GCP Console > Billing > Budgets & alerts**

Verify budget is configured:

- Budget: EUR 5/month
- Alerts at: 50%, 80%, 100%, 120%
- Notification email configured

### 4. Cost Optimization Notes

**Free Tier (US Regions Only):**

- 2M requests per month
- 360K GB-seconds
- 180K vCPU-seconds

**Europe Regions (Tier 1):**

- No free tier available
- Lowest European pricing: europe-west1 (Belgium)

**Cost Drivers:**

- **WebSocket connections:** Instance-based billing (CPU always allocated)
- **Cold starts:** Free (but count toward vCPU-seconds when serving)
- **Bandwidth:** Egress charges apply after free quota

**Optimization Tips:**

- Scale to zero when idle (default configuration)
- Single instance maximum (enforced)
- Conservative concurrency limit (20)
- WebSocket timeout: 3600s (prevents stale connections)

---

## Updating Deployment

### 1. Build New Image

```bash
# Build with updated code
docker build -t catan:latest .

# Tag for Artifact Registry
docker tag catan:latest \
  europe-west1-docker.pkg.dev/$PROJECT_ID/catan/catan:latest

# Push to registry
docker push europe-west1-docker.pkg.dev/$PROJECT_ID/catan/catan:latest
```

### 2. Update Terraform

If you need to change configuration, edit `terraform/terraform.tfvars`, then:

```bash
cd terraform
terraform apply
```

**For image updates only:** Terraform will detect the new image and redeploy automatically if you update the `image_url` in tfvars. Alternatively, Cloud Run will pull `:latest` on next cold start.

### 3. Force New Deployment

```bash
# Deploy latest image immediately
gcloud run services update catan-game \
  --region=europe-west1 \
  --image=europe-west1-docker.pkg.dev/$PROJECT_ID/catan/catan:latest
```

### 4. Verify Update

```bash
# Check service URL
curl https://your-service-url.run.app/api
```

---

## Troubleshooting

### Container Failed to Start

**Error:** "Container failed to start. Failed to start and then listen on the port defined by the PORT environment variable."

**Cause:** Application not listening on `process.env.PORT` or binding to 127.0.0.1 instead of 0.0.0.0.

**Fix:** Verify `apps/api/src/main.ts`:

```typescript
const port = process.env.PORT || 8080;
httpServer.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});
```

### 404 on Frontend Routes

**Error:** Frontend routes return 404 or show blank page.

**Cause:** Static files not being served or SPA fallback missing.

**Fix:** Verify `dist/apps/web` exists in built image and Express static middleware is configured.

### WebSocket Disconnects After 5 Minutes

**Error:** WebSocket connections drop after exactly 5 minutes.

**Cause:** Default Cloud Run timeout is 300 seconds.

**Fix:** Verify `terraform/main.tf`:

```hcl
template {
  timeout = "3600s"  # Must be set
}
```

### Budget Alerts Not Received

**Error:** No email alerts when budget thresholds crossed.

**Cause:** Email not verified or billing_account_id incorrect.

**Fix:**

1. Check email spam folder
2. Verify billing_account_id in terraform.tfvars
3. Check GCP Console > Billing > Budgets & alerts

### Service Returns 503

**Error:** Service responds with "503 Service Unavailable".

**Cause:** Container health checks failing or service not ready.

**Fix:**

```bash
# Check logs
gcloud run services logs read catan-game \
  --region=europe-west1 \
  --limit=50

# Look for startup errors or health check failures
```

### Image Build Fails

**Error:** Docker build fails with module not found errors.

**Cause:** Dependencies not installed or .dockerignore excluding required files.

**Fix:**

1. Ensure `package.json` and `package-lock.json` are not in .dockerignore
2. Verify NX workspace files are included
3. Check build output for specific missing modules

### Common Pitfalls (from 13-RESEARCH.md)

1. **MUST listen on process.env.PORT and 0.0.0.0** (Pitfall 1)
   - Never hardcode port 3000 or 8080
   - Must bind to 0.0.0.0, not 127.0.0.1

2. **Free tier only in US regions** (Pitfall 4)
   - europe-west1 does NOT qualify for free tier
   - Use us-central1 for free tier (or accept Europe costs)

3. **Session affinity is best-effort** (Pitfall 3)
   - Connections may drop on instance restart/scaling
   - Single instance deployment minimizes this

4. **WebSocket connections incur instance-based billing** (Pitfall 2)
   - CPU always allocated while connections open
   - Configure `cpu_idle = false` explicitly

---

## Teardown

To completely remove all deployed resources:

### 1. Destroy Terraform Infrastructure

```bash
cd terraform
terraform destroy
```

Type `yes` when prompted.

This removes:

- Cloud Run service
- IAM policies
- Budget alerts

### 2. Delete Container Images

```bash
# List images
gcloud artifacts docker images list \
  --repository=catan \
  --location=europe-west1

# Delete specific image
gcloud artifacts docker images delete \
  europe-west1-docker.pkg.dev/$PROJECT_ID/catan/catan:latest

# Or delete entire repository
gcloud artifacts repositories delete catan \
  --location=europe-west1
```

### 3. Delete Terraform State Bucket

```bash
# Remove state files
gsutil rm -r gs://catan-terraform-state

# Delete bucket
gsutil rb gs://catan-terraform-state
```

### 4. Delete GCP Project (Optional)

**WARNING:** This deletes EVERYTHING in the project.

```bash
gcloud projects delete $PROJECT_ID
```

---

## Cost Warnings

**Important notes on pricing:**

1. **No free tier in Europe** - europe-west1 deployment incurs charges from first request
2. **WebSocket billing** - Long-lived connections keep instances running (instance-based billing)
3. **Budget alerts configured** - You'll receive email notifications at 50%, 80%, 100%, 120% of EUR 5/month
4. **Bandwidth charges** - Egress traffic is billed after free quota

**Expected monthly costs (low usage):**

- **Idle (no traffic):** EUR 0 (scales to zero)
- **Light use (< 10 games/month):** EUR 0.50-2
- **Moderate use (daily games):** EUR 3-5

Monitor actual costs in GCP Console > Billing for your specific usage patterns.

---

## Next Steps

After successful deployment:

1. **Test thoroughly** - Run through complete game scenarios
2. **Monitor metrics** - Check Cloud Run dashboard daily for first week
3. **Watch costs** - Verify billing aligns with expectations
4. **Share URL** - Distribute service_url to players
5. **Plan updates** - Use CI/CD for automated deployments (future enhancement)

---

## Support

For deployment issues:

- **Cloud Run Docs:** https://cloud.google.com/run/docs
- **Terraform Google Provider:** https://registry.terraform.io/providers/hashicorp/google/latest/docs
- **Project Issues:** File on GitHub repository

---

_Last updated: 2026-02-05_
_Phase: 13-deployment (Plan 04)_
