# bootstrap (remote state)

이 스택은 Terraform remote state용 리소스를 1회성으로 생성합니다.

- S3 bucket: state 저장
- DynamoDB table: state lock

## 왜 분리하나요?

remote backend를 사용하려면 state bucket/table이 이미 존재해야 합니다.
그래서 bootstrap은 로컬 state로 먼저 apply한 뒤, 다른 환경(`environments/*`)에서 remote backend를 사용합니다.

