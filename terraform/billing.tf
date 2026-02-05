# Email notification channel for budget alerts
resource "google_monitoring_notification_channel" "email" {
  display_name = "Catan Budget Alert Email"
  type         = "email"

  labels = {
    email_address = var.alert_email
  }

  enabled = true
}

# Budget alert for Cloud Run costs
resource "google_billing_budget" "cloud_run_budget" {
  billing_account = var.billing_account_id
  display_name    = "Cloud Run Monthly Budget"

  budget_filter {
    # Target Cloud Run service specifically
    projects = ["projects/${var.project_id}"]
    services = ["services/152E-C115-5142"]  # Cloud Run service code

    # Optional: Uncomment to filter by specific labels
    # labels = {
    #   "service" = var.service_name
    # }
  }

  amount {
    specified_amount {
      currency_code = "EUR"
      units         = tostring(var.monthly_budget_euros)
    }
  }

  # Alert at 50% of budget
  threshold_rules {
    threshold_percent = 0.5
    spend_basis       = "CURRENT_SPEND"
  }

  # Alert at 80% of budget
  threshold_rules {
    threshold_percent = 0.8
    spend_basis       = "CURRENT_SPEND"
  }

  # Alert at 100% of budget
  threshold_rules {
    threshold_percent = 1.0
    spend_basis       = "CURRENT_SPEND"
  }

  # Alert at 120% of budget (overspend warning)
  threshold_rules {
    threshold_percent = 1.2
    spend_basis       = "CURRENT_SPEND"
  }

  all_updates_rule {
    monitoring_notification_channels = [
      google_monitoring_notification_channel.email.id
    ]

    disable_default_iam_recipients = false
  }
}
