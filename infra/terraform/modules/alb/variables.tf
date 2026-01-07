variable "project_name" {
  description = "리소스 네이밍 prefix"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "public_subnet_ids" {
  description = "Public subnet IDs (ALB 배치)"
  type        = list(string)
}

variable "target_port" {
  description = "Target group 포트 (컨테이너 포트)"
  type        = number
}

variable "health_check_path" {
  description = "ALB 헬스 체크 경로"
  type        = string
  default     = "/api/health"
}

variable "enable_https" {
  description = "HTTPS 리스너 활성화 여부"
  type        = bool
  default     = false
}

variable "certificate_arn" {
  description = "ACM 인증서 ARN (enable_https=true일 때 필요)"
  type        = string
  default     = ""
}

