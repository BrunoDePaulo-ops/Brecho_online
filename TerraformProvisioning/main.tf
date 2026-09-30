terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "network" {
  source = "./Network"

  project_name = var.project_name
  vpc_cidr     = var.vpc_cidr

  availability_zones = [
    "us-east-1a",
    "us-east-1b"
  ]
}
module "security" {
  source = "./Security"

  project_name = var.project_name
  vpc_id       = module.network.vpc_id
  development_ip = var.development_ip
}

module "ec2_frontend" {
  source = "./EC2"

  project_name      = var.project_name
  role              = "frontend"
  instance_type     = "t3.micro"
  subnet_id         = module.network.public_subnet_ids[0]
  security_group_id = module.security.frontend_security_group_id
}

module "ec2_backend" {
  source = "./EC2"

  project_name      = var.project_name
  role              = "backend"
  instance_type     = "t3.micro"
  subnet_id         = module.network.public_subnet_ids[1]
  security_group_id = module.security.backend_security_group_id
}

# module "s3" {
#   source = "./S3"

#   project_name = var.project_name
# }

module "rds" {
  source = "./RDS"

  project_name      = var.project_name
  subnet_ids        = module.network.public_subnet_ids # TODO: Mudar para private_subnet_ids quando for para prod
  security_group_id = module.security.rds_security_group_id

  db_name     = "marketplace"
  db_username = "marketplace"
  db_password = var.db_password
}

module "dynamodb" {
  source = "./DynamoDB"

  project_name = var.project_name
}

module "sns_sqs" {
  source = "./SNS_SQS"

  project_name = var.project_name
}

module "elasticache" {
  source = "./ElastiCache"

  project_name      = var.project_name
  subnet_ids        = module.network.public_subnet_ids # TODO: Mudar para private_subnet_ids quando for para prod
  security_group_id = module.security.elasticache_security_group_id
}