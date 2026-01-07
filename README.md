# blog (apps)

이 디렉토리(`apps/`)만 Git 레포로 관리합니다. (`/Users/ji/jh-blog` 루트는 레포 범위 밖)

## 구성

- `web/`: 프론트엔드 (Vite dev server 기반, 기존 정적 UI 유지)
- `api/`: Kotlin 백엔드 (Spring Boot)

## 로컬 실행

### API

```bash
cd api
./gradlew bootRun
```

- Health: `GET http://localhost:8080/api/health`
- Data:
  - `GET http://localhost:8080/api/profile`
  - `GET http://localhost:8080/api/targets`
  - `GET http://localhost:8080/api/posts`

### Web

```bash
cd web
npm install
npm run dev
```

- Web은 각 HTML의 `<meta name="api-base-url" content="...">` 설정을 통해 API 주소를 참조합니다.
  - 비워두면(기본값) 로컬은 `http://localhost:8080`, 배포는 `window.location.origin`을 사용합니다.

## 방향(요약)

- 프론트엔드 UI는 “기존 UI”를 유지합니다.
- 이력/프로필/게시물 등 변경 가능한 데이터는 백엔드 API에서 HTTPS로 받아옵니다.
  - 로컬 개발에서는 HTTP로 동작할 수 있으며, 배포 환경에서는 HTTPS를 사용합니다.
