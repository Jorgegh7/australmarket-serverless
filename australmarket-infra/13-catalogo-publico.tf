# ============================================================
# Catalogo publico (HU-B5) — sin autenticacion, columnas filtradas
# ============================================================

module "catalogo_artesanos" {
  source = "./modules/lambda-api"

  function_name     = "catalogo-artesanos"
  source_dir        = "../services/catalogo-artesanos"
  role_arn          = aws_iam_role.lambda_artesanos_reader.arn
  routes            = [{ method = "GET", path = "/catalogo/artesanos" }]
  protegida         = false
  api_id            = aws_apigatewayv2_api.australmarket.id
  api_execution_arn = aws_apigatewayv2_api.australmarket.execution_arn
  dsql_endpoint     = var.dsql_endpoint
  tags              = var.common_tags
}

module "catalogo_productos" {
  source = "./modules/lambda-api"

  function_name     = "catalogo-productos"
  source_dir        = "../services/catalogo-productos"
  role_arn          = aws_iam_role.lambda_productos_reader.arn
  routes            = [{ method = "GET", path = "/catalogo/productos" }]
  protegida         = false
  api_id            = aws_apigatewayv2_api.australmarket.id
  api_execution_arn = aws_apigatewayv2_api.australmarket.execution_arn
  dsql_endpoint     = var.dsql_endpoint
  tags              = var.common_tags
}
