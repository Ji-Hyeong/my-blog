# GitHub Actions 연동 가이드 (Terraform / ECS)

이 문서는 “모노레포 1개”에서 Terraform과 ECS 배포를 GitHub Actions로 운영하기 위한 설정 요약입니다.

## 1) Terraform (PR plan + 코멘트 apply)

워크플로우:
- `apps/.github/workflows/terraform-plan.yml`
- `apps/.github/workflows/terraform-apply.yml`

동작:
- PR에서 `infra/terraform/**` 변경이 감지되면 plan 실행 + 결과를 PR 코멘트로 남김
- PR 코멘트에 `/apply`를 남기면 apply 실행(권한 가드 포함)

### GitHub Secrets (필수)

- (워크플로우에 하드코딩) Terraform용 AssumeRole ARN
- Remote state/backend 값은 `infra/terraform/environments/prod/backend.hcl`에 고정(비밀값 아님)
- 환경 변수 값은 `infra/terraform/environments/prod/ci.auto.tfvars.json`에 고정(비밀값 아님)

> 메모: `ENABLE_HTTPS`는 Terraform 변수 타입이 bool이라 `true/false` 형태가 안전합니다.

### AWS IAM (OIDC, 필수)

Access Key를 GitHub Secrets에 저장하지 않기 위해, AWS에 “OIDC 신뢰 관계 + 권한 정책”이 설정된 IAM Role이 필요합니다.

학습/운영을 위해 권장하는 형태:
- 신뢰 정책: GitHub OIDC provider(`token.actions.githubusercontent.com`)를 통해 특정 repo에서만 AssumeRole 가능
- 권한 정책: Terraform이 생성/수정할 리소스 범위(ECS/ALB/VPC/ECR/CloudWatch/IAM 등) 허용

## 2) API (Docker → ECR → ECS)

워크플로우:
- `apps/.github/workflows/api-deploy.yml`

동작:
- `apps/api/**` 변경이 `main`에 반영되면 Docker 이미지를 빌드하고 ECR에 `latest`로 push
- 이후 ECS 서비스에 `--force-new-deployment`를 호출해 새 태스크가 `latest`를 다시 pull 하도록 유도

### GitHub Secrets (필수)

- (워크플로우에 하드코딩) API 배포용 AssumeRole ARN
- ECR/ECS 리소스명은 워크플로우에 하드코딩(Terraform 기본 네이밍, 비밀값 아님)

> 주의: 이 배포 방식은 Terraform에서 `api_image`를 `:latest`로 고정하는 것을 전제로 합니다.

## 3) 애플리케이션 시크릿(권장: SSM Parameter Store)

원칙:
- GitHub Secrets: “배포 파이프라인에 필요한 최소 값”만 저장
- 애플리케이션 시크릿(API 키, OAuth secret 등): SSM Parameter Store(SecureString)를 권장

추후 확장:
- ECS task definition에서 SSM Parameter Store를 secrets로 주입(또는 애플리케이션에서 런타임에 SSM 조회)
