/**
 * 현재는 “스캐폴딩이 정상 동작하는지” 확인하기 위한 최소 화면입니다.
 *
 * 이후 계획:
 * - API(apps/api)에서 글/문서 목록을 조회해 렌더링합니다.
 * - 문서 공개 범위(public/unlisted/private)에 따라 노출을 제어합니다.
 */
import { useEffect, useState } from 'react'
import './App.css'

type ApiHealthResponse = {
  status: string
  timestamp: string
}

function App() {
  /**
   * Vite 개발 서버에서 사용할 API 기본 URL입니다.
   *
   * - `.env.development`에서 주입되는 `VITE_API_BASE_URL`을 우선 사용합니다.
   * - 값이 없으면 로컬 기본값(8080)을 사용합니다.
   */
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8080'

  const [health, setHealth] = useState<ApiHealthResponse | null>(null)
  const [healthError, setHealthError] = useState<string | null>(null)

  useEffect(() => {
    /**
     * “프론트에서 백엔드를 호출해 데이터가 갱신된다”는 목표를 가장 단순하게 확인하기 위해,
     * 앱 시작 시 `GET /api/health`를 호출해 상태를 화면에 표시합니다.
     */
    const controller = new AbortController()

    fetch(`${apiBaseUrl}/api/health`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        return (await response.json()) as ApiHealthResponse
      })
      .then((data) => {
        setHealth(data)
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }
        setHealthError(error instanceof Error ? error.message : 'unknown error')
      })

    return () => controller.abort()
  }, [apiBaseUrl])

  return (
    <>
      <h1>jh-blog</h1>
      <p>TypeScript(Web) + Kotlin(Spring Boot API) 모노레포 스캐폴딩</p>

      <div className="card">
        <h2>API 상태</h2>
        <p>
          baseUrl: <code>{apiBaseUrl}</code>
        </p>
        {health ? (
          <p>
            <code>{health.status}</code> ({health.timestamp})
          </p>
        ) : healthError ? (
          <p>
            error: <code>{healthError}</code>
          </p>
        ) : (
          <p>loading...</p>
        )}
      </div>
    </>
  )
}

export default App
