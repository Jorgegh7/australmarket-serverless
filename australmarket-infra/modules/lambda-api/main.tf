data "archive_file" "this" {
  type        = "zip"
  source_dir  = var.source_dir
  excludes    = ["index.ts", "tsconfig.json", "package-lock.json"]
  output_path = "${path.module}/${var.function_name}.zip"
}

resource "aws_lambda_function" "this" {
  function_name = "australmarket-${var.function_name}"
  filename      = data.archive_file.this.output_path
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  role          = var.role_arn

  source_code_hash = data.archive_file.this.output_base64sha256

  environment {
    variables = merge(
      { DSQL_ENDPOINT = var.dsql_endpoint },
      var.variables_extra
    )
  }

  tags = merge(var.tags, {
    Name = "australmarket-${var.function_name}"
  })
}

resource "aws_apigatewayv2_integration" "this" {
  api_id                 = var.api_id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.this.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "this" {
  for_each = { for r in var.routes : "${r.method} ${r.path}" => r }

  api_id             = var.api_id
  route_key          = "${each.value.method} ${each.value.path}"
  target             = "integrations/${aws_apigatewayv2_integration.this.id}"
  authorization_type = var.protegida ? "JWT" : null
  authorizer_id      = var.protegida ? var.authorizer_id : null
}

resource "aws_lambda_permission" "this" {
  statement_id  = "AllowAPIGatewayInvoke${replace(var.function_name, "-", "")}"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.this.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_execution_arn}/*/*"
}
