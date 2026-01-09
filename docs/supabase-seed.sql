-- Generated seed SQL for Supabase (jh blog)
-- Source: apps/api/src/main/resources/data/*.json
--
-- 목적:
-- - 현재 로컬 JSON 기반으로 관리하던 데이터를 Supabase DB로 옮길 때 사용할 "초기 적재 SQL"입니다.
-- - 마이그레이션 자동화(스크립트)는 추후로 미루고, 우선 이 파일을 Supabase SQL Editor에 붙여넣어 실행하면 됩니다.
--
-- 안전성:
-- - deterministic UUID(uuid5) + ON CONFLICT upsert를 사용해, 같은 파일을 여러 번 실행해도 중복 적재가 최소화됩니다.
-- - 단, 프로젝트 구조를 크게 바꿨다면(스키마 변경) 다시 생성하는 것을 권장합니다.
--
-- 주의(중요):
-- - 이 파일은 "데이터 적재"만 합니다. 테이블 생성/RLS는 `apps/docs/supabase.md`를 먼저 적용하세요.
-- - allowlist(writer) 권한은 RLS에서 강제해야 합니다.


-- Generated seed SQL for Supabase (jh blog)
-- Source: apps/api/src/main/resources/data/*.json
-- Safe: uses deterministic UUIDs and ON CONFLICT upserts

begin;

-- 1) site_profile (single row)
insert into public.site_profile (
  key, name, title, email, phone, location, links, summary, intro, achievements, skills, education, trainings
) values (
  'default', '강지형', 'Backend Engineer', 'wlgud30@gmail.com', '+82-10-2209-8728', 'Seoul, KR', '[{"label": "GitHub", "url": "https://github.com/Ji-Hyeong"}, {"label": "Blog", "url": "https://blog.jihyeong.com"}]'::jsonb, '저는 기술 탐구도 즐기되, 비즈니스에 필요한 기능을 최소 리소스로 빠르게 출시하고 운영 가능한 상태로 안착시키는 백엔드 엔지니어입니다. 문제를 빠르게 좁히고 리스크를 선제적으로 드러내며, 반복되는 운영 업무를 자동화·표준화해 팀의 시간을 확보합니다. 의사결정의 근거를 공유하고 우선순위를 정해 실행하며, 어려운 상황에서도 끝까지 방법을 찾아 결과와 재발 방지까지 책임집니다.', '저는 기술 탐구도 즐기되, 비즈니스에 필요한 기능을 최소한의 리소스로 빠르게 제품에 안착시키는 데 강점이 있는 백엔드 엔지니어입니다.
문제를 빠르게 좁히고 리스크를 선제적으로 드러내며, 운영 단계에서 반복되는 수동 작업을 자동화·표준화해 팀의 시간을 확보하는 일을 좋아합니다.
의사결정의 맥락과 근거를 명확히 공유하고, 타 직군의 관점까지 고려해 현실적인 우선순위를 정한 뒤 실행으로 연결합니다.
예상치 못한 제약이나 장애 상황에서도 가능한 선택지를 끝까지 찾아 결과를 만들고, 재발을 줄이는 방향으로 마무리합니다.
또한 기록과 문서화를 통해 조직이 신뢰할 수 있는 일관된 기준과 운영 가능한 시스템을 만드는 것을 중요하게 생각합니다.', ARRAY['결제 트래픽 3배 증가 구간에서 장애 없이 캠페인 운영', '팀 내 운영 가이드 문서화로 신규 인력 온보딩 기간 30% 단축']::text[], '[{"category": "Backend", "items": ["Kotlin", "Java", "Spring Boot", ".NET", "REST", "JPA", "Querydsl", "EF Core"]}, {"category": "Data", "items": ["PostgreSQL", "Redis", "Service Bus", "Mysql"]}, {"category": "Infra", "items": ["AWS", "Docker", "Azure"]}]'::jsonb, '[{"school": "배재대학교", "major": "컴퓨터공학과", "period": "2013.03 - 2014.08 (중퇴)"}, {"school": "한서고등학교", "major": "졸업", "period": "2010.03 - 2013.02"}]'::jsonb, '[{"name": "한경닷컴 IT 교육센터", "period": "2017.08 - 2018.02"}, {"name": "비트교육센터", "period": "2021.02 - 2021.08"}]'::jsonb
)
on conflict (key) do update set
  name = excluded.name,
  title = excluded.title,
  email = excluded.email,
  phone = excluded.phone,
  location = excluded.location,
  links = excluded.links,
  summary = excluded.summary,
  intro = excluded.intro,
  achievements = excluded.achievements,
  skills = excluded.skills,
  education = excluded.education,
  trainings = excluded.trainings;

-- 2) companies
insert into public.companies (id, name, role, period, summary, icon_image, icon_text, sort_order) values (
  '1a4b7c1e-5bad-5a05-a215-f5053edf4f09', '유니크굿컴퍼니', 'Backend Engineer', '2022.08 - Present', '백엔드 서비스 운영 및 신규 기능 개발', 'logo/유니크굿.jpg', 'UG', 0)
on conflict (id) do update set
  name = excluded.name,
  role = excluded.role,
  period = excluded.period,
  summary = excluded.summary,
  icon_image = excluded.icon_image,
  icon_text = excluded.icon_text,
  sort_order = excluded.sort_order;

insert into public.companies (id, name, role, period, summary, icon_image, icon_text, sort_order) values (
  '00ce27fb-e23e-5e4b-aa9e-21112d479cc9', '아이아라', 'Backend Developer', '2021.08 - 2022.04', 'SI 백엔드 파트 개발 (API 개발 및 DB 설계, CI/CD·인프라 구성)', 'logo/아이아라.png', 'IA', 0)
on conflict (id) do update set
  name = excluded.name,
  role = excluded.role,
  period = excluded.period,
  summary = excluded.summary,
  icon_image = excluded.icon_image,
  icon_text = excluded.icon_text,
  sort_order = excluded.sort_order;

insert into public.companies (id, name, role, period, summary, icon_image, icon_text, sort_order) values (
  '4add5b1e-c9f9-5448-90ee-8dd310a3680a', '테크앤아이코리아', 'Backend Engineer', '2018.04 - 2019.07', '하이브리드 웹앱 서버 개발', 'logo/techand-building.svg', 'TI', 0)
on conflict (id) do update set
  name = excluded.name,
  role = excluded.role,
  period = excluded.period,
  summary = excluded.summary,
  icon_image = excluded.icon_image,
  icon_text = excluded.icon_text,
  sort_order = excluded.sort_order;

-- 3) projects
insert into public.projects (id, company_id, name, period, role, summary, impact, tags, details, tech, sort_order) values (
  '3691851e-0131-5880-865a-b2a18d72b657', '1a4b7c1e-5bad-5a05-a215-f5053edf4f09', '리얼월드 스튜디오 요금제', '2025.11 - 2026.01', 'Backend Engineer', '기존에는 표면적으로 드러나지 않고, 제품적 제약/혜택이 없는 상태에서 커뮤니케이션만으로 요금제가 존재했습니다. 이미 기업/학교 교육 또는 행사에서 사용해야 할 경우에는 유료 요금제로 전환해야 했고, 반복 매출 확보와 운영 표준화를 위해 제품 내 요금제 도입이 필요하다고 판단해 무료 사용자에겐 약간의 제약을, 유료 사용자에겐 혜택을 주어 요금제를 도입하기로 했습니다.', '기존 결제 서버를 재활용해 2개월 내 출시 일정을 지켰고, 재시도/만료 알림을 비동기화해 운영 의존도를 낮췄습니다.', ARRAY['요금제', '구독', '빌링키', 'Outbox', 'Service Bus', '알림']::text[], ARRAY['빌링키 등록·구독 결제·예약 재시도·해지 플로우를 정리하고 중복 구독 가드를 적용했습니다.', 'Outbox → Service Bus 예약 메시지로 재시도/만료 알림 파이프라인을 구성하고 예약 취소/재등록 흐름을 정리했습니다.', '코어 알림 규칙(갱신 실패/만료/다운그레이드)과 어드민 API 연계를 맞춰 운영 기준을 통일했습니다.']::text[], '{}'::text[], 0)
on conflict (id) do update set
  company_id = excluded.company_id,
  name = excluded.name,
  period = excluded.period,
  role = excluded.role,
  summary = excluded.summary,
  impact = excluded.impact,
  tags = excluded.tags,
  details = excluded.details,
  tech = excluded.tech,
  sort_order = excluded.sort_order;

insert into public.projects (id, company_id, name, period, role, summary, impact, tags, details, tech, sort_order) values (
  '345d3065-155a-5e61-a358-1dc05521dd23', '1a4b7c1e-5bad-5a05-a215-f5053edf4f09', '리얼월드 스튜디오 AI 프로젝트', '2025.08 - 2025.10', 'Backend Engineer', '기존 스튜디오에서 게임 콘텐츠 제작은 스토리 작성부터 미션/퀘스트 구성, 필수 이미지 준비까지 수작업 비중이 커 제작 리드타임이 길었고, 크리에이터가 빠르게 “초안→수정→공개” 사이클을 돌리기 어려웠습니다. 또한 생성형 AI를 제품 기능으로 제공하려면 모델 호출 비용을 통제할 크레딧 정책, 생성 실패/지연 등 운영 이슈 대응, 그리고 생성 결과를 실제 게임 데이터(미션/퀘스트/아이템/액션)로 안정적으로 반영하는 백엔드 파이프라인이 필요했습니다.', '스토리·미션·퀘스트·이미지(및 선택 BGM)까지 자동 생성하는 “AI로 만들기” 경험을 제공해 제작 기간을 12일 → 1일 수준으로 단축할 수 있는 기반을 마련하고, 크레딧/실패 복구/로그 기반 운영 추적 흐름을 정착시켰습니다.', ARRAY['AI', '콘텐츠', '크레딧', '스튜디오', 'Bedrock', 'Orchestrator', '트랜잭션']::text[], ARRAY['Bedrock(Claude) 기반 템플릿/스토리 생성 파이프라인을 구축하고, 프롬프트 식별자/버전(AppSetting+캐시) 및 AiUseLog(토큰/메타/결과)로 추적 가능하게 정리했습니다.', '이미지/사운드 생성기를 연동해 대표 이미지·배경·미션 카드·서사/썸네일·아이템 아이콘 및 선택 BGM을 병렬 생성하고, 실패 시 크레딧 롤백/상태 업데이트/이벤트 발행까지 포함한 실패 처리 흐름을 구성했습니다.', '생성된 미션/퀘스트/아이템/ActionHandler를 DB에 저장한 뒤 임시 ID를 실제 PK로 매핑하고, 커맨드/조건 파라미터 및 HTML 콘텐츠 내 이미지 토큰을 후처리해 플레이 가능한 데이터 정합성을 맞췄습니다.']::text[], '{}'::text[], 1)
on conflict (id) do update set
  company_id = excluded.company_id,
  name = excluded.name,
  period = excluded.period,
  role = excluded.role,
  summary = excluded.summary,
  impact = excluded.impact,
  tags = excluded.tags,
  details = excluded.details,
  tech = excluded.tech,
  sort_order = excluded.sort_order;

insert into public.projects (id, company_id, name, period, role, summary, impact, tags, details, tech, sort_order) values (
  '7223265d-36b2-5598-ae06-7548cf726eff', '1a4b7c1e-5bad-5a05-a215-f5053edf4f09', 'TMS UIUX 개선', '2025.04 - 2025.06', 'Backend Engineer', '위치기반 오프라인 보물찾기 컨텐츠를 만들고 운영하는 담당자들이 사용하는 TMS는 기능이 늘어나며 캠페인/어드벤처/보물/퀴즈/리워드 등 정보가 흩어지고 용어도 혼용되어 제작 플로우가 복잡해졌습니다. 운영 실수와 수동 작업 의존도를 줄이기 위해 사용성 개선과 함께 데이터/상태 모델 및 검증 흐름을 백엔드에서 정리할 필요가 있었습니다.', 'Quartz 기반 상태 자동 전환을 도입해 운영 수동 작업을 줄이고, 제작·운영 플로우의 정합성을 높여 운영 효율을 개선했습니다.', ARRAY['TMS', '운영', '백오피스', '개편', 'Quartz', '스케줄링']::text[], ARRAY['TMS UI/UX 개선 프로젝트의 백엔드 전반(데이터 모델/검증/운영 플로우/API)을 담당해 캠페인 중심의 제작 하이어라키와 보물·퀴즈·리워드 설정 흐름을 안정적으로 지원했습니다.', '리워드 타입(뽑기/기프티쇼/교환권/할인권) 등 운영 제작 방식에 맞춰 입력/검증/관리 플로우를 정리하고, QA 피드백을 기반으로 제작 과정의 오류·누락을 줄이는 방향으로 보완했습니다.', '기존에는 행사 시작/종료 시점에 운영자가 수동으로 상태를 변경해야 했던 문제를 해결하기 위해 Quartz 스케줄링을 도입해 시작/종료 시간에 맞춰 캠페인 상태가 자동으로 전환되도록 개선했습니다.']::text[], '{}'::text[], 2)
on conflict (id) do update set
  company_id = excluded.company_id,
  name = excluded.name,
  period = excluded.period,
  role = excluded.role,
  summary = excluded.summary,
  impact = excluded.impact,
  tags = excluded.tags,
  details = excluded.details,
  tech = excluded.tech,
  sort_order = excluded.sort_order;

insert into public.projects (id, company_id, name, period, role, summary, impact, tags, details, tech, sort_order) values (
  '7766a0c5-2529-52a2-90ce-9256b4a8770c', '1a4b7c1e-5bad-5a05-a215-f5053edf4f09', '리얼월드 소셜 개발 1차', '2024.05 - 2024.07', 'Backend Engineer', '친구/쪽지/프로필/알림 중심의 소셜 그래프 기능 구축.', '유저 관계 기반 인게이지먼트 기능 확보', ARRAY['소셜', '알림', '프로필', '관계']::text[], ARRAY['친구 추가/차단/추천 등 관계 모델을 정의하고, 관계 상태에 따른 조회/검색 규칙을 정리했습니다.', '쪽지/알림 도메인의 핵심 API를 구현하고, 읽음/삭제 등 상태 전이와 권한 검증 흐름을 보강했습니다.', '운영 관점에서 추적이 필요한 이벤트/로그를 정리하고, 장애 대응을 위한 진단 정보를 보완했습니다.']::text[], '{}'::text[], 3)
on conflict (id) do update set
  company_id = excluded.company_id,
  name = excluded.name,
  period = excluded.period,
  role = excluded.role,
  summary = excluded.summary,
  impact = excluded.impact,
  tags = excluded.tags,
  details = excluded.details,
  tech = excluded.tech,
  sort_order = excluded.sort_order;

insert into public.projects (id, company_id, name, period, role, summary, impact, tags, details, tech, sort_order) values (
  '55d19e8d-3e61-5b79-9edb-20bb8e06702f', '1a4b7c1e-5bad-5a05-a215-f5053edf4f09', '홈/상세 개편', '2024.04 - 2024.06', 'Backend Engineer', '홈/상세 화면 개편에 맞춘 데이터 모델 및 API 개선.', '콘텐츠 탐색/상세 전환 흐름 최적화', ARRAY['홈', '상세', '개편', 'API']::text[], ARRAY['개편된 UI 요구사항에 맞춰 홈/상세 응답 모델을 재정의하고, 기존 API의 호환/마이그레이션 전략을 정리했습니다.', '정렬/필터/페이지네이션 등 리스트 조회 규칙을 표준화하고, N+1/불필요한 조회를 줄이기 위한 쿼리 구성을 조정했습니다.', '캐시/ETag 등 적용 가능 지점을 검토해 반복 조회 비용을 낮추고, 모니터링 지표를 보강했습니다.']::text[], '{}'::text[], 4)
on conflict (id) do update set
  company_id = excluded.company_id,
  name = excluded.name,
  period = excluded.period,
  role = excluded.role,
  summary = excluded.summary,
  impact = excluded.impact,
  tags = excluded.tags,
  details = excluded.details,
  tech = excluded.tech,
  sort_order = excluded.sort_order;

insert into public.projects (id, company_id, name, period, role, summary, impact, tags, details, tech, sort_order) values (
  'e14ba00b-ede3-52c7-a7af-f2864d3d92bc', '1a4b7c1e-5bad-5a05-a215-f5053edf4f09', '파티플레이', '2024.01 - 2024.02', 'Backend Engineer', '파티플레이 기능 POC 및 운영 도구/지표 개선 지원.', '실험/운영 기반 마련', ARRAY['파티플레이', 'POC', '운영', '지표']::text[], ARRAY['POC 요구사항을 기능 단위로 쪼개 빠르게 검증할 수 있도록 데이터/상태 모델을 단순화해 설계했습니다.', '실험 결과를 확인할 수 있도록 운영용 조회/관리 API를 추가하고, 주요 이벤트/지표가 남도록 로깅을 보강했습니다.', '추후 확장(정식 출시) 시 필요한 권한/제한/정합성 규칙을 문서화해 팀 의사결정에 활용했습니다.']::text[], '{}'::text[], 5)
on conflict (id) do update set
  company_id = excluded.company_id,
  name = excluded.name,
  period = excluded.period,
  role = excluded.role,
  summary = excluded.summary,
  impact = excluded.impact,
  tags = excluded.tags,
  details = excluded.details,
  tech = excluded.tech,
  sort_order = excluded.sort_order;

insert into public.projects (id, company_id, name, period, role, summary, impact, tags, details, tech, sort_order) values (
  'b0f267c9-591c-56e2-b456-c906b0f9dd06', '1a4b7c1e-5bad-5a05-a215-f5053edf4f09', '커뮤니티 기능 개선', '2023.08 - 2024.01', 'Backend Engineer', '커뮤니티 탭 신설 및 기능 개선을 위한 API 보강.', '커뮤니티 참여 지표 안정화 기반 확보', ARRAY['커뮤니티', '탭', 'API', '운영']::text[], ARRAY['커뮤니티 탭 신설에 맞춰 피드/댓글/좋아요 등 핵심 도메인의 조회/작성 API를 정리했습니다.', '신고/차단/권한 등 운영 정책을 반영해 노출 규칙과 검증 로직을 보강했습니다.', '트래픽이 몰리는 구간을 기준으로 인덱스/쿼리/캐시 지점을 점검해 성능 저하 리스크를 줄였습니다.']::text[], '{}'::text[], 6)
on conflict (id) do update set
  company_id = excluded.company_id,
  name = excluded.name,
  period = excluded.period,
  role = excluded.role,
  summary = excluded.summary,
  impact = excluded.impact,
  tags = excluded.tags,
  details = excluded.details,
  tech = excluded.tech,
  sort_order = excluded.sort_order;

insert into public.projects (id, company_id, name, period, role, summary, impact, tags, details, tech, sort_order) values (
  'e0be9940-afd7-5545-857c-d996b161c832', '1a4b7c1e-5bad-5a05-a215-f5053edf4f09', '크리에이터 홈 (BE/FE 분리)', '2022.07 - 2024.01', 'Backend Engineer / Frontend 협업', '크리에이터 홈 기능 고도화 및 백엔드/프론트 분리 작업.', '홈/피드/커뮤니티 탭 확장 및 유지보수성 개선', ARRAY['크리에이터', '홈', '분리', '커뮤니티']::text[], ARRAY['프론트 분리 이후에도 안정적으로 기능을 확장할 수 있도록 API 계약(스키마/에러/페이지네이션)을 정리했습니다.', '레거시 응답/권한 처리 로직을 점진적으로 분리·정리하고, 기능 단위로 리팩터링해 변경 리스크를 낮췄습니다.', '협업 효율을 위해 공통 응답/에러 스펙을 맞추고, 문서화/테스트 전략을 보완했습니다.']::text[], '{}'::text[], 7)
on conflict (id) do update set
  company_id = excluded.company_id,
  name = excluded.name,
  period = excluded.period,
  role = excluded.role,
  summary = excluded.summary,
  impact = excluded.impact,
  tags = excluded.tags,
  details = excluded.details,
  tech = excluded.tech,
  sort_order = excluded.sort_order;

insert into public.projects (id, company_id, name, period, role, summary, impact, tags, details, tech, sort_order) values (
  'c4a90208-f38a-5742-827e-0f9e36146130', '1a4b7c1e-5bad-5a05-a215-f5053edf4f09', '위치기반 오프라인 보물찾기 컨텐츠', '2023.08 - 2023.11', 'Backend Engineer', '오프라인 보물찾기 캠페인 운영을 위한 서비스 백엔드 지원.', '이벤트 운영/리워드 흐름 안정화', ARRAY['위치기반', '오프라인', '이벤트', '리워드', '운영']::text[], ARRAY['캠페인/미션 진행 상태와 보상 지급 조건을 기준으로 데이터 정합성 규칙과 검증 흐름을 정리했습니다.', '현장 운영 이슈를 줄이기 위해 운영자용 조회/관리 기능(상태 변경/재지급/이력 확인)을 보강했습니다.', '재현이 어려운 케이스(위치/시간/중복 참여)를 추적할 수 있도록 로그/감사 데이터 구조를 개선했습니다.']::text[], '{}'::text[], 8)
on conflict (id) do update set
  company_id = excluded.company_id,
  name = excluded.name,
  period = excluded.period,
  role = excluded.role,
  summary = excluded.summary,
  impact = excluded.impact,
  tags = excluded.tags,
  details = excluded.details,
  tech = excluded.tech,
  sort_order = excluded.sort_order;

insert into public.projects (id, company_id, name, period, role, summary, impact, tags, details, tech, sort_order) values (
  '1a9759de-8b3b-5006-ab21-361ac31111b1', '1a4b7c1e-5bad-5a05-a215-f5053edf4f09', '포인트 시스템 (광고 연동 포함)', '2023.04 - 2023.08', 'Backend Engineer', '애드몹/아이언소스/애드팝콘 연동을 포함한 포인트 적립·사용 설계.', '광고 기반 보상 흐름과 정산 정책 통합', ARRAY['포인트', '광고', '정산', '정책']::text[], ARRAY['적립/차감/환불 등 포인트 원장(ledger) 관점의 데이터 모델과 트랜잭션 처리 규칙을 설계했습니다.', '광고/오퍼월 연동 특성을 반영해 중복 적립/재시도/지연 콜백을 안전하게 처리하는 검증 로직을 보강했습니다.', '정산/운영 요구사항을 반영해 지급 이력 조회와 이상 케이스 추적이 가능한 관리 지점을 추가했습니다.']::text[], '{}'::text[], 9)
on conflict (id) do update set
  company_id = excluded.company_id,
  name = excluded.name,
  period = excluded.period,
  role = excluded.role,
  summary = excluded.summary,
  impact = excluded.impact,
  tags = excluded.tags,
  details = excluded.details,
  tech = excluded.tech,
  sort_order = excluded.sort_order;

insert into public.projects (id, company_id, name, period, role, summary, impact, tags, details, tech, sort_order) values (
  'f15877cc-ee30-5f54-914a-089bdfce440c', '1a4b7c1e-5bad-5a05-a215-f5053edf4f09', '내 필름을 채워줘', '2022.11 - 2022.12', 'Backend Engineer', '콘텐츠 참여형 프로젝트의 초기 기획/기능 검증 지원.', '프로젝트 검증을 위한 백엔드 지원', ARRAY['프로젝트', '실험', '기획']::text[], ARRAY['짧은 기간 내 검증이 가능하도록 핵심 기능을 최소 단위로 정의하고 API/데이터 모델을 빠르게 구성했습니다.', '운영/정책 변경 가능성을 고려해 설정 값을 분리하고, 관리자 관점의 조회/조정 포인트를 마련했습니다.', '실험 결과를 기반으로 다음 단계(개선/중단) 의사결정이 가능하도록 로그/지표 기준을 정리했습니다.']::text[], '{}'::text[], 10)
on conflict (id) do update set
  company_id = excluded.company_id,
  name = excluded.name,
  period = excluded.period,
  role = excluded.role,
  summary = excluded.summary,
  impact = excluded.impact,
  tags = excluded.tags,
  details = excluded.details,
  tech = excluded.tech,
  sort_order = excluded.sort_order;

insert into public.projects (id, company_id, name, period, role, summary, impact, tags, details, tech, sort_order) values (
  '7476afe7-3610-51c2-9aa4-fb01f245d17f', '1a4b7c1e-5bad-5a05-a215-f5053edf4f09', '기프트카드', '2022.09 - 2022.10', 'Backend Engineer', '기프트카드 발행/조회/사용 흐름 및 관리 기능 구축.', '기프트카드 판매/사용 운영 프로세스 정립', ARRAY['기프트카드', '결제', '정책', '관리']::text[], ARRAY['발행/조회/사용/취소 등 상태 전이를 정의하고, 중복 사용 방지와 유효성 검증 규칙을 구현했습니다.', '운영자 관점의 조회/검색/재발행 등 관리 기능을 보강해 고객 대응 시간을 줄였습니다.', '결제/정산 흐름과 연결되는 데이터 정합성 포인트를 점검하고, 장애 시나리오에 대한 예외 처리를 보완했습니다.']::text[], '{}'::text[], 11)
on conflict (id) do update set
  company_id = excluded.company_id,
  name = excluded.name,
  period = excluded.period,
  role = excluded.role,
  summary = excluded.summary,
  impact = excluded.impact,
  tags = excluded.tags,
  details = excluded.details,
  tech = excluded.tech,
  sort_order = excluded.sort_order;

insert into public.projects (id, company_id, name, period, role, summary, impact, tags, details, tech, sort_order) values (
  '95864d3e-3592-558a-949c-6e16d935f040', '00ce27fb-e23e-5e4b-aa9e-21112d479cc9', '에스테틱 서비스 이용자 모바일 서비스', '2021.08 - 2021.12', 'Backend Developer', '예약과 상품 판매를 결합한 모바일 서비스 백엔드 개발.', '고객사 요구사항 기반 기능 개발 및 납품', ARRAY['예약', '이커머스', 'SI']::text[], ARRAY['예약/상품/회원 도메인의 데이터베이스를 설계하고 API를 개발했습니다.', 'Jenkins + Docker 기반 CI/CD 파이프라인을 구성해 배포 및 운영 효율을 높였습니다.', 'EC2/RDS/S3 기반 인프라 구성을 지원하고, 환경별 설정/배포 절차를 정리했습니다.']::text[], ARRAY['Kotlin', 'Spring Boot', 'JPA', 'Querydsl', 'MySQL', 'Docker', 'AWS EC2', 'AWS RDS', 'S3', 'Jenkins']::text[], 0)
on conflict (id) do update set
  company_id = excluded.company_id,
  name = excluded.name,
  period = excluded.period,
  role = excluded.role,
  summary = excluded.summary,
  impact = excluded.impact,
  tags = excluded.tags,
  details = excluded.details,
  tech = excluded.tech,
  sort_order = excluded.sort_order;

insert into public.projects (id, company_id, name, period, role, summary, impact, tags, details, tech, sort_order) values (
  'b08d380b-3b62-520e-8e10-df2dfc4177e1', '00ce27fb-e23e-5e4b-aa9e-21112d479cc9', '여행 플랫폼 고도화', '2021.12 - 2022.04', 'Backend Developer', '여행 플랫폼 기능 고도화 및 운영 개선을 위한 백엔드 개발.', '운영 기능 개선 및 미디어 처리 파이프라인 구축', ARRAY['여행', '미디어', '운영', '고도화']::text[], ARRAY['기능 고도화 요구사항에 맞춰 API 및 데이터 모델을 확장하고 운영 안정성을 개선했습니다.', 'Jenkins + Docker 기반 CI/CD를 유지·개선하고, 배포/운영 과정의 반복 작업을 정리했습니다.', 'Lambda + MediaConvert를 활용해 mp4 → m3u8 변환 파이프라인을 구성하고 업로드/처리 흐름을 연결했습니다.']::text[], ARRAY['Kotlin', 'Spring Boot', 'JPA', 'jOOQ', 'WebFlux', 'MySQL', 'Docker', 'AWS EC2', 'AWS RDS', 'S3', 'Jenkins', 'AWS Lambda', 'AWS MediaConvert']::text[], 1)
on conflict (id) do update set
  company_id = excluded.company_id,
  name = excluded.name,
  period = excluded.period,
  role = excluded.role,
  summary = excluded.summary,
  impact = excluded.impact,
  tags = excluded.tags,
  details = excluded.details,
  tech = excluded.tech,
  sort_order = excluded.sort_order;

insert into public.projects (id, company_id, name, period, role, summary, impact, tags, details, tech, sort_order) values (
  '450886a3-810a-5373-94c7-6fb8f135ef79', '4add5b1e-c9f9-5448-90ee-8dd310a3680a', '배드민턴 대회/모임 매칭 기능', '2018.04 - 2019.07', 'Backend Engineer', '대회/소모임 매칭과 기본 회원 기능(로그인/로그아웃 포함) 개발.', '대회/모임 운영을 위한 매칭·회원 기능을 제공하고, 약 200명 규모의 대회 진행에 활용', ARRAY['매칭', '커뮤니티', '웹앱']::text[], ARRAY['서비스 요구사항을 기반으로 데이터베이스를 설계하고 핵심 테이블/관계 모델을 구성했습니다.', '대회/소모임 매칭 및 회원 기능 중심의 API를 개발하고 화면(JSP) 연동을 지원했습니다.', '운영 시나리오(대회 진행/참가자 관리)를 기준으로 예외 케이스를 보완하고 기능 정합성을 점검했습니다.']::text[], ARRAY['Java', 'Spring Framework', 'JavaScript', 'jQuery', 'JSP', 'MyBatis', 'MySQL', 'Git']::text[], 0)
on conflict (id) do update set
  company_id = excluded.company_id,
  name = excluded.name,
  period = excluded.period,
  role = excluded.role,
  summary = excluded.summary,
  impact = excluded.impact,
  tags = excluded.tags,
  details = excluded.details,
  tech = excluded.tech,
  sort_order = excluded.sort_order;

-- 4) initiatives
insert into public.initiatives (id, company_id, name, period, summary, impact, tags, details, tech, sort_order) values (
  '45c8449e-3881-5a97-8fa5-ff5da467c97f', '1a4b7c1e-5bad-5a05-a215-f5053edf4f09', 'Swagger 도입', '2024.04', 'API 문서화를 Swagger로 통일.', '문서 유지보수 비용 감소', ARRAY['문서', 'Swagger', '협업']::text[], '{}'::text[], '{}'::text[], 0)
on conflict (id) do update set
  company_id = excluded.company_id,
  name = excluded.name,
  period = excluded.period,
  summary = excluded.summary,
  impact = excluded.impact,
  tags = excluded.tags,
  details = excluded.details,
  tech = excluded.tech,
  sort_order = excluded.sort_order;

insert into public.initiatives (id, company_id, name, period, summary, impact, tags, details, tech, sort_order) values (
  '6b04f8fe-0506-578a-8b9d-98e60750626d', '1a4b7c1e-5bad-5a05-a215-f5053edf4f09', '인증 개선 (JWT + RTR)', '2024.02 - 2024.03', 'RDB/캐시 의존도를 줄이고 JWT 기반 인증 + RTR 도입.', '인증 IO 감소 및 토큰 보안성 강화', ARRAY['인증', 'JWT', '보안', '성능']::text[], '{}'::text[], '{}'::text[], 1)
on conflict (id) do update set
  company_id = excluded.company_id,
  name = excluded.name,
  period = excluded.period,
  summary = excluded.summary,
  impact = excluded.impact,
  tags = excluded.tags,
  details = excluded.details,
  tech = excluded.tech,
  sort_order = excluded.sort_order;

insert into public.initiatives (id, company_id, name, period, summary, impact, tags, details, tech, sort_order) values (
  'c304b2dd-e7ea-522f-8513-748765a64086', '1a4b7c1e-5bad-5a05-a215-f5053edf4f09', '공통 응답 모델 도입', '2023.10 - 2023.11', 'API 응답 스펙을 통일하고 에러 타이틀 체계를 도입.', '클라이언트/운영 대응 효율 개선', ARRAY['API', '표준화', '에러 처리']::text[], '{}'::text[], '{}'::text[], 2)
on conflict (id) do update set
  company_id = excluded.company_id,
  name = excluded.name,
  period = excluded.period,
  summary = excluded.summary,
  impact = excluded.impact,
  tags = excluded.tags,
  details = excluded.details,
  tech = excluded.tech,
  sort_order = excluded.sort_order;

-- 5) targets (writer-only)
insert into public.targets (id, company, role, priority_tags, summary_hint, sort_order) values (
  '74791ecf-60e5-5a14-a23e-1c9b45973344', '핀테크 A', 'Backend Engineer', ARRAY['결제', '성능', '신뢰성']::text[], null, 0)
on conflict (id) do update set
  company = excluded.company,
  role = excluded.role,
  priority_tags = excluded.priority_tags,
  summary_hint = excluded.summary_hint,
  sort_order = excluded.sort_order;

insert into public.targets (id, company, role, priority_tags, summary_hint, sort_order) values (
  'c383b95c-3a72-5dd8-acd8-47ad964981d5', 'SaaS B', 'Platform Engineer', ARRAY['멀티테넌트', '인증', '운영']::text[], '멀티테넌트 설계와 운영 자동화 중심으로 구성', 1)
on conflict (id) do update set
  company = excluded.company,
  role = excluded.role,
  priority_tags = excluded.priority_tags,
  summary_hint = excluded.summary_hint,
  sort_order = excluded.sort_order;

-- 6) posts (optional seed)
insert into public.posts (id, slug, title, category, excerpt, content, published, published_at) values (
  '164765f9-4b4e-5a29-9b6f-3989e1a50552', 'stable-payment-flow', '결제 트래픽 급증 대응기', 'Case Study', '결제 요청 급증 상황에서 실패율을 낮추고 지연을 줄인 대응 전략.', '결제 요청 급증 상황에서 실패율을 낮추고 지연을 줄인 대응 전략.', true, '2026-01-05'::date)
on conflict (slug) do update set
  title = excluded.title,
  category = excluded.category,
  excerpt = excluded.excerpt,
  content = excluded.content,
  published = excluded.published,
  published_at = excluded.published_at;

commit;
