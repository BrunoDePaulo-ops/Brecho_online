variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Nome do projeto"
  type        = string
  default     = "brechonline"
}

variable "vpc_cidr" {
  description = "CIDR da VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "db_password" {
  description = "Senha do PostgreSQL"
  type        = string
  sensitive   = true
}

variable "development_ip" {
  description = "IP publico utilizado para desenvolvimento"
  type        = string
}

variable "github_token" {
  description = "Token do GitHub para o Worker clonar o repo"
  type        = string
  sensitive   = true
}