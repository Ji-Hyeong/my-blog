# prod 환경 (Seoul)

`apps/api`를 ECS Fargate + ALB로 배포하기 위한 환경 스택입니다.

## 주요 리소스

- VPC + Public Subnets (2 AZ)
- ALB + Target Group + Listener
- ECS Cluster + Service(Fargate, desired_count=1)
- ECR Repository
- CloudWatch Logs

## 중요한 설계 포인트(비용/학습)

- NAT Gateway를 사용하지 않습니다.
  - 개인 프로젝트에서 NAT는 고정비가 크게 나올 수 있어 초기에 피합니다.
  - 대신 Fargate 태스크를 Public Subnet + Public IP로 배치합니다.
- ALB는 학습 가치가 높지만 고정비가 존재합니다.

## 도메인/HTTPS

- HTTPS(ALB 443)를 켜려면 ACM 인증서 ARN이 필요합니다.
- Cloudflare DNS를 사용한다면:
  - `api.<domain>` → ALB DNS name으로 CNAME 설정

- 2026-01-07: trigger prod apply
