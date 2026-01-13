# AGENTS (apps)

## 프로젝트 변경 이력
- 2026-01-09: 로딩 오버레이 텍스트를 제거하고 스피너만 표시하도록 단순화(App.tsx, site.css).
- 2026-01-09: 데이터 로딩 표시를 상단 배너에서 중앙 스피너 오버레이로 변경(App.tsx, site.css).
- 2026-01-09: Supabase 로딩 지연 시 로딩 배너를 표시하고 3초 타임아웃 후 폴백 데이터를 사용하도록 개선(App.tsx, data-loader.js, site.css).
- 2026-01-09: `apps/web` 구조를 제거하고 Vite SPA를 레포 루트(apps)로 이동, 정적 자산을 `public/` 기준으로 정리.
- 2026-01-09: 정적 HTML을 React SPA(Hash 라우팅)로 전환하고 빌드 기반 GitHub Pages 배포로 재구성(App.tsx, main.tsx, public/*, vite.config.ts, pages.yml).
- 2026-01-09: 홈 CTA/링크를 제거하고 헤더에 GitHub 아이콘 링크를 추가(header.js, style.css, index.html).
- 2026-01-09: 회사 아이콘 렌더링을 이력서에 반영하고 파비콘을 추가(resume.js, style.css, favicon.svg, html head).
- 2026-01-09: 맞춤/기록 페이지 문구와 타이틀을 대외 톤에 맞게 정리(builder.html, blog.html).
- 2026-01-09: 이력서 기술 스택 UI를 태그형으로 개선하고 경력/프로젝트를 최신순 정렬(resume.js, style.css).
- 2026-01-09: 소개/이력서 톤을 대외 관점으로 정리하고 라이트 팔레트로 전환(app.js, style.css, index.html, resume.html, resume.js).
- 2026-01-09: 홈/이력서 UI 개선 및 로그인 상태에 따른 탭/CTA 숨김 적용(header.js, home.js, resume.js, style.css, index.html, resume.html).
- 2026-01-09: 헤더/탭 내비게이션을 공통 스크립트로 분리해 언어/구조를 단일화(header.js).
- 2026-01-09: API/Infra 중단에 맞춰 불필요한 GitHub Actions 워크플로우 제거(api-deploy.yml, terraform-apply.yml, terraform-plan.yml).
- 2026-01-09: Supabase 설정을 `assets/supabase-config.js`로 단일화하고 각 HTML에서 로드하도록 정리(index.html, blog.html, resume.html, post.html, builder.html, auth/callback.html, supabase.js).
- 2026-01-09: Supabase 설정 meta를 주요 HTML에 추가해 모든 페이지에서 인증/데이터 로딩을 보장(index.html, blog.html, resume.html, post.html, builder.html, auth/callback.html).
- 2026-01-09: Supabase 설정을 meta 주입으로 전환하고 운영/시드 문서를 보강(supabase.js, docs/supabase.md).
- 2026-01-09: 백엔드 배포 부담으로 `apps/infra`, `apps/api` 제거하고 Supabase 전환에 맞춰 앱 구조를 단순화.
- 2026-01-07: 기존 정적 UI를 `apps/web`로 이식하고, 데이터(profile/targets/posts)를 `apps/api`의 `/api/*` 엔드포인트로 전환.
- 2026-01-07: AWS 배포 학습용 Terraform 스캐폴딩 추가(`infra/terraform`: bootstrap + ECS Fargate + ALB 모듈/환경 템플릿).
- 2026-01-07: GitHub Actions 워크플로우 추가(Terraform PR plan + 코멘트 apply, API Docker→ECR→ECS 배포) 및 prod 환경으로 정리.
- 2026-01-07: GitHub Pages 배포 워크플로우 추가 및 `blog.jihyeong.com` 커스텀 도메인 설정(web/CNAME).
- 2026-01-09: 이전 이력서(PDF) 기준으로 학력/교육 이력 보강 및 프로젝트 상세/링크 갱신(profile.json, resume.js, builder.js, builder.html).
- 2026-01-09: `apps/api` 데이터(JSON) 변경 시 GitHub Pages가 자동으로 재배포되도록 Pages 워크플로우에 export 단계 추가(pages.yml).
- 2026-01-09: GitHub Actions 워크플로우 이름을 역할 중심으로 명확화(pages.yml, api-deploy.yml, terraform-plan.yml, terraform-apply.yml).
- 2026-01-09: Pages에서 API 미연동 시 정적 JSON(`/data/*.json`)로 폴백 및 로컬에서 JSON 변경 즉시 반영되도록 API의 JSON 로딩 방식을 개선(pages.yml, app.js, resume.js, blog.js, builder.js, ContentController.kt).
- 2026-01-09: 홈 페이지를 “프로필 허브”로 재구성하고 profile 데이터 기반으로 동적 렌더링(home.js, index.html, style.css).
- 2026-01-09: 로컬에서 GitHub Pages와 동일한 경로로 확인할 수 있도록 Web 8000 포트 실행 스크립트 추가(package.json, README.md).
- 2026-01-09: 홈을 단순 소개 페이지로 정리하고, 탭 라벨/설명 문구를 역할 중심으로 통일(index.html, home.js, resume.html, builder.html, blog.html, style.css).
- 2026-01-09: Supabase Google 로그인 + 이메일 allowlist 기반으로 맞춤/글쓰기 기능을 제한하고, posts CRUD를 정적 사이트에서 제공(supabase.js, auth.js, blog.js, post.js, supabase.md).
- 2026-01-09: 이력/타겟 데이터도 Supabase로 확장할 수 있도록 스키마(B-라이트) 문서화 및 웹 데이터 로더(Supabase→API→정적) 추가(data-loader.js, supabase.md).
- 2026-01-09: Supabase OAuth 콜백이 code/hash 없는 경우에도 원인 안내 및 재시도 UX 제공(callback.html).
- 2026-01-09: Supabase OAuth 콜백 화면이 노출되지 않도록 성공/실패 모두 원래 페이지로 즉시 리다이렉트(callback.html).
- 2026-01-09: 블로그 글 목록 로딩 실패 시 메시지를 Supabase/정적 폴백 상황에 맞게 개선하고 폴백 우선순위를 정적→API로 변경(blog.js).

## 메모
- `reference/`, `me/`는 프론트 배포 범위에 포함하지 않음(민감/비공개 자료).
- API 주소 제어는 `public/data-loader.js`의 `getApiBaseUrl()` 규칙을 따른다.
