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

variable "github_owner" {
  description = "GitHub repository owner (user or org)"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
}

variable "github_app_installation_id" {
  description = "Cloud Build GitHub App installation ID (find in GCP Console > Cloud Build > Repositories)"
  type        = number
}

variable "github_token" {
  description = "GitHub Personal Access Token for Cloud Build GitHub App OAuth (must be tied to the Cloud Build GitHub App)"
  type        = string
  sensitive   = true
}

variable "min_instances" {
  description = "Minimum number of instances (0 = scale to zero)"
  type        = number
  default     = 0
}

variable "max_instances" {
  description = "Maximum number of instances"
  type        = number
  default     = 1
}

variable "cpu_limit" {
  description = "CPU limit per instance"
  type        = string
  default     = "1"
}

variable "memory_limit" {
  description = "Memory limit per instance"
  type        = string
  default     = "512Mi"
}

variable "max_concurrency" {
  description = "Maximum concurrent requests per instance"
  type        = number
  default     = 20
}

variable "billing_account_id" {
  description = "GCP billing account ID for budget alerts"
  type        = string
  sensitive   = true
}

variable "alert_email" {
  description = "Email address for budget alert notifications"
  type        = string
  sensitive   = true
}

variable "monthly_budget_euros" {
  description = "Monthly budget in EUR for cost alerts"
  type        = number
  default     = 5
}
