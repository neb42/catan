# Cloud Build v2 connection to GitHub and build trigger

# Compute the image URL from Artifact Registry
locals {
  image_url = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.catan.repository_id}/catan"
}

# Cloud Build v2 GitHub connection
# NOTE: After terraform apply, you must complete the OAuth handshake in the GCP Console:
#   1. Go to Cloud Build > Repositories (2nd gen)
#   2. Find the connection and click "Install" to authorize the GitHub App
resource "google_cloudbuildv2_connection" "github" {
  location = var.region
  name     = "github-${var.github_owner}"

  github_config {
    app_installation_id = var.github_app_installation_id
  }

  depends_on = [google_project_service.cloudbuild]
}

# Link the specific repository
resource "google_cloudbuildv2_repository" "catan" {
  location          = var.region
  name              = var.github_repo
  parent_connection = google_cloudbuildv2_connection.github.name
  remote_uri        = "https://github.com/${var.github_owner}/${var.github_repo}.git"
}

# Build trigger: push to main branch
resource "google_cloudbuild_trigger" "deploy" {
  name     = "deploy-${var.service_name}"
  location = var.region

  repository_event_config {
    repository = google_cloudbuildv2_repository.catan.id

    push {
      branch = "^main$"
    }
  }

  filename = "cloudbuild.yaml"

  substitutions = {
    _IMAGE_URL    = local.image_url
    _SERVICE_NAME = var.service_name
    _REGION       = var.region
  }

  depends_on = [google_project_service.cloudbuild]
}

# Grant Cloud Build service account permission to deploy to Cloud Run
resource "google_project_iam_member" "cloudbuild_run_admin" {
  project = var.project_id
  role    = "roles/run.admin"
  member  = "serviceAccount:${data.google_project.project.number}@cloudbuild.gserviceaccount.com"
}

# Grant Cloud Build service account permission to act as the compute service account
resource "google_project_iam_member" "cloudbuild_service_account_user" {
  project = var.project_id
  role    = "roles/iam.serviceAccountUser"
  member  = "serviceAccount:${data.google_project.project.number}@cloudbuild.gserviceaccount.com"
}

# Grant Cloud Build service account permission to push to Artifact Registry
resource "google_project_iam_member" "cloudbuild_ar_writer" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${data.google_project.project.number}@cloudbuild.gserviceaccount.com"
}

# Data source to get project number for service account references
data "google_project" "project" {
  project_id = var.project_id
}
