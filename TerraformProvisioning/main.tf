
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

# ========== REDE ==========

module "network" {
  source = "./Network"

  project_name = var.project_name
  vpc_cidr     = var.vpc_cidr

  availability_zones = [
    "us-east-1a",
    "us-east-1b"
  ]
}

# ========== SEGURANÇA ==========

module "security" {
  source = "./Security"

  project_name   = var.project_name
  vpc_id         = module.network.vpc_id
  development_ip = var.development_ip
}

# ========== SERVIÇOS EXISTENTES ==========

data "aws_sqs_queue" "image_processing" {
  name = "${var.project_name}-image-processing"
}

# ========== RDS ==========

module "rds" {
  source = "./RDS"

  project_name      = var.project_name
  subnet_ids        = module.network.private_subnet_ids
  security_group_id = module.security.rds_security_group_id

  db_name     = "marketplace"
  db_username = "marketplace"
  db_password = var.db_password
}

# ========== ELASTICACHE ==========

module "elasticache" {
  source = "./ElastiCache"

  project_name      = var.project_name
  subnet_ids        = module.network.public_subnet_ids
  security_group_id = module.security.elasticache_security_group_id
}

# ========== AUTO SCALING DO BACKEND ==========

module "autoscaling" {
  source = "./AutoScaling"

  project_name              = var.project_name
  vpc_id                    = module.network.vpc_id
  public_subnet_ids         = module.network.public_subnet_ids
  alb_security_group_id     = module.security.alb_security_group_id
  backend_security_group_id = module.security.backend_security_group_id

  user_data = templatefile("${path.root}/UserData/backend.sh", {
    aws_region     = var.aws_region
    secret_key     = var.secret_key
    db_host        = module.rds.endpoint_address
    db_password    = var.db_password
    s3_bucket      = var.s3_bucket_name
    dynamodb_table = "${var.project_name}-audit"
    sqs_queue_url  = data.aws_sqs_queue.image_processing.url
    redis_host     = module.elasticache.primary_endpoint

    github_user  = var.github_user
    github_token = var.github_token
    repo_branch  = var.backend_branch
  })
}

# ========== FRONTEND ==========

module "ec2_frontend" {
  source = "./EC2"

  project_name      = var.project_name
  role              = "frontend"
  instance_type     = "t3.micro"
  subnet_id         = module.network.public_subnet_ids[0]
  security_group_id = module.security.frontend_security_group_id

  user_data = templatefile("${path.root}/UserData/frontend.sh", {
    aws_region = var.aws_region

    api_url = "http://${module.autoscaling.alb_dns_name}/api"

    github_user  = var.github_user
    github_token = var.github_token
  })
}

# ========== WORKER ==========

module "ec2_worker" {
  source = "./EC2"

  project_name      = var.project_name
  role              = "worker"
  instance_type     = "t3.micro"
  subnet_id         = module.network.public_subnet_ids[0]
  security_group_id = module.security.worker_security_group_id

  user_data = templatefile("${path.root}/UserData/worker.sh", {
    aws_region     = var.aws_region
    sqs_queue_url  = data.aws_sqs_queue.image_processing.url
    s3_bucket_name = var.s3_bucket_name

    github_user  = var.github_user
    github_token = var.github_token
  })
}
