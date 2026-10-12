-- 03-iam-grant-productos.sql
-- Vinculo IAM <-> PostgreSQL para productos_reader / productos_writer
-- Correr DESPUES de aplicar los roles de IAM en Terraform

AWS IAM GRANT productos_reader TO 'arn:aws:iam::814023476104:role/lambda-productos-reader-execution';
AWS IAM GRANT productos_writer TO 'arn:aws:iam::814023476104:role/lambda-productos-writer-execution';