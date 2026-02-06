# Artifact Registry repository for container images

resource "google_artifact_registry_repository" "catan" {
  location      = var.region
  repository_id = "catan"
  description   = "Docker images for Catan game"
  format        = "DOCKER"

  cleanup_policy_dry_run = false

  # Keep only the 5 most recent images to save storage costs
  cleanup_policies {
    id     = "keep-recent"
    action = "KEEP"

    most_recent_versions {
      keep_count = 5
    }
  }

  depends_on = [google_project_service.artifactregistry]
}
