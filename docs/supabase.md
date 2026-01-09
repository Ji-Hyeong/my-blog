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

---

# 이력/타겟 데이터 스키마 (정규화: B-라이트)

목표:
- 기존에 `apps/api/src/main/resources/data/*.json`으로 관리하던 데이터를 Supabase DB로 옮깁니다.
- 정적 웹(GitHub Pages)은 그대로 유지하면서, 데이터만 Supabase에서 동적으로 읽습니다.
- 공개 방문자는 “읽기만”, allowlist 계정만 “쓰기/수정”이 가능하도록 RLS로 강제합니다.

> 마이그레이션은 추후 진행할 수 있도록, 웹은 “Supabase 우선 → 없으면 기존 `/data/*.json` 폴백” 구조로 구현했습니다.

## 6) DB 테이블: `site_profile` (단일 row)

- 프로필/소개/스킬/학력 등 “페이지 상단에 그대로 쓰이는 정보”는 단일 row로 관리합니다.
- 정규화를 과하게 하면 초기 속도가 느려지므로, 배열성 데이터는 `jsonb`로 보관합니다.

```sql
create table if not exists public.site_profile (
  key text primary key,
  name text not null,
  title text not null,
  email text,
  phone text,
  location text,
  links jsonb not null default '[]'::jsonb,
  summary text,
  intro text,
  achievements text[] not null default '{}'::text[],
  skills jsonb not null default '[]'::jsonb,
  education jsonb not null default '[]'::jsonb,
  trainings jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists site_profile_set_updated_at on public.site_profile;
create trigger site_profile_set_updated_at
before update on public.site_profile
for each row execute function public.set_updated_at();
```

## 7) DB 테이블: `companies`, `projects`, `initiatives`

```sql
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  period text,
  summary text,
  icon_image text,
  icon_text text,
  sort_order int not null default 0
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  period text,
  role text,
  summary text,
  impact text,
  tags text[] not null default '{}'::text[],
  details text[] not null default '{}'::text[],
  tech text[] not null default '{}'::text[],
  sort_order int not null default 0
);

create table if not exists public.initiatives (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  period text,
  summary text,
  impact text,
  tags text[] not null default '{}'::text[],
  details text[] not null default '{}'::text[],
  tech text[] not null default '{}'::text[],
  sort_order int not null default 0
);
```

## 8) DB 테이블: `targets` (작성자 전용)

```sql
create table if not exists public.targets (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  role text not null,
  priority_tags text[] not null default '{}'::text[],
  summary_hint text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
```

## 9) RLS 정책(공개 읽기 + 작성자 쓰기)

allowlist 이메일: `wlgud30@gmail.com`

> 주의: 이 정책은 “최종 방어선”입니다. 프론트의 버튼 숨김/가드는 UX일 뿐입니다.

```sql
-- 공통: writer 판별 조건
-- (정책 안에서 반복 사용)
-- (auth.jwt()는 인증된 사용자만 값이 있고, 공개 방문자는 null입니다.)

-- site_profile
alter table public.site_profile enable row level security;

drop policy if exists site_profile_public_read on public.site_profile;
create policy site_profile_public_read
on public.site_profile
for select
using (true);

drop policy if exists site_profile_writer_write on public.site_profile;
create policy site_profile_writer_write
on public.site_profile
for all
using ((auth.jwt() ->> 'email') = 'wlgud30@gmail.com')
with check ((auth.jwt() ->> 'email') = 'wlgud30@gmail.com');

-- companies
alter table public.companies enable row level security;

drop policy if exists companies_public_read on public.companies;
create policy companies_public_read
on public.companies
for select
using (true);

drop policy if exists companies_writer_write on public.companies;
create policy companies_writer_write
on public.companies
for all
using ((auth.jwt() ->> 'email') = 'wlgud30@gmail.com')
with check ((auth.jwt() ->> 'email') = 'wlgud30@gmail.com');

-- projects
alter table public.projects enable row level security;

drop policy if exists projects_public_read on public.projects;
create policy projects_public_read
on public.projects
for select
using (true);

drop policy if exists projects_writer_write on public.projects;
create policy projects_writer_write
on public.projects
for all
using ((auth.jwt() ->> 'email') = 'wlgud30@gmail.com')
with check ((auth.jwt() ->> 'email') = 'wlgud30@gmail.com');

-- initiatives
alter table public.initiatives enable row level security;

drop policy if exists initiatives_public_read on public.initiatives;
create policy initiatives_public_read
on public.initiatives
for select
using (true);

drop policy if exists initiatives_writer_write on public.initiatives;
create policy initiatives_writer_write
on public.initiatives
for all
using ((auth.jwt() ->> 'email') = 'wlgud30@gmail.com')
with check ((auth.jwt() ->> 'email') = 'wlgud30@gmail.com');

-- targets: 작성자만 읽고/쓰기
alter table public.targets enable row level security;

drop policy if exists targets_writer_read on public.targets;
create policy targets_writer_read
on public.targets
for select
using ((auth.jwt() ->> 'email') = 'wlgud30@gmail.com');

drop policy if exists targets_writer_write on public.targets;
create policy targets_writer_write
on public.targets
for all
using ((auth.jwt() ->> 'email') = 'wlgud30@gmail.com')
with check ((auth.jwt() ->> 'email') = 'wlgud30@gmail.com');
```

