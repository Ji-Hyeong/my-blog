/*
  Blog post viewer.

  목적:
  - Supabase(posts 테이블)에 저장된 글을 slug로 조회해 표시합니다.
  - 공개 방문자는 published=true 글만 읽을 수 있습니다.
  - 작성자(allowlist)는 초안도 확인할 수 있습니다.

  보안:
  - 클라이언트 가드는 UX 레벨입니다.
  - 실제 접근 제어는 Supabase RLS에서 강제해야 합니다.
*/
(() => {
  const title = document.getElementById("postTitle")
  const meta = document.getElementById("postMeta")
  const body = document.getElementById("postBody")

  if (!title || !meta || !body) {
    return
  }

  /**
   * XSS 방지용 최소 이스케이프.
   *
   * - markdown 렌더러를 붙이지 않은 상태에서, plain text를 HTML로 안전하게 보여주기 위해 사용합니다.
   * - 필요하면 이후 `marked` 같은 마크다운 렌더러로 교체할 수 있습니다.
   */
  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;")

  const renderError = (message) => {
    title.textContent = "글을 불러오지 못했습니다"
    meta.textContent = ""
    body.innerHTML = `
      <div class="card">
        <h3>오류</h3>
        <p>${escapeHtml(message)}</p>
        <p class="home-muted" style="margin-top: 10px;">
          글 목록으로 돌아가려면 <a href="blog.html">여기</a>를 클릭하세요.
        </p>
      </div>
    `
  }

  const boot = async () => {
    const params = new URLSearchParams(window.location.search)
    const slug = params.get("slug") || ""

    if (!slug) {
      renderError("slug가 없습니다.")
      return
    }

    try {
      const client = await window.JH_SUPABASE.getSupabaseClient()
      const session = await window.JH_SUPABASE.getSession()
      const isWriter = window.JH_SUPABASE.isWriter(session)

      const { data, error } = await client
        .from("posts")
        .select("slug, title, category, content, published, published_at, created_at")
        .eq("slug", slug)
        .maybeSingle()

      if (error || !data) {
        renderError("해당 글을 찾을 수 없습니다.")
        return
      }

      if (!isWriter && !data.published) {
        renderError("비공개 글입니다.")
        return
      }

      title.textContent = data.title || "글"
      const date = data.published_at
        ? String(data.published_at).slice(0, 10)
        : data.created_at
          ? String(data.created_at).slice(0, 10)
          : ""
      meta.textContent = [data.category, date].filter(Boolean).join(" · ")

      const content = data.content || ""
      body.innerHTML = `
        <article class="card">
          <div style="white-space: pre-wrap; line-height: 1.75;">
            ${escapeHtml(content)}
          </div>
        </article>
      `
    } catch (error) {
      renderError("네트워크 또는 설정 문제로 글을 불러오지 못했습니다.")
    }
  }

  boot()
})()

