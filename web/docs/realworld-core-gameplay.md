# RealWorld Core 게임 구조 정리 (Project/Mission/Quest/ActionHandler)

이 문서는 `realworld-core-server`를 중심으로 RealWorld 게임의 **콘텐츠 트리 구조**와, 그 중에서도 핵심 실행 단위인 **ActionHandler(룰/리액션 엔진)** 의 설계·흐름을 빠르게 이해하기 위한 메모입니다.  
또한 `Areas/Creator/Services/Ai` 하위의 **AI 프로젝트 생성 파이프라인**(Bedrock/이미지/BGM/로그/크레딧)도 함께 요약합니다.

> 참고: 도메인 모델(`Project`, `Mission`, `Quest`, `ActionHandler` 등)은 `Realworld.Common.Models` 패키지 소스가 `realworld-server-libraries/realworld-data-models`에도 존재합니다.  
> 실행/서비스 레이어는 `realworld-core-server`에 있습니다.

---

## 1) 핵심 콘텐츠 트리 구조

실행 흐름/데이터 조회에서 사실상 표준 경로는 아래입니다.

- `Project` (게임/프로젝트) → `Scenario` (시나리오/챕터) → `Mission` (미션) → `Quest` (퀘스트) → `ActionHandler` (액션 처리기)

### 1.1 Project

- 역할: 게임의 최상위 단위. 노출/상태/미디어/태그/장르/시나리오 묶음 등을 가진다.
- 관계:
  - `Project.Scenarios` (프로젝트 하위 시나리오 컬렉션)
  - “현재는 프로젝트당 1개의 시나리오가 표준”이라는 주석이 모델에 존재
- 모델(패키지 소스): `/Users/ji/realworld-server-libraries/realworld-data-models/realworld-common-models/Core/Models/GamePlay/Project.cs`

### 1.2 Scenario

- 역할: 프로젝트 내부의 시나리오 단위. 커버/아이콘/노출기간/기본 BGM 등을 가진다.
- 관계:
  - `Scenario.ProjectId` / `Scenario.Project`
  - `Scenario.Missions`
- 모델(패키지 소스): `/Users/ji/realworld-server-libraries/realworld-data-models/realworld-common-models/Core/Models/GamePlay/Scenario.cs`

### 1.3 Mission

- 역할: 시나리오 안의 미션 단위. 영상/설명/순서/잠금/노출 등과 `Quests`를 가진다.
- 관계:
  - `Mission.ScenarioId` / `Mission.Scenario`
  - `Mission.Quests`
- 모델(패키지 소스): `/Users/ji/realworld-server-libraries/realworld-data-models/realworld-common-models/Core/Models/GamePlay/Mission.cs`

### 1.4 Quest

- 역할: 플레이 중 “사용자 입력을 받는 단위”에 가장 가까운 콘텐츠. 이미지/표시/잠금/순서 등의 메타 + **ActionHandler 연결**을 가진다.
- 관계:
  - `Quest.MissionId` / `Quest.Mission`
  - `Quest.ActionHandlerId` / `Quest.ActionHandler`
- 모델(패키지 소스): `/Users/ji/realworld-server-libraries/realworld-data-models/realworld-common-models/Core/Models/GamePlay/Quest.cs`

---

## 2) ActionHandler: 데이터 기반 룰/리액션 엔진

ActionHandler는 “(입력) → (조건 평가) → (커맨드 실행) → (Reaction 반환)”을 **데이터로 구성**하는 작은 룰 엔진입니다.  
퀘스트(또는 아이템/챗씬)마다 ActionHandler를 연결해 행동을 정의합니다.

### 2.1 핵심 필드

- `ActionType`: 주로 **클라이언트 입력/UI 동작 타입**에 가깝다. (예: `RealWorld.ActionTypes.Dummy`, `RealWorld.ActionTypes.GpsRadar` 등)
- `ActionParameters`: 액션 타입별 파라미터 딕셔너리.
- `ReactionDefinitions[]`: 여러 개의 “조건 + 커맨드” 묶음(= if/else-if 체인).
- `FailureCommands[]`: 어떤 definition도 만족 못할 때 실행할 커맨드(= else).

모델(패키지 소스): `/Users/ji/realworld-server-libraries/realworld-data-models/realworld-common-models/Core/Models/GamePlay/ActionHandler.cs`

### 2.2 ReactionDefinition / Command / Condition 구조

