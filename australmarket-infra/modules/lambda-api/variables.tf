variable "function_name" {
  description = "Nombre corto de la funcion (sin prefijo australmarket-)"
  type        = string
}

variable "source_dir" {
  description = "Ruta relativa a la carpeta del codigo fuente de la Lambda"
  type        = string
}

variable "role_arn" {
  description = "ARN del execution role de IAM que usa esta Lambda"
  type        = string
}

variable "routes" {
  description = "Lista de rutas (metodo + path) que apuntan a esta Lambda"
  type = list(object({
    method = string
    path   = string
  }))
}

variable "protegida" {
  description = "Si true, la ruta exige JWT de Cognito. Si false, es publica"
  type        = bool
  default     = true
}

variable "api_id" {
  description = "ID de la API Gateway"
  type        = string
}

variable "api_execution_arn" {
  description = "Execution ARN de la API Gateway"
  type        = string
}

variable "authorizer_id" {
  description = "ID del Cognito Authorizer (solo se usa si protegida = true)"
  type        = string
  default     = null
}

variable "dsql_endpoint" {
  description = "Endpoint del cluster Aurora DSQL"
  type        = string
}

variable "tags" {
  description = "Tags comunes a aplicar"
  type        = map(string)
}
