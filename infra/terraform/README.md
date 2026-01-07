# Terraform 인프라 (AWS, Seoul)

이 디렉토리는 `apps/api`(Spring Boot)를 **ECS Fargate + ALB**로 배포하기 위한 Terraform 구성 스캐폴딩입니다.

> 목표
> - 학습 가치가 높은 “정석” 구성(ECS/ALB/ACM/VPC/IAM/CloudWatch)을 경험
> - 개인 프로젝트 비용 폭탄을 피하기 위해 **NAT Gateway 없이**(퍼블릭 서브넷 + Public IP) 시작

## 디렉토리 구조

- `bootstrap/`: Terraform remote state(S3 + DynamoDB lock) 생성을 위한 1회성 스택
- `environments/prod/`: 프로덕션 환경(서울 리전) 스택
- `modules/`: 재사용 가능한 Terraform 모듈

## 사전 준비

1. AWS 계정 및 자격증명 설정(로컬)
   - 예: `aws configure` 또는 환경변수(`AWS_PROFILE`, `AWS_ACCESS_KEY_ID` 등)
2. (선택) 커스텀 도메인
   - Cloudflare DNS를 사용할 예정이라면 `api.<domain>`을 ALB로 연결할 계획을 세워둡니다.
3. Docker 이미지 빌드/푸시 환경
   - `apps/api`를 컨테이너로 빌드해 ECR에 올릴 수 있어야 합니다.

## 1) Remote State(권장) - bootstrap

Terraform state를 Git에 올리지 않기 위해 S3 backend + DynamoDB lock을 권장합니다.

### 실행 순서(개념)

1. `bootstrap/`을 **로컬 state**로 1회 apply 해서
   - state bucket
   - lock table
   를 생성합니다.
2. `environments/prod/`에서 `backend.tf`를 활성화해 remote state로 전환합니다.

> 주의: bootstrap을 remote backend로 올리면 “닭-달걀” 문제가 생깁니다.

## 2) dev 환경 배포 흐름(개념)

1. Terraform apply로 인프라 생성
   - VPC/서브넷/ALB/ECS/ECR/로그 등
2. API 컨테이너 이미지 빌드 후 ECR push
3. ECS 서비스가 새 이미지로 롤링 업데이트 되도록
   - 태스크 정의 갱신(이미지 태그 변경) → 서비스 업데이트

## HTTPS(TLS)

- ALB HTTPS는 AWS ACM 인증서 ARN이 필요합니다.
- Cloudflare를 DNS로 쓰더라도 “원본(AWS)까지” TLS를 종단하려면 ACM/Let’s Encrypt 중 하나가 필요합니다.
- 본 스캐폴딩은 `certificate_arn`을 입력하면 ALB에 HTTPS 리스너를 붙일 수 있도록 설계했습니다.

## 비용 메모(중요)

- 개인 프로젝트에서 비용이 튀는 주범은 “트래픽”보다 **고정비(ALB, NAT Gateway)** 인 경우가 많습니다.
- 본 구성은 비용 방어를 위해 NAT Gateway를 사용하지 않습니다.
- 그럼에도 ALB는 상시 과금이므로, “항상 1태스크 유지” 전략과 함께 예산을 주기적으로 확인하세요.
