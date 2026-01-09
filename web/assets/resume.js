/*
  Resume renderer.
  - Loads profile data from API (/api/profile).
  - Builds a readable, non-fragmented resume layout.
*/
(() => {
  const resumeRoot = document.getElementById('resume');

  // Basic guard to avoid running on unrelated pages.
  if (!resumeRoot) {
    return;
  }

  const renderTagRow = (tags) =>
    tags.map((tag) => `<span class="tag">${tag}</span>`).join('');

  // Template helpers keep HTML generation consistent and easy to adjust.
  const renderCompanyProjects = (items, title) => {
    if (!items.length) {
      return '';
    }
    return `
      <div class="company-group">
        <p class="company-label">${title}</p>
        ${items
          .map(
            (item) => `
          <div class="company-item">
            <div class="company-item-title">${item.name}</div>
            <div class="company-item-meta">${item.period || ''}${
              item.role ? ` · ${item.role}` : ''
            }</div>
            <div>${item.summary}</div>
            <div><strong>Impact:</strong> ${item.impact}</div>
            ${
              item.details && item.details.length
                ? `<ul>${item.details.map((detail) => `<li>${detail}</li>`).join('')}</ul>`
                : ''
            }
            <div>${renderTagRow(item.tags || [])}</div>
            ${
              item.tech
                ? `<div class="company-item-tech">Tech: ${item.tech.join(' · ')}</div>`
                : ''
            }
          </div>
        `
          )
          .join('')}
      </div>
    `;
  };

  const renderCompany = (company) => `
    <article class="card">
      <h3>${company.name}</h3>
      <p>${company.role} · ${company.period}</p>
      ${company.summary ? `<p>${company.summary}</p>` : ''}
      ${renderCompanyProjects(company.projects || [], '프로젝트')}
      ${renderCompanyProjects(company.initiatives || [], '개선/표준화')}
    </article>
  `;

  const renderSkill = (group) => `
    <div class="card">
      <h3>${group.category}</h3>
      <p>${group.items.join(' · ')}</p>
    </div>
  `;

  // If fetch fails (local file restrictions), show a helpful message.
  const renderError = () => {
    resumeRoot.innerHTML = `
      <div class="card">
        <h3>데이터 로딩 실패</h3>
        <p>
          API 연결에 실패했습니다.
          <br />
          로컬: <code>apps/api</code>를 실행하고 <code>/api/profile</code>이 응답하는지 확인해 주세요.
        </p>
      </div>
    `;
  };

  /**
   * JSON을 안전하게 fetch합니다.
   *
   * - `fetch()`는 404/500이어도 예외를 던지지 않으므로, 상태 코드를 확인해 명시적으로 실패 처리합니다.
   * - 실패 시에는 호출부에서 다음 전략(예: 정적 JSON 폴백)을 선택할 수 있도록 예외를 던집니다.
   */
  const fetchJsonOrThrow = async (url) => {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} from ${url}`);
    }
    return response.json();
  };

  /**
   * 데이터 로딩 전략:
   * 1) API(`/api/profile`) 호출을 먼저 시도합니다.
   * 2) 실패하면 GitHub Pages 정적 배포 경로(`/data/profile.json`)로 폴백합니다.
   *
   * 왜 폴백이 필요한가?
   * - GitHub Pages는 정적 호스팅이므로 기본적으로 `/api/*` 엔드포인트가 없습니다.
   * - API를 별도 배포하지 않는 시기에도 “이력서 화면이 깨지지 않도록” 하기 위해,
   *   Pages 배포 단계에서 `apps/api`의 JSON을 `web/data/`로 복사해 함께 배포합니다.
   */
  const loadProfileData = async (apiBaseUrl) => {
    try {
      return await fetchJsonOrThrow(`${apiBaseUrl}/api/profile`);
    } catch (error) {
      // 정적 JSON 폴백은 same-origin 기준 상대 경로가 가장 안전합니다.
      // (custom domain / github.io 등 환경에 상관 없이 동작)
      return fetchJsonOrThrow('/data/profile.json');
    }
  };

  const renderResume = (data) => {
    const companies = Array.isArray(data.companies) ? data.companies : [];
    /**
     * 교육/대외활동(선택) 목록입니다.
     *
     * - 과거 이력서에 있는 교육 이력을 참고해 `profile.json`에 `trainings` 배열로 저장합니다.
     * - 데이터가 없을 수 있으므로, 렌더링은 조건부로 처리합니다.
     */
    const trainings = Array.isArray(data.trainings) ? data.trainings : [];
    resumeRoot.innerHTML = `
        <section class="section">
          <h2>${data.basics.name}</h2>
          <p>${data.basics.title}</p>
          <div class="meta">
            <span>${data.basics.email}</span>
            <span>${data.basics.phone}</span>
            <span>${data.basics.location}</span>
          </div>
          <div class="meta">
            ${data.basics.links
              .map((link) => `<a href="${link.url}">${link.label}</a>`)
              .join('')}
          </div>
        </section>

        <section class="section">
          <h2>요약</h2>
          <p>${data.summary}</p>
        </section>

        <section class="section">
          <h2>경력</h2>
          ${companies.length ? companies.map(renderCompany).join('') : '<p>아직 작성 중입니다.</p>'}
        </section>

        <section class="section">
          <h2>프로젝트</h2>
          <p>경력 섹션에 회사별 프로젝트를 정리했습니다.</p>
        </section>

        <section class="section">
          <h2>개선/표준화</h2>
          <p>경력 섹션에 회사별 개선 항목을 정리했습니다.</p>
        </section>

        <section class="section">
          <h2>기술 스택</h2>
          ${data.skills.map(renderSkill).join('')}
        </section>

        <section class="section">
          <h2>성과</h2>
          <ul>
            ${data.achievements.map((item) => `<li>${item}</li>`).join('')}
          </ul>
        </section>

        <section class="section">
          <h2>학력</h2>
          ${data.education
            .map((item) => `<p>${item.school} · ${item.major} (${item.period})</p>`)
            .join('')}
        </section>

        ${
          trainings.length
            ? `
        <section class="section">
          <h2>교육/대외활동</h2>
          <ul>
            ${trainings
              .map((item) => `<li>${item.name} (${item.period})</li>`)
              .join('')}
          </ul>
        </section>
        `
            : ''
        }
      `;
  };

  // Prefer inline data when the page is opened from a local file.
  if (window.PROFILE_DATA) {
    renderResume(window.PROFILE_DATA);
    return;
  }

  /**
   * 데이터는 백엔드 API에서 가져옵니다.
   *
   * - 로컬: http://localhost:8080
   * - 배포: meta(name="api-base-url") 또는 same-origin(https)
   */
  const apiBaseUrl = window.JH_BLOG?.getApiBaseUrl?.() || 'http://localhost:8080';

  loadProfileData(apiBaseUrl).then(renderResume).catch(renderError);
})();
