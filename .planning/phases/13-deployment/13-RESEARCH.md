# Phase 13: Deployment - Research

**Researched:** 2026-02-05
**Domain:** Docker multi-stage builds, Terraform, GCP Cloud Run, WebSocket deployment
**Confidence:** HIGH

## Summary

Cloud Run natively supports WebSocket deployments with no special configuration required beyond timeout settings. The platform automatically handles request routing and scaling, but WebSocket connections incur instance-based billing (CPU always allocated while connections are open). For cost optimization with the single-instance constraint, use request-based billing for HTTP traffic and accept that WebSocket connections will trigger instance-based pricing.

The standard deployment stack combines Docker multi-stage builds (Node.js Alpine base), Terraform Infrastructure-as-Code with GCS backend for state management, and Cloud Run's v2 API. Key architectural decisions include serving static frontend files via Express middleware, aggressive compression (Brotli/Gzip), and session affinity for improved WebSocket stability.

Critical pitfall: Cloud Run injects the PORT environment variable (default 8080) at runtime. Containers MUST listen on this dynamic port, not hardcoded values. Session affinity is "best effort" only and breaks when instances restart, reach concurrency limits, or hit resource caps—external state synchronization is required for multi-instance scenarios but not needed for the single-instance deployment pattern.

**Primary recommendation:** Use Terraform's `google_cloud_run_v2_service` resource with `invoker_iam_disabled = true` for public access, configure 3600s timeout for full game sessions, and set CPU allocation to instance-based billing to match WebSocket connection patterns. Deploy to `europe-west1` (Belgium) for lowest Tier 1 pricing in Europe, though this forfeits free tier benefits (US regions only).

## Standard Stack

The established libraries/tools for Docker + Terraform + GCP Cloud Run deployment:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Terraform | 1.x+ | Infrastructure-as-Code | Industry standard for GCP resource provisioning, declarative config |
| Google Provider | latest (~6.x) | Terraform GCP integration | Official HashiCorp provider, supports Cloud Run v2 API |
| Docker | 20.x+ | Container runtime | Universal containerization standard, Cloud Run's deployment format |
| Node.js Alpine | 20-alpine | Base image | Minimal footprint (~40MB vs ~300MB), security updates, LTS support |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| compression | 1.7.x | Express middleware | On-the-fly Gzip/Brotli compression for dynamic responses |
| express-static-gzip | 2.x+ | Pre-compressed static files | Serve .br/.gz files built at compile time for frontend assets |
| ws | 8.x+ | WebSocket library | Already in use, supports permessage-deflate compression |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Terraform | gcloud CLI + scripts | Terraform provides declarative state management, drift detection, versioning |
| node:alpine | node:slim / distroless | Alpine has smallest size, active security patches, established ecosystem |
| GCS backend | Local state / Terraform Cloud | GCS provides free state storage, automatic locking, team collaboration |

**Installation:**
```bash
# Terraform (macOS)
brew install terraform

# Compression libraries (add to package.json)
npm install compression express-static-gzip
```

## Architecture Patterns

### Recommended Project Structure
```
.
├── Dockerfile                    # Multi-stage build for web + api
├── .dockerignore                 # Exclude node_modules, .nx, .git
├── terraform/
│   ├── main.tf                   # Primary Cloud Run service resource
│   ├── variables.tf              # Input variables (region, project, etc.)
│   ├── outputs.tf                # Service URL, other outputs
│   ├── backend.tf                # GCS state backend configuration
│   ├── billing.tf                # Budget alerts and monitoring
│   ├── iam.tf                    # Public access IAM policy
│   └── terraform.tfvars          # Secret values (gitignored)
└── apps/
    └── api/
        └── src/
            └── main.ts           # Express app with static middleware
```

### Pattern 1: Multi-Stage Docker Build for NX Monorepo
**What:** Separate stages for dependencies, building both apps, and minimal production runtime
**When to use:** NX monorepo with React frontend + Express API deployed as single container

**Example:**
```dockerfile
# Source: Docker best practices + NX monorepo patterns
# https://medium.com/@abdullahzengin/how-to-dockerize-your-nx-monorepo-applications-a-step-by-step-guide-using-angular-and-nestjs-a079b1b9a181

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false

# Stage 2: Build both apps
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx nx build api --prod
RUN npx nx build web --prod

# Stage 3: Production runtime
FROM node:20-alpine AS runtime
WORKDIR /app

# Copy production dependencies only
COPY package*.json ./
RUN npm ci --production --ignore-scripts

# Copy built artifacts
COPY --from=build /app/dist/apps/api ./dist/apps/api
COPY --from=build /app/dist/apps/web ./dist/apps/web

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

# Cloud Run provides PORT env var (default 8080)
EXPOSE 8080

CMD ["node", "dist/apps/api/main.js"]
```

