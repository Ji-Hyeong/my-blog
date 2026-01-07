/**
 * ecs_service 모듈
 *
 * 목적:
 * - Fargate 기반 ECS 서비스(항상 1태스크 등)를 구성합니다.
 * - ALB target group에 태스크를 등록하여 외부 트래픽을 받습니다.
 *
 * 비용/단순화 전략:
 * - NAT Gateway 없이 운영하기 위해 public subnet + public IP를 사용합니다.
 * - 보안은 “ALB SG에서만 태스크 SG로 인바운드 허용”으로 제한합니다.
 */

resource "aws_ecs_cluster" "this" {
  name = "${var.project_name}-cluster"
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/ecs/${var.project_name}/api"
  retention_in_days = 14
}

resource "aws_iam_role" "task_execution" {
  name = "${var.project_name}-task-exec"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "task_execution_default" {
  role       = aws_iam_role.task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_security_group" "task" {
  name        = "${var.project_name}-task-sg"
  description = "ECS task security group"
  vpc_id      = var.vpc_id

  /**
   * 인바운드는 ALB에서만 허용합니다.
   * - 외부에서 태스크로 직접 접근하지 못하도록 막습니다.
   */
  ingress {
    from_port       = var.container_port
    to_port         = var.container_port
    protocol        = "tcp"
    security_groups = [var.alb_security_group_id]
  }

  /**
   * 아웃바운드는 기본 허용합니다.
   * - 외부 API 호출(OpenAI 등)이 필요해지면 이 경로를 사용합니다.
   * - 더 엄격히 통제하려면 egress를 목적지로 제한하는 방식을 고려합니다.
   */
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_ecs_task_definition" "api" {
  family                   = "${var.project_name}-api"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.cpu
  memory                   = var.memory

  execution_role_arn = aws_iam_role.task_execution.arn

  /**
   * 컨테이너 정의
   *
   * - Spring Boot 컨테이너 1개만 포함합니다.
   * - 로그는 CloudWatch Logs로 전송합니다.
   * - 환경변수는 추후(예: DB URL, OAuth 설정) 확장할 수 있습니다.
   */
  container_definitions = jsonencode([
    {
      name      = "api"
      image     = var.container_image
      essential = true
      portMappings = [
        {
          containerPort = var.container_port
          hostPort      = var.container_port
          protocol      = "tcp"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.api.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "api"
        }
      }
      environment = var.environment
    }
  ])
}

resource "aws_ecs_service" "api" {
  name            = "${var.project_name}-api-svc"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  /**
   * 롤링 배포 기본 설정
   * - 개인 프로젝트에서는 100/200으로도 충분하지만,
   *   무중단 성격을 명확히 보기 위해 min/max 비율을 설정합니다.
   */
  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200

  network_configuration {
    subnets          = var.public_subnet_ids
    security_groups  = [aws_security_group.task.id]
    assign_public_ip = true
  }

  /**
   * ALB target group과 연결합니다.
   * - target_type이 ip이므로 task ENI가 등록됩니다.
   */
  load_balancer {
    target_group_arn = var.target_group_arn
    container_name   = "api"
    container_port   = var.container_port
  }

  /**
   * 서비스 안정성:
   * - ALB 헬스체크 결과를 기반으로 실패 태스크를 교체합니다.
   */
  health_check_grace_period_seconds = 30
}

