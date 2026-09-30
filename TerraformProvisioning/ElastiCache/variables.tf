variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "subnet_ids" {
  description = "IDs das subnets privadas"
  type        = list(string)
}

variable "security_group_id" {
  description = "Security Group do ElastiCache"
  type        = string
}