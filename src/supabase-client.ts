/**
 * Supabase 클라이언트 헬퍼를 브라우저에서 초기화합니다.
 *
 * - CDN ESM import로 @supabase/supabase-js를 로드합니다.
 * - 기존 정적 스크립트가 window.JH_SUPABASE를 참조하므로 동일한 API를 제공합니다.
 */
import { supabaseRuntimeConfig } from './supabase-runtime'

const loadSupabaseLibrary = async () => {
  if (window.__JH_SUPABASE_LIB) {
    return window.__JH_SUPABASE_LIB
  }

  const lib = await import('https://esm.sh/@supabase/supabase-js@2.49.1')
  window.__JH_SUPABASE_LIB = lib
  return lib
}

const getSupabaseConfig = () => {
  return {
    url: supabaseRuntimeConfig.url,
    anonKey: supabaseRuntimeConfig.anonKey,
    writerEmail: supabaseRuntimeConfig.writerEmail,
  }
}

const getSupabaseClient = async () => {
  if (window.__JH_SUPABASE_CLIENT) {
    return window.__JH_SUPABASE_CLIENT
  }

  const { url, anonKey } = getSupabaseConfig()
  if (!url || !anonKey) {
    throw new Error('Supabase 설정이 비어 있습니다. Vite env를 확인하세요.')
  }

  const { createClient } = await loadSupabaseLibrary()
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

const isWriter = (session: { user?: { email?: string } } | null) => {
  const { writerEmail } = getSupabaseConfig()
  const email = session?.user?.email || ''
  return email.toLowerCase() === writerEmail.toLowerCase()
}

const signInWithGoogle = async ({ returnTo }: { returnTo?: string } = {}) => {
  const client = await getSupabaseClient()
  const origin = window.location.origin
  const callbackUrl = `${origin}/#/auth/callback`

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
