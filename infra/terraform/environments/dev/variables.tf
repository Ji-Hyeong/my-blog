/**
 * dev 환경 변수
 *
 * - 도메인/HTTPS는 선택 사항입니다.
 * - 우선 HTTP로 배포 확인 후, ACM 인증서 ARN을 연결해 HTTPS를 켜는 순서를 권장합니다.
 */

variable "aws_region" {
  description = "AWS region (예: ap-northeast-2)"
  type        = string
  default     = "ap-northeast-2"
}

variable "project_name" {
  description = "리소스 네이밍 prefix"
  type        = string
  default     = "jh-blog"
}

variable "api_container_port" {
  description = "Spring Boot 컨테이너 포트"
  type        = number
  default     = 8080
}

variable "api_desired_count" {
  description = "ECS 서비스 desired count (항상 1개 유지 등)"
  type        = number
  default     = 1
}

variable "enable_https" {
  description = "ALB HTTPS(443) 리스너 활성화 여부"
  type        = bool
  default     = false
}

variable "certificate_arn" {
  description = "ACM 인증서 ARN (enable_https=true일 때 필요)"
  type        = string
  default     = ""
}

variable "api_image" {
  description = "ECS에서 실행할 컨테이너 이미지(ECR URL 포함). 예: <account>.dkr.ecr.ap-northeast-2.amazonaws.com/jh-blog-api:latest"
  type        = string
}

