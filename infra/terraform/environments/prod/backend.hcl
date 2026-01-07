# Terraform remote state backend config (non-secret)
#
# 이 파일은 민감 정보가 아닌 “식별자/경로”만 포함합니다.
# - bucket/key/region/table은 비밀값이 아니므로 GitHub Secrets 없이도 관리 가능합니다.
#
# 주의:
# - state 자체(tfstate)는 민감 정보가 섞일 수 있으므로 GitHub에 올리면 안 됩니다.
#

bucket         = "jihyeong-my-blog-tfstate-906518091264"
key            = "apps/prod/terraform.tfstate"
region         = "ap-northeast-2"
dynamodb_table = "terraform-lock"

