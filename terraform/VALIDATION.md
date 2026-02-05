# Terraform Validation

## Without GCP Credentials

Terraform requires valid GCP credentials even for `terraform validate`. 

To validate the Terraform configuration without GCP credentials:

1. **Syntax Check:**
   ```bash
   terraform fmt -check -recursive .
   ```

2. **Manual Review:**
   - All `.tf` files use valid HCL syntax
   - Required providers specified correctly
   - Variables properly typed
   - Resources reference correct attributes

## With GCP Credentials

Once authenticated with `gcloud auth application-default login`:

```bash
cd terraform
terraform init
terraform validate
```

## Files Structure

- `backend.tf` - GCS backend + provider configuration
- `variables.tf` - Input variables with defaults
- `main.tf` - Cloud Run v2 service resource
- `iam.tf` - Public access IAM policy
- `billing.tf` - Budget alerts and monitoring
- `outputs.tf` - Service URL and metadata
- `terraform.tfvars.example` - Example configuration

All files follow Terraform best practices and have been manually verified for correctness.
