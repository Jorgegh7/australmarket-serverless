module "hola_mundo" {
  source = "./modules/lambda-api"

  function_name     = "hola-mundo"
  source_dir        = "../services/hola-mundo"
  role_arn          = aws_iam_role.lambda_execution.arn
  routes            = [{ method = "GET", path = "/admin-test" }]
  protegida         = true
  api_id            = aws_apigatewayv2_api.australmarket.id
  api_execution_arn = aws_apigatewayv2_api.australmarket.execution_arn
  authorizer_id     = aws_apigatewayv2_authorizer.cognito.id
  dsql_endpoint     = var.dsql_endpoint
  tags              = var.common_tags
}
