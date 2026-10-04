variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "role" {
  description = "Funcao da instancia"
  type        = string
}

variable "instance_type" {
  description = "Tipo da instancia EC2"
  type        = string
  default     = "t3.micro"
}

variable "subnet_id" {
  description = "Subnet onde a EC2 sera criada"
  type        = string
}

variable "security_group_id" {
  description = "Security Group da EC2"
  type        = string
}

variable "github_token" {
  description = "Token do GitHub para o Worker clonar o repo"
  type        = string
  sensitive   = true
  default     = "" 

}