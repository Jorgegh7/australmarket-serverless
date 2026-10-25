# ============================================================
# Subida de imagenes desde el panel admin
# Una sola Lambda entrega URLs firmadas de subida (PUT) para productos y
# artesanos. El navegador sube el archivo directo a S3.
# ============================================================

resource "aws_iam_role" "lambda_subida_imagenes" {
  name               = "lambda-subida-imagenes-execution"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json

  tags = merge(var.common_tags, {
    Name = "lambda-subida-imagenes"
  })
}

resource "aws_iam_role_policy_attachment" "subida_imagenes_logs" {
  role       = aws_iam_role.lambda_subida_imagenes.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Solo escritura sobre los dos prefijos, y generar la clave de datos de KMS
# (el bucket cifra con la llave propia). Sin lectura, listado ni borrado.
resource "aws_iam_role_policy" "subida_imagenes_s3" {
  name = "s3-subida-imagenes"
  role = aws_iam_role.lambda_subida_imagenes.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["s3:PutObject"]
        Resource = [
          "${aws_s3_bucket.australmarket.arn}/productos/*",
          "${aws_s3_bucket.australmarket.arn}/artesanos/*"
        ]
      },
      {
        Effect   = "Allow"
        Action   = ["kms:GenerateDataKey"]
        Resource = aws_kms_key.s3.arn
      }
    ]
  })
}

module "generar_url_subida" {
  source = "./modules/lambda-api"

  function_name     = "generar-url-subida"
  source_dir        = "../services/generar-url-subida"
  role_arn          = aws_iam_role.lambda_subida_imagenes.arn
  routes            = [{ method = "POST", path = "/admin/imagenes/url-subida" }]
  protegida         = true
  api_id            = aws_apigatewayv2_api.australmarket.id
  api_execution_arn = aws_apigatewayv2_api.australmarket.execution_arn
  authorizer_id     = aws_apigatewayv2_authorizer.cognito.id
  dsql_endpoint     = var.dsql_endpoint # el modulo lo exige, esta Lambda no usa la base
  tags              = var.common_tags

  variables_extra = {
    BUCKET_NAME = aws_s3_bucket.australmarket.id
  }
}

# CORS del bucket: sin esto el navegador no puede hacer el PUT directo a S3.
# Orígenes permitidos: desarrollo local y dominio de Amplify.
resource "aws_s3_bucket_cors_configuration" "australmarket" {
  bucket = aws_s3_bucket.australmarket.id

  cors_rule {
    allowed_origins = ["http://localhost:5173", "http://localhost:5174", "https://master.dy9whm0ljtf0l.amplifyapp.com"]
    allowed_methods = ["PUT", "GET"]
    allowed_headers = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}
