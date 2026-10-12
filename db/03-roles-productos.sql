-- 02-roles-productos.sql
-- Roles de PostgreSQL para el CRUD de productos (HU-B4)
-- Vinculados a roles de IAM via AWS IAM GRANT (ver comandos mas abajo)

CREATE ROLE productos_reader WITH LOGIN;
GRANT SELECT ON productos TO productos_reader;
-- 02-roles-productos.sql
-- Roles de PostgreSQL para el CRUD de productos (HU-B4)
-- Vinculo IAM en 03-iam-grant-productos.sql

CREATE ROLE productos_reader WITH LOGIN;
GRANT SELECT ON productos TO productos_reader;

CREATE ROLE productos_writer WITH LOGIN;
GRANT INSERT, UPDATE, DELETE, SELECT ON productos TO productos_writer;

GRANT SELECT ON artesanos TO productos_writer;