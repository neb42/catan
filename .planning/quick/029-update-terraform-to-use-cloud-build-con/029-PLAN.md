# Quick Task 029: Update Terraform to Use Cloud Build

## Goal

Replace manual Docker build/push workflow with automated Cloud Build pipeline connected to the GitHub repository, triggered on push to main.

## Tasks

### Task 1: Add Cloud Build pipeline and Terraform resources

**Files to create:**

- `cloudbuild.yaml` - Build pipeline: Docker build, push to Artifact Registry, deploy to Cloud Run
- `terraform/apis.tf` - Enable required GCP APIs (cloudbuild, artifactregistry, run, secretmanager)
- `terraform/artifact-registry.tf` - Docker repository with cleanup policy (keep 5 recent images)
- `terraform/cloudbuild.tf` - GitHub connection (v2), repository link, build trigger, IAM roles

**Files to modify:**

- `terraform/variables.tf` - Replace `image_url` var with `github_owner`, `github_repo`, `github_app_installation_id`
- `terraform/main.tf` - Use computed `local.image_url` from Artifact Registry instead of `var.image_url`
- `terraform/outputs.tf` - Add `artifact_registry_url`, `image_url`, `build_trigger_name` outputs
- `terraform/terraform.tfvars` - Replace `image_url` with GitHub connection vars
- `terraform/terraform.tfvars.example` - Same changes with placeholder values

### Post-apply Setup

After `terraform apply`, complete the GitHub App OAuth handshake:

1. Go to GCP Console > Cloud Build > Repositories (2nd gen)
2. Find the connection and authorize the GitHub App
3. Set the `github_app_installation_id` in terraform.tfvars
4. Run `terraform apply` again
