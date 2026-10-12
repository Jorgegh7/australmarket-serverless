-- 01-roles-artesanos.sql
-- Roles de PostgreSQL para el CRUD de artesanos (HU-B3)
-- Vinculados a roles de IAM via AWS IAM GRANT (ver comandos mas abajo)

CREATE ROLE artesanos_reader WITH LOGIN;
GRANT SELECT ON artesanos TO artesanos_reader;

CREATE ROLE artesanos_writer WITH LOGIN;
GRANT INSERT, UPDATE, DELETE, SELECT ON artesanos TO artesanos_writer;
