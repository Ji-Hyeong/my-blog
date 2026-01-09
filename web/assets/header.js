/*
  Shared header renderer.

  목적:
  - 각 페이지마다 중복된 네비게이션 마크업을 제거합니다.
  - 탭 라벨/링크를 단일 소스에서 관리해 언어/구조 불일치를 방지합니다.

  사용:
  - 각 HTML에 <div id="siteHeader" data-show-auth="true"></div>를 배치합니다.
  - app.js보다 먼저 로드해야 활성 탭 하이라이트가 정상 동작합니다.
*/
(() => {
  const placeholder = document.getElementById("siteHeader")
  if (!placeholder) {
    return
  }

  // posts/ 하위 글 페이지는 상대 경로가 다르므로 prefix를 분기합니다.
  const path = window.location.pathname
  const basePrefix = path.includes("/posts/") ? "../" : ""

  const showAuth = placeholder.dataset.showAuth !== "false"

  const navItems = [
    { href: `${basePrefix}index.html`, label: "소개", requiresAuth: false },
    { href: `${basePrefix}resume.html`, label: "이력서", requiresAuth: false },
    { href: `${basePrefix}builder.html`, label: "맞춤", requiresAuth: true },
    { href: `${basePrefix}blog.html`, label: "기록", requiresAuth: true },
  ]

  const navMarkup = navItems
    .map((item) => {
      const authAttr = item.requiresAuth ? ' data-requires-auth="true" hidden' : ""
      return `<a class="nav-link" href="${item.href}"${authAttr}>${item.label}</a>`
    })
    .join("")

  const githubMarkup = `
    <a
      class="header-icon"
      id="githubLink"
      href="#"
      target="_blank"
      rel="noreferrer"
      aria-label="GitHub"
      hidden
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 2c-5.52 0-10 4.58-10 10.23 0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.48l-.01-1.7c-2.78.62-3.36-1.1-3.36-1.1-.45-1.18-1.1-1.49-1.1-1.49-.9-.63.07-.62.07-.62 1 .07 1.52 1.06 1.52 1.06.9 1.58 2.36 1.12 2.94.86.1-.68.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.74-.1-.26-.45-1.31.1-2.74 0 0 .84-.27 2.75 1.05a9.3 9.3 0 0 1 5 0c1.9-1.32 2.75-1.05 2.75-1.05.55 1.43.2 2.48.1 2.74.64.7 1.03 1.62 1.03 2.74 0 3.93-2.35 4.8-4.59 5.06.36.32.68.95.68 1.92l-.01 2.84c0 .26.18.58.69.48 3.96-1.35 6.83-5.18 6.83-9.7C22 6.58 17.52 2 12 2z"
        />
      </svg>
    </a>
  `

  const authMarkup = showAuth
    ? `<div class="auth-area" id="authArea"></div>`
    : ""

  placeholder.innerHTML = `
    <header class="site-header">
      <div class="container nav-row">
        <div class="brand">JH · Backend</div>
        <nav class="nav-links">
          ${navMarkup}
        </nav>
        <div class="header-actions">
          ${githubMarkup}
          ${authMarkup}
        </div>
      </div>
    </header>
  `

  /**
   * meta에서 GitHub URL을 읽어옵니다.
   *
   * - meta name="github-url"을 사용합니다.
   * - 없으면 빈 문자열을 반환합니다.
   */
  const readGitHubMeta = () => {
    const meta = document.querySelector('meta[name="github-url"]')
    return meta?.getAttribute("content")?.trim() || ""
  }

  /**
   * GitHub 링크를 노출합니다.
   *
   * - 링크가 없으면 숨김 상태를 유지합니다.
   */
  const applyGitHubLink = (url) => {
    const link = document.getElementById("githubLink")
    if (!link) {
      return
    }
    if (!url) {
      link.setAttribute("hidden", "hidden")
      return
    }
    link.setAttribute("href", url)
    link.removeAttribute("hidden")
  }

  /**
   * 프로필 데이터에서 GitHub 링크를 탐색합니다.
   *
   * - links 배열에 GitHub 라벨이 있는 경우 우선 사용합니다.
   */
  const resolveGitHubFromProfile = (profile) => {
    const links = Array.isArray(profile?.basics?.links) ? profile.basics.links : []
    const github = links.find((item) =>
      String(item.label || "").toLowerCase().includes("github")
    )
    return github?.url || ""
  }

  /**
   * GitHub 링크를 설정합니다.
   *
   * - 우선순위: meta → PROFILE_DATA → JH_DATA.loadProfile()
   */
  const resolveGitHubLink = async () => {
    const metaUrl = readGitHubMeta()
    if (metaUrl) {
      applyGitHubLink(metaUrl)
      return
    }

    if (window.PROFILE_DATA) {
      applyGitHubLink(resolveGitHubFromProfile(window.PROFILE_DATA))
      return
    }

    if (window.JH_DATA?.loadProfile) {
      try {
        const profile = await window.JH_DATA.loadProfile()
        applyGitHubLink(resolveGitHubFromProfile(profile))
      } catch (error) {
        applyGitHubLink("")
      }
    }
  }

  /**
   * 로그인 여부에 따라 "인증 전용 요소"를 노출합니다.
   *
   * - 기본값은 숨김(hidden)이며, 로그인 확인 후에만 해제합니다.
   * - 네비게이션뿐 아니라 홈 CTA 같은 공통 요소에도 재사용합니다.
   * - 헤더를 다시 렌더링하지 않고, DOM 속성만 조정해 auth.js와 충돌을 피합니다.
   */
  const applyAuthVisibility = (isLoggedIn) => {
    document.querySelectorAll('[data-requires-auth="true"]').forEach((node) => {
      if (isLoggedIn) {
        node.removeAttribute("hidden")
      } else {
        node.setAttribute("hidden", "hidden")
      }
    })
  }

  /**
   * Supabase 로딩을 기다린 뒤 세션을 확인합니다.
   *
   * - 정적 페이지는 로딩 순서가 고정되어 있지 않으므로, 짧은 폴링으로 안전하게 처리합니다.
   * - Supabase가 없거나 실패하면 공개 탭만 유지합니다.
   */
  const resolveAuthVisibility = async () => {
    const sleep = (ms) =>
      new Promise((resolve) => {
        setTimeout(resolve, ms)
      })

    for (let attempt = 0; attempt < 20; attempt += 1) {
      if (window.JH_SUPABASE?.getSession) {
        try {
          const session = await window.JH_SUPABASE.getSession()
          applyAuthVisibility(Boolean(session))
        } catch (error) {
          applyAuthVisibility(false)
        }
        return
      }
      await sleep(150)
    }
  }

  applyAuthVisibility(false)
  resolveAuthVisibility()
  resolveGitHubLink()
})()
