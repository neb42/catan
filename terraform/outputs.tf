output "service_url" {
  value       = google_cloud_run_v2_service.api.uri
  description = "Cloud Run service URL"
}

output "service_name" {
  value       = google_cloud_run_v2_service.api.name
  description = "Cloud Run service name"
}

output "service_location" {
  value       = google_cloud_run_v2_service.api.location
  description = "Cloud Run service location (region)"
}

output "artifact_registry_url" {
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.catan.repository_id}"
  description = "Artifact Registry repository URL"
}

output "image_url" {
  value       = local.image_url
  description = "Full container image URL (without tag)"
}

output "build_trigger_name" {
  value       = google_cloudbuild_trigger.deploy.name
  description = "Cloud Build trigger name"
}
