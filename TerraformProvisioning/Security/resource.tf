# Security Groups
resource "aws_security_group" "frontend" {
  name        = "${var.project_name}-frontend-sg"
  description = "Security Group do frontend"
  vpc_id      = var.vpc_id

  tags = {
    Name = "${var.project_name}-frontend-sg"
  }
}

resource "aws_security_group" "backend" {
  name        = "${var.project_name}-backend-sg"
  description = "Security Group do backend"
  vpc_id      = var.vpc_id

  tags = {
    Name = "${var.project_name}-backend-sg"
  }
}

resource "aws_security_group" "worker" {
  name        = "${var.project_name}-worker-sg"
  description = "Security Group do worker"
  vpc_id      = var.vpc_id

  tags = {
    Name = "${var.project_name}-worker-sg"
  }
}

resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "Security Group do banco RDS"
  vpc_id      = var.vpc_id

  tags = {
    Name = "${var.project_name}-rds-sg"
  }
}

resource "aws_security_group" "elasticache" {
  name        = "${var.project_name}-elasticache-sg"
  description = "Security Group do ElastiCache"
  vpc_id      = var.vpc_id

  tags = {
    Name = "${var.project_name}-elasticache-sg"
  }
}


# EC2 - Frontend + Backend
resource "aws_vpc_security_group_ingress_rule" "frontend" {
  security_group_id = aws_security_group.frontend.id

  cidr_ipv4   = "0.0.0.0/0" # TODO: Restringir 
  from_port   = 3000
  ip_protocol = "tcp"
  to_port     = 3000
}

resource "aws_vpc_security_group_ingress_rule" "backend" {
  security_group_id = aws_security_group.backend.id

  cidr_ipv4   = "0.0.0.0/0" # TODO: Restringir
  from_port   = 8080
  ip_protocol = "tcp"
  to_port     = 8080
}

resource "aws_vpc_security_group_ingress_rule" "frontend_ssh" {
  security_group_id = aws_security_group.frontend.id

  cidr_ipv4   = var.development_ip
  from_port   = 22
  ip_protocol = "tcp"
  to_port     = 22
}

resource "aws_vpc_security_group_ingress_rule" "backend_ssh" {
  security_group_id = aws_security_group.backend.id

  cidr_ipv4   = var.development_ip
  from_port   = 22
  ip_protocol = "tcp"
  to_port     = 22
}

resource "aws_vpc_security_group_ingress_rule" "worker_ssh" { # TODO: retirar o SSH
  security_group_id = aws_security_group.worker.id

  cidr_ipv4   = var.development_ip
  from_port   = 22
  ip_protocol = "tcp"
  to_port     = 22
}
// Aceita conexões do Security Group do EC2 para o RDS e ElastiCache
resource "aws_vpc_security_group_ingress_rule" "rds_postgres" {
  security_group_id = aws_security_group.rds.id

  referenced_security_group_id = aws_security_group.backend.id

  from_port   = 5432
  ip_protocol = "tcp"
  to_port     = 5432
}
resource "aws_vpc_security_group_ingress_rule" "rds_development" {
  security_group_id = aws_security_group.rds.id

  cidr_ipv4 = var.development_ip

  from_port   = 5432
  ip_protocol = "tcp"
  to_port     = 5432
}

resource "aws_vpc_security_group_ingress_rule" "elasticache_redis" {
  security_group_id = aws_security_group.elasticache.id

  referenced_security_group_id = aws_security_group.backend.id

  from_port   = 6379
  ip_protocol = "tcp"
  to_port     = 6379
}

// Saida de cada Security Group
resource "aws_vpc_security_group_egress_rule" "ec2_frontend_all" {
  security_group_id = aws_security_group.frontend.id

  cidr_ipv4   = "0.0.0.0/0"
  ip_protocol = "-1"
}
resource "aws_vpc_security_group_egress_rule" "ec2_backend_all" {
  security_group_id = aws_security_group.backend.id

  cidr_ipv4   = "0.0.0.0/0"
  ip_protocol = "-1"
}

resource "aws_vpc_security_group_egress_rule" "rds_all" {
  security_group_id = aws_security_group.rds.id

  cidr_ipv4   = "0.0.0.0/0"
  ip_protocol = "-1"
}

resource "aws_vpc_security_group_egress_rule" "elasticache_all" {
  security_group_id = aws_security_group.elasticache.id

  cidr_ipv4   = "0.0.0.0/0"
  ip_protocol = "-1"
}

resource "aws_vpc_security_group_egress_rule" "worker_all" {
  security_group_id = aws_security_group.worker.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}