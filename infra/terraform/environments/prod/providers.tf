/**
 * prod 환경 provider 설정입니다.
 *
 * - 인증은 AWS CLI profile 또는 환경변수로 주입하는 것을 권장합니다.
 * - 예: `AWS_PROFILE=... terraform apply`
 */

provider "aws" {
  region = var.aws_region
}
