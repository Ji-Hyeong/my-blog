# AGENTS (apps)

## 프로젝트 변경 이력
- 2026-01-07: 기존 정적 UI를 `apps/web`로 이식하고, 데이터(profile/targets/posts)를 `apps/api`의 `/api/*` 엔드포인트로 전환.

## 메모
- `reference/`, `me/`는 프론트 배포 범위에 포함하지 않음(민감/비공개 자료).
- 배포 시 Web/API를 분리한다면 `apps/web/*.html`의 `<meta name="api-base-url">` 값으로 API 주소를 설정한다.

