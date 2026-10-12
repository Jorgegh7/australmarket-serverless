# User Pool de Cognito — gestiona la identidad del admin (unico rol
# autenticado en el MVP, ver seguridad-australmarket.md)
resource "aws_cognito_user_pool" "australmarket" {
  name = "australmarket-users"

  # Politica de contraseñas explicita
  password_policy {
    minimum_length    = 12
    require_uppercase = true
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
  }

  auto_verified_attributes = ["email"] # verifica el mail al crear la cuenta

  tags = merge(var.common_tags, {
    Name = "australmarket-cognito"
  })
}

# App Client — como lo usa el frontend (React, SPA) para autenticarse.
# generate_secret = false porque un SPA no puede guardar secretos de forma
# segura (el codigo corre en el navegador, visible para cualquiera)
resource "aws_cognito_user_pool_client" "frontend" {
  name         = "australmarket-frontend"
  user_pool_id = aws_cognito_user_pool.australmarket.id

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_ADMIN_USER_PASSWORD_AUTH" # necesario para probar login via AWS CLI (admin-initiate-auth)
  ]
  generate_secret = false
}

# Grupo "admin" — se crea desde el diseño inicial, aunque hoy sea el unico
# grupo poblado. Permite verificar cognito:groups en cada peticion protegida
# (no solo "JWT valido = admin"), sin costo adicional de implementacion.
# Ver seguridad-australmarket.md, "Decision de diseño"
resource "aws_cognito_user_group" "admin" {
  name         = "admin"
  user_pool_id = aws_cognito_user_pool.australmarket.id
  description  = "Grupo de administradores - unico rol autenticado en el MVP"
}
