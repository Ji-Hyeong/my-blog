/**
 * ecr 모듈
 *
 * 목적:
 * - API 컨테이너 이미지를 저장할 ECR repository를 생성합니다.
 *
 * 운영 팁:
 * - 개인 프로젝트에서는 이미지 태그를 무한히 쌓기보다 lifecycle policy로 정리하는 것을 권장합니다.
 */

resource "aws_ecr_repository" "api" {
  name                 = "${var.project_name}-api"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "api" {
  repository = aws_ecr_repository.api.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "최근 30개 이미지만 유지"
        selection = {
          tagStatus     = "any"
          countType     = "imageCountMoreThan"
          countNumber   = 30
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

