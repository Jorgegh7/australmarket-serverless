module "listar_artesanos" {
  source = "./modules/lambda-api"

  function_name     = "listar-artesanos"
  source_dir        = "../services/listar-artesanos"
  role_arn          = aws_iam_role.lambda_artesanos_reader.arn
  routes            = [{ method = "GET", path = "/artesanos" }]
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

module "gestionar_artesano" {
  source = "./modules/lambda-api"

  function_name = "gestionar-artesano"
  source_dir    = "../services/gestionar-artesano"
  role_arn      = aws_iam_role.lambda_artesanos_writer.arn
  routes = [
    { method = "POST", path = "/artesanos" },
    { method = "PUT", path = "/artesanos/{id}" },
    { method = "DELETE", path = "/artesanos/{id}" },
  ]
  protegida         = true
  api_id            = aws_apigatewayv2_api.australmarket.id
  api_execution_arn = aws_apigatewayv2_api.australmarket.execution_arn
  authorizer_id     = aws_apigatewayv2_authorizer.cognito.id
  dsql_endpoint     = var.dsql_endpoint
  tags              = var.common_tags
}
