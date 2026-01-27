/**
 * Supabase 클라이언트 헬퍼를 브라우저에서 초기화합니다.
 *
 * - 원격 CDN import는 TypeScript에서 타입을 `unknown`으로 전파시켜 빌드를 깨뜨리므로,
 *   npm 의존성(@supabase/supabase-js)으로 고정해 타입 안정성을 확보합니다.
 * - 기존 정적 스크립트가 window.JH_SUPABASE를 참조하므로 동일한 API를 제공합니다.
 */
import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js'
import { supabaseRuntimeConfig } from './supabase-runtime'

const getSupabaseConfig = () => {
  return {
    url: supabaseRuntimeConfig.url,
    anonKey: supabaseRuntimeConfig.anonKey,
    writerEmail: supabaseRuntimeConfig.writerEmail,
    siteUrl: supabaseRuntimeConfig.siteUrl,
  }
}

const getSupabaseClient = async (): Promise<SupabaseClient> => {
  const cachedClient = window.__JH_SUPABASE_CLIENT
  if (cachedClient) {
    return cachedClient
  }

  const { url, anonKey } = getSupabaseConfig()
  if (!url || !anonKey) {
    throw new Error('Supabase 설정이 비어 있습니다. Vite env를 확인하세요.')
  }

  // 타입이 명확한 로컬 의존성 createClient를 사용해 SupabaseClient를 생성합니다.
  const client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })

  window.__JH_SUPABASE_CLIENT = client
  return client
}

const getSession = async () => {
  const client = await getSupabaseClient()
  const { data } = await client.auth.getSession()
  return data.session || null
}

const isWriter = (session: Session | null) => {
  const { writerEmail } = getSupabaseConfig()
  const email = session?.user?.email || ''
  return email.toLowerCase() === writerEmail.toLowerCase()
}

const signInWithGoogle = async ({ returnTo }: { returnTo?: string } = {}) => {
  const client = await getSupabaseClient()
  const { siteUrl } = getSupabaseConfig()
  const origin = siteUrl || window.location.origin
  const callbackUrl = `${origin.replace(/\/$/, '')}/#/auth/callback`

  const fallbackReturnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`
  localStorage.setItem('jh_return_to', returnTo || fallbackReturnTo)

  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl,
    },
  })

  if (error) {
    throw error
  }
}

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

export { getSupabaseClient, getSupabaseConfig, getSession, isWriter }
