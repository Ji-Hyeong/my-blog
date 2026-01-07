output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.this.id
}

output "public_subnet_ids" {
  description = "Public subnet IDs (2 AZ)"
  value       = [for s in aws_subnet.public : s.id]
}

