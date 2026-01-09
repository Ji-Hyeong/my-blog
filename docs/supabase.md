# Supabase 설정 가이드 (로그인 + Posts CRUD)

목표:
- 정적 사이트(GitHub Pages)에서 Google 로그인 + 글(Post) CRUD를 제공합니다.
- 비용을 최소화하기 위해 별도 API 서버 없이 Supabase(Auth + DB + RLS)로 구현합니다.

## 1) Supabase Auth (Google OAuth)

### Google Provider 활성화
1. Supabase Dashboard → **Authentication** → **Providers** → **Google** 활성화
2. Google Cloud Console에서 OAuth Client 생성 후 Client ID/Secret 설정

### Redirect URL 등록(중요)
정적 사이트는 callback 페이지로 돌아오도록 구성했습니다.

- 배포: `https://blog.jihyeong.com/auth/callback.html`
- 로컬: `http://localhost:8000/auth/callback.html`

Supabase Dashboard → Authentication → URL Configuration(또는 Providers 설정)에서
위 URL들이 허용되도록 등록하세요.

## 2) DB 테이블: `posts`

아래 SQL을 Supabase Dashboard → **SQL Editor**에서 실행합니다.

> 주의: 이 프로젝트는 “이메일 allowlist(1명)”가 writer이므로, 정책에서 이메일을 직접 비교합니다.

```sql
-- posts 테이블
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text,
  excerpt text,
  content text,
  published boolean not null default false,
  published_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at 자동 갱신 트리거
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
before update on public.posts
for each row execute function public.set_updated_at();
```

## 3) RLS 정책(핵심)

정책 목표:
- **읽기(select)**:
  - 공개 방문자: `published = true`만 조회 가능
  - writer: 전체(초안 포함) 조회 가능
- **쓰기(insert/update/delete)**:
  - writer(allowlist 이메일)만 가능

```sql
alter table public.posts enable row level security;

-- 공개 읽기: published 글만
drop policy if exists posts_public_read on public.posts;
create policy posts_public_read
on public.posts
for select
using (published = true);

-- 작성자 읽기: 전체
drop policy if exists posts_writer_read on public.posts;
create policy posts_writer_read
on public.posts
for select
using ((auth.jwt() ->> 'email') = 'wlgud30@gmail.com');

-- 작성자 쓰기: insert
drop policy if exists posts_writer_insert on public.posts;
create policy posts_writer_insert
on public.posts
for insert
with check ((auth.jwt() ->> 'email') = 'wlgud30@gmail.com');

-- 작성자 쓰기: update
drop policy if exists posts_writer_update on public.posts;
create policy posts_writer_update
on public.posts
for update
using ((auth.jwt() ->> 'email') = 'wlgud30@gmail.com')
with check ((auth.jwt() ->> 'email') = 'wlgud30@gmail.com');

-- 작성자 쓰기: delete
drop policy if exists posts_writer_delete on public.posts;
create policy posts_writer_delete
on public.posts
for delete
using ((auth.jwt() ->> 'email') = 'wlgud30@gmail.com');
```

## 4) 프론트 코드 위치

- Supabase 클라이언트: `apps/web/assets/supabase.js`
- 상단 로그인 UI: `apps/web/assets/auth.js`
- 글 목록/CRUD: `apps/web/assets/blog.js`, `apps/web/blog.html`
- 글 상세: `apps/web/assets/post.js`, `apps/web/post.html`
- OAuth 콜백: `apps/web/auth/callback.html`

## 5) 로컬 확인

GitHub Pages와 동일한 방식으로 확인하려면:

```bash
cd apps/web
python3 -m http.server 8000
```

그 다음 `http://localhost:8000`에서 확인합니다.

