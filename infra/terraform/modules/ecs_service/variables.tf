variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-2"
}

variable "project_name" {
  description = "리소스 네이밍 prefix"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "public_subnet_ids" {
  description = "Public subnet IDs (태스크 배치)"
  type        = list(string)
}

variable "alb_security_group_id" {
  description = "ALB security group id (태스크 인바운드 제한용)"
  type        = string
}

variable "target_group_arn" {
  description = "ALB target group ARN"
  type        = string
}

variable "container_image" {
  description = "컨테이너 이미지 (ECR URL 포함)"
  type        = string
}

variable "container_port" {
  description = "컨테이너 포트"
  type        = number
  default     = 8080
}

variable "desired_count" {
  description = "ECS desired count"
  type        = number
  default     = 1
}

variable "cpu" {
  description = "Fargate CPU 단위(예: 256, 512, 1024...)"
  type        = string
  default     = "256"
}

variable "memory" {
  description = "Fargate 메모리(MiB, 예: 512, 1024, 2048...)"
  type        = string
  default     = "512"
}

variable "environment" {
  description = "컨테이너 환경변수 목록"
  type = list(object({
    name  = string
    value = string
  }))
  default = []
}

