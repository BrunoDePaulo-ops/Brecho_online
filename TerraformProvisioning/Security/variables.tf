variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "vpc_id" {
  description = "ID da VPC onde os Security Groups serão criados"
  type        = string
}
variable "development_ip" {
  description = "IP publico utilizado para desenvolvimento"
  type        = string
  default     = "0.0.0.0/32"
}