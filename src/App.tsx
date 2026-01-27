/**
 * SPA shell for jh-blog.
 *
 * - Hash routing is used to keep GitHub Pages deployment simple.
 * - Legacy page scripts (home/resume/blog/builder/post) are loaded on demand.
 * - Supabase session is used to show/hide writer-only tabs.
 */
import { useEffect, useMemo, useState, type FC, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'

type RouteName =
  | 'home'
  | 'resume'
  | 'portfolio'
  | 'builder'
  | 'blog'
  | 'post'
  | 'auth-callback'
  | 'not-found'

type RouteState = {
  name: RouteName
  slug?: string
}

type ProfileLink = {
  label?: string
  url?: string
}

type ProfileData = {
  basics?: {
    links?: ProfileLink[]
  }
}

const parseRoute = (): RouteState => {
  const raw = window.location.hash.replace(/^#/, '')
  const clean = raw || '/'
  const parts = clean.replace(/^\//, '').split('/').filter(Boolean)

  if (!parts.length) {
    return { name: 'home' }
  }

  if (parts[0] === 'resume') {
    return { name: 'resume' }
  }
  if (parts[0] === 'portfolio') {
    return { name: 'portfolio' }
  }
  if (parts[0] === 'builder') {
    return { name: 'builder' }
  }
  if (parts[0] === 'blog') {
    return { name: 'blog' }
  }
  if (parts[0] === 'post' && parts[1]) {
    return { name: 'post', slug: parts[1] }
  }
  if (parts[0] === 'auth' && parts[1] === 'callback') {
    return { name: 'auth-callback' }
  }

  return { name: 'not-found' }
}

const useHashRoute = () => {
  const [route, setRoute] = useState<RouteState>(() => parseRoute())

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseRoute())
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return route
}

const useSupabaseSession = () => {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadSession = async () => {
      try {
        if (!window.JH_SUPABASE?.getSession) {
          if (isMounted) {
            setSession(null)
            setLoading(false)
          }
          return
        }

        const nextSession = await window.JH_SUPABASE.getSession()
        if (isMounted) {
          setSession(nextSession)
          setLoading(false)
        }
      } catch (error) {
        if (isMounted) {
          setSession(null)
          setLoading(false)
        }
      }
    }

    loadSession()

    return () => {
      isMounted = false
    }
  }, [])

  const isWriter = useMemo(() => {
    return window.JH_SUPABASE?.isWriter?.(session) ?? false
  }, [session])

  return { session, isWriter, loading, refresh: () => setSession(session) }
}

