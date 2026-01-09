# AGENTS (apps)

## 프로젝트 변경 이력
- 2026-01-07: 기존 정적 UI를 `apps/web`로 이식하고, 데이터(profile/targets/posts)를 `apps/api`의 `/api/*` 엔드포인트로 전환.
- 2026-01-07: AWS 배포 학습용 Terraform 스캐폴딩 추가(`infra/terraform`: bootstrap + ECS Fargate + ALB 모듈/환경 템플릿).
- 2026-01-07: GitHub Actions 워크플로우 추가(Terraform PR plan + 코멘트 apply, API Docker→ECR→ECS 배포) 및 prod 환경으로 정리.
- 2026-01-07: GitHub Pages 배포 워크플로우 추가 및 `blog.jihyeong.com` 커스텀 도메인 설정(web/CNAME).
- 2026-01-09: 이전 이력서(PDF) 기준으로 학력/교육 이력 보강 및 프로젝트 상세/링크 갱신(profile.json, resume.js, builder.js, builder.html).
- 2026-01-09: `apps/api` 데이터(JSON) 변경 시 GitHub Pages가 자동으로 재배포되도록 Pages 워크플로우에 export 단계 추가(pages.yml).

## 메모
- `reference/`, `me/`는 프론트 배포 범위에 포함하지 않음(민감/비공개 자료).
- 배포 시 Web/API를 분리한다면 `apps/web/*.html`의 `<meta name="api-base-url">` 값으로 API 주소를 설정한다.
