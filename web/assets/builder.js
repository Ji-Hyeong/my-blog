/*
  Tailor builder logic.
  - Loads profile and target data.
  - Lets the user select items and generates a focused preview.
  - Uses window.print() for PDF output.
*/
;(async () => {
  const targetSelect = document.getElementById("targetSelect")
  const companyName = document.getElementById("companyName")
  const roleName = document.getElementById("roleName")
  const priorityTags = document.getElementById("priorityTags")
  const experienceList = document.getElementById("experienceList")
  const projectList = document.getElementById("projectList")
  const initiativeList = document.getElementById("initiativeList")
  const printName = document.getElementById("printName")
  const printTitle = document.getElementById("printTitle")
  const printSummary = document.getElementById("printSummary")
  const printContact = document.getElementById("printContact")
  const printIntro = document.getElementById("printIntro")
  const printSkills = document.getElementById("printSkills")
  const printExperience = document.getElementById("printExperience")
  const printProjects = document.getElementById("printProjects")
  const printInitiatives = document.getElementById("printInitiatives")
  const printEducation = document.getElementById("printEducation")
  const printTrainings = document.getElementById("printTrainings")
  const printFooter = document.getElementById("printFooter")
  const autoSelectButton = document.getElementById("autoSelect")
  const resetSelectButton = document.getElementById("resetSelect")
  const exportPdfButton = document.getElementById("exportPdf")

  /**
   * 맞춤 이력서는 “작성자 전용” 기능입니다.
   *
   * - 공개 방문자에게는 기본 이력서(Resume)만 제공하고,
   * - 맞춤 조합/출력은 allowlist 계정만 사용할 수 있게 제한합니다.
   *
   * 주의:
   * - 이 체크는 UX 레벨 가드이며, 보안은 Supabase RLS(글쓰기 등)에서 강제합니다.
   * - 맞춤 이력서는 현재 로컬에서만 출력(PDF)하므로, 여기서는 기능 접근만 제한합니다.
   */
  const requireWriter = async () => {
    try {
      const session = await window.JH_SUPABASE?.getSession?.()
      const isWriter = window.JH_SUPABASE?.isWriter?.(session)
      if (isWriter) {
        return true
      }

      const root = document.getElementById("builderRoot") || document.body
      root.innerHTML = `
        <div class="container page">
          <section class="section reveal" data-delay="0.05">
            <h1 class="page-title">맞춤 이력서</h1>
            <p class="page-desc">
              이 기능은 작성자 전용입니다. Google로 로그인해 주세요.
            </p>
            <div class="card" style="margin-top: 18px;">
              <button class="button primary" id="builderLoginBtn">Google 로그인</button>
              <a class="button ghost" href="resume.html">기본 이력서 보기</a>
            </div>
          </section>
        </div>
      `

      const loginBtn = document.getElementById("builderLoginBtn")
      if (loginBtn) {
        loginBtn.addEventListener("click", async () => {
          await window.JH_SUPABASE.signInWithGoogle()
        })
      }
      return false
    } catch (error) {
      return false
    }
  }

  // Guard: skip if builder elements are not present.
  if (!targetSelect || !experienceList || !projectList || !initiativeList) {
    return
  }

  // Writer guard: block the page early.
  // - 작성자가 아니면 아래 로직(데이터 로딩/렌더링/이벤트 바인딩)을 실행하지 않습니다.
  const allowed = await requireWriter()
  if (!allowed) {
    return
  }

  const state = {
    profile: null,
    targets: [],
    selected: new Set(),
  }

  /**
   * JSON을 안전하게 fetch합니다.
   *
   * - `fetch()`는 404/500이어도 예외를 던지지 않기 때문에 상태 코드를 확인합니다.
   * - 실패 시 호출부에서 폴백(정적 JSON) 전략을 적용할 수 있도록 예외를 던집니다.
   */
  const fetchJsonOrThrow = async (url) => {
    const response = await fetch(url, { cache: "no-cache" })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} from ${url}`)
    }
    return response.json()
  }

  const toTagList = (value) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)

  const getPriorityTags = () => {
    const target = state.targets.find((item) => item.id === targetSelect.value)
    const manual = priorityTags.value ? toTagList(priorityTags.value) : []
    const preset = target ? target.priorityTags : []
    return [...new Set([...preset, ...manual])]
  }

  // Highlight match quality to guide quick decisions.
  const hasTagMatch = (tags, priorities) =>
    tags.some((tag) => priorities.includes(tag))

  const renderItem = (item, type) => {
    const isChecked = state.selected.has(item.id)
    const title = type === "experience" ? item.role : item.name
    const subtitle =
      type === "experience"
        ? item.company
        : [item.company, item.period].filter(Boolean).join(" · ")
    const tags = Array.isArray(item.tags) ? item.tags : []
    return `
      <div class="list-item">
        <div class="checkbox-row">
          <input
            type="checkbox"
            data-id="${item.id}"
            data-type="${type}"
            ${isChecked ? "checked" : ""}
          />
          <div>
            <strong>${title}</strong>
            <div>${subtitle}</div>
          </div>
        </div>
        <div>
          ${tags.map((tag) => `<span class="badge">${tag}</span>`).join("")}
        </div>
      </div>
    `
  }

  const renderLists = () => {
    const priorities = getPriorityTags()
    const companies = Array.isArray(state.profile.companies)
      ? state.profile.companies
      : []

    // Company overview list.
    experienceList.innerHTML = companies
      .map(
        (company) => `
        <div class="list-item">
          <strong>${company.name}</strong>
          <div>${company.role} · ${company.period}</div>
        </div>
      `
      )
      .join("")

    // Project + initiative list grouped by company.
    projectList.innerHTML = companies
      .map((company) => {
        const projects = company.projects || []
        const initiatives = company.initiatives || []
        return `
          <h4>${company.name}</h4>
          ${projects
            .map((item) => {
              const html = renderItem(
                { ...item, company: company.name },
                "project"
              )
              return hasTagMatch(item.tags || [], priorities)
                ? html.replace("list-item", "list-item card")
                : html
            })
            .join("")}
          ${initiatives
            .map((item) => {
              const html = renderItem(
                { ...item, company: company.name },
                "initiative"
              )
              return hasTagMatch(item.tags || [], priorities)
                ? html.replace("list-item", "list-item card")
                : html
            })
            .join("")}
        `
      })
      .join("")

    initiativeList.innerHTML = ""
  }

  // Company icon helper: use logo image when available, otherwise show text badge
  // to keep the print layout stable even when a logo asset is missing.
  const renderCompanyIcon = (company) => {
    if (company.iconImage) {
      return `
        <span class="company-icon">
          <img src="${company.iconImage}" alt="${company.name} 로고" />
        </span>
      `
    }
    return `<span class="company-icon">${company.iconText || "•"}</span>`
  }

  // Print template groups each project by company and splits content into
  // 배경/주요 작업/성과 for consistent resume scanning.
  const renderCompanyGroups = (entries) =>
    entries
      .map((entry) => {
        if (!entry.items.length) {
          return ""
        }
        return `
          <div class="print-company-group">
            <div class="print-company-title">
              ${entry.iconHtml}
              ${entry.companyName}
            </div>
            ${entry.items
              .map(
                (item) => `
              <div class="print-item">
                <div class="print-item-title">${item.name}</div>
                <div class="print-item-meta">${[item.period]
                  .filter(Boolean)
                  .join(" · ")}</div>
                <div class="print-item-section">
                  <strong class="print-item-label">배경</strong>
                  <div>${item.summary}</div>
                </div>
                <div class="print-item-section">
                  <strong class="print-item-label">주요 작업</strong>
                  ${
                    item.details && item.details.length
                      ? `<ul>${item.details
                          .map((detail) => `<li>${detail}</li>`)
                          .join("")}</ul>`
                      : "<div>-</div>"
                  }
                </div>
                <div class="print-item-section">
                  <strong class="print-item-label">성과</strong>
                  <div>${item.impact || "-"}</div>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        `
      })
      .join("")

  const updatePreview = () => {
    const priorities = getPriorityTags()
    const companies = Array.isArray(state.profile.companies)
      ? state.profile.companies
      : []
    const selectedCompanies = companies.map((company) => ({
      company,
      projects: (company.projects || []).filter((item) =>
        state.selected.has(item.id)
      ),
      initiatives: (company.initiatives || []).filter((item) =>
        state.selected.has(item.id)
      ),
    }))
    const selectedProjects = selectedCompanies.flatMap((entry) =>
      entry.projects.map((item) => ({ ...item, company: entry.company.name }))
    )
    const selectedInitiatives = selectedCompanies.flatMap((entry) =>
      entry.initiatives.map((item) => ({
        ...item,
        company: entry.company.name,
      }))
    )
    const selectedItems = [...selectedProjects, ...selectedInitiatives]

    const target = state.targets.find((item) => item.id === targetSelect.value)
    // 자동 생성 요약 문구는 항상 숨김 처리한다.
    const summaryText = ""

    // Header content in the print template.
    printName.textContent = state.profile.basics.name || "이름"
    printTitle.textContent = state.profile.basics.title || "Backend Engineer"
    printSummary.textContent = summaryText
    printContact.innerHTML = `
      <div>${state.profile.basics.email || ""}</div>
      <div>${state.profile.basics.phone || ""}</div>
      <div>${state.profile.basics.location || ""}</div>
    `
    printIntro.innerHTML = state.profile.intro || "소개를 작성해 주세요."
    printFooter.innerHTML = state.profile.basics.links
      .map((link) => `<span>${link.label}: ${link.url}</span>`)
      .join(" · ")

    // Skills pulled from profile data.
    printSkills.innerHTML = state.profile.skills
      .map(
        (group) => `
        <div class="print-row">
          <strong>${group.category}</strong>
          <span>${group.items.join(" · ")}</span>
        </div>
      `
      )
      .join("")

    printExperience.innerHTML =
      selectedCompanies
        .map((entry) => {
          if (!entry.projects.length && !entry.initiatives.length) {
            return ""
          }
          return `
            <div class="print-item">
              <div class="print-item-title">
                ${renderCompanyIcon(entry.company)}
                ${entry.company.name}
              </div>
              <div class="print-item-meta">${entry.company.role} · ${entry.company.period}</div>
            </div>
          `
        })
        .join("") || '<p class="print-muted">선택된 경력이 없습니다.</p>'

    const projectGroups = selectedCompanies.map((entry) => ({
      companyName: entry.company.name,
      iconHtml: renderCompanyIcon(entry.company),
      items: entry.projects.map((item) => ({
        ...item,
        company: entry.company.name,
      })),
    }))
    printProjects.innerHTML = selectedProjects.length
      ? renderCompanyGroups(projectGroups)
      : '<p class="print-muted">선택된 프로젝트가 없습니다.</p>'

    const initiativeGroups = selectedCompanies.map((entry) => ({
      companyName: entry.company.name,
      iconHtml: renderCompanyIcon(entry.company),
      items: entry.initiatives.map((item) => ({
        ...item,
        company: entry.company.name,
      })),
    }))
    printInitiatives.innerHTML = selectedInitiatives.length
      ? renderCompanyGroups(initiativeGroups)
      : '<p class="print-muted">선택된 개선 항목이 없습니다.</p>'

    printEducation.innerHTML = state.profile.education
      .map(
        (item) => `
        <div class="print-row">
          <strong>${item.school}</strong>
          <span>${item.major} · ${item.period}</span>
        </div>
      `
      )
      .join("")

    /**
     * 교육/대외활동(선택) 렌더링.
     *
     * - 이 섹션은 PDF 출력 기준으로도 정보 가치가 있지만,
     *   모든 사용자가 채우는 것은 아니므로 데이터가 없으면 숨깁니다.
     * - 데이터는 profile.json의 `trainings` 배열을 사용합니다.
     */
    if (printTrainings) {
      const trainings = Array.isArray(state.profile.trainings)
        ? state.profile.trainings
        : []
      printTrainings.innerHTML = trainings.length
        ? trainings
            .map(
              (item) => `
            <div class="print-row">
              <strong>${item.name}</strong>
              <span>${item.period}</span>
            </div>
          `
            )
            .join("")
        : '<p class="print-muted">-</p>'
    }

    // Deliberately omit keyword tags in the header for a cleaner resume.
  }

  const applyTarget = () => {
    const target = state.targets.find((item) => item.id === targetSelect.value)
    if (!target) {
      return
    }
    companyName.value = target.company
    roleName.value = target.role
    priorityTags.value = target.priorityTags.join(", ")
  }

  const autoSelect = () => {
    const priorities = getPriorityTags()
    const companies = Array.isArray(state.profile.companies)
      ? state.profile.companies
      : []
    companies.forEach((company) => {
      ;(company.projects || []).forEach((item) => {
        if (hasTagMatch(item.tags || [], priorities)) {
          state.selected.add(item.id)
        }
      })
      ;(company.initiatives || []).forEach((item) => {
        if (hasTagMatch(item.tags || [], priorities)) {
          state.selected.add(item.id)
        }
      })
    })
    renderLists()
    bindListHandlers()
    updatePreview()
  }

  const resetSelect = () => {
    state.selected.clear()
    renderLists()
    bindListHandlers()
    updatePreview()
  }

  const bindListHandlers = () => {
    document
      .querySelectorAll('input[type="checkbox"][data-id]')
      .forEach((input) => {
        input.addEventListener("change", (event) => {
          const id = event.target.getAttribute("data-id")
          if (event.target.checked) {
            state.selected.add(id)
          } else {
            state.selected.delete(id)
          }
          updatePreview()
        })
      })
  }

  // Refresh list and preview whenever inputs change.
  const bindInputs = () => {
    ;[companyName, roleName, priorityTags, targetSelect].forEach((input) => {
      input.addEventListener("input", () => {
        renderLists()
        bindListHandlers()
        updatePreview()
      })
    })
  }

  const setupTargets = () => {
    targetSelect.innerHTML = state.targets
      .map((item) => `<option value="${item.id}">${item.company}</option>`)
      .join("")
    applyTarget()
  }

  const loadData = () => {
    /**
     * 데이터 로딩 전략(공통 로더 사용):
     *
     * - assets/data-loader.js에 “Supabase(writer only) → API → 정적 JSON” 우선순위 로더를 구현해두었습니다.
     * - 맞춤(builder)은 작성자 전용 기능이므로, targets는 Supabase에서도 writer만 읽을 수 있게 설계되어 있습니다.
     *
     * 반환 형태:
     * - profile: profile.json과 동일한 형태
     * - targets: `{ targets: [...] }`
     */
    return Promise.all([window.JH_DATA.loadProfile(), window.JH_DATA.loadTargets()])
  }

  loadData()
    .then(([profile, targets]) => {
      state.profile = profile
      state.targets = targets.targets
      setupTargets()
      renderLists()
      bindListHandlers()
      bindInputs()
      updatePreview()
    })
    .catch(() => {
      printSummary.innerHTML = `
        <div class="card">
          <h3>데이터 로딩 실패</h3>
          <p>
            API 연결에 실패했습니다.
            <br />
            로컬: <code>apps/api</code>를 실행하고 <code>/api/profile</code>, <code>/api/targets</code>가 응답하는지 확인해 주세요.
          </p>
        </div>
      `
    })

  autoSelectButton.addEventListener("click", () => {
    applyTarget()
    autoSelect()
  })

  resetSelectButton.addEventListener("click", resetSelect)
  exportPdfButton.addEventListener("click", () => window.print())
  targetSelect.addEventListener("change", () => {
    applyTarget()
    renderLists()
    bindListHandlers()
    updatePreview()
  })
})()