const useGithubUrl = () => {
  const [url, setUrl] = useState('')

  useEffect(() => {
    let isMounted = true

    const readMeta = () => {
      const meta = document.querySelector('meta[name="github-url"]')
      return meta?.getAttribute('content')?.trim() || ''
    }

    const resolveFromProfile = (profile: ProfileData) => {
      const links = Array.isArray(profile?.basics?.links) ? profile.basics.links : []
      const github = links.find((item) =>
        String(item.label || '').toLowerCase().includes('github')
      )
      return github?.url || ''
    }

    const load = async () => {
      const metaUrl = readMeta()
      if (metaUrl) {
        if (isMounted) {
          setUrl(metaUrl)
        }
        return
      }

      if (window.JH_DATA?.loadProfile) {
        try {
          const profile = (await window.JH_DATA.loadProfile()) as ProfileData
          // loadProfile는 내부 로더에서 스키마를 보장하므로, 여기서는 타입 단언으로 사용합니다.
          const nextUrl = resolveFromProfile(profile)
          if (isMounted) {
            setUrl(nextUrl)
          }
        } catch (error) {
          if (isMounted) {
            setUrl('')
          }
        }
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [])

  return url
}

const useDataLoading = () => {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let pending = 0

    /**
     * data-loader.js에서 발생시키는 전역 로딩 이벤트를 수집합니다.
     *
     * - 여러 데이터 요청이 겹쳐도 카운트를 통해 로딩 상태를 안정적으로 유지합니다.
     */
    const handleLoading = (event: Event) => {
      const detail = (event as CustomEvent<{ state?: string }>).detail || {}
      if (detail.state === 'start') {
        pending += 1
      }
      if (detail.state === 'end') {
        pending = Math.max(0, pending - 1)
      }
      setIsLoading(pending > 0)
    }

    window.addEventListener('jh-data-loading', handleLoading as EventListener)

    return () => {
      window.removeEventListener('jh-data-loading', handleLoading as EventListener)
    }
  }, [])

  return isLoading
}

const useLegacyScript = (src: string, enabled = true) => {
  useEffect(() => {
    if (!enabled) {
      return undefined
    }

    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.dataset.legacy = src
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [src, enabled])
}

const Reveal: FC<{ delay?: number; children: ReactNode }> = ({
  delay,
  children,
}) => {
  return (
    <div className="reveal" style={delay ? { animationDelay: `${delay}s` } : undefined}>
      {children}
    </div>
  )
}

const Header: FC<{
  isWriter: boolean
  session: unknown
  githubUrl: string
  activeRoute: RouteName
}> = ({ isWriter, session, githubUrl, activeRoute }) => {
  const email = (session as { user?: { email?: string } } | null)?.user?.email || ''

  const handleLogin = async () => {
    if (!window.JH_SUPABASE?.signInWithGoogle) {
      return
    }

    await window.JH_SUPABASE.signInWithGoogle({
      returnTo: `${window.location.pathname}${window.location.search}${window.location.hash}`,
    })
  }

  const handleLogout = async () => {
    if (!window.JH_SUPABASE?.signOut) {
      return
    }

    await window.JH_SUPABASE.signOut()
    window.location.reload()
  }

  const authLabel = session ? (isWriter ? `관리자 · ${email}` : `로그인됨 · ${email}`) : '게스트'
  // 현재 라우트와 일치하는 탭에 강조 스타일을 적용합니다.
  const isActive = (name: RouteName) => (activeRoute === name ? 'is-active' : '')

  return (
    <header className="site-header">
      <div className="container nav-row">
        <div className="brand">JH · Backend</div>
        <nav className="nav-links">
          <a className={`nav-link ${isActive('home')}`} href="#/">
            소개
          </a>
          <a className={`nav-link ${isActive('resume')}`} href="#/resume">
            이력서
          </a>
          <a className={`nav-link ${isActive('portfolio')}`} href="#/portfolio">
            포트폴리오
          </a>
          {isWriter && (
            <a className={`nav-link ${isActive('builder')}`} href="#/builder">
              맞춤
            </a>
          )}
          {isWriter && (
            <a className={`nav-link ${isActive('blog')}`} href="#/blog">
              기록
            </a>
          )}
        </nav>
        <div className="header-actions">
          {githubUrl ? (
            <a
              className="header-icon"
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2c-5.52 0-10 4.58-10 10.23 0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.48l-.01-1.7c-2.78.62-3.36-1.1-3.36-1.1-.45-1.18-1.1-1.49-1.1-1.49-.9-.63.07-.62.07-.62 1 .07 1.52 1.06 1.52 1.06.9 1.58 2.36 1.12 2.94.86.1-.68.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.74-.1-.26-.45-1.31.1-2.74 0 0 .84-.27 2.75 1.05a9.3 9.3 0 0 1 5 0c1.9-1.32 2.75-1.05 2.75-1.05.55 1.43.2 2.48.1 2.74.64.7 1.03 1.62 1.03 2.74 0 3.93-2.35 4.8-4.59 5.06.36.32.68.95.68 1.92l-.01 2.84c0 .26.18.58.69.48 3.96-1.35 6.83-5.18 6.83-9.7C22 6.58 17.52 2 12 2z" />
              </svg>
            </a>
          ) : null}
          <div className="auth-area" id="authArea">
            <div className="auth-row">
              <span className="auth-status">{authLabel}</span>
              {session ? (
                <button className="auth-btn" type="button" onClick={handleLogout}>
                  로그아웃
                </button>
              ) : (
                <button className="auth-btn" type="button" onClick={handleLogin}>
                  Google 로그인
                </button>
              )}
            </div>
            {session && !isWriter ? (
              <div className="auth-hint">작성 기능은 allowlist 계정만 사용할 수 있습니다.</div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container footer-row"></div>
    </footer>
  )
}

const HomePage = () => {
  useLegacyScript('/legacy/home.js')

  return (
    <main className="container hero">
      <section className="hero-content">
        <Reveal delay={0.05}>
          <p className="eyebrow" id="homeEyebrow">
            Profile
          </p>
          <h1 className="hero-title" id="homeTitle">
            강지형
            <span className="hero-subtitle accent">Backend Engineer</span>
          </h1>
          <p className="hero-body" id="homeSummary">
            대규모 트래픽 환경에서 안정성을 지키고, 수치 기반 개선을 반복해 온 백엔드 엔지니어입니다.
          </p>
        </Reveal>
      </section>

      <aside className="hero-panel">
        <Reveal delay={0.1}>
          <div className="card hero-card">
            <p className="eyebrow">Highlights</p>
            <h2 className="hero-panel-title">핵심 임팩트 요약</h2>
            <ul className="hero-list" id="homeHighlights">
              <li>성과 데이터를 준비 중입니다.</li>
            </ul>
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="card hero-card">
            <p className="eyebrow">Focus</p>
            <p className="hero-panel-body" id="homeFocus">
              운영 안정성과 비용 효율, 그리고 팀 생산성 개선에 집중하고 있습니다.
            </p>
            <div className="hero-tags" id="homeStack"></div>
          </div>
        </Reveal>
      </aside>
    </main>
  )
}

const ResumePage = () => {
  useLegacyScript('/legacy/resume.js')

  return (
    <main className="container page">
      <section id="resume" className="section reveal" data-delay="0.1"></section>
    </main>
  )
}

const PortfolioPage = () => {
  useLegacyScript('/legacy/resume.js')

  return (
    <main className="container page">
      <section className="section reveal" data-delay="0.05">
        <h1 className="page-title">포트폴리오</h1>
        <p className="page-desc">
          이력서보다 프로젝트 맥락과 의사결정을 더 길고 구체적으로 설명하는 뷰입니다.
        </p>
      </section>
      {/* 레거시 이력서 렌더러가 #resume 루트를 기준으로 동작하므로 동일한 루트를 재사용합니다. */}
      <section id="resume" className="section reveal" data-delay="0.1"></section>
    </main>
  )
}

const RequireWriter: FC<{ isWriter: boolean; children: ReactNode }> = ({
  isWriter,
  children,
}) => {
  if (isWriter) {
    return <>{children}</>
  }

  return (
    <main className="container page">
      <Reveal delay={0.05}>
        <div className="card">
          <h2>접근 제한</h2>
          <p>이 기능은 로그인한 작성자 계정만 사용할 수 있습니다.</p>
        </div>
      </Reveal>
    </main>
  )
}

const BuilderPage: FC<{ isWriter: boolean }> = ({ isWriter }) => {
  useLegacyScript('/legacy/builder.js', isWriter)

  return (
    <RequireWriter isWriter={isWriter}>
      <main className="container page">
        <Reveal delay={0.05}>
          <p className="eyebrow print-hide">Tailored Resume</p>
          <h1 className="page-title print-hide">맞춤 이력서</h1>
          <p className="page-desc print-hide">
            지원 역할에 맞춰 키워드를 입력하고, 프로젝트/개선 항목을 골라 포지션 중심의 PDF로
            정리합니다.
          </p>
        </Reveal>

        <section className="builder-controls section reveal" data-delay="0.1">
          <div className="hero-actions">
            <button className="button primary" id="autoSelect" type="button">
              추천 항목 자동 선택
            </button>
            <button className="button ghost" id="resetSelect" type="button">
              선택 초기화
            </button>
            <button className="button ghost" id="exportPdf" type="button">
              PDF로 출력
            </button>
          </div>
        </section>

        <section className="builder-grid section reveal" data-delay="0.15">
          <aside className="panel" aria-label="Target panel">
            <h3>지원 회사 정보</h3>
            <div className="field">
              <label htmlFor="targetSelect">미리 정의된 타겟</label>
              <select id="targetSelect"></select>
            </div>
            <div className="field">
              <label htmlFor="companyName">회사명</label>
              <input id="companyName" type="text" placeholder="예: 토스, 네이버" />
            </div>
            <div className="field">
              <label htmlFor="roleName">포지션</label>
              <input id="roleName" type="text" placeholder="예: Backend Engineer" />
            </div>
            <div className="field">
              <label htmlFor="priorityTags">핵심 키워드</label>
              <textarea id="priorityTags" rows={4} placeholder="예: 결제, 대규모 트래픽, 멀티테넌트"></textarea>
            </div>
            <p className="print-hide">키워드를 쉼표로 구분해두면 선택이 편해집니다.</p>
          </aside>

          <section className="panel" aria-label="Selectable list">
            <h3>선택 항목</h3>
            <div id="experienceList"></div>
            <div id="projectList"></div>
            <div id="initiativeList"></div>
          </section>

          <section className="preview print-sheet" id="preview" aria-label="Preview">
            <header className="print-header">
              <div className="print-identity">
                <h2 id="printName">맞춤 이력서</h2>
                <p id="printTitle"></p>
                <p id="printSummary"></p>
              </div>
              <div className="print-contact" id="printContact"></div>
            </header>

            <section className="print-section">
              <h3>소개</h3>
              <div id="printIntro"></div>
            </section>

            <section className="print-section">
              <h3>기술 스택</h3>
              <div id="printSkills"></div>
            </section>

            <section className="print-section">
              <h3>경력</h3>
              <div id="printExperience"></div>
            </section>

            <section className="print-section">
              <h3>프로젝트</h3>
              <div id="printProjects"></div>
            </section>

            <section className="print-section">
              <h3>개선/표준화</h3>
              <div id="printInitiatives"></div>
            </section>

            <section className="print-section">
              <h3>학력</h3>
              <div id="printEducation"></div>
            </section>

            <section className="print-section">
              <h3>교육/대외활동</h3>
              <div id="printTrainings"></div>
            </section>

            <footer className="print-footer" id="printFooter"></footer>
          </section>
        </section>
      </main>
    </RequireWriter>
  )
}

const BlogPage: FC<{ isWriter: boolean }> = ({ isWriter }) => {
  useLegacyScript('/legacy/blog.js', isWriter)

  return (
    <RequireWriter isWriter={isWriter}>
      <main className="container page">
        <Reveal delay={0.05}>
          <p className="eyebrow">Notes</p>
          <h1 className="page-title">기록</h1>
          <p className="page-desc">
            작업/학습/회고를 짧게 남기는 공간입니다. 나중에 다시 꺼내 쓸 수 있는 기록에 집중합니다.
          </p>
        </Reveal>

        <section className="section reveal" data-delay="0.08" id="writerControls" style={{ display: 'none' }}>
          <div className="card">
            <h3>글 관리(작성자 전용)</h3>
            <p className="page-desc">
              새 글을 작성하거나 기존 글을 수정/삭제할 수 있습니다. 공개 범위는
              <code> published</code>로 제어합니다.
            </p>
            <form id="postForm" className="section" autoComplete="off">
              <div className="field">
                <label htmlFor="postSlug">슬러그</label>
                <input id="postSlug" type="text" placeholder="예: payment-retry-outbox" />
              </div>
              <div className="field">
                <label htmlFor="postTitle">제목</label>
                <input id="postTitle" type="text" placeholder="제목" />
              </div>
              <div className="field">
                <label htmlFor="postCategory">카테고리</label>
                <input id="postCategory" type="text" placeholder="예: Engineering" />
              </div>
              <div className="field">
                <label htmlFor="postDate">작성일</label>
                <input id="postDate" type="date" />
              </div>
              <div className="field">
                <label htmlFor="postExcerpt">요약</label>
                <input id="postExcerpt" type="text" placeholder="카드에 보일 짧은 소개" />
              </div>
              <div className="field">
                <label htmlFor="postContent">본문</label>
                <textarea id="postContent" rows={10} placeholder="본문(plain text 또는 markdown)"></textarea>
              </div>
              <div className="field">
                <label>
                  <input id="postPublished" type="checkbox" /> 공개
                </label>
              </div>
              <div className="hero-actions">
                <button className="button primary" type="submit">
                  저장
                </button>
                <button className="button ghost" type="button" id="postReset">
                  초기화
                </button>
              </div>
              <p className="home-muted" id="postStatus" style={{ marginTop: 10 }}></p>
            </form>
          </div>
        </section>

        <section className="blog-grid section reveal" data-delay="0.1" id="blogList"></section>
      </main>
    </RequireWriter>
  )
}

const PostPage = () => {
  useLegacyScript('/legacy/post.js')

  return (
    <main className="container page">
      <Reveal delay={0.05}>
        <a className="button ghost" href="#/blog">
          ← 목록으로
        </a>
        <h1 className="page-title" id="postTitle" style={{ marginTop: 16 }}>
          글
        </h1>
        <p className="page-desc" id="postMeta"></p>
      </Reveal>

      <section className="section reveal" data-delay="0.1" id="postBody"></section>
    </main>
  )
}

const AuthCallbackPage = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    /**
     * hash 라우팅에서 query가 포함될 수 있어 URL과 hash를 모두 파싱합니다.
     */
    const readAuthCode = () => {
      const url = new URL(window.location.href)
      const directCode = url.searchParams.get('code')
      if (directCode) {
        return directCode
      }

      const hash = window.location.hash || ''
      const queryIndex = hash.indexOf('?')
      if (queryIndex === -1) {
        return null
      }
      const query = hash.slice(queryIndex + 1)
      const params = new URLSearchParams(query)
      return params.get('code')
    }

    /**
     * returnTo가 다른 오리진이면 무시하고 현재 사이트로 복귀합니다.
     */
    const resolveReturnTo = () => {
      const fallback = '/#/'
      const raw = localStorage.getItem('jh_return_to') || ''
      if (!raw) {
        return fallback
      }
      if (raw.startsWith('#')) {
        return `/${raw}`
      }
      if (raw.startsWith('/')) {
        return raw
      }

      try {
        const parsed = new URL(raw)
        if (parsed.origin === window.location.origin) {
          return `${parsed.pathname}${parsed.search}${parsed.hash}`
        }
      } catch (error) {
        // ignore parse errors
      }

      return fallback
    }

    const handleCallback = async () => {
      try {
        if (!window.JH_SUPABASE?.getSupabaseClient) {
          throw new Error('Supabase client가 준비되지 않았습니다.')
        }

        const client = await window.JH_SUPABASE.getSupabaseClient()
        const code = readAuthCode()

        if (code) {
          await client.auth.exchangeCodeForSession(code)
        }

        // v2 auth 클라이언트에는 getSessionFromUrl이 없으므로 exchangeCodeForSession으로 충분합니다.
        const { data } = await client.auth.getSession()
        const session = data?.session || null

        if (!session) {
          throw new Error('로그인 세션을 확인하지 못했습니다.')
        }

        localStorage.removeItem('jh_return_to')
        window.location.replace(resolveReturnTo())
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            '로그인 처리에 실패했습니다. 새로고침 후 다시 시도해 주세요.'
          )
        }
      }
    }

    handleCallback()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <main className="container page">
      <div className="card">
        <h2>로그인 처리 중…</h2>
        <p className="page-desc">잠시만 기다려 주세요.</p>
        {errorMessage ? <p className="page-desc">{errorMessage}</p> : null}
      </div>
    </main>
  )
}

