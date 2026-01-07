output "state_bucket_name" {
  description = "Terraform remote state bucket"
  value       = aws_s3_bucket.tf_state.bucket
}

output "lock_table_name" {
  description = "Terraform lock table"
  value       = aws_dynamodb_table.tf_lock.name
}

