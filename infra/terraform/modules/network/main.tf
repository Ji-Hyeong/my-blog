/**
 * network 모듈
 *
 * 목표:
 * - 개인 프로젝트 초기 단계에서 “비용 폭탄”이 될 수 있는 NAT Gateway 없이 시작합니다.
 * - 대신 Public Subnet + IGW + Public Route를 구성합니다.
 *
 * 확장 포인트:
 * - DB를 붙이거나 보안을 강화할 때는 Private Subnet + NAT/Endpoints 등을 추가로 고려합니다.
 */

data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  /**
   * 2 AZ로 분산하여 ALB/ECS를 멀티 AZ로 배치할 수 있도록 합니다.
   * - 학습/가용성 측면에서 의미가 큽니다.
   */
  azs = slice(data.aws_availability_zones.available.names, 0, 2)
}

resource "aws_vpc" "this" {
  cidr_block = "10.0.0.0/16"

  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-vpc"
  }
}

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id

  tags = {
    Name = "${var.project_name}-igw"
  }
}

resource "aws_subnet" "public" {
  for_each = { for idx, az in local.azs : idx => az }

  vpc_id            = aws_vpc.this.id
  availability_zone = each.value
  cidr_block        = cidrsubnet(aws_vpc.this.cidr_block, 8, each.key)

  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public-${each.value}"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id

  tags = {
    Name = "${var.project_name}-public-rt"
  }
}

resource "aws_route" "public_internet" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.this.id
}

resource "aws_route_table_association" "public" {
  for_each = aws_subnet.public

  subnet_id      = each.value.id
  route_table_id = aws_route_table.public.id
}

