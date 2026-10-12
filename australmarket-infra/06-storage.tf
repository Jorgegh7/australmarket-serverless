# Bucket unico para todo el proyecto (imagenes de productos + fotos de artesanos)
# Decision confirmada en el tablero: un solo bucket, no separados por tipo
resource "aws_s3_bucket" "australmarket" {
  bucket = "australmarket-imagenes-2026" # debe ser unico a nivel mundial en S3

  tags = merge(var.common_tags, {
    Name = "australmarket-imagenes"
  })
}

# Bloquea toda forma de acceso publico al bucket
resource "aws_s3_bucket_public_access_block" "australmarket" {
  bucket = aws_s3_bucket.australmarket.id

  block_public_acls       = true  # seguimos bloqueando ACLs publicas (metodo viejo/inseguro)
  block_public_policy     = false # permite que una bucket policy otorgue lectura publica
  ignore_public_acls      = true  # seguimos ignorando ACLs publicas si alguien las intenta
  restrict_public_buckets = false # permite que el bucket tenga una politica publica activa
}

# Cifrado en reposo con la llave KMS propia de S3 (no la generica de AWS)
resource "aws_s3_bucket_server_side_encryption_configuration" "australmarket" {
  bucket = aws_s3_bucket.australmarket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.s3.arn
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_policy" "public_read" {
  bucket = aws_s3_bucket.australmarket.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.australmarket.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.australmarket]
}