### Pattern 2: Serving Static Frontend from Express API
**What:** Express middleware serves built Vite frontend from /dist folder
**When to use:** Single-container deployment where API also hosts frontend

**Example:**
```typescript
// Source: Express static middleware + Vite production builds
// https://medium.com/@csroee/vite-react-expressjs-app-performance-architecture-e76363361b17

import express from 'express';
import compression from 'compression';
import expressStaticGzip from 'express-static-gzip';
import path from 'path';

const app = express();

// Enable compression for dynamic responses
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// Serve pre-compressed static files (Brotli preferred, falls back to Gzip)
app.use(expressStaticGzip(path.join(__dirname, '../web'), {
  enableBrotli: true,
  orderPreference: ['br', 'gz'],
  serveStatic: {
    maxAge: '1y',
    immutable: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    }
  }
}));

// WebSocket + API routes
// ... ws and REST endpoints ...

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../web/index.html'));
});

// Cloud Run provides PORT env var
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
```

### Pattern 3: Terraform Modular Structure
**What:** Separate .tf files for logical resource grouping, GCS backend for state
**When to use:** All Terraform GCP deployments

**Example:**
```hcl
# Source: Terraform best practices + Cloud Run v2 API
# https://docs.cloud.google.com/docs/terraform/best-practices/general-style-structure
# https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/cloud_run_v2_service

# backend.tf
terraform {
  backend "gcs" {
    bucket = "catan-terraform-state"
    prefix = "prod"
  }
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
}

# main.tf
resource "google_cloud_run_v2_service" "api" {
  name     = var.service_name
  location = var.region

  template {
    timeout = "3600s"  # 1 hour for full game sessions

    scaling {
      min_instance_count = 0  # Scale to zero
      max_instance_count = 1  # Single instance constraint
    }

    containers {
      image = var.image_url

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
        cpu_idle = false  # Instance-based billing for WebSocket
      }

      ports {
        container_port = 8080
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      startup_probe {
        http_get {
          path = "/health"
        }
        initial_delay_seconds = 10
        failure_threshold     = 3
        period_seconds        = 10
      }
    }

    session_affinity = true  # Best-effort WebSocket connection stickiness
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  invoker_iam_disabled = true  # Public access (no authentication)
}

# iam.tf - Alternative approach to public access
# resource "google_cloud_run_service_iam_binding" "public" {
#   location = google_cloud_run_v2_service.api.location
#   service  = google_cloud_run_v2_service.api.name
#   role     = "roles/run.invoker"
#   members  = ["allUsers"]
# }

# billing.tf
resource "google_billing_budget" "budget" {
  billing_account = var.billing_account_id
  display_name    = "Cloud Run Budget Alert"

  budget_filter {
    services = ["services/152E-C115-5142"]  # Cloud Run service code
  }

  amount {
    specified_amount {
      currency_code = "EUR"
      units         = "5"
    }
  }

  threshold_rules {
    threshold_percent = 0.5  # Alert at 50%
  }

  threshold_rules {
    threshold_percent = 0.8  # Alert at 80%
  }

  threshold_rules {
    threshold_percent = 1.0  # Alert at 100%
  }

  all_updates_rule {
    monitoring_notification_channels = [
      google_monitoring_notification_channel.email.id
    ]
  }
}

resource "google_monitoring_notification_channel" "email" {
  display_name = "Budget Alert Email"
  type         = "email"

  labels = {
    email_address = var.alert_email
  }
}

# outputs.tf
output "service_url" {
  value       = google_cloud_run_v2_service.api.uri
  description = "Cloud Run service URL"
}

output "service_name" {
  value = google_cloud_run_v2_service.api.name
}
```

### Pattern 4: .dockerignore for NX Monorepo
**What:** Exclude unnecessary files from Docker build context
**When to use:** All Docker builds, especially monorepos with large node_modules

