/*
  Home page renderer.

  역할:
  - Home은 “나를 기록하고 알리는 프로필 허브”로 사용합니다.
  - Resume/Builder/Blog로 자연스럽게 이어지는 진입점을 제공하되,
    첫 화면에서 '누구인지'와 '어떤 경험을 했는지'가 30초 안에 읽히게 구성합니다.

  데이터 로딩 정책:
  - 1순위: API(`/api/profile`) 호출
  - 2순위: 정적 폴백(`/data/profile.json`)
    - GitHub Pages는 정적 호스팅이라 `/api/*`가 없을 수 있습니다.
    - Pages 배포 워크플로우에서 `apps/api`의 JSON을 `apps/web/data/`로 복사해 함께 배포합니다.
*/
(() => {
  const title = document.getElementById('homeTitle');
  const summary = document.getElementById('homeSummary');
  const links = document.getElementById('homeLinks');
  const highlights = document.getElementById('homeHighlights');
  const focus = document.getElementById('homeFocus');
  const stack = document.getElementById('homeStack');

  // Guard: only run on home page.
  if (!title || !summary) {
    return;
  }

  /**
   * profile 데이터를 가져옵니다.
   *
   * - 배포 환경에서 API가 없을 수 있으므로, 정적 폴백을 제공합니다.
   * - API 기본 URL은 `assets/app.js`의 `getApiBaseUrl()` 규칙을 사용합니다.
   */
  const loadProfile = async () => {
    /**
     * assets/data-loader.js의 공통 로더를 사용합니다.
     *
     * - Supabase로 전환하더라도 Home 로직은 유지하고,
     * - “어떤 소스에서 가져오는지”는 로더가 결정합니다.
     */
    return window.JH_DATA.loadProfile();
  };

  const renderLinks = (profile) => {
    if (!links) {
      return;
    }
    const items = Array.isArray(profile?.basics?.links) ? profile.basics.links : [];
    if (!items.length) {
      links.innerHTML = '';
      return;
    }
    links.innerHTML = `
      <div class="home-link-row">
        ${items
          .map(
            (item) =>
              `<a class="home-link" href="${item.url}" target="_blank" rel="noreferrer">${item.label}</a>`
          )
          .join('')}
      </div>
    `;
  };

  /**
   * 성과 하이라이트를 렌더링합니다.
   *
   * - achievements 배열을 우선 사용하고, 없으면 기본 메시지를 유지합니다.
   * - 너무 길어지지 않도록 상위 4개만 노출합니다.
   */
  const renderHighlights = (profile) => {
    if (!highlights) {
      return;
    }
    const items = Array.isArray(profile?.achievements) ? profile.achievements : [];
    const visible = items.slice(0, 4);
    if (!visible.length) {
      highlights.innerHTML = '<li>성과 데이터를 준비 중입니다.</li>';
      return;
    }
    highlights.innerHTML = visible.map((item) => `<li>${item}</li>`).join('');
  };

  /**
   * 홈의 포커스 문구와 핵심 스택 태그를 렌더링합니다.
   *
   * - intro가 있으면 우선 사용하고, 없으면 summary를 요약 문구로 사용합니다.
   * - skills에서 상위 카테고리 항목을 6개까지 뽑아 태그로 표시합니다.
   */
  const renderFocus = (profile) => {
    if (focus) {
      const intro = profile?.intro || profile?.summary;
      focus.textContent = intro || '현재는 운영 안정성과 데이터 기반 개선에 집중하고 있습니다.';
    }

    if (!stack) {
      return;
    }
    const skillGroups = Array.isArray(profile?.skills) ? profile.skills : [];
    const tags = skillGroups
      .flatMap((group) => (Array.isArray(group.items) ? group.items : []))
      .slice(0, 6);

    if (!tags.length) {
      stack.innerHTML = '';
      return;
    }
    stack.innerHTML = tags.map((item) => `<span class="hero-tag">${item}</span>`).join('');
  };

  const renderProfile = (profile) => {
    const basics = profile?.basics || {};
    const name = basics.name || '이름';
    const jobTitle = basics.title || 'Backend Engineer';

    title.innerHTML = `${name} <span class="accent">· ${jobTitle}</span>`;
    summary.textContent = profile?.summary || '프로필 요약을 준비 중입니다.';

    renderLinks(profile);
    renderHighlights(profile);
    renderFocus(profile);
  };

  const renderError = () => {
    if (links) {
      links.innerHTML = '';
    }
  };

  loadProfile().then(renderProfile).catch(renderError);
})();
