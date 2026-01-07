output "ecr_repository_url" {
  description = "ECR repository URL (API 이미지 push 대상)"
  value       = module.ecr.repository_url
}

output "alb_dns_name" {
  description = "ALB DNS name (Cloudflare에서 CNAME 대상으로 사용)"
  value       = module.alb.alb_dns_name
}

