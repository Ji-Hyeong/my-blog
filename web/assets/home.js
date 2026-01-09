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
  const intro = document.getElementById('homeIntro');
  const links = document.getElementById('homeLinks');
  const projects = document.getElementById('homeProjects');
  const achievements = document.getElementById('homeAchievements');

  // Guard: only run on home page.
  if (!title || !summary || !projects || !achievements) {
    return;
  }

  /**
   * JSON을 안전하게 fetch합니다.
   *
   * - `fetch()`는 404/500이어도 예외를 던지지 않으므로 상태 코드를 확인합니다.
   * - 실패 시 호출부에서 폴백 전략을 적용할 수 있도록 예외를 던집니다.
   */
  const fetchJsonOrThrow = async (url) => {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} from ${url}`);
    }
    return response.json();
  };

  /**
   * profile 데이터를 가져옵니다.
   *
   * - 배포 환경에서 API가 없을 수 있으므로, 정적 폴백을 제공합니다.
   * - API 기본 URL은 `assets/app.js`의 `getApiBaseUrl()` 규칙을 사용합니다.
   */
  const loadProfile = async () => {
    const apiBaseUrl = window.JH_BLOG?.getApiBaseUrl?.() || 'http://localhost:8080';
    try {
      return await fetchJsonOrThrow(`${apiBaseUrl}/api/profile`);
    } catch (error) {
      return fetchJsonOrThrow('/data/profile.json');
    }
  };

  /**
   * 최근 프로젝트 3개를 뽑습니다.
   *
   * 주의:
   * - 현재 데이터는 사람이 관리하는 JSON이며, 프로젝트가 “최신순으로 이미 정렬되어 있다”는 전제를 둡니다.
   * - 날짜 문자열(예: `2025.11 - 2026.01`)을 엄밀히 파싱해 정렬하는 것은 과도할 수 있어,
   *   우선은 입력 순서를 존중합니다(나중에 필요하면 파싱/정렬로 확장 가능).
   */
  const pickRecentProjects = (companies, count) => {
    const items = [];
    companies.forEach((company) => {
      (company.projects || []).forEach((project) => {
        items.push({
          company: company.name,
          name: project.name,
          period: project.period,
          tags: Array.isArray(project.tags) ? project.tags : [],
        });
      });
    });
    return items.slice(0, count);
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

  const renderProjects = (profile) => {
    const companies = Array.isArray(profile?.companies) ? profile.companies : [];
    const items = pickRecentProjects(companies, 3);

    if (!items.length) {
      projects.innerHTML = '<p class="home-muted">아직 정리된 프로젝트가 없습니다.</p>';
      return;
    }

    projects.innerHTML = `
      <ul class="home-ul">
        ${items
          .map(
            (item) => `
          <li class="home-li">
            <div class="home-li-title">${item.name}</div>
            <div class="home-li-meta">${[item.company, item.period].filter(Boolean).join(' · ')}</div>
            ${
              item.tags.length
                ? `<div class="home-li-tags">${item.tags
                    .slice(0, 5)
                    .map((tag) => `<span class="tag">${tag}</span>`)
                    .join('')}</div>`
                : ''
            }
          </li>
        `
          )
          .join('')}
      </ul>
    `;
  };

  const renderAchievements = (profile) => {
    const items = Array.isArray(profile?.achievements) ? profile.achievements : [];
    if (!items.length) {
      achievements.innerHTML = '<p class="home-muted">아직 정리된 성과가 없습니다.</p>';
      return;
    }
    achievements.innerHTML = `
      <ul class="home-ul">
        ${items
          .slice(0, 4)
          .map((item) => `<li class="home-li">${item}</li>`)
          .join('')}
      </ul>
    `;
  };

  const renderProfile = (profile) => {
    const basics = profile?.basics || {};
    const name = basics.name || '이름';
    const jobTitle = basics.title || 'Backend Engineer';

    title.innerHTML = `${name} <span class="accent">· ${jobTitle}</span>`;
    summary.textContent = profile?.summary || '프로필 요약을 준비 중입니다.';
    if (intro) {
      // home에서는 너무 길면 읽히지 않으므로 1~2문장만 보여줍니다.
      const introText = (profile?.intro || '').split('\n').map((line) => line.trim()).filter(Boolean);
      intro.textContent =
        introText.slice(0, 2).join(' ') ||
        '프로젝트/개선 이력을 정리하고, 필요할 때 근거 있는 형태로 꺼내 쓰는 공간입니다.';
    }

    renderLinks(profile);
    renderProjects(profile);
    renderAchievements(profile);
  };

  const renderError = () => {
    projects.innerHTML = '<p class="home-muted">프로필 데이터를 불러오지 못했습니다.</p>';
    achievements.innerHTML = '<p class="home-muted">-</p>';
    if (links) {
      links.innerHTML = '';
    }
  };

  loadProfile().then(renderProfile).catch(renderError);
})();

