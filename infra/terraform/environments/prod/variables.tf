/**
 * prod 환경 변수
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

/**
 * 컨테이너 환경변수(비밀값 포함 가능)
 *
 * 원칙:
 * - GitHub Secrets는 “배포 파이프라인에 필요한 최소 값(AWS Role ARN 등)”만 보관합니다.
 * - 애플리케이션에서 사용하는 비밀값은 AWS SSM Parameter Store(SecureString)를 권장합니다.
 *
 * 현재 스캐폴딩에서는 “환경변수 목록을 주입”하는 형태로 열어두되,
 * 실제 운영에서는 컨테이너가 Parameter Store에서 직접 읽도록(또는 ECS secrets로 주입) 확장하는 것이 안전합니다.
 */
variable "api_environment" {
  description = "ECS task container environment variables"
  type = list(object({
    name  = string
    value = string
  }))
  default = []
}
