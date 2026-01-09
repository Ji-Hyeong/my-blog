# blog (apps)

이 디렉토리(`apps/`)만 Git 레포로 관리합니다. (`/Users/ji/jh-blog` 루트는 레포 범위 밖)

## 구성

- `web/`: 프론트엔드 (Vite dev server 기반, 기존 정적 UI 유지)
- `docs/`: Supabase 설정/스키마 문서 및 시드

## 로컬 실행

### Web

```bash
cd web
npm install
npm run dev
```

- `http://localhost:8000`으로 “정적 배포(GitHub Pages)와 동일한 방식”으로 확인하고 싶다면:
  - `apps/web` 디렉토리에서 `python3 -m http.server 8000`으로 서빙합니다.
  - 또는 `npm run serve:8000`을 사용합니다.
- Vite 개발 서버도 8000 포트로 고정하고 싶다면 `npm run dev:8000`을 사용합니다.

- Web은 Supabase 설정을 `apps/web/assets/supabase.js` 기본값 또는 HTML의 meta로 오버라이드합니다.

## 방향(요약)

- 프론트엔드 UI는 “기존 UI”를 유지합니다.
- 이력/프로필/게시물 등 변경 가능한 데이터는 Supabase에서 가져옵니다.
