resource "google_cloud_run_v2_service" "api" {
  name     = var.service_name
  location = var.region

  template {
    timeout = "3600s"  # 1 hour for full game sessions

    scaling {
      min_instance_count = var.min_instances  # Scale to zero
      max_instance_count = var.max_instances  # Single instance constraint
    }

    max_instance_request_concurrency = var.max_concurrency

    containers {
      image = var.image_url

      resources {
        limits = {
          cpu    = var.cpu_limit
          memory = var.memory_limit
        }
        cpu_idle = false  # Instance-based billing for WebSocket
      }

      ports {
        name           = "http1"
        container_port = 8080
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      startup_probe {
        http_get {
          path = "/api"
        }
        initial_delay_seconds = 10
        timeout_seconds       = 3
        period_seconds        = 10
        failure_threshold     = 3
      }

      liveness_probe {
        http_get {
          path = "/api"
        }
        initial_delay_seconds = 30
        timeout_seconds       = 3
        period_seconds        = 30
        failure_threshold     = 3
      }
    }

    session_affinity = true  # Best-effort WebSocket connection stickiness
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  # Enable public access (no authentication required)
  ingress = "INGRESS_TRAFFIC_ALL"
}
