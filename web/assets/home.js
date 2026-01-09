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

  const renderProfile = (profile) => {
    const basics = profile?.basics || {};
    const name = basics.name || '이름';
    const jobTitle = basics.title || 'Backend Engineer';

    title.innerHTML = `${name} <span class="accent">· ${jobTitle}</span>`;
    summary.textContent = profile?.summary || '프로필 요약을 준비 중입니다.';

    renderLinks(profile);
  };

  const renderError = () => {
    if (links) {
      links.innerHTML = '';
    }
  };

  loadProfile().then(renderProfile).catch(renderError);
})();
