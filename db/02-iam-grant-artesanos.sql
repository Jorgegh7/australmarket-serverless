-- 03-iam-grant-artesanos.sql
-- Vinculo IAM <-> PostgreSQL para artesanos_reader / artesanos_writer
-- Correr DESPUES de aplicar los roles de IAM en Terraform

AWS IAM GRANT artesanos_reader TO 'arn:aws:iam::814023476104:role/lambda-artesanos-reader-execution';
AWS IAM GRANT artesanos_writer TO 'arn:aws:iam::814023476104:role/lambda-artesanos-writer-execution';