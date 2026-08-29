# ADR 004: Modelo de datos — relacional, dos tablas (artesanos, productos)

## Estado
Aceptado

## Contexto
AustralMarket necesita persistir dos entidades relacionadas: **artesanos** (autores de los productos) y **productos** (con su historia, categoría/región, precio, URL de imagen y contacto), donde cada producto pertenece a un artesano.

Se evaluó DynamoDB (NoSQL, clave-valor) frente a un modelo relacional (RDS/Aurora). DynamoDB ofrece escalado automático a niveles masivos sin configuración, ideal para patrones de acceso simples y predecibles sin necesidad de joins. Sin embargo, el modelo de AustralMarket tiene una relación uno-a-muchos clara y consultas que naturalmente requieren traer un producto junto con los datos de su artesano — un caso de uso donde un modelo relacional explícito es más natural que modelar relaciones a mano en un esquema clave-valor.

## Decisión
Se usa un **modelo relacional** con dos tablas: `artesanos` y `productos`, relacionadas uno-a-muchos vía `productos.artesano_id`.

```
artesanos: id | nombre | historia | region | foto_perfil_url
productos: id | artesano_id (FK) | nombre | historia | imagen_url | precio | categoria
```

Las imágenes no se almacenan en la base de datos: `imagen_url` y `foto_perfil_url` son solo punteros a objetos en S3.

## Consecuencias
- Las consultas que combinan producto + artesano se resuelven con SQL estándar (JOIN), sin lógica de aplicación adicional para reconstruir relaciones.
- El modelo es simple (2 tablas, 1 relación) — no se requieren las ventajas de escalado masivo sin configuración que ofrece DynamoDB, ya que el volumen esperado del MVP es bajo y predecible.
- Este modelo asume relaciones vía SQL nativo (FOREIGN KEY), lo cual influye directamente en la decisión de motor de base de datos — ver ADR 005.
- `foto_perfil_url` se incluye en el esquema desde el diseño inicial, aunque el MVP no la use todavía (no hay página de perfil de artesano — ver "Fuera de alcance" en el README). Agregarla ahora evita una migración de esquema más adelante si se construye la sección propia de Artesanos en una futura iteración.

## Alternativas consideradas
- **DynamoDB**: descartada por preferir un modelo relacional explícito, dado que el caso de uso principal (traer producto con datos de su artesano) es una relación natural, no un patrón de acceso clave-valor.
