# ============================================================
# Lectura de imagenes privadas via URLs firmadas
# Las Lambdas lectoras firman URLs con las credenciales de su rol, asi que
# el rol necesita leer el objeto (s3:GetObject) y descifrarlo (kms:Decrypt).
# Cada rol solo accede al prefijo de su propio dominio.
# ============================================================

resource "aws_iam_role_policy" "productos_reader_imagenes" {
  name = "s3-imagenes-lectura"
  role = aws_iam_role.lambda_productos_reader.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject"]
        Resource = "${aws_s3_bucket.australmarket.arn}/productos/*"
      },
      {
        Effect   = "Allow"
        Action   = ["kms:Decrypt"]
        Resource = aws_kms_key.s3.arn
      }
    ]
  })
}

resource "aws_iam_role_policy" "artesanos_reader_imagenes" {
  name = "s3-imagenes-lectura"
  role = aws_iam_role.lambda_artesanos_reader.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject"]
        Resource = "${aws_s3_bucket.australmarket.arn}/artesanos/*"
      },
      {
        Effect   = "Allow"
        Action   = ["kms:Decrypt"]
        Resource = aws_kms_key.s3.arn
      }
    ]
  })
}
