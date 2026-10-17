# ============================================================
# Detalle publico de un producto: GET /catalogo/productos/{id}
# Rol de IAM y rol de base de datos propios. Es el unico endpoint publico
# que devuelve el telefono del artesano (lo necesita el boton de WhatsApp).
# ============================================================

resource "aws_iam_role" "lambda_catalogo_detalle" {
  name               = "lambda-catalogo-detalle-execution"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json

  tags = merge(var.common_tags, {
    Name = "lambda-catalogo-detalle"
  })
}

resource "aws_iam_role_policy_attachment" "catalogo_detalle_logs" {
  role       = aws_iam_role.lambda_catalogo_detalle.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "catalogo_detalle_dsql" {
  name = "dsql-connect"
  role = aws_iam_role.lambda_catalogo_detalle.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["dsql:DbConnect"]
      Resource = aws_dsql_cluster.australmarket.arn
    }]
  })
}

# Firma las imagenes del producto y de la foto del artesano
resource "aws_iam_role_policy" "catalogo_detalle_imagenes" {
  name = "s3-imagenes-lectura"
  role = aws_iam_role.lambda_catalogo_detalle.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["s3:GetObject"]
        Resource = [
          "${aws_s3_bucket.australmarket.arn}/productos/*",
          "${aws_s3_bucket.australmarket.arn}/artesanos/*"
        ]
      },
      {
        Effect   = "Allow"
        Action   = ["kms:Decrypt"]
        Resource = aws_kms_key.s3.arn
      }
    ]
  })
}

module "catalogo_producto_detalle" {
  source = "./modules/lambda-api"

  function_name     = "catalogo-producto-detalle"
  source_dir        = "../services/catalogo-producto-detalle"
  role_arn          = aws_iam_role.lambda_catalogo_detalle.arn
  routes            = [{ method = "GET", path = "/catalogo/productos/{id}" }]
  protegida         = false
  api_id            = aws_apigatewayv2_api.australmarket.id
  api_execution_arn = aws_apigatewayv2_api.australmarket.execution_arn
  dsql_endpoint     = var.dsql_endpoint
  tags              = var.common_tags

  variables_extra = {
    BUCKET_NAME = aws_s3_bucket.australmarket.id
  }
}
