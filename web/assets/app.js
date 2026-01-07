/*
  Shared UI helpers: staggered reveal timing and active navigation highlight.
  Keep logic light to avoid dependency on any framework.
*/
(() => {
  /**
   * 프론트엔드에서 사용할 API 기본 URL을 계산합니다.
   *
   * 목적:
   * - “정적 UI(기존 HTML/JS)”는 그대로 유지하되,
   *   데이터(profile/targets/posts 등)는 백엔드 API에서 받아오도록 구조를 전환합니다.
   *
   * 동작 규칙(우선순위):
   * 1) `<meta name="api-base-url" content="...">`가 있고 값이 비어있지 않으면 그 값을 사용합니다.
   * 2) 로컬 개발(localhost)에서는 `http://localhost:8080`을 기본값으로 사용합니다.
   * 3) 배포 환경에서는 `window.location.origin`을 사용합니다.
   *    - Web과 API를 같은 오리진(리버스 프록시 등)으로 묶으면 CORS 없이 동작합니다.
   *
   * 주의:
   * - 배포 환경에서 Web/API를 다른 도메인으로 분리하면 반드시 meta의 content를 설정하세요.
   */
  const getApiBaseUrl = () => {
    const meta = document.querySelector('meta[name="api-base-url"]');
    const override = meta?.getAttribute('content')?.trim();
    if (override) {
      return override.replace(/\/$/, '');
    }

    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      return 'http://localhost:8080';
    }
    return window.location.origin;
  };

  /**
   * 페이지별 스크립트(예: resume.js, builder.js)가 공통으로 사용할 수 있도록
   * 전역 네임스페이스를 노출합니다.
   *
   * - 외부 라이브러리 없이도 “공통 설정/헬퍼”를 공유하기 위한 최소 장치입니다.
   */
  window.JH_BLOG = {
    getApiBaseUrl,
  };

  // Apply staggered delays for elements that opt into the reveal animation.
  document.querySelectorAll('.reveal').forEach((element) => {
    const delay = element.getAttribute('data-delay');
    if (delay) {
      element.style.animationDelay = `${delay}s`;
    }
  });

  // Highlight the current page in the navigation bar.
  const path = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-link').forEach((link) => {
    if (link.getAttribute('href') === path) {
      link.style.background = 'var(--accent)';
      link.style.color = '#0f1115';
    }
  });
})();
