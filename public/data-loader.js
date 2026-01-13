/*
  Data loader (profile/targets).

  목표:
  - 정적 웹(GitHub Pages)에서 데이터 소스를 유연하게 전환합니다.
  - “Supabase 우선”으로 읽되, 아직 마이그레이션 전/장애 상황에서도 화면이 깨지지 않게
    기존 소스(API 또는 정적 JSON)로 폴백합니다.

  현재 지원하는 데이터 소스(우선순위):
  1) Supabase DB (정규화 B-라이트 스키마)
  2) 기존 API(`/api/profile`, `/api/targets`)
  3) 정적 JSON(`/data/profile.json`, `/data/targets.json`)

  주의:
  - Supabase anon key는 공개 키이며, 실제 보안은 RLS 정책으로 강제합니다.
  - 로컬/배포 모두 동일한 코드를 사용하므로, 네트워크/권한 실패를 “정상 경로”로 간주하고
    친절하게 폴백하도록 구현합니다.
*/
(() => {
  /**
   * Supabase 응답이 느릴 때 폴백으로 전환하기 위한 제한 시간(ms)입니다.
   *
   * - 3초 안에 응답이 없으면 기본(폴백) 데이터를 즉시 사용합니다.
   */
  const SUPABASE_TIMEOUT_MS = 3000

  /**
   * JSON을 안전하게 fetch합니다.
   *
   * - fetch는 404/500이어도 throw하지 않으므로, status를 확인해 명시적으로 실패 처리합니다.
   * - 캐시로 인해 변경이 늦게 보이는 문제를 줄이기 위해 no-cache를 사용합니다.
   */
  const fetchJsonOrThrow = async (url) => {
    const response = await fetch(url, { cache: "no-cache" })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} from ${url}`)
    }
    return response.json()
  }

  /**
   * Supabase client가 준비되었는지 확인합니다.
   *
   * - supabase.js는 CDN ESM import를 사용하므로, 네트워크 정책/광고 차단 등에 의해 실패할 수 있습니다.
   * - 실패 시에는 기존 API/정적 JSON로 폴백합니다.
   */
  const isSupabaseReady = () =>
    Boolean(window.JH_SUPABASE?.getSupabaseClient && window.JH_SUPABASE?.getSession)

  /**
   * 데이터 로딩 상태를 전역 이벤트로 브로드캐스트합니다.
   *
   * - React 쉘에서 로딩 바/배너를 표시하는 데 사용합니다.
   */
  const notifyLoading = (key, state) => {
    window.dispatchEvent(
      new CustomEvent("jh-data-loading", {
        detail: { key, state },
      })
    )
  }

  /**
   * 지정 시간 안에 완료되지 않으면 타임아웃 에러로 처리합니다.
   *
   * - Supabase 호출 지연 시 빠르게 폴백 경로로 전환하기 위해 사용합니다.
   */
  const withTimeout = (promise, timeoutMs) =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const error = new Error("Supabase timeout")
        error.name = "TimeoutError"
        reject(error)
      }, timeoutMs)

      promise
        .then((value) => {
          clearTimeout(timer)
          resolve(value)
        })
        .catch((error) => {
          clearTimeout(timer)
          reject(error)
        })
    })

  /**
   * GitHub Pages에서 유니코드 파일명이 정규화(NFC/NFD) 차이로 404가 나는 이슈를 예방합니다.
   *
   * - 아이콘 경로가 한글 파일명일 때 ASCII 별칭으로 강제 매핑합니다.
   * - Supabase/정적 JSON 어디에서 오든 동일하게 동작하도록 공통 처리합니다.
   */
  const normalizeIconImagePath = (path) => {
    if (!path) {
      return path
    }
    const normalized = String(path)
    if (normalized.includes("유니크굿")) {
      return "logo/unique-good.jpg"
    }
    if (normalized.includes("아이아라")) {
      return "logo/aiara.png"
    }
    return normalized
  }

  /**
   * Supabase에서 “프로필 데이터(profile.json 형태)”를 구성합니다.
   *
   * - DB 스키마는 docs/supabase.md의 "이력/타겟 데이터 스키마"를 기준으로 합니다.
   * - 마이그레이션이 아직 안 된 경우(테이블/row 없음)에는 예외를 던져 폴백 경로로 이동합니다.
   */
  const loadProfileFromSupabase = async () => {
    if (!isSupabaseReady()) {
      throw new Error("Supabase not ready")
    }

    const client = await window.JH_SUPABASE.getSupabaseClient()

    // 1) site_profile 단일 row
    const { data: profileRow, error: profileError } = await client
      .from("site_profile")
      .select(
        "key,name,title,email,phone,location,links,summary,intro,achievements,skills,education,trainings"
      )
      .eq("key", "default")
      .maybeSingle()

    if (profileError || !profileRow) {
      throw profileError || new Error("site_profile is empty")
    }

    // 2) companies
    const { data: companies, error: companiesError } = await client
      .from("companies")
      .select("id,name,role,period,summary,icon_image,icon_text,sort_order")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })

    if (companiesError) {
      throw companiesError
    }

    const companyIds = (companies || []).map((item) => item.id)

    // 3) projects / initiatives
    const { data: projects, error: projectsError } = companyIds.length
      ? await client
          .from("projects")
          .select(
            "id,company_id,name,period,role,summary,impact,tags,details,tech,sort_order"
          )
          .in("company_id", companyIds)
          .order("sort_order", { ascending: true })
          .order("name", { ascending: true })
      : { data: [], error: null }

    if (projectsError) {
      throw projectsError
    }

    const { data: initiatives, error: initiativesError } = companyIds.length
      ? await client
          .from("initiatives")
          .select(
            "id,company_id,name,period,summary,impact,tags,details,tech,sort_order"
          )
          .in("company_id", companyIds)
          .order("sort_order", { ascending: true })
          .order("name", { ascending: true })
      : { data: [], error: null }

    if (initiativesError) {
      throw initiativesError
    }

    const projectsByCompany = new Map()
    ;(projects || []).forEach((project) => {
      const list = projectsByCompany.get(project.company_id) || []
      list.push({
        id: project.id,
        name: project.name,
        period: project.period,
        role: project.role,
        summary: project.summary,
        impact: project.impact,
        tags: Array.isArray(project.tags) ? project.tags : [],
        details: Array.isArray(project.details) ? project.details : [],
        tech: Array.isArray(project.tech) ? project.tech : [],
      })
      projectsByCompany.set(project.company_id, list)
    })

    const initiativesByCompany = new Map()
    ;(initiatives || []).forEach((item) => {
      const list = initiativesByCompany.get(item.company_id) || []
      list.push({
        id: item.id,
        name: item.name,
        period: item.period,
        role: item.role,
        summary: item.summary,
        impact: item.impact,
        tags: Array.isArray(item.tags) ? item.tags : [],
        details: Array.isArray(item.details) ? item.details : [],
        tech: Array.isArray(item.tech) ? item.tech : [],
      })
      initiativesByCompany.set(item.company_id, list)
    })

    /**
     * 프론트가 기대하는 profile.json 형태로 조립합니다.
     *
     * - 이 형태를 유지하면, 기존 Resume/Builder 렌더러를 크게 바꾸지 않고도 데이터 소스만 교체할 수 있습니다.
     */
    return {
      basics: {
        name: profileRow.name,
        title: profileRow.title,
        email: profileRow.email,
        phone: profileRow.phone,
        location: profileRow.location,
        links: Array.isArray(profileRow.links) ? profileRow.links : [],
      },
      summary: profileRow.summary,
      skills: Array.isArray(profileRow.skills) ? profileRow.skills : [],
      achievements: Array.isArray(profileRow.achievements)
        ? profileRow.achievements
        : [],
      education: Array.isArray(profileRow.education) ? profileRow.education : [],
      trainings: Array.isArray(profileRow.trainings) ? profileRow.trainings : [],
      companies: (companies || []).map((company) => ({
        id: company.id,
        name: company.name,
        role: company.role,
        period: company.period,
        summary: company.summary,
        projects: projectsByCompany.get(company.id) || [],
        initiatives: initiativesByCompany.get(company.id) || [],
        iconImage: normalizeIconImagePath(company.icon_image),
        iconText: company.icon_text,
      })),
      intro: profileRow.intro,
    }
  }

  /**
   * Supabase에서 targets 데이터를 가져옵니다.
   *
   * - targets는 작성자 전용 기능(맞춤 이력서)에서 사용하므로,
   *   allowlist(writer)만 읽을 수 있도록 RLS를 구성하는 것을 권장합니다.
   *
   * 반환 형태는 기존 `targets.json`과 동일하게 `{ targets: [...] }`입니다.
   */
  const loadTargetsFromSupabase = async () => {
    if (!isSupabaseReady()) {
      throw new Error("Supabase not ready")
    }

    const session = await window.JH_SUPABASE.getSession()
    if (!window.JH_SUPABASE.isWriter(session)) {
      throw new Error("Not writer")
    }

    const client = await window.JH_SUPABASE.getSupabaseClient()
    const { data, error } = await client
      .from("targets")
      .select("id,company,role,priority_tags,summary_hint,sort_order")
      .order("sort_order", { ascending: true })

    if (error) {
      throw error
    }

    return {
      targets: (data || []).map((item) => ({
        id: item.id,
        company: item.company,
        role: item.role,
        priorityTags: Array.isArray(item.priority_tags) ? item.priority_tags : [],
        summaryHint: item.summary_hint || "",
      })),
    }
  }

  /**
   * API 기본 URL을 계산합니다.
   *
   * - meta(name="api-base-url")가 있으면 해당 값을 사용합니다.
   * - 로컬 환경(localhost)에서는 기본값(8080)을 사용합니다.
   * - 배포 환경에서는 현재 오리진을 사용합니다.
   */
  const getApiBaseUrl = () => {
    const meta = document.querySelector('meta[name="api-base-url"]')
    const override = meta?.getAttribute('content')?.trim()
    if (override) {
      return override.replace(/\/$/, '')
    }

    const hostname = window.location.hostname
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'
    if (isLocalhost) {
      return 'http://localhost:8080'
    }

    return window.location.origin
  }

  /**
   * Profile 로딩: Supabase → API → 정적 JSON
   */
  const loadProfile = async () => {
    notifyLoading("profile", "start")
    try {
      // 1) Supabase (3초 타임아웃)
      try {
        return await withTimeout(loadProfileFromSupabase(), SUPABASE_TIMEOUT_MS)
      } catch (error) {
        // migration 전이거나 네트워크/권한/지연 문제일 수 있으므로 폴백합니다.
      }

      // 2) API
      const apiBaseUrl = getApiBaseUrl()
      try {
        return await fetchJsonOrThrow(`${apiBaseUrl}/api/profile`)
      } catch (error) {
        // continue
      }

      // 3) static
      return await fetchJsonOrThrow("/data/profile.json")
    } finally {
      notifyLoading("profile", "end")
    }
  }

  /**
   * Targets 로딩: Supabase(writer only) → API → 정적 JSON
   */
  const loadTargets = async () => {
    notifyLoading("targets", "start")
    try {
      // 1) Supabase(writer only, 3초 타임아웃)
      try {
        return await withTimeout(loadTargetsFromSupabase(), SUPABASE_TIMEOUT_MS)
      } catch (error) {
        // continue
      }

      // 2) API
      const apiBaseUrl = getApiBaseUrl()
      try {
        return await fetchJsonOrThrow(`${apiBaseUrl}/api/targets`)
      } catch (error) {
        // continue
      }

      // 3) static
      return await fetchJsonOrThrow("/data/targets.json")
    } finally {
      notifyLoading("targets", "end")
    }
  }

  window.JH_DATA = {
    fetchJsonOrThrow,
    loadProfile,
    loadTargets,
  }
})()