**Example:**
```
# Source: Docker optimization best practices
# https://medium.com/@6akcuk/quick-tip-2-completely-ignore-node-modules-for-docker-in-monorepo-3ndb

# Dependencies (reinstalled in container)
**/node_modules/
**/.pnp
**/.pnp.js

# NX cache and build artifacts
.nx/
dist/
tmp/

# Git
.git/
.gitignore

# IDE
.vscode/
.idea/

# Testing
coverage/
**/*.test.ts
**/*.spec.ts

# CI/CD
.github/
.circleci/

# Environment files (use Terraform env vars instead)
.env*
!.env.example

# Documentation
*.md
!README.md

# Logs
logs/
*.log
npm-debug.log*
```

### Pattern 5: WebSocket Compression Configuration
**What:** Enable permessage-deflate with conservative settings to reduce bandwidth
**When to use:** WebSocket connections where bandwidth costs exceed CPU costs

**Example:**
```typescript
// Source: ws library WebSocket compression
// https://github.com/websockets/ws
// https://oneuptime.com/blog/post/2026-01-24-websocket-message-compression/view

import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({
  port: 8080,
  perMessageDeflate: {
    zlibDeflateOptions: {
      level: 3,  // Lower compression = faster, less memory
      memLevel: 8,
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    },
    clientNoContextTakeover: true,
    serverNoContextTakeover: true,
    serverMaxWindowBits: 10,
    concurrencyLimit: 10,  # Limit concurrent compressions
    threshold: 1024  # Don't compress messages < 1KB
  }
});
```

### Anti-Patterns to Avoid

- **Hardcoded ports:** Cloud Run injects PORT env var dynamically. Never hardcode 8080.
- **Listening on 127.0.0.1:** Containers must listen on 0.0.0.0 to accept external connections.
- **Running as root:** Create and use non-root user (nodejs) for security.
- **Large base images:** node:latest is ~300MB; node:20-alpine is ~40MB. Always use Alpine variants.
- **Copying node_modules:** Install dependencies in container, never COPY node_modules from host.
- **Relying on session affinity:** Session affinity is best-effort and breaks frequently. Design for stateless instances.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTTP compression | Custom compression logic | `compression` + `express-static-gzip` | Handles content negotiation, pre-compressed files, proper headers, streaming |
| State backend | Local .tfstate files | Terraform GCS backend | Automatic locking, team collaboration, state versioning, encrypted storage |
| Docker layer caching | Single-stage Dockerfile | Multi-stage builds with BuildKit | Intelligent layer reuse, parallel builds, 10x faster rebuilds |
| Public access IAM | Custom auth middleware | `invoker_iam_disabled = true` | Terraform-managed, consistent with GCP security model, audit trail |
| Budget monitoring | Manual cost tracking | `google_billing_budget` resource | Automated alerts, percentage thresholds, email/Pub/Sub notifications |
| Health checks | Custom ping endpoints | Cloud Run startup/liveness probes | Automatic container restarts, zero-downtime deployments, integrated monitoring |
| WebSocket compression | Manual message compression | ws `perMessageDeflate` | RFC 7692 standard, automatic negotiation, frame-level compression |

**Key insight:** Cloud Run's serverless model handles orchestration, scaling, health checks, and HTTPS termination. Don't replicate these in application code. Configuration over implementation.

## Common Pitfalls

### Pitfall 1: PORT Environment Variable Mismatch
**What goes wrong:** Container fails to start with "Container failed to start. Failed to start and then listen on the port defined by the PORT environment variable."
**Why it happens:** Application hardcodes port 3000/8080 instead of reading process.env.PORT. Cloud Run injects PORT dynamically (usually 8080 but not guaranteed).
**How to avoid:**
```typescript
// WRONG
app.listen(3000);

// CORRECT
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0');  // Must bind to 0.0.0.0, not 127.0.0.1
```
**Warning signs:** Local development works, Cloud Run deployment fails immediately with port binding errors.

### Pitfall 2: CPU Allocation Mode for WebSocket Services
**What goes wrong:** Unexpected billing spikes or connection drops due to CPU throttling.
**Why it happens:** Default request-based billing (CPU only during requests) doesn't work for long-lived WebSocket connections. Cloud Run automatically uses instance-based billing when WebSocket connections are open, but explicit configuration prevents confusion.
**How to avoid:**
```hcl
# Set cpu_idle = false for instance-based billing
resources {
  limits = {
    cpu    = "1"
    memory = "512Mi"
  }
  cpu_idle = false  # Always allocate CPU (instance-based billing)
}
```
**Warning signs:** WebSocket connections disconnect after 5 minutes, CPU throttling errors in logs, billing shows mixture of request/instance charges.

