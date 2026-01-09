/*
  Supabase client helper.

  목표:
  - 정적 사이트(GitHub Pages)에서 "로그인/권한/CRUD"를 구현합니다.
  - 서버 비용을 최소화하기 위해, 가능하면 Supabase(Auth + DB + RLS)로 해결합니다.

  보안 메모(중요):
  - 아래 anon key는 "publishable key"이며 클라이언트에 노출되어도 괜찮습니다.
  - 실제 권한 제어는 RLS(Row Level Security) 정책이 담당합니다.
  - 이 파일의 allowlist는 UI 레벨의 가드(UX)이며, 최종 방어선은 DB 정책입니다.
*/
(() => {
  /**
   * 설정 로딩 순서:
   * 1) window.JH_SUPABASE_CONFIG (단일 설정 파일)
   * 2) HTML meta (페이지별 오버라이드)
   *
   * - 배포/로컬 환경마다 값이 다를 수 있으므로, 코드에 하드코딩하지 않습니다.
   * - 예: <meta name="supabase-url" content="...">
   *       <meta name="supabase-anon-key" content="...">
   *       <meta name="writer-email" content="...">
   */
  const readMeta = (name) => {
    const meta = document.querySelector(`meta[name="${name}"]`)
    return meta?.getAttribute("content")?.trim() || ""
  }

  const readWindowConfig = () => {
    const config = window.JH_SUPABASE_CONFIG || {}
    const url = typeof config.url === "string" ? config.url.trim() : ""
    const anonKey =
      typeof config.anonKey === "string" ? config.anonKey.trim() : ""
    const writerEmail =
      typeof config.writerEmail === "string" ? config.writerEmail.trim() : ""
    return { url, anonKey, writerEmail }
  }

  const getSupabaseConfig = () => {
    const windowConfig = readWindowConfig()
    const url = windowConfig.url || readMeta("supabase-url")
    const anonKey = windowConfig.anonKey || readMeta("supabase-anon-key")
    const writerEmail = windowConfig.writerEmail || readMeta("writer-email")
    return { url, anonKey, writerEmail }
  }

  /**
   * ESM 번들 로드.
   *
   * - npm install 없이도 정적 사이트에서 동작하도록 CDN을 사용합니다.
   * - GitHub Pages/Cloudflare Pages 등에서 바로 동작합니다.
   */
  const loadSupabaseLibrary = async () => {
    // 캐시: 한 번 로드하면 재사용합니다.
    if (window.__JH_SUPABASE_LIB) {
      return window.__JH_SUPABASE_LIB
    }

    // esm.sh는 브라우저 ESM import를 지원합니다.
    // (네트워크 장애가 있으면 상위 호출부에서 폴백 처리)
    const lib = await import("https://esm.sh/@supabase/supabase-js@2.49.1")
    window.__JH_SUPABASE_LIB = lib
    return lib
  }

  /**
   * Supabase client를 생성합니다.
   *
   * - 여러 페이지에서 공유하므로 전역 캐시로 보관합니다.
   * - 세션은 localStorage에 저장되며, 페이지 이동해도 유지됩니다.
   */
  const getSupabaseClient = async () => {
    if (window.__JH_SUPABASE_CLIENT) {
      return window.__JH_SUPABASE_CLIENT
    }

    const { url, anonKey } = getSupabaseConfig()
    // 필수 설정 누락 시 조기 실패시키고 폴백 흐름이 동작하도록 합니다.
    if (!url || !anonKey) {
      throw new Error(
        "Supabase 설정이 비어 있습니다. meta supabase-url/anon-key를 확인하세요."
      )
    }
    const { createClient } = await loadSupabaseLibrary()
    const client = createClient(url, anonKey, {
      auth: {
        // 멀티 페이지 정적 사이트에서 세션 유지가 가장 중요합니다.
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })

    window.__JH_SUPABASE_CLIENT = client
    return client
  }

  /**
   * 현재 세션을 조회합니다.
   *
   * - 로그인 직후 redirect callback에서 토큰 교환이 이루어지면,
   *   이후 페이지에서는 getSession()으로 세션이 잡힙니다.
   */
  const getSession = async () => {
    const client = await getSupabaseClient()
    const { data } = await client.auth.getSession()
    return data.session || null
  }

  /**
   * allowlist(작성자) 여부를 판단합니다.
   *
   * - UI 레벨 가드이며, 진짜 권한은 DB(RLS)로 강제합니다.
   */
  const isWriter = (session) => {
    const { writerEmail } = getSupabaseConfig()
    const email = session?.user?.email || ""
    return email.toLowerCase() === writerEmail.toLowerCase()
  }

  /**
   * Google OAuth 로그인 시작.
   *
   * - redirectTo는 고정된 callback 페이지로 보냅니다.
   * - 돌아온 뒤 원래 페이지로 복귀하기 위해 returnTo를 localStorage에 저장합니다.
   */
  const signInWithGoogle = async ({ returnTo } = {}) => {
    const client = await getSupabaseClient()

    const origin = window.location.origin
    const callbackUrl = `${origin}/auth/callback.html`

    // 어떤 페이지에서 로그인했는지 기억해두면, callback에서 원래 위치로 돌려보낼 수 있습니다.
    if (returnTo) {
      localStorage.setItem("jh_return_to", returnTo)
    } else {
      localStorage.setItem(
        "jh_return_to",
        window.location.pathname + window.location.search
      )
    }

    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
      },
    })

    if (error) {
      throw error
    }
  }

  /**
   * 로그아웃.
   */
  const signOut = async () => {
    const client = await getSupabaseClient()
    await client.auth.signOut()
  }

  window.JH_SUPABASE = {
    getSupabaseConfig,
    getSupabaseClient,
    getSession,
    isWriter,
    signInWithGoogle,
    signOut,
  }
})()