각 요소는 “문자열 타입 + 파라미터” 형태의 데이터입니다.  
즉, 서버는 실제 실행을 `Type` 문자열로 찾아 처리하고, 파라미터는 런타임에 주입/치환됩니다.

- `ReactionDefinition`: `conds` + `cmds`
- `ReactionCommand`: `t` + `p`
- `ReactionCondition`: `t` + `p`

모델(패키지 소스):
- `/Users/ji/realworld-server-libraries/realworld-data-models/realworld-common-models/Core/Models/GamePlay/ReactionDefinition.cs`
- `/Users/ji/realworld-server-libraries/realworld-data-models/realworld-common-models/Core/Models/GamePlay/ReactionCommand.cs`
- `/Users/ji/realworld-server-libraries/realworld-data-models/realworld-common-models/Core/Models/GamePlay/ReactionCondition.cs`

### 2.3 저장 방식(중요)

`ActionParameters`, `ReactionDefinitions`, `FailureCommands`는 DB에서 각각 문자열 컬럼에 JSON으로 저장됩니다.

- `ActionParameters` → `ActionParametersStr`
- `FailureCommands` → `FailureCommandsStr`
- `ReactionDefinitions` → `ReactionDefinitionsStr`

매핑 위치: `/Users/ji/realworld-server-libraries/realworld-data-models/realworld-common-models/Core/CoreDatabaseContext.cs`

### 2.4 기본 생성(콘텐츠 에디터의 시작점)

`ActionHandler.CreateDefault(...)`는 컨테이너 타입(Quest/Item/ChatScene)에 따라 기본 커맨드/실패 커맨드를 만들어줍니다.

- 컨테이너 타입 열거형: `/Users/ji/realworld-server-libraries/realworld-data-models/realworld-common-models/Core/Models/GamePlay/ActionHandlerContainerType.cs`

---

## 3) 런타임 실행 흐름(서버)

### 3.1 API 엔드포인트

- `POST /api/actions/{id}`가 액션 실행의 진입점입니다.
- 현재 컨트롤러 구현은 `params`를 빈 딕셔너리로 넘깁니다(추가 컨텍스트 주입이 필요하면 확장 지점).

위치: `/Users/ji/realworld-core-server/RealWorld/Controllers/ActionController.cs`

### 3.2 ActionHandlerService

흐름:
1. `ActionHandler`를 DB에서 조회
2. `ActionType`이 `GpsRadar`/`GpsMap`이면 위치 로그를 추가로 남김
3. `ReactionRunner.RunAsync(...)`로 위임

위치: `/Users/ji/realworld-core-server/RealWorld/Services/ActionHandlerService.cs`

### 3.3 ReactionRunner(핵심 실행기)

ReactionRunner는 `ReactionDefinitions`를 순서대로 평가합니다.

- 각 definition:
  - `Conditions`를 모두 평가(AND)
  - 만족하면 `Commands`를 실행하고 Reactions 반환(즉시 종료)
- 아무 definition도 만족 못하면:
  - `FailureCommands`를 실행하고 Reactions 반환

추가로, 실행 전/후에 게임플레이 컨텍스트를 로드/저장합니다.

- Load: `LoadGamePlayContextAsync(userId, projectId)`
- Save: `UpdateRemoteGamePlayContext()`

위치: `/Users/ji/realworld-core-server/RealWorld/Services/ReactionRunner.cs`

### 3.4 Command/Condition 실행 방식(“Type 문자열” 기반)

`ReactionCommand.Type`, `ReactionCondition.Type`는 문자열입니다.  
서버는 리플렉션으로 구현체를 스캔하여 “타입 문자열 → 구현체”로 매핑합니다.

- `ICommandHandler` 구현체 스캔/캐시
- `IConditionEvaluator` 구현체 스캔/캐시

매칭 실패 시:
- Condition: 해당 condition은 “불만족” 처리로 definition 탈락
- Command: `ClientCommandHandler`가 “그 타입 그대로” Reaction을 만들어 클라이언트에 전달(서버는 해석하지 않음)

위치:
- `/Users/ji/realworld-core-server/RealWorld/Services/ReactionRunner.cs`
- `/Users/ji/realworld-core-server/RealWorld/CommandHandlers/ClientCommandHandler.cs`

### 3.5 파라미터 주입/치환(콘텐츠를 데이터화하는 핵심 장치)

실행 중 파라미터에 다음 값들이 주입/치환됩니다.

