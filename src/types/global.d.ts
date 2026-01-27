import type { Session, SupabaseClient } from '@supabase/supabase-js'

export {}

declare global {
  interface Window {
    JH_SUPABASE_CONFIG?: {
      url?: string
      anonKey?: string
      writerEmail?: string
      siteUrl?: string
    }
    JH_SUPABASE?: {
      getSupabaseConfig?: () => {
        url?: string
        anonKey?: string
        writerEmail?: string
        siteUrl?: string
      }
      getSupabaseClient?: () => Promise<SupabaseClient>
      getSession?: () => Promise<Session | null>
      isWriter?: (session: Session | null) => boolean
      signInWithGoogle?: (options?: { returnTo?: string }) => Promise<void>
      signOut?: () => Promise<void>
    }
    JH_DATA?: {
      loadProfile?: () => Promise<unknown>
    }
    /**
     * 전역 Supabase 클라이언트 캐시입니다.
     *
     * - 동일한 브라우저 세션에서 클라이언트를 한 번만 생성하도록 보장합니다.
     * - 타입을 명시해 `unknown` 전파로 인한 빌드 실패를 방지합니다.
     */
    __JH_SUPABASE_CLIENT?: SupabaseClient
  }
}
