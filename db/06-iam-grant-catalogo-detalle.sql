-- 06-iam-grant-catalogo-detalle.sql
-- Vincula el rol de PostgreSQL con el rol de IAM de la Lambda de detalle

AWS IAM GRANT catalogo_detalle_reader
  TO 'arn:aws:iam::814023476104:role/lambda-catalogo-detalle-execution';