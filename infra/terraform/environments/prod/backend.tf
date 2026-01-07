/**
 * Remote backend 설정(권장)
 *
 * bootstrap 스택에서 S3/DynamoDB를 만든 뒤 활성화하세요.
 *
 * 주의:
 * - backend 블록은 변수 참조가 제한적입니다.
 * - 계정/프로젝트마다 값이 다를 수 있으므로, 실사용 시 이 파일을 본인 값으로 채우거나
 *   `-backend-config` 옵션을 사용하세요.
 *
 * 사용 예:
 *   terraform init -backend-config=backend.hcl
 */

# terraform {
#   backend "s3" {}
# }
