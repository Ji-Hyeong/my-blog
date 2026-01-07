# AGENTS (apps)

## 프로젝트 변경 이력
- 2026-01-07: 기존 정적 UI를 `apps/web`로 이식하고, 데이터(profile/targets/posts)를 `apps/api`의 `/api/*` 엔드포인트로 전환.
- 2026-01-07: AWS 배포 학습용 Terraform 스캐폴딩 추가(`infra/terraform`: bootstrap + ECS Fargate + ALB 모듈/환경 템플릿).
- 2026-01-07: GitHub Actions 워크플로우 추가(Terraform PR plan + 코멘트 apply, API Docker→ECR→ECS 배포) 및 prod 환경으로 정리.

## 메모
- `reference/`, `me/`는 프론트 배포 범위에 포함하지 않음(민감/비공개 자료).
- 배포 시 Web/API를 분리한다면 `apps/web/*.html`의 `<meta name="api-base-url">` 값으로 API 주소를 설정한다.
