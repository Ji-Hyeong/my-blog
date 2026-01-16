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
      getSupabaseClient?: () => Promise<unknown>
      getSession?: () => Promise<unknown>
      isWriter?: (session: unknown) => boolean
      signInWithGoogle?: (options?: { returnTo?: string }) => Promise<void>
      signOut?: () => Promise<void>
    }
    JH_DATA?: {
      loadProfile?: () => Promise<unknown>
    }
    __JH_SUPABASE_LIB?: unknown
    __JH_SUPABASE_CLIENT?: unknown
  }
}
