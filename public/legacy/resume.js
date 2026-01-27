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

  /**
   * 현재 해시 라우트가 포트폴리오인지 판별합니다.
   *
   * - App.tsx는 `#/resume`, `#/portfolio`로 라우팅합니다.
   * - 동일한 레거시 렌더러를 재사용하되, 라우트에 따라 표현을 분기합니다.
   */
  const resolveViewMode = () => {
    const rawHash = String(window.location.hash || '').toLowerCase();
    return rawHash.startsWith('#/portfolio') ? 'portfolio' : 'resume';
  };

  // 렌더 시점의 모드를 고정해 동일한 DOM 업데이트 내에서 일관성을 유지합니다.
  const viewMode = resolveViewMode();

  const renderTagRow = (tags) =>
    tags.map((tag) => `<span class="tag">${tag}</span>`).join('');

  /**
   * 기간 문자열을 정렬 가능한 숫자로 변환합니다.
   *
   * - "2025.11 - 2026.01", "2022.08 - Present", "2024.01" 형태를 지원합니다.
   * - 종료가 "Present/현재/Now"면 가장 최신으로 취급합니다.
   */
  const getPeriodEndValue = (period) => {
    if (!period || typeof period !== 'string') {
      return 0;
    }
    const normalized = period.trim().toLowerCase();
    if (normalized.includes('present') || normalized.includes('현재') || normalized.includes('now')) {
      return 999912;
    }

    const parts = normalized.split('-').map((part) => part.trim());
    const target = parts.length > 1 ? parts[1] : parts[0];
    const match = target.match(/(\d{4})\.(\d{2})/);
    if (!match) {
      return 0;
    }
    const year = Number(match[1]);
    const month = Number(match[2]);
    return year * 100 + month;
  };

  /**
   * 최신 기간이 먼저 오도록 정렬합니다.
   *
   * - 동일한 경우 이름으로 보조 정렬합니다.
   */
  const sortByLatest = (items) =>
    [...items].sort((a, b) => {
      const aValue = getPeriodEndValue(a.period);
      const bValue = getPeriodEndValue(b.period);
      if (aValue !== bValue) {
        return bValue - aValue;
      }
      return String(a.name || '').localeCompare(String(b.name || ''), 'ko');
    });

  /**
   * 기술 스택을 태그 형태로 렌더링합니다.
   *
   * - 긴 한 줄을 방지하고, 시각적 스캔성을 높입니다.
   */
  const renderSkillTags = (items) => `
    <div class="skill-tags">
      ${items.map((item) => `<span class="skill-tag">${item}</span>`).join('')}
    </div>
  `;

  // Template helpers keep HTML generation consistent and easy to adjust.
  /**
   * 회사 아이콘을 렌더링합니다.
   *
   * - iconImage가 있으면 이미지 우선, 없으면 iconText를 사용합니다.
   * - 아이콘이 없는 경우 빈 문자열을 반환합니다.
   */
  const renderCompanyIcon = (company) => {
    if (company.iconImage) {
      return `<img class="company-logo" src="${company.iconImage}" alt="${company.name} logo" />`;
    }
    if (company.iconText) {
      return `<span class="company-logo-text">${company.iconText}</span>`;
    }
    return '';
  };

  /**
   * visibility 규칙에 따라 현재 뷰에서 노출 가능한지 판별합니다.
   *
   * - 명시되지 않은 경우 기본값은 `both`로 간주합니다.
   * - `resume`은 이력서, `portfolio`는 포트폴리오 뷰입니다.
   */
  const isVisibleInMode = (item, mode) => {
    const visibility = String(item?.visibility || 'both').toLowerCase();
    if (visibility === 'both') {
      return true;
    }
    return visibility === mode;
  };

  /**
   * 포트폴리오 전용 구조(배경/주요 작업/성과)를 렌더링합니다.
   *
   * - 데이터에 `portfolio`가 없으면 일반 요약/성과 렌더링으로 폴백합니다.
   */
  const renderPortfolioSections = (item) => {
    const portfolio = item?.portfolio || {};
    const background = portfolio.background || item.summary || '';
    const highlights = Array.isArray(portfolio.highlights) ? portfolio.highlights : [];
    const impacts = Array.isArray(portfolio.impact) ? portfolio.impact : [];

    const highlightList = highlights.length
      ? `<ul>${highlights.map((detail) => `<li>${detail}</li>`).join('')}</ul>`
      : '';
    const impactList = impacts.length
      ? `<ul>${impacts.map((detail) => `<li>${detail}</li>`).join('')}</ul>`
      : '';

    return `
      ${background ? `<div><strong>배경:</strong> ${background}</div>` : ''}
      ${highlightList ? `<div><strong>주요 작업:</strong></div>${highlightList}` : ''}
      ${
        impactList
          ? `<div><strong>성과:</strong></div>${impactList}`
          : item.impact
          ? `<div><strong>성과:</strong> ${item.impact}</div>`
          : ''
      }
    `;
  };

  const renderCompanyProjects = (items, title, mode) => {
    const visibleItems = items.filter((item) => isVisibleInMode(item, mode));
    if (!visibleItems.length) {
      return '';
    }
    return `
      <div class="company-group">
        <p class="company-label">${title}</p>
        ${visibleItems
          .map(
            (item) => `
          <div class="company-item">
            <div class="company-item-title">${item.name}</div>
            <div class="company-item-meta">${item.period || ''}${
              item.role ? ` · ${item.role}` : ''
            }</div>
            ${
              mode === 'portfolio'
                ? renderPortfolioSections(item)
                : `<div>${item.resumeSummary || item.summary || ''}</div>${
                    item.impact ? `<div><strong>성과:</strong> ${item.impact}</div>` : ''
                  }`
            }
            ${
              item.details && item.details.length
                ? `<ul>${item.details.map((detail) => `<li>${detail}</li>`).join('')}</ul>`
                : ''
            }
            <div>${renderTagRow(item.tags || [])}</div>
            ${
              Array.isArray(item.tech) && item.tech.length
                ? `<div class="company-item-tech">기술: ${item.tech.join(' · ')}</div>`
                : ''
            }
          </div>
        `
          )
          .join('')}
      </div>
    `;
  };

  const renderCompany = (company) => {
    const projects = sortByLatest(company.projects || []);
    const initiatives = sortByLatest(company.initiatives || []);
    return `
    <article class="card resume-card">
      <div class="resume-company-head">
        <div class="resume-company-title">
          ${renderCompanyIcon(company)}
          <h3>${company.name}</h3>
        </div>
        <p class="resume-muted">${company.role} · ${company.period}</p>
      </div>
      ${company.summary ? `<p>${company.summary}</p>` : ''}
      ${renderCompanyProjects(projects, viewMode === 'portfolio' ? '프로젝트 상세' : '프로젝트', viewMode)}
      ${renderCompanyProjects(
        initiatives,
        viewMode === 'portfolio' ? '개선/표준화 상세' : '개선/표준화',
        viewMode
      )}
    </article>
  `;
  };

  const renderSkill = (group) => `
    <div class="card resume-card">
      <h3>${group.category}</h3>
      ${renderSkillTags(group.items || [])}
    </div>
  `;

  // If fetch fails (local file restrictions), show a helpful message.
  const renderError = () => {
    resumeRoot.innerHTML = `
      <div class="card resume-card">
        <h3>데이터 로딩 실패</h3>
        <p>
          Supabase 또는 정적 데이터 로딩에 실패했습니다.
          <br />
          Vite 환경변수(<code>VITE_SUPABASE_URL</code> 등)와 네트워크 상태를 확인해 주세요.
        </p>
      </div>
    `;
  };

  /**
   * 데이터 로딩 전략(공통 로더 사용):
   *
   * - public/data-loader.js에 “Supabase → API → 정적 JSON” 우선순위 로더를 구현해두었습니다.
   * - 이 페이지는 이력서 렌더링만 담당하고, 데이터 소스 전환은 로더에 위임합니다.
   */

  const renderResume = (data) => {
    const basics = data.basics || {};
    const companies = Array.isArray(data.companies) ? sortByLatest(data.companies) : [];
    const achievements = Array.isArray(data.achievements) ? data.achievements : [];
    const skills = Array.isArray(data.skills) ? data.skills : [];
    const education = Array.isArray(data.education) ? data.education : [];
    const links = Array.isArray(basics.links) ? basics.links : [];
    /**
     * 교육/대외활동(선택) 목록입니다.
     *
     * - 과거 이력서에 있는 교육 이력을 참고해 `profile.json`에 `trainings` 배열로 저장합니다.
     * - 데이터가 없을 수 있으므로, 렌더링은 조건부로 처리합니다.
     */
    const trainings = Array.isArray(data.trainings) ? data.trainings : [];
    const pageTitle = viewMode === 'portfolio' ? '포트폴리오' : '이력서';
    const pageDesc =
      viewMode === 'portfolio'
        ? '프로젝트의 배경, 의사결정, 결과를 더 길고 구체적으로 설명합니다.'
        : '핵심 성과와 실행 요약을 빠르게 스캔할 수 있도록 정리합니다.';
    // 메인 이력서 레이아웃: 상단 요약 → 경력 → 기술 → 성과 → 학력 순으로 정렬합니다.
    resumeRoot.innerHTML = `
        <section class="section">
          <div class="card resume-card">
            <p class="eyebrow">${pageTitle}</p>
            <p class="resume-muted">${pageDesc}</p>
          </div>
        </section>
        <section class="section resume-hero">
          <div class="card resume-card resume-hero-card">
            <div class="resume-hero-top">
              <div>
                <h2>${basics.name || '이름'}</h2>
                <p class="resume-title">${basics.title || 'Backend Engineer'}</p>
              </div>
              <div class="resume-contact">
                <span>${basics.email || ''}</span>
                <span>${basics.phone || ''}</span>
                <span>${basics.location || ''}</span>
              </div>
            </div>
            <p class="resume-summary">${data.summary || '요약을 준비 중입니다.'}</p>
            ${
              links.length
                ? `<div class="resume-links">
                    ${links.map((link) => `<a href="${link.url}">${link.label}</a>`).join('')}
                  </div>`
                : ''
            }
          </div>
        </section>

        <section class="section">
          <h2>${viewMode === 'portfolio' ? '경력 및 프로젝트' : '경력'}</h2>
          ${companies.length ? companies.map(renderCompany).join('') : '<p>아직 작성 중입니다.</p>'}
        </section>

        <section class="section">
          <h2>기술 스택</h2>
          <div class="resume-grid">
            ${skills.map(renderSkill).join('')}
          </div>
        </section>

        <section class="section">
          <h2>성과</h2>
          <ul class="resume-list">
            ${achievements.map((item) => `<li>${item}</li>`).join('')}
          </ul>
        </section>

        <section class="section">
          <h2>학력</h2>
          <div class="resume-stack">
            ${education
              .map((item) => `<p>${item.school} · ${item.major} (${item.period})</p>`)
              .join('')}
          </div>
        </section>

        ${
          trainings.length
            ? `
        <section class="section">
          <h2>교육/대외활동</h2>
          <ul class="resume-list">
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
  window.JH_DATA.loadProfile().then(renderResume).catch(renderError);
})();
