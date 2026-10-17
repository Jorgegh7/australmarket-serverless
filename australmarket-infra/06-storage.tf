# Bucket unico para todo el proyecto (imagenes de productos + fotos de artesanos)
# Decision confirmada en el tablero: un solo bucket, no separados por tipo
resource "aws_s3_bucket" "australmarket" {
  bucket = "australmarket-imagenes-2026" # debe ser unico a nivel mundial en S3

  tags = merge(var.common_tags, {
    Name = "australmarket-imagenes"
  })
}

# Bucket totalmente privado: las imagenes se leen solo con URLs firmadas
# generadas por las Lambdas (s3:GetObject en sus roles)
resource "aws_s3_bucket_public_access_block" "australmarket" {
  bucket = aws_s3_bucket.australmarket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
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
