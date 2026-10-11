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

  project_name   = var.project_name
  vpc_id         = module.network.vpc_id
  development_ip = var.development_ip
}

module "sns_sqs" {
  source = "./SNS_SQS"

  project_name = var.project_name
}

# module "ec2_backend" {
#   source = "./EC2"

#   project_name      = var.project_name
#   role              = "backend"
#   instance_type     = "t3.micro"
#   subnet_id         = module.network.public_subnet_ids[1]
#   security_group_id = module.security.backend_security_group_id

#   user_data = templatefile("${path.root}/UserData/backend.sh", {
#     aws_region     = var.aws_region
#     secret_key     = var.secret_key
#     db_host        = module.rds.endpoint_address
#     db_password    = var.db_password
#     s3_bucket      = var.s3_bucket_name
#     dynamodb_table = module.dynamodb.table_name
#     sqs_queue_url  = module.sns_sqs.sqs_queue_url
#     redis_host     = module.elasticache.primary_endpoint

#     github_user  = var.github_user
#     github_token = var.github_token
#   })
# }

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
    dynamodb_table = module.dynamodb.table_name
    sqs_queue_url  = module.sns_sqs.sqs_queue_url
    redis_host     = module.elasticache.primary_endpoint

    github_user    = var.github_user
    github_token   = var.github_token
  })
}

module "ec2_frontend" {
  source = "./EC2"

  project_name      = var.project_name
  role              = "frontend"
  instance_type     = "t3.micro"
  subnet_id         = module.network.public_subnet_ids[0]
  security_group_id = module.security.frontend_security_group_id

  user_data = templatefile("${path.root}/UserData/frontend.sh", {
    aws_region = var.aws_region

    api_url      = "http://${module.autoscaling.alb_dns_name}/api"

    github_user  = var.github_user
    github_token = var.github_token
  })
}
module "ec2_worker" {
  source = "./EC2"

  project_name      = var.project_name
  role              = "worker"
  instance_type     = "t3.micro"
  subnet_id         = module.network.public_subnet_ids[0]
  security_group_id = module.security.worker_security_group_id

  user_data = templatefile("${path.root}/UserData/worker.sh", {
    aws_region     = var.aws_region
    sqs_queue_url  = module.sns_sqs.sqs_queue_url
    s3_bucket_name = var.s3_bucket_name

    github_user  = var.github_user
    github_token = var.github_token
  })
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

module "elasticache" {
  source = "./ElastiCache"

  project_name      = var.project_name
  subnet_ids        = module.network.public_subnet_ids # TODO: Mudar para private_subnet_ids quando for para prod
  security_group_id = module.security.elasticache_security_group_id
}