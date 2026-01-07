/**
 * bootstrap 스택
 *
 * 목적:
 * - Terraform remote state를 위한 S3 bucket과 DynamoDB lock table을 생성합니다.
 *
 * 운영 팁:
 * - 이 스택은 “1회성” 성격이 강합니다.
 * - 생성 후 `environments/prod/backend.tf`에서 remote backend를 활성화하는 흐름을 권장합니다.
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

provider "aws" {
  region = var.aws_region
}

resource "aws_s3_bucket" "tf_state" {
  bucket = var.state_bucket_name

  /**
   * 실무에서는 아래 옵션들을 함께 고려합니다.
   * - 버저닝(versioning)
   * - 서버사이드 암호화(SSE)
   * - 접근 정책(최소 권한)
   */
}

resource "aws_s3_bucket_public_access_block" "tf_state" {
  bucket = aws_s3_bucket.tf_state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "tf_state" {
  bucket = aws_s3_bucket.tf_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "tf_state" {
  bucket = aws_s3_bucket.tf_state.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_dynamodb_table" "tf_lock" {
  name         = var.lock_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}
