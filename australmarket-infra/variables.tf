variable "aws_region" {
  description = "Region de AWS donde se despliega toda la infraestructura"
  type        = string
  default     = "us-east-1" # decision del ADR 001 (restriccion del proyecto)
}

variable "aws_profile" {
  description = "Perfil de AWS CLI usado por Terraform para autenticarse"
  type        = string
  default     = "australmarket-dev"
}

variable "project_name" {
  description = "Nombre base del proyecto, usado para nombrar recursos de forma consistente"
  type        = string
  default     = "australmarket"
}
