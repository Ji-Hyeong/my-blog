/**
 * Supabase 런타임 설정을 전역으로 주입합니다.
 *
 * - Vite 환경변수에서 값을 읽어 window.JH_SUPABASE_CONFIG에 저장합니다.
 * - legacy 스크립트(data-loader/legacy/*)가 동일한 경로로 설정을 참조할 수 있게 합니다.
 */
type SupabaseRuntimeConfig = {
  url: string
  anonKey: string
  writerEmail: string
  siteUrl: string
}

const config: SupabaseRuntimeConfig = {
  url: (import.meta.env.VITE_SUPABASE_URL || '').trim(),
  anonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim(),
  writerEmail: (import.meta.env.VITE_WRITER_EMAIL || '').trim(),
  siteUrl: (import.meta.env.VITE_SITE_URL || '').trim(),
}

if (!config.url || !config.anonKey) {
  console.warn('[supabase] 설정이 비어 있습니다. VITE_SUPABASE_URL/ANON_KEY를 확인하세요.')
}

if (!config.writerEmail) {
  console.warn('[supabase] writer email이 비어 있습니다. VITE_WRITER_EMAIL을 확인하세요.')
}

if (!config.siteUrl) {
  console.warn('[supabase] site url이 비어 있습니다. VITE_SITE_URL을 확인하세요.')
}

window.JH_SUPABASE_CONFIG = config

export const supabaseRuntimeConfig = config
