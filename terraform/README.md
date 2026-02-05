# Terraform Configuration for Catan Online

Complete Terraform infrastructure-as-code for deploying Catan game to Google Cloud Run.

## Overview

This Terraform configuration deploys a **single Cloud Run service** optimized for:

- **Cost Optimization**: Scale to zero, single instance max, budget alerts
- **WebSocket Support**: 3600s timeout, session affinity, conservative concurrency
- **Production Ready**: Health probes, IAM policies, monitoring

**Architecture**: One Cloud Run v2 service serving both frontend (static files) and backend (API + WebSocket) from a single container.

## Files

| File           | Purpose                                                   |
| -------------- | --------------------------------------------------------- |
| `backend.tf`   | GCS backend for Terraform state storage                   |
| `variables.tf` | Input variables (project, image, resources, billing)      |
| `main.tf`      | Cloud Run v2 service with scaling and health probes       |
| `iam.tf`       | Public access IAM policy (allows unauthenticated traffic) |
| `billing.tf`   | Budget alerts at 50%, 80%, 100%, 120% thresholds          |
| `outputs.tf`   | Service URL, name, and location outputs                   |

## Prerequisites

Before using this Terraform configuration:

1. **Terraform >= 1.0** installed
2. **GCP project** created with billing enabled
3. **GCS bucket** for Terraform state:
   ```bash
   gsutil mb -l EU gs://catan-terraform-state
   ```
4. **Container image** pushed to Artifact Registry:
   ```bash
   # Build and push (see DEPLOYMENT.md for details)
   docker build -t catan:latest .
   docker tag catan:latest europe-west1-docker.pkg.dev/[PROJECT_ID]/catan/catan:latest
   docker push europe-west1-docker.pkg.dev/[PROJECT_ID]/catan/catan:latest
   ```
5. **APIs enabled** in GCP project:
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable artifactregistry.googleapis.com
   ```

## Configuration

### 1. Create `terraform.tfvars`

Copy the example file and fill in your values:

```bash
cp terraform.tfvars.example terraform.tfvars
```

### 2. Required Variables

These must be set in `terraform.tfvars`:

```hcl
project_id          = "your-gcp-project-id"
image_url           = "europe-west1-docker.pkg.dev/your-project/catan/catan:latest"
billing_account_id  = "012345-ABCDEF-678901"  # From: gcloud billing accounts list
alert_email         = "your-email@example.com"
```

### 3. Optional Variables (with defaults)

Override these in `terraform.tfvars` if needed:

```hcl
region              = "europe-west1"  # Default: Belgium
service_name        = "catan-game"    # Default service name
min_instances       = 0               # Scale to zero
max_instances       = 1               # Single instance limit
cpu_limit           = "1"             # 1 vCPU
memory_limit        = "512Mi"         # 512 MB RAM
max_concurrency     = 20              # Concurrent requests per instance
monthly_budget_euros = 5              # Budget in EUR
```

## Usage

### Initialize Terraform

Run once to download providers and configure backend:

```bash
cd terraform
terraform init
```

### Preview Changes

Review what Terraform will create:

```bash
terraform plan
```

### Deploy Infrastructure

Apply the configuration:

```bash
terraform apply
```

Type `yes` when prompted. Terraform will output the service URL:

```
Outputs:

