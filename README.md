# JH Blog Web

React + Vite 기반 SPA입니다. GitHub Pages 배포를 위해 Hash 라우팅을 사용합니다.

## 로컬 실행

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```

## 구성 메모

- 정적 자산: `public/`
  - `public/logo/`, `public/data/`, `public/legacy/` 포함
- Supabase 설정: `public/supabase-config.js`
- OAuth 콜백: `public/auth/callback.html`
- 라우팅: Hash 기반 (`#/resume`, `#/blog` 등)

## 데이터 폴백

Supabase가 실패하면 `public/data/*.json`을 사용합니다.
