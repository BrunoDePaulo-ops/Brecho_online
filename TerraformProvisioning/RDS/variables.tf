variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "subnet_ids" {
  description = "IDs das subnets privadas onde o RDS poderá ser criado"
  type        = list(string)
}

variable "security_group_id" {
  description = "Security Group do RDS"
  type        = string
}

variable "db_name" {
  description = "Nome do banco de dados"
  type        = string
  default     = "marketplace"
}

variable "db_username" {
  description = "Usuario administrador do banco"
  type        = string
  default     = "marketplace"
}

variable "db_password" {
  description = "Senha do usuario administrador"
  type        = string
  sensitive   = true
  default = "123456789"
}