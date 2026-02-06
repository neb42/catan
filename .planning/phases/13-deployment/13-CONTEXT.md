# Phase 13: Deployment - Context

**Gathered:** 2026-02-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Create production-ready Docker deployment with Terraform infrastructure on Google Cloud Platform. Single container serving both API and frontend static files, optimized for minimal cost within GCP free tier.

</domain>

<decisions>
## Implementation Decisions

### Container Architecture

- **Single container approach** — API serves both WebSocket connections AND static frontend files
- **Express static middleware** — Use `express.static()` to serve built frontend from `/dist` or `/public`
- **Balanced multi-stage build** — Standard Node alpine base with reasonable layer separation
- **Production dependencies only** — `npm ci --production` after build, exclude dev dependencies for minimal image size

### GCP Service Selection

- **Cloud Run** — Serverless container platform for cost optimization and auto-scaling
- **In-memory state** — Keep existing in-memory game state (accept session loss on restart for simplicity)
- **Cloud Run default domain** — Use `*.run.app` URL (no custom domain setup)
- **Single region deployment** — Deploy to cheapest European region (likely `europe-west1` Belgium or `europe-north1` Finland)

### Scaling & Availability

- **Scale to zero** — Shut down completely when idle for maximum cost savings (accept 1-2s cold start)
- **Maximum 1 instance** — Single instance limit for strict cost control
- **Low concurrency (10-50)** — Conservative concurrent requests per instance for WebSocket stability
- **Maximum timeout (3600s)** — 1 hour request timeout to support full game sessions without disconnection

### Cost Optimization Priorities

- **Maximize free tier** — Stay within Cloud Run free tier limits (2M requests/month, 360K GB-seconds)
- **Aggressive compression** — Enable Gzip/Brotli for all responses, WebSocket compression enabled to minimize bandwidth costs
- **Budget alerts** — Configure Terraform billing alerts at cost thresholds (e.g., $5, $10, $20)

### Environment & Secrets

- **Terraform-managed environment variables** — All env vars defined in Terraform configuration files
- **Terraform variables file** — Secrets in `.tfvars` file (gitignored), passed at apply time
- **Standard configuration** — `PORT` + `NODE_ENV` for Node.js, Cloud Run provides PORT automatically
- **Modular Terraform structure** — Separate files for compute, networking, variables, outputs

### Claude's Discretion

- Resource allocation (CPU/memory) — Start with small instance size, document scaling
- Exact compression configuration details
- Terraform module organization within modular structure
- Build optimization details (layer caching strategy)
- Cheapest Europe region selection between available options

</decisions>

<specifics>
## Specific Ideas

- Focus on staying within GCP free tier — this is a learning/demo project
- Single instance maximum is a hard constraint for cost control
- Accept cold starts and session loss for cost savings
- WebSocket stability is important — conservative concurrency settings

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

_Phase: 13-deployment_
_Context gathered: 2026-02-05_
