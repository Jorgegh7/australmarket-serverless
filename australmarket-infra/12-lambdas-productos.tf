module "listar_productos" {
  source = "./modules/lambda-api"

  function_name     = "listar-productos"
  source_dir        = "../services/listar-productos"
  role_arn          = aws_iam_role.lambda_productos_reader.arn
  routes            = [{ method = "GET", path = "/productos" }]
  protegida         = true
  api_id            = aws_apigatewayv2_api.australmarket.id
  api_execution_arn = aws_apigatewayv2_api.australmarket.execution_arn
  authorizer_id     = aws_apigatewayv2_authorizer.cognito.id
  dsql_endpoint     = var.dsql_endpoint
  tags              = var.common_tags

  variables_extra = {
    BUCKET_NAME = aws_s3_bucket.australmarket.id
  }
}

module "gestionar_producto" {
  source = "./modules/lambda-api"

  function_name = "gestionar-producto"
  source_dir    = "../services/gestionar-producto"
  role_arn      = aws_iam_role.lambda_productos_writer.arn
  routes = [
    { method = "POST", path = "/productos" },
    { method = "PUT", path = "/productos/{id}" },
    { method = "DELETE", path = "/productos/{id}" },
  ]
  protegida         = true
  api_id            = aws_apigatewayv2_api.australmarket.id
  api_execution_arn = aws_apigatewayv2_api.australmarket.execution_arn
  authorizer_id     = aws_apigatewayv2_authorizer.cognito.id
  dsql_endpoint     = var.dsql_endpoint
  tags              = var.common_tags
}