const NotFoundPage = () => {
  return (
    <main className="container page">
      <Reveal delay={0.05}>
        <div className="card">
          <h2>페이지를 찾을 수 없습니다.</h2>
          <p>메뉴로 이동해 다시 선택해 주세요.</p>
        </div>
      </Reveal>
    </main>
  )
}

function App() {
  const route = useHashRoute()
  const { session, isWriter } = useSupabaseSession()
  const githubUrl = useGithubUrl()
  const dataLoading = useDataLoading()

  useEffect(() => {
    /**
     * 레거시 data-delay 속성을 읽어 reveal 애니메이션 지연을 적용합니다.
     *
     * - 정적 마크업을 React로 옮긴 뒤에도 동일한 모션 톤을 유지합니다.
     */
    document.querySelectorAll<HTMLElement>('.reveal').forEach((element) => {
      const delay = element.getAttribute('data-delay')
      if (delay) {
        element.style.animationDelay = `${delay}s`
      }
    })
  }, [route])

  // 상세 글 화면은 '기록' 탭을 활성 상태로 보여줍니다.
  const headerRoute: RouteName = route.name === 'post' ? 'blog' : route.name

  return (
    <>
      <Header isWriter={isWriter} session={session} githubUrl={githubUrl} activeRoute={headerRoute} />
      {dataLoading ? (
        <div className="loading-overlay" role="status" aria-live="polite">
          <div className="loading-spinner" aria-hidden="true" />
        </div>
      ) : null}
      <div className={`page-shell ${dataLoading ? 'is-loading' : ''}`}>
        {route.name === 'home' && <HomePage />}
        {route.name === 'resume' && <ResumePage />}
        {route.name === 'portfolio' && <PortfolioPage />}
        {route.name === 'builder' && <BuilderPage isWriter={isWriter} />}
        {route.name === 'blog' && <BlogPage isWriter={isWriter} />}
        {route.name === 'post' && <PostPage />}
        {route.name === 'auth-callback' && <AuthCallbackPage />}
        {route.name === 'not-found' && <NotFoundPage />}
      </div>
      <Footer />
    </>
  )
}

export default App