- 공통 주입
  - `"$input"`: 사용자 입력값
  - `@params`: 호출자가 넘긴 추가 파라미터(현재 API는 빈 딕셔너리)
- 문자열 치환
  - `ContextParameterEscapeService`가 `{...}` 토큰을 컨텍스트 값으로 치환
  - 기본 제공 예시: `{user-id}`, `{user-name}`, `{user-picture}`, `{user-code}`, `{input}`
  - 확장: `{변수명|기본값}` 형태로 “유저 변수 컨텍스트”를 조회해 치환

위치: `/Users/ji/realworld-core-server/RealWorld/Services/ContextParameterEscapeService.cs`

---

## 4) 크리에이터/관리 화면과의 연결(편집 UX 관점)

`ActionType`과 `ActionParameters/ReactionDefinitions/FailureCommands`는 관리/크리에이터 편집기에서 구성되며, 프론트 에디터 스크립트에도 액션 타입/커맨드 타입 목록이 하드코딩 형태로 존재합니다.

- `/Users/ji/realworld-core-server/RealWorld/wwwroot/js/action-editor.es5.js`
- `/Users/ji/realworld-core-server/RealWorld/wwwroot/js/item-action-editor.es5.js`

---

## 5) AI 프로젝트 생성 파이프라인(Areas/Creator/Services/Ai)

이 디렉토리는 “AI가 프로젝트 콘텐츠를 생성 → 이미지/BGM 리소스 생성 → DB 반영 → 로그/이벤트 처리”까지를 담당합니다.

### 5.1 전체 흐름(요약)

1. 사용자 요청 진입: `AiService`
2. 크레딧 상품 조회/차감: `AiProducts` + `creditService.PurchaseProductAsync(...)`
3. 프로젝트 플레이스홀더 생성: `creatorProjectServiceV2.CreateProjectPlaceholderForAiAsync(...)`
4. 생성 실행
   - 큐 발행 + Consumer 처리(`GenerateProjectConsumer`) 또는
   - 오케스트레이터 직접 호출(`ProjectGenerationOrchestrator`)
5. Bedrock(Claude) 호출로 프로젝트/스토리/템플릿 생성 + 토큰/메타 기록
6. 이미지 생성(외부 생성기) + (옵션) BGM 생성 병렬
7. 단일 트랜잭션으로 최종 DB 반영
8. 성공/실패 이벤트 처리 + 실패 시 크레딧 롤백

핵심 파일:
- 진입 서비스: `/Users/ji/realworld-core-server/RealWorld/Areas/Creator/Services/Ai/AiService.cs`
- 큐 컨슈머: `/Users/ji/realworld-core-server/RealWorld/Areas/Creator/Services/Ai/GenerateProjectConsumer.cs`
- 오케스트레이터: `/Users/ji/realworld-core-server/RealWorld/Areas/Creator/Services/Ai/IProjectGenerationOrchestrator.cs`
- Bedrock 래퍼: `/Users/ji/realworld-core-server/RealWorld/Areas/Creator/Services/Ai/BedrockOrchestrator.cs`
- 프롬프트 조회/캐시: `/Users/ji/realworld-core-server/RealWorld/Areas/Creator/Services/Ai/AiPromptService.cs`
- AiUseLog 유틸: `/Users/ji/realworld-core-server/RealWorld/Areas/Creator/Services/Ai/AiUseLogService.cs`

### 5.2 외부 생성기 연동(이미지/BGM)

- 이미지(일괄): `POST /images/generate` (프롬프트 리스트를 한 번에 전송)
- 이미지(단건): `POST /generative/image` (현재 모델 값은 `"qwen-image"`)
- BGM: `POST /generative/sound` (부적절 프롬프트(`bad_prompt`)는 400 처리)

위치: `/Users/ji/realworld-core-server/RealWorld/Areas/Creator/Services/Ai/IAiGeneratorClient.cs`

### 5.2 로그/관측 포인트(AiUseLog)

`BedrockOrchestrator`는 호출 결과에서

- `aiUseLog.Metadata`
- `aiUseLog.InputToken`, `aiUseLog.OutputToken`
- `aiUseLog.GenerateResult`

를 채우도록 되어 있어, “모델 호출 비용/결과/메타”를 서버 단에서 추적할 수 있습니다.

Bedrock 호출(저수준)은 `InvokeModelAsync`로 Raw 응답을 그대로 `JsonDocument`로 보관합니다.

