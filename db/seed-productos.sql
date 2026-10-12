-- db/seed-productos.sql
-- Datos de ejemplo para probar el catálogo público (HU-F5 / HU-F6).
-- Ejecutar como admin, igual que seed-artesanos.sql.
-- Requiere PGCLIENTENCODING=UTF8 para que las tildes entren bien.
--
-- imagen_url guarda la clave del objeto en S3 (no una URL). Mientras el backend
-- no entregue URLs firmadas, el frontend mostrará el placeholder.

INSERT INTO productos (artesano_id, nombre, historia, imagen_url, precio, categoria) VALUES
(
  'c38fe1b7-fdaf-40fe-82fd-ff1cd25a21cb',
  'Poncho de lana de oveja',
  'Tejido en telar tradicional con lana hilada a mano. Cada poncho lleva varios días de trabajo y mantiene los tonos naturales de la lana del sur.',
  'productos/poncho-lana.jpg',
  45990,
  'Textiles'
),
(
  'c38fe1b7-fdaf-40fe-82fd-ff1cd25a21cb',
  'Chal de lana teñida con plantas',
  'Teñido con tintes vegetales de la zona, como el nogal y la cebolla. Un chal liviano, cálido y único en su color.',
  'productos/chal-lana.jpg',
  28500,
  'Textiles'
),
(
  'c38fe1b7-fdaf-40fe-82fd-ff1cd25a21cb',
  'Canasto de mimbre',
  'Cestería tradicional hecha a mano con mimbre cosechado en la región. Resistente y perfecto para el hogar.',
  'productos/canasto-mimbre.jpg',
  18990,
  'Cestería'
),
(
  'c38fe1b7-fdaf-40fe-82fd-ff1cd25a21cb',
  'Tabla de madera de lenga',
  'Tabla para servir tallada en lenga, una madera nativa del sur de Chile. Cada pieza conserva la veta natural de la madera.',
  'productos/tabla-lenga.jpg',
  22990,
  'Madera'
);

-- Verificación
SELECT p.nombre, p.categoria, p.precio, a.nombre AS artesano
FROM productos p
JOIN artesanos a ON a.id = p.artesano_id
ORDER BY p.nombre;
