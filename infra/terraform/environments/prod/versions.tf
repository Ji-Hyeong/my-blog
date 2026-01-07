/**
 * 환경 공통 버전 고정 파일입니다.
 *
 * - Terraform과 provider 버전을 고정하면 “환경마다 다른 동작”을 줄일 수 있습니다.
 * - 팀/개인 프로젝트 모두 재현성에 중요합니다.
 */

terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
