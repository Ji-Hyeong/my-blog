/*
  Supabase runtime configuration.

  목적:
  - Supabase URL/anon key/writer email을 한 곳에서 관리합니다.
  - HTML meta를 반복 편집하지 않도록, 전역 설정 객체를 제공합니다.

  사용:
  - 각 HTML에서 supabase.js보다 먼저 이 파일을 로드해야 합니다.
  - 예: <script src="assets/supabase-config.js"></script>

  보안 메모:
  - anon key는 공개 가능한 publishable key입니다.
  - 실제 권한 제어는 Supabase RLS 정책으로 강제합니다.
*/
window.JH_SUPABASE_CONFIG = {
  // Supabase 프로젝트 URL
  url: "https://jsdpcrphulkjslifskmk.supabase.co",
  // Supabase publishable anon key
  anonKey: "sb_publishable_-qVYmvWIx-uZRQF0SsUxgw_llyMm96l",
  // allowlist 계정(관리자) 이메일
  writerEmail: "wlgud30@gmail.com",
}
