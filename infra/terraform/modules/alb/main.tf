/**
 * alb 모듈
 *
 * 목적:
 * - API 트래픽을 ECS로 라우팅하는 ALB + Target Group + Listener를 구성합니다.
 *
 * 학습 포인트:
 * - 헬스체크, 리스너 규칙, HTTPS 종단(ACM), 롤링 배포 등
 *
 * 비용 포인트:
 * - ALB는 트래픽이 거의 없어도 “상시” 과금이 발생할 수 있습니다.
 */

resource "aws_security_group" "alb" {
  name        = "${var.project_name}-alb-sg"
  description = "ALB security group"
  vpc_id      = var.vpc_id

  /**
   * 외부에서 ALB로 들어오는 트래픽을 허용합니다.
   * - HTTPS를 켠 경우 443도 오픈합니다.
   */
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  dynamic "ingress" {
    for_each = var.enable_https ? [1] : []
    content {
      from_port   = 443
      to_port     = 443
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_lb" "this" {
  name               = "${var.project_name}-alb"
  load_balancer_type = "application"
  subnets            = var.public_subnet_ids
  security_groups    = [aws_security_group.alb.id]

  /**
   * 개인 프로젝트에서는 삭제가 쉬운 구성이 편할 수 있습니다.
   * - 운영에서 삭제 보호가 필요하면 `enable_deletion_protection = true`를 고려하세요.
   */
  enable_deletion_protection = false
}

resource "aws_lb_target_group" "api" {
  name        = "${var.project_name}-tg"
  port        = var.target_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  /**
   * Spring Boot 헬스 체크 경로를 기준으로 타깃을 평가합니다.
   * - 앱 준비 시간이 길면 `healthy_threshold`, `timeout` 등을 조정할 수 있습니다.
   */
  health_check {
    enabled             = true
    path                = var.health_check_path
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 15
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
}

/**
 * Listener 구성
 *
 * - HTTPS(enable_https=true)일 때:
 *   - 80: 443으로 redirect
 *   - 443: target group으로 forward
 *
 * - HTTP(enable_https=false)일 때:
 *   - 80: target group으로 forward
 */
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn
  port              = 80
  protocol          = "HTTP"

  dynamic "default_action" {
    for_each = var.enable_https ? [1] : []
    content {
      type = "redirect"
      redirect {
        port        = "443"
        protocol    = "HTTPS"
        status_code = "HTTP_301"
      }
    }
  }

  dynamic "default_action" {
    for_each = var.enable_https ? [] : [1]
    content {
      type             = "forward"
      target_group_arn = aws_lb_target_group.api.arn
    }
  }
}

resource "aws_lb_listener" "https" {
  count = var.enable_https ? 1 : 0

  load_balancer_arn = aws_lb.this.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}

