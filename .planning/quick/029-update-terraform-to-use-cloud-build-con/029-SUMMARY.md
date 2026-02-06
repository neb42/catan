# Quick Task 029 Summary: Update Terraform to Use Cloud Build

## What Changed

Replaced manual Docker build/push/deploy workflow with an automated Cloud Build CI/CD pipeline connected to the GitHub repository (`neb42/catan`).

## Files Created

| File                             | Purpose                                                                             |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| `cloudbuild.yaml`                | Build pipeline: Docker build → push to Artifact Registry → deploy to Cloud Run      |
| `terraform/apis.tf`              | Enables Cloud Build, Artifact Registry, Cloud Run, Secret Manager APIs              |
| `terraform/artifact-registry.tf` | Docker repository with cleanup policy (keeps 5 most recent images)                  |
| `terraform/cloudbuild.tf`        | GitHub v2 connection, repo link, push-to-main trigger, IAM roles for Cloud Build SA |

## Files Modified

| File                                 | Change                                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------ |
| `terraform/variables.tf`             | Removed `image_url` var; added `github_owner`, `github_repo`, `github_app_installation_id` |
| `terraform/main.tf`                  | Changed `var.image_url` → `local.image_url` (computed from Artifact Registry)              |
| `terraform/outputs.tf`               | Added `artifact_registry_url`, `image_url`, `build_trigger_name` outputs                   |
| `terraform/terraform.tfvars`         | Replaced `image_url` with GitHub connection variables                                      |
| `terraform/terraform.tfvars.example` | Same changes with placeholder values                                                       |

## Architecture

```
Push to main → Cloud Build Trigger → Docker Build → Artifact Registry → Cloud Run Deploy
```

### IAM Roles Granted to Cloud Build SA

- `roles/run.admin` - Deploy to Cloud Run
- `roles/iam.serviceAccountUser` - Act as compute service account
- `roles/artifactregistry.writer` - Push images to Artifact Registry

## Validation

- `terraform validate` passes successfully

## Post-Apply Steps

1. Run `terraform apply` to create the Cloud Build GitHub connection
2. Complete OAuth handshake in GCP Console > Cloud Build > Repositories (2nd gen)
3. Set `github_app_installation_id` in `terraform.tfvars`
4. Run `terraform apply` again to finalize the connection
