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

  fetch(`${apiBaseUrl}/api/profile`)
    .then((response) => response.json())
    .then(renderResume)
    .catch(renderError);
})();
