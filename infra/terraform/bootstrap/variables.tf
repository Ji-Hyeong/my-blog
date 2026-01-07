/**
 * bootstrap 입력 변수
 *
 * - state bucket/table 이름은 계정 전체에서 유니크해야 합니다.
 * - 개인 프로젝트라면 이름 충돌을 피하기 위해 prefix에 본인 식별자를 넣는 것을 권장합니다.
 */

variable "aws_region" {
  description = "AWS region (예: ap-northeast-2)"
  type        = string
  default     = "ap-northeast-2"
}

variable "state_bucket_name" {
  description = "Terraform state를 저장할 S3 bucket 이름"
  type        = string
  # bucket/key/table은 비밀값이 아니며, 개인 프로젝트에서는 기본값으로 고정해도 충분합니다.
  default     = "jihyeong-my-blog-tfstate-906518091264"
}

variable "lock_table_name" {
  description = "Terraform state lock을 위한 DynamoDB table 이름"
  type        = string
  default     = "terraform-lock"
}