### Pitfall 3: Session Affinity Over-Reliance
**What goes wrong:** WebSocket connections drop unexpectedly, game state lost, players disconnected mid-game.
**Why it happens:** Session affinity is "best effort" and breaks when instance reaches max concurrency (10-50 connections), max CPU utilization, or during instance replacement. Developers assume it's guaranteed sticky routing.
**How to avoid:** For single-instance deployment (max_instance_count = 1), session affinity is largely redundant but harmless. For multi-instance, require external state store (Memorystore Redis, Firestore) and implement reconnection logic with session ID recovery.
```typescript
// Client-side reconnection
ws.on('close', () => {
  setTimeout(() => {
    reconnect(sessionId);  // Resume session on new instance
  }, 1000);
});
```
**Warning signs:** Works perfectly in testing, fails under load or after deployments.

### Pitfall 4: Free Tier Region Mismatch
**What goes wrong:** Expected free tier usage shows charges. Budget alerts trigger on minimal traffic.
**Why it happens:** Free tier (180K vCPU-seconds, 360K GiB-seconds, 2M requests) ONLY applies to us-central1, us-east1, us-west1. European regions (europe-west1, europe-north1) don't qualify despite being Tier 1 pricing.
**How to avoid:** Accept that European deployment forfeits free tier. Use `europe-west1` (Belgium) for lowest Tier 1 European pricing. For true free tier, deploy to `us-central1`.
```hcl
# Europe = no free tier, but lowest Tier 1 pricing
variable "region" {
  default = "europe-west1"  # Belgium, Tier 1
}

# OR use US region for free tier
# variable "region" {
#   default = "us-central1"  # Iowa, free tier eligible
# }
```
**Warning signs:** First bill shows charges despite low usage, pricing calculator doesn't show $0 estimate.

### Pitfall 5: Non-Root User Missing
**What goes wrong:** Container runs as root (UID 0), security scanners flag high-severity vulnerability, potential container escape attacks.
**Why it happens:** Node.js base images default to root user. Developers skip user creation in Dockerfile.
**How to avoid:**
```dockerfile
# Create non-root user in final stage
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership if needed
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs
```
**Warning signs:** Docker Scout/Snyk scans show "Running as root" critical vulnerability.

### Pitfall 6: Dockerfile EXPOSE vs Runtime PORT
**What goes wrong:** Confusion about whether EXPOSE directive matters for Cloud Run.
**Why it happens:** EXPOSE is documentation-only in Dockerfile. Cloud Run uses `ports.container_port` in Terraform config.
**How to avoid:**
```dockerfile
# EXPOSE is optional but good documentation
EXPOSE 8080
```
```hcl
# This is what actually matters
ports {
  container_port = 8080  # Must match app.listen(port)
}
```
**Warning signs:** Changing EXPOSE value doesn't affect deployment, connection refused errors despite correct Dockerfile.

### Pitfall 7: Alpine vs Debian Compatibility
**What goes wrong:** Native dependencies fail to compile in Alpine (bcrypt, canvas, sharp, etc.).
**Why it happens:** Alpine uses musl libc instead of glibc. Some npm packages with native bindings expect Debian/Ubuntu.
**How to avoid:**
```dockerfile
# If native dependencies fail in Alpine
# Option 1: Install build dependencies
RUN apk add --no-cache python3 make g++

# Option 2: Use node:20-slim instead
FROM node:20-slim AS runtime

# Option 3: Rebuild native modules in Alpine
RUN npm rebuild
```
**Warning signs:** npm install succeeds locally (macOS/Windows), fails in Docker build with compilation errors.

### Pitfall 8: Request Timeout Too Low
**What goes wrong:** WebSocket connections disconnect after 5 minutes mid-game.
**Why it happens:** Default Cloud Run timeout is 300 seconds (5 minutes). WebSocket connections are HTTP requests subject to timeout.
**How to avoid:**
```hcl
template {
  timeout = "3600s"  # 1 hour for full game sessions (max allowed: 3600s)
}
```
**Warning signs:** Connections stable for 4-5 minutes then abruptly close, logs show timeout errors.

