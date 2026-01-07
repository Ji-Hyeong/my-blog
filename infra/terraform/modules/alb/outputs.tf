output "alb_dns_name" {
  description = "ALB DNS name"
  value       = aws_lb.this.dns_name
}

output "alb_security_group_id" {
  description = "ALB security group id"
  value       = aws_security_group.alb.id
}

output "target_group_arn" {
  description = "Target group ARN (ECS service attachment)"
  value       = aws_lb_target_group.api.arn
}

