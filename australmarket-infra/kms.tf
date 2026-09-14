# Llave KMS exclusiva para S3 — para cifrado del bucket de imagenes
resource "aws_kms_key" "s3" {
  description             = "Llave KMS para cifrado del bucket S3 (imagenes de productos y artesanos)"
  deletion_window_in_days = 7

  tags = {
    Name = "australmarket-s3-kms"
  }
}

resource "aws_kms_alias" "s3" {
  name          = "alias/australmarket-s3"
  target_key_id = aws_kms_key.s3.key_id
}
