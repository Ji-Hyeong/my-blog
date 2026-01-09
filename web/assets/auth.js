/*
  Auth UI helper.

  목적:
  - 모든 페이지 상단에 “로그인/로그아웃 + 권한 상태”를 노출합니다.
  - allowlist 계정만 “작성자(관리자)”로 인식해, 글쓰기/맞춤 기능을 사용할 수 있게 합니다.

  주의:
  - UI에서 버튼을 숨긴다고 권한이 생기는 것이 아닙니다.
  - 쓰기 권한은 Supabase RLS 정책으로 강제해야 합니다.
*/
(() => {
  const authRoot = document.getElementById("authArea")
  if (!authRoot) {
    return
  }

  const render = ({ session, writerEmail }) => {
    const isLoggedIn = Boolean(session)
    const isWriter = window.JH_SUPABASE?.isWriter?.(session)
    const email = session?.user?.email || ""

    authRoot.innerHTML = `
      <div class="auth-row">
        <span class="auth-status">
          ${
            isLoggedIn
              ? isWriter
                ? `관리자 · ${email}`
                : `로그인됨 · ${email}`
              : "게스트"
          }
        </span>
        ${
          !isLoggedIn
            ? `<button class="auth-btn" id="authLoginBtn">Google 로그인</button>`
            : `<button class="auth-btn" id="authLogoutBtn">로그아웃</button>`
        }
      </div>
      ${
        isLoggedIn && !isWriter
          ? `<div class="auth-hint">
              작성 기능은 <strong>${writerEmail}</strong>만 사용할 수 있습니다.
            </div>`
          : ""
      }
    `

    const loginBtn = document.getElementById("authLoginBtn")
    if (loginBtn) {
      loginBtn.addEventListener("click", async () => {
        try {
          await window.JH_SUPABASE.signInWithGoogle()
        } catch (error) {
          alert("로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.")
        }
      })
    }

    const logoutBtn = document.getElementById("authLogoutBtn")
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        try {
          await window.JH_SUPABASE.signOut()
          window.location.reload()
        } catch (error) {
          alert("로그아웃에 실패했습니다. 잠시 후 다시 시도해 주세요.")
        }
      })
    }
  }

  const boot = async () => {
    const writerEmail =
      window.JH_SUPABASE?.getSupabaseConfig?.()?.writerEmail || ""

    // Supabase 로딩 자체가 실패할 수 있으므로(네트워크), 실패 시에는 게스트 UI로 유지합니다.
    try {
      const session = await window.JH_SUPABASE.getSession()
      render({ session, writerEmail })
    } catch (error) {
      render({ session: null, writerEmail })
    }
  }

  boot()
})()