- `/Users/ji/realworld-core-server/RealWorld/Areas/Creator/Services/Ai/BedrockOrchestrator.cs`
- `/Users/ji/realworld-core-server/RealWorld/Areas/Creator/Services/Ai/IBedrockService.cs`

### 5.3 생성 결과를 “실제 게임 모델”로 반영하는 핵심: ID 매핑/후처리

AI가 만들어내는 미션/퀘스트/아이템/ActionHandler는 생성 중에 임시 ID를 쓰는 경우가 있어, DB 저장 후 실제 PK로 교체하는 후처리가 필요합니다.

`ProjectGenerationOrchestrator` 내부의 `UpdateActionHandlersWithRealIds(...)`가 대표적인 핵심 로직입니다.

- 커맨드 파라미터 `missionId`, `questId`, `itemId`가 임시 ID(문자열)라면 실제 PK로 교체
- `StartScenario`/`AccomplishScenario*` 류 커맨드에 `scenarioId`를 채움
- `DisplayHtml`의 `content`에 포함된 이미지 토큰(생성 요청 시의 id)을 실제 URL로 치환
- 조건(Condition) 파라미터의 `itemId`, `questId`도 동일하게 교체
- 교체가 끝난 ActionHandler 데이터를 최종적으로 `questEntityToUpdate.ActionHandler.*`에 복사하여 UPDATE가 발생하도록 구성

위치: `/Users/ji/realworld-core-server/RealWorld/Areas/Creator/Services/Ai/IProjectGenerationOrchestrator.cs`

### 5.4 성공/실패 이벤트

성공/실패 시 메시지를 발행하여(요청 URL/UserAgent/IP 등 포함) 추적이 가능하도록 구성되어 있습니다.

- `/Users/ji/realworld-core-server/RealWorld/Areas/Creator/Services/Ai/AiEventMessageHandler.cs`

---

## 6) (추정) 내가 했던 작업 요약: Git 히스토리 기반

`RealWorld/Areas/Creator/Services/Ai` 경로의 Git 로그를 기준으로 보면, `Ji-Hyeong`이 다음 영역을 집중적으로 개선/확장한 흔적이 있습니다.

- AI 프로젝트 생성 파이프라인 리팩토링/안정화
  - DB 트랜잭션 관리, ChangeTracker 초기화, 저장 누락 보완, 타임아웃 조정 등
- 이미지 생성 로직 확장
  - 미션 카드/배경/썸네일/서사 이미지 등 프롬프트/매핑 로직 추가 및 조건 검증
- BGM 생성 옵션 지원
  - `GenerateBgm`/`includeBgm` 템플릿 변수, BGM 생성 및 저장 로직 통합
- Bedrock 호출 구조 정리
  - JsonObject 기반 요청, 토큰/메타 기록, Orchestrator/PromptService DI 구성 등
- ActionHandler/아이템 매핑 등 “생성된 콘텐츠를 실제 게임 모델에 반영”하는 로직 보강
  - 특히 “ActionHandler ID 매핑 추가” 관련 커밋 메시지가 존재

확인한 로그(예시):
- 2025-09-18 `9254bdc2` (Ji-Hyeong): 이미지 생성 로직 개선 + ActionHandler ID 매핑 추가
- 2025-09-04~2025-09-01 (Ji-Hyeong): 이미지 모델/프롬프트/생성 모델(qwen-image 등) 교체 및 프롬프트 버전 업데이트 다수
- 2025-08-29 (Ji-Hyeong): BGM 생성 지원 추가 및 생성 서비스 리팩토링

> 더 정확히 “내 작업 범위”를 고정하려면, 위 파일들의 `git blame`를 기반으로 변경 블록을 묶어서 (기능 단위로) 정리하는 방식이 가장 안전합니다.

---

## 7) 다음 단계(문서 보강 체크리스트)

- ActionHandler에서 실제로 많이 쓰는 `RealWorld.Commands.*` / `RealWorld.Conditions.*` 조합을 “패턴”으로 정리(퀴즈형/아이템형/웹훅형 등)
- AI 생성 결과가 최종적으로 어디까지(프로젝트 메타/미션/퀘스트/아이템/ActionHandler/이미지/BGM) 채워지는지 “DB 반영 단계”를 더 자세히 도식화
- 이 문서를 스튜디오 AI 프로젝트 이력서 서술(배경/주요 작업/성과)로 변환할 수 있도록, 기여 항목을 “문제-해결-성과” 형태로 재구성
