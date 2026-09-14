# API Gateway HTTP API — decision del ADR 002 (elegido sobre REST API por
# costo y porque las funciones avanzadas de REST, como cache y WAF, no
# aportan valor al alcance actual del MVP)
resource "aws_apigatewayv2_api" "australmarket" {
  name          = "australmarket-api"
  protocol_type = "HTTP" # HTTP API, no REST API — ver ADR 002

  # CORS: por defecto, el navegador bloquea que el frontend (Amplify) le
  # pida datos a una API en un dominio distinto, a menos que la API lo
  # permita explicitamente
  cors_configuration {
    allow_origins = ["*"] # TODO: restringir al dominio real del frontend en produccion
    allow_methods = ["GET", "POST", "PUT", "DELETE"]
    allow_headers = ["Authorization", "Content-Type"] # Authorization = donde viaja el JWT
  }

  tags = {
    Name = "australmarket-api"
  }
}

# Authorizer de Cognito — valida el JWT antes de invocar Lambda, en las
# rutas protegidas (equivalente al "Cognito User Pool Authorizer" descrito
# en seguridad-australmarket.md)
resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id           = aws_apigatewayv2_api.australmarket.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"] # donde buscar el JWT en la peticion
  name             = "cognito-authorizer"

  jwt_configuration {
    # audience/issuer confirman que el token viene DE ESTE Cognito especifico,
    # no de otro proyecto — evita que un JWT valido ajeno se cuele
    audience = [aws_cognito_user_pool_client.frontend.id]
    issuer   = "https://cognito-idp.us-east-1.amazonaws.com/${aws_cognito_user_pool.australmarket.id}"
  }
}

# Stage — el "ambiente" donde vive la API, accesible por URL.
# "$default" es un nombre especial de AWS que publica la API en la URL
# raiz, sin sufijo extra. auto_deploy publica cada cambio automaticamente,
# sin un paso manual de "deploy" aparte
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.australmarket.id
  name        = "$default"
  auto_deploy = true
}

# ============================================================
# Conexiones Lambda <-> API Gateway
# Patron fijo por cada Lambda: Integracion + Ruta + Permiso
# (ver adr/0002-api-gateway-http-api.md, seccion "Nota tecnica")
# ============================================================

# 1 [hola-mundo]: Integracion
# Conecta API Gateway con la Lambda de prueba (reutilizada, ver lambda.tf)
resource "aws_apigatewayv2_integration" "hola_mundo" {
  api_id                 = aws_apigatewayv2_api.australmarket.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.hola_mundo.invoke_arn
  payload_format_version = "2.0"
}

# 1 [hola-mundo]: Ruta
# Protegida con el Cognito Authorizer — prueba end-to-end de HU-B2
resource "aws_apigatewayv2_route" "admin_test" {
  api_id             = aws_apigatewayv2_api.australmarket.id
  route_key          = "GET /admin-test"
  target             = "integrations/${aws_apigatewayv2_integration.hola_mundo.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

# 1 [hola-mundo]: Permiso
# Sin esto, la integracion y la ruta existen pero la invocacion real falla
resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.hola_mundo.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.australmarket.execution_arn}/*/*"
}
