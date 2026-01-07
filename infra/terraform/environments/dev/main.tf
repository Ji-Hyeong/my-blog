/**
 * dev 환경 메인 스택
 *
 * 구성 개요:
 * - network: VPC + public subnets
 * - ecr: API 이미지 저장소
 * - alb: HTTP/HTTPS 리스너 + target group
 * - ecs_service: Fargate 서비스(항상 1개) + 로그 + 보안그룹
 */

module "network" {
  source = "../../modules/network"

  project_name = var.project_name
}

module "ecr" {
  source = "../../modules/ecr"

  project_name = var.project_name
}

module "alb" {
  source = "../../modules/alb"

  project_name       = var.project_name
  vpc_id             = module.network.vpc_id
  public_subnet_ids  = module.network.public_subnet_ids
  target_port        = var.api_container_port
  enable_https       = var.enable_https
  certificate_arn    = var.certificate_arn
  health_check_path  = "/api/health"
}

module "ecs_service" {
  source = "../../modules/ecs_service"

  project_name        = var.project_name
  vpc_id              = module.network.vpc_id
  public_subnet_ids   = module.network.public_subnet_ids
  alb_security_group_id = module.alb.alb_security_group_id
  target_group_arn    = module.alb.target_group_arn

  container_image     = var.api_image
  container_port      = var.api_container_port
  desired_count       = var.api_desired_count
}

