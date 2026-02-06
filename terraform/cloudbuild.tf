# Cloud Build v2 connection to GitHub and build trigger

# Compute the image URL from Artifact Registry
locals {
  image_url = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.catan.repository_id}/catan"
}

# Secret Manager secret for the GitHub PAT used by Cloud Build
resource "google_secret_manager_secret" "github_token" {
  secret_id = "github-token"

  replication {
    auto {}
  }

  depends_on = [google_project_service.secretmanager]
}

resource "google_secret_manager_secret_version" "github_token" {
  secret      = google_secret_manager_secret.github_token.id
  secret_data = var.github_token
}

# Grant Cloud Build P4SA access to read the GitHub token secret
resource "google_secret_manager_secret_iam_member" "cloudbuild_secret_access" {
  secret_id = google_secret_manager_secret.github_token.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:service-${data.google_project.project.number}@gcp-sa-cloudbuild.iam.gserviceaccount.com"
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

    authorizer_credential {
      oauth_token_secret_version = google_secret_manager_secret_version.github_token.id
    }
  }

  depends_on = [
    google_project_service.cloudbuild,
    google_secret_manager_secret_iam_member.cloudbuild_secret_access,
  ]
}

# Link the specific repository
resource "google_cloudbuildv2_repository" "catan" {
  location          = var.region
  name              = var.github_repo
  parent_connection = google_cloudbuildv2_connection.github.id
  remote_uri        = "https://github.com/${var.github_owner}/${var.github_repo}.git"
}

# Build trigger: push to main branch
resource "google_cloudbuild_trigger" "deploy" {
  name            = "deploy-${var.service_name}"
  location        = var.region
  service_account = "projects/${var.project_id}/serviceAccounts/${data.google_project.project.number}-compute@developer.gserviceaccount.com"

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

# Grant default compute service account permission to deploy to Cloud Run
resource "google_project_iam_member" "cloudbuild_run_admin" {
  project = var.project_id
  role    = "roles/run.admin"
  member  = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"
}

# Grant default compute service account permission to act as itself
resource "google_project_iam_member" "cloudbuild_service_account_user" {
  project = var.project_id
  role    = "roles/iam.serviceAccountUser"
  member  = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"
}

# Grant default compute service account permission to push to Artifact Registry
resource "google_project_iam_member" "cloudbuild_ar_writer" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"
}

# Data source to get project number for service account references
data "google_project" "project" {
  project_id = var.project_id
}
