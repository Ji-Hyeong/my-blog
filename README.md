# JH Blog Web

React + Vite 기반 SPA입니다. GitHub Pages 배포를 위해 Hash 라우팅을 사용합니다.

## 로컬 실행

```bash
npm install
npm run dev
```

## 환경변수

Vite 환경변수는 `.env` / `.env.production`에서 관리합니다.

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_WRITER_EMAIL=...
VITE_SITE_URL=https://blog.jihyeong.com
VITE_API_BASE_URL=http://localhost:8080
```

## 빌드

```bash
npm run build
```

## 구성 메모

- 정적 자산: `public/`
  - `public/logo/`, `public/data/`, `public/legacy/` 포함
- Supabase 설정: `src/supabase-runtime.ts` (Vite env)
- OAuth 콜백: `#/auth/callback` (SPA 라우트)
- 라우팅: Hash 기반 (`#/resume`, `#/blog` 등)

## 데이터 폴백

Supabase가 실패하면 `public/data/*.json`을 사용합니다.
