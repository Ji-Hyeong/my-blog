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
        ${authMarkup}
      </div>
    </header>
  `

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
})()
