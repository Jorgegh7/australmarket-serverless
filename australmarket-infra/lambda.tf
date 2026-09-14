# Empaqueta automaticamente el codigo JS ya compilado de la Lambda
data "archive_file" "hola_mundo" {
  type        = "zip"
  source_file = "lambda-hola-mundo/index.js"
  output_path = "${path.module}/hola_mundo.zip"
}

resource "aws_lambda_function" "hola_mundo" {
  function_name = "australmarket-hola-mundo"
  filename      = data.archive_file.hola_mundo.output_path
  handler       = "index.handler" # archivo.funcion
  runtime       = "nodejs20.x"
  role          = aws_iam_role.lambda_execution.arn

  source_code_hash = data.archive_file.hola_mundo.output_base64sha256

  tags = {
    Name = "australmarket-hola-mundo"
  }
}
