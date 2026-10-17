-- 05-roles-catalogo-detalle.sql
-- Rol de PostgreSQL para GET /catalogo/productos/{id} (detalle publico)
-- Vinculo IAM en 06-iam-grant-catalogo-detalle.sql

CREATE ROLE catalogo_detalle_reader WITH LOGIN;

GRANT SELECT ON productos TO catalogo_detalle_reader;

-- Solo las columnas que el detalle necesita: excluye mail y red_social.
-- Incluye telefono porque el boton de WhatsApp lo requiere.
GRANT SELECT (id, nombre, historia, region, foto_perfil_url, telefono)
  ON artesanos TO catalogo_detalle_reader;