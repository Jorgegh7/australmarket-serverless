# ADR 004: Modelo de datos — relacional, dos tablas (artesanos, productos)

## Estado
Aceptado

## Contexto
AustralMarket necesita persistir dos entidades relacionadas: **artesanos** (autores de los productos) y **productos** (con su historia, categoría/región, precio, URL de imagen y contacto), donde cada producto pertenece a un artesano.

Se evaluó DynamoDB (NoSQL, clave-valor) frente a un modelo relacional (RDS/Aurora). DynamoDB ofrece escalado automático a niveles masivos sin configuración, ideal para patrones de acceso simples y predecibles sin necesidad de joins. Sin embargo, el modelo de AustralMarket tiene una relación uno-a-muchos clara y consultas que naturalmente requieren traer un producto junto con los datos de su artesano — un caso de uso donde un modelo relacional explícito es más natural que modelar relaciones a mano en un esquema clave-valor.

## Decisión
Se usa un **modelo relacional** con dos tablas: `artesanos` y `productos`, relacionadas uno-a-muchos vía `productos.artesano_id`.

```
artesanos: id | nombre | historia | region | foto_perfil_url | telefono | red_social (opcional, 1 link) | mail (opcional)
productos: id | artesano_id (FK) | nombre | historia | imagen_url | precio | categoria
```

Las imágenes no se almacenan en la base de datos: `imagen_url` y `foto_perfil_url` son solo punteros a objetos en S3.

## Consecuencias
- Las consultas que combinan producto + artesano se resuelven con SQL estándar (JOIN), sin lógica de aplicación adicional para reconstruir relaciones.
- El modelo es simple (2 tablas, 1 relación) — no se requieren las ventajas de escalado masivo sin configuración que ofrece DynamoDB, ya que el volumen esperado del MVP es bajo y predecible.
- Este modelo asume relaciones vía SQL nativo (FOREIGN KEY), lo cual influye directamente en la decisión de motor de base de datos — ver ADR 005.
- `foto_perfil_url` se incluye en el esquema y **sí se usa desde el MVP** — se muestra en el detalle de producto (HU-F6) junto a la historia del artesano, aprovechando el mismo mecanismo de subida a S3 que ya existe para las imágenes de producto (HU-B6). No requiere esperar a una sección propia de Artesanos: esa sí queda fuera del MVP porque implica un endpoint y una pantalla nuevos (ver "Fuera de alcance" en el README), pero mostrar la foto en una pantalla que ya existía no tiene ese costo adicional.

## Alternativas consideradas
- **DynamoDB**: descartada por preferir un modelo relacional explícito, dado que el caso de uso principal (traer producto con datos de su artesano) es una relación natural, no un patrón de acceso clave-valor.

## Fuera de alcance (evaluado, no incluido en el MVP)
Ubicación/dirección para artesanos con local físico. `telefono`, `red_social` y `mail` ya están en el esquema.

**Nota sobre `mail`:** además de ser dato de contacto, es el campo que Cognito usa típicamente como identificador de login. Tenerlo ya guardado no crea una cuenta de Cognito por sí solo (son sistemas distintos — ver `seguridad-australmarket.md`), pero es el dato puente necesario para vincular, en una futura iteración, cada artesano con su propia cuenta autenticada, sin tener que pedírselo después.
