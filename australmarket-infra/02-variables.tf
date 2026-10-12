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

variable "common_tags" {
  description = "Tags comunes aplicados a todos los recursos, para trazabilidad de costos (FinOps)"
  type        = map(string)
  default = {
    Project     = "australmarket"
    Environment = "dev"
    ManagedBy   = "terraform"
  }
}

variable "dsql_endpoint" {
  description = "Endpoint completo del cluster Aurora DSQL, usado por las Lambdas para conectarse"
  type        = string
  default     = "g5ub5qt4ad7zvdai6v7x5qofdq.dsql.us-east-1.on.aws"
}
