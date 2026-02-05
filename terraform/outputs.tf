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