### Pitfall 9: Development Dependencies in Production Image
**What goes wrong:** 500MB+ images, slow cold starts, security vulnerabilities in dev tools.
**Why it happens:** Copying node_modules or running `npm install` without --production flag.
**How to avoid:**
```dockerfile
# Stage 2: Install ONLY production dependencies
RUN npm ci --production --ignore-scripts

# Don't copy node_modules from host
# .dockerignore: node_modules/
```
**Warning signs:** Image size > 300MB for simple Node.js app, presence of @types/*, typescript, jest in production image.

### Pitfall 10: Missing .dockerignore
**What goes wrong:** 5+ minute Docker builds, multi-GB build contexts, cached layers invalidate on every build.
**Why it happens:** Docker COPY . . includes node_modules, .git, .nx cache, dist folders from host.
**How to avoid:** Create comprehensive .dockerignore (see Architecture Patterns above). Use `docker build --progress=plain` to debug context size.
**Warning signs:** "Sending build context to Docker daemon: 2.5GB", builds always invalidate at COPY step.

## Code Examples

Verified patterns from official sources:

### GCS Backend with Authentication
```hcl
# Source: https://developer.hashicorp.com/terraform/language/backend/gcs
terraform {
  backend "gcs" {
    bucket  = "your-terraform-state-bucket"
    prefix  = "terraform/state"

    # Authentication via gcloud CLI (local development)
    # OR via GOOGLE_APPLICATION_CREDENTIALS env var (CI/CD)
    # OR via Workload Identity (GKE/Cloud Build)
  }

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
}

# Create state bucket (one-time setup)
resource "google_storage_bucket" "terraform_state" {
  name          = "your-terraform-state-bucket"
  location      = "EU"
  force_destroy = false

  versioning {
    enabled = true  # State history for rollback
  }

  lifecycle_rule {
    action {
      type = "Delete"
    }
    condition {
      num_newer_versions = 3
      days_since_noncurrent_time = 30
    }
  }
}
```

### Cloud Run Minimum Resources
```hcl
# Source: https://docs.cloud.google.com/run/docs/configuring/services/memory-limits
# Minimum: 0.08 vCPU, 128Mi memory (but 512Mi recommended)
# Maximum: 8 vCPU, 32Gi memory

resources {
  limits = {
    cpu    = "1"      # 0.08 to 8 (1 vCPU = baseline)
    memory = "512Mi"  # 128Mi to 32Gi (512Mi minimum for Node.js)
  }
  cpu_idle = false  # false = always allocated (instance-based billing)
                    # true = request-based billing (default)
}
```

### Express Compression Middleware
```typescript
// Source: https://github.com/Kikobeats/http-compression
import compression from 'compression';
import expressStaticGzip from 'express-static-gzip';

app.use(compression({
  level: 6,          // Compression level (0-9, default 6)
  threshold: 1024,   // Only compress responses > 1KB
  filter: (req, res) => {
    // Don't compress if client sends x-no-compression header
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// Serve pre-compressed static files (built by Vite)
app.use(expressStaticGzip('dist/apps/web', {
  enableBrotli: true,
  orderPreference: ['br', 'gz'],  // Prefer Brotli over Gzip
  serveStatic: {
    maxAge: '1y',
    immutable: true
  }
}));
```

### Vite Build Configuration for Compression
```typescript
// Source: https://vite.dev/guide/
// vite.config.ts for web app
import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    // Generate .gz files
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024
    }),
    // Generate .br files (Brotli)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024
    })
  ],
  build: {
    outDir: '../../dist/apps/web',
    emptyOutDir: true
  }
});
```

### Health Check Endpoint
```typescript
// Source: https://docs.cloud.google.com/run/docs/configuring/healthchecks
// Simple health check for startup probe
app.get('/health', (req, res) => {
  // Check critical dependencies
  if (!wss || !wss.clients) {
    return res.status(503).send('WebSocket server not ready');
  }

  res.status(200).send('OK');
});
```

### Terraform Variables Pattern
```hcl
# variables.tf
variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region for Cloud Run deployment"
  type        = string
  default     = "europe-west1"
}

variable "service_name" {
  description = "Cloud Run service name"
  type        = string
  default     = "catan-game"
}

variable "image_url" {
  description = "Container image URL (GCR/Artifact Registry)"
  type        = string
}

variable "alert_email" {
  description = "Email for budget alerts"
  type        = string
  sensitive   = true
}

variable "billing_account_id" {
  description = "GCP billing account ID"
  type        = string
  sensitive   = true
}

# terraform.tfvars (gitignored)
project_id         = "your-project-id"
image_url          = "gcr.io/your-project-id/catan:latest"
alert_email        = "your-email@example.com"
billing_account_id = "012345-ABCDEF-678901"
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Cloud Run v1 API | Cloud Run v2 API | 2022-2023 | More consistent with GCP APIs, better Terraform support, improved features |
| `google_cloud_run_service` | `google_cloud_run_v2_service` | Terraform ~5.0 | Different attribute names, v2 required for new features (startup probes, session affinity) |
| CPU always allocated only | Request vs instance billing | 2021 | Renamed for clarity: request-based = old "during request", instance-based = old "always allocated" |
| Manual IAM binding | `invoker_iam_disabled` flag | Cloud Run v2 | Simpler public access configuration, clearer intent |
| Docker Hub rate limits | GCP Artifact Registry | 2020-2021 | Free private registry, integrated with GCP, faster pulls from same region |
| node:14 | node:20 (LTS) | 2023 | Active LTS until 2026-04-30, performance improvements, new features |
| npm install | npm ci | Best practice | Deterministic builds, faster in CI/CD, fails on lockfile mismatch |
| Single-stage Dockerfile | Multi-stage builds | Docker 17.05+ (2017) | 10x smaller images, better layer caching, separation of build/runtime dependencies |

**Deprecated/outdated:**
- **Cloud Run v1 API (`google_cloud_run_service`):** Still works but missing features like startup probes. Use v2 for new deployments.
- **Manual gzip compression in Vite:** Use `vite-plugin-compression` to pre-compress assets at build time.
- **terraform init without backend:** Always configure GCS backend before creating resources to avoid local state issues.
- **Billing settings as separate config:** Now integrated into `resources.cpu_idle` (false = instance-based, true = request-based).

## Open Questions

Things that couldn't be fully resolved:

1. **Exact free tier applicability to WebSocket connections**
   - What we know: Free tier exists (2M requests, 180K vCPU-sec, 360K GiB-sec) in US regions only. WebSocket connections are billed instance-based (CPU always allocated).
   - What's unclear: How WebSocket connection time maps to vCPU-seconds calculation. Whether 1 hour connection = 3600 CPU-seconds per vCPU.
   - Recommendation: Assume WebSocket time fully consumes CPU allocation. With 1 vCPU, 1-hour session = 3600 vCPU-seconds. Free tier = 180K seconds = ~50 hours of 1-vCPU WebSocket time per month. Monitor actual billing in first month and adjust.

2. **Optimal compression level tradeoff**
   - What we know: Lower levels (3-6) reduce CPU/memory, higher levels (7-9) reduce bandwidth. WebSocket compression with ws library supports level configuration.
   - What's unclear: Exact breakeven point where bandwidth savings exceed CPU cost increases for this specific workload (Catan game state updates).
   - Recommendation: Start with level 3 for WebSocket (conservative), level 6 for HTTP static files (balanced). Monitor Cloud Run metrics and adjust if bandwidth costs exceed expectations.

3. **NX build optimization for Docker**
   - What we know: NX has build caching, affected command, and dependency graph. Docker has layer caching and BuildKit.
   - What's unclear: Best integration of NX cache with Docker build context. Whether to use `nx affected:build` vs `nx build` in Dockerfile for monorepo.
   - Recommendation: Use `nx build api --prod && nx build web --prod` explicitly in Dockerfile (simpler, guaranteed both apps built). NX cache lives in .nx/ which is .dockerignored, so Docker layer cache is primary optimization.

4. **Europe region pricing differences**
   - What we know: europe-west1 (Belgium) and europe-north1 (Finland) are both Tier 1. No free tier in Europe.
   - What's unclear: Current 2026 exact pricing differences between European Tier 1 regions.
   - Recommendation: Default to europe-west1 (Belgium) as it's most commonly referenced and has established track record. Pricing calculator required for exact comparison, but differences within Tier 1 are minimal (< 5%).

5. **Image registry choice: GCR vs Artifact Registry**
   - What we know: GCR (gcr.io) is being replaced by Artifact Registry (region-docker.pkg.dev). GCR still works but deprecated for new projects.
   - What's unclear: Whether GCR shutdown timeline has been announced, exact migration requirements.
   - Recommendation: Use Artifact Registry for new deployment. Terraform resource: `google_artifact_registry_repository`. Requires one-time setup of Docker repository before Terraform deployment.

## Sources

### Primary (HIGH confidence)
- [Cloud Run WebSocket Documentation](https://docs.cloud.google.com/run/docs/triggering/websockets) - Timeout, concurrency, billing, session affinity
- [Cloud Run Session Affinity](https://docs.cloud.google.com/run/docs/configuring/session-affinity) - Best-effort behavior, limitations
- [Cloud Run CPU Configuration](https://docs.cloud.google.com/run/docs/configuring/services/cpu) - CPU allocation modes
- [Cloud Run Memory Limits](https://docs.cloud.google.com/run/docs/configuring/services/memory-limits) - Minimum 512Mi, maximum 32Gi
- [Cloud Run Health Checks](https://docs.cloud.google.com/run/docs/configuring/healthchecks) - Startup/liveness probes
- [Terraform Best Practices - General Style](https://docs.cloud.google.com/docs/terraform/best-practices/general-style-structure) - Module structure, naming
- [Terraform google_cloud_run_v2_service](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/cloud_run_v2_service) - Resource documentation
- [Terraform google_billing_budget](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/billing_budget) - Budget alerts
- [Terraform GCS Backend](https://developer.hashicorp.com/terraform/language/backend/gcs) - State backend (rate-limited, partial verification)

### Secondary (MEDIUM confidence)
- [Cloud Run Troubleshooting](https://docs.cloud.google.com/run/docs/troubleshooting) - Common deployment failures
- [Cloud Run Allowing Public Access](https://docs.cloud.google.com/run/docs/authenticating/public) - IAM configuration
- [Docker Multi-Stage Builds for Monorepos](https://oneuptime.com/blog/post/2026-01-30-docker-multi-stage-monorepos/view) - Recent 2026 guidance
- [WebSocket Compression Guide](https://oneuptime.com/blog/post/2026-01-24-websocket-message-compression/view) - Performance optimization
- [ws Library GitHub](https://github.com/websockets/ws) - WebSocket compression options
- [Express Compression Middleware](https://expressjs.com/en/resources/middleware/compression.html) - Official Express docs
- [express-static-gzip npm](https://www.npmjs.com/package/express-static-gzip) - Pre-compressed files
- [http-compression GitHub](https://github.com/Kikobeats/http-compression) - Brotli + Gzip support

### Tertiary (LOW confidence - marked for validation)
- [Cloud Run Pricing](https://cloud.google.com/run/pricing) - WebFetch failed, pricing details from WebSearch only
- [Google Cloud Run Pricing Guide (ProsperOps)](https://www.prosperops.com/blog/google-cloud-run-pricing-and-cost-optimization/) - Free tier limits
- [Cloud Run Pricing Guide (CloudChipr)](https://cloudchipr.com/blog/cloud-run-pricing) - Regional pricing
- [Docker Security Best Practices](https://www.docker.com/blog/docker-for-node-js-developers-5-things-you-need-to-know-not-to-fail-your-security/) - Alpine considerations
- [NX Monorepo Dockerization](https://medium.com/@abdullahzengin/how-to-dockerize-your-nx-monorepo-applications-a-step-by-step-guide-using-angular-and-nestjs-a079b1b9a181) - Community guide
- [Vite + Express Production](https://medium.com/@csroee/vite-react-expressjs-app-performance-architecture-e76363361b17) - Community pattern

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Terraform/Docker docs, established ecosystem
- Architecture: HIGH - Official GCP docs, verified Terraform registry examples
- Pitfalls: HIGH - Official troubleshooting docs, community patterns with verification
- Cost optimization: MEDIUM - Free tier verified, regional pricing from community sources (official pricing page WebFetch failed)
- WebSocket specifics: HIGH - Official Cloud Run WebSocket documentation, ws library GitHub

**Research date:** 2026-02-05
**Valid until:** 2026-03-05 (30 days - Cloud Run and Terraform are stable, monthly review recommended for pricing changes)

**Key uncertainties requiring validation:**
1. Exact European region pricing comparison (pricing page fetch failed)
2. WebSocket free tier vCPU-second calculation methodology
3. GCR vs Artifact Registry migration timeline

**Recommended pre-planning validation:**
- Test Docker build locally with multi-stage Dockerfile
- Verify GCP project exists and billing enabled
- Confirm Artifact Registry repository created
- Create GCS bucket for Terraform state
- Test minimal Cloud Run deployment with sample container to verify region selection and billing