service_url      = "https://catan-game-abc123-ew.a.run.app"
service_name     = "catan-game"
service_location = "europe-west1"
```

### Update Deployment

After pushing a new container image:

```bash
# Update image_url in terraform.tfvars if using new tag
terraform apply
```

Cloud Run will perform a rolling update to the new revision.

### Destroy Infrastructure

Remove all resources:

```bash
terraform destroy
```

Type `yes` when prompted. This will delete the Cloud Run service and budget alerts.

## Cost Optimization Settings

This configuration is designed to minimize costs:

### Scaling Configuration

- **Scale to zero** (`min_instances = 0`): Instance shuts down completely when idle, no charges
- **Single instance max** (`max_instances = 1`): Hard limit prevents runaway costs
- **Conservative concurrency** (`max_concurrency = 20`): Ensures WebSocket stability

### Billing Configuration

- **Instance-based billing** (`cpu_idle = false`): Matches WebSocket usage pattern
- **3600s timeout**: Allows full game sessions without reconnection
- **Budget alerts**: Email notifications at 50%, 80%, 100%, 120% of monthly budget

**Default budget**: EUR 5/month

**Alert thresholds**:

- 50% (EUR 2.50) - Early warning
- 80% (EUR 4.00) - Review usage
- 100% (EUR 5.00) - Budget exceeded
- 120% (EUR 6.00) - Overspend alert

### Resource Limits

- **CPU**: 1 vCPU (default) - sufficient for multiple concurrent games
- **Memory**: 512 MB (default) - handles in-memory game state
- **Concurrency**: 20 requests/instance - conservative for WebSocket stability

## WebSocket Configuration

Special settings for long-lived WebSocket connections:

| Setting            | Value   | Rationale                                           |
| ------------------ | ------- | --------------------------------------------------- |
| `timeout`          | `3600s` | Allows 1-hour game sessions without disconnection   |
| `session_affinity` | `true`  | Best-effort sticky sessions for WebSocket stability |
| `max_concurrency`  | `20`    | Conservative limit prevents connection issues       |
| `cpu_idle`         | `false` | Instance-based billing (matches WebSocket pattern)  |

**Note**: Cloud Run session affinity is **best-effort** - not guaranteed. Clients should handle reconnection gracefully.

## Health Probes

Two probes ensure service reliability:

### Startup Probe

- **Path**: `/api`
- **Initial delay**: 10s
- **Timeout**: 3s
- **Period**: 10s
- **Failure threshold**: 3

Waits for service to start before routing traffic.

### Liveness Probe

- **Path**: `/api`
- **Initial delay**: 30s
- **Timeout**: 3s
- **Period**: 30s
- **Failure threshold**: 3

Restarts unhealthy instances automatically.

## Outputs

After `terraform apply`, these outputs are available:

### `service_url`

Full HTTPS URL to access the deployed application:

```
https://catan-game-abc123-ew.a.run.app
```

### `service_name`

Name of the Cloud Run service (for gcloud commands):

```
catan-game
```

### `service_location`

Region where service is deployed:

```
europe-west1
```

**Usage example**:

```bash
# View logs
gcloud run services logs read $(terraform output -raw service_name) \
  --region=$(terraform output -raw service_location)

# Describe service
gcloud run services describe $(terraform output -raw service_name) \
  --region=$(terraform output -raw service_location)
```

## Implementation Rationale

Configuration decisions based on [13-CONTEXT.md](../.planning/phases/13-deployment/13-CONTEXT.md):

- **Scale to zero**: Maximum cost savings, accept 1-2s cold start
- **Single instance**: Hard constraint for cost control
- **Instance-based billing**: WebSocket connections keep CPU active
- **3600s timeout**: Full game sessions without forced reconnection
- **Session affinity**: Improves WebSocket stability (best-effort)
- **Conservative concurrency**: Prioritizes stability over throughput
- **Budget alerts**: Four thresholds provide progressive cost warnings

## Troubleshooting

### Terraform Errors

**Error**: `Backend configuration changed`

```bash
# Reinitialize backend
terraform init -reconfigure
```

**Error**: `Resource already exists`

```bash
# Import existing resource
terraform import google_cloud_run_v2_service.api projects/[PROJECT]/locations/[REGION]/services/[NAME]
```

### Deployment Issues

**Problem**: Service won't start

```bash
# Check logs
gcloud run services logs read catan-game --region=europe-west1 --limit=50
```

Common causes:

- Container listening on wrong port (must use `process.env.PORT`)
- Missing static files in container (`dist/apps/web`)
- Health probe failing (API must respond to `/api`)

**Problem**: Budget alerts not working

- Verify `billing_account_id` is correct: `gcloud billing accounts list`
- Check email address in `alert_email` variable
- Allow up to 24 hours for first alert configuration

## Further Reading

- **Deployment guide**: See `../DEPLOYMENT.md` for full deployment walkthrough
- **Cloud Run docs**: https://cloud.google.com/run/docs
- **Terraform Google provider**: https://registry.terraform.io/providers/hashicorp/google/latest/docs
- **Cost optimization**: https://cloud.google.com/run/docs/tips/general
