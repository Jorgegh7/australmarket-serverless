# Product Backlog — AustralMarket

Backlog completo del proyecto, repartido en los **4 sprints de implementación** posteriores al Gate 1 (el Sprint 1 fue de diseño y propuesta). Este documento refleja el **estado de cierre del proyecto** (octubre de 2026): todas las historias del MVP quedaron completas, más trabajo adicional y una lista de deuda técnica explícita.

**Estado general: 46 de 46 story points completados.**

## Backlog completo, por track

### Track Infraestructura / Backend

| ID | Historia / tarea | Pts | Estado |
|---|---|---|---|
| HU-B1 | Infraestructura base con Terraform: Aurora DSQL (esquema relacional con `FOREIGN KEY`, ver ADR 007), Cognito User Pool + Authorizer, bucket S3 (privado, cifrado con KMS), API Gateway (HTTP API) e IAM. La conectividad Lambda↔BD se resolvió con el endpoint público administrado de DSQL y autenticación por token IAM, sin VPC ni Data API. | 5 | ✅ Sprint 2 |
| HU-B2 | Iniciar sesión: Cognito + JWT Authorizer en API Gateway, con verificación del grupo `cognito:groups` desde el diseño inicial. | 3 | ✅ Sprint 2 |
| HU-B3 | CRUD de artesanos (backend) con `foto_perfil_url`, `telefono`, `red_social` y `mail`. | 3 | ✅ Sprint 3 |
| HU-B4 | CRUD de productos (backend) con `FOREIGN KEY` a artesano. | 5 | ✅ Sprint 3 |
| HU-B5 | Endpoints públicos del catálogo: listar productos y artesanos, y detalle de producto. | 3 | ✅ Sprint 4–5 |
| HU-B6 | Subida de imagen a S3 con una Lambda que genera URL prefirmada, reutilizada para producto y artesano. | 3 | ✅ Sprint 3, integrada al panel en Sprint 5 |

### Track Frontend

| ID | Historia / tarea | Pts | Estado |
|---|---|---|---|
| HU-F1 | Setup del proyecto frontend (React): estructura, ruteo, conexión a la API y wireframes. | 3 | ✅ Sprint 2 |
| HU-F2 | Pantalla de login (admin). | 2 | ✅ Sprint 4 |
| HU-F3 | Panel admin: gestión de artesanos con foto de perfil, teléfono, red social y mail. | 3 | ✅ Sprint 4–5 |
| HU-F4 | Panel admin: crear, editar y eliminar productos con subida de imagen. | 5 | ✅ Sprint 5 |
| HU-F5 | Catálogo público: listado de productos. | 3 | ✅ Sprint 4 |
| HU-F6 | Detalle de producto con historia y foto del artesano y botón de contacto por WhatsApp (con modal de confirmación). | 3 | ✅ Sprint 5 |

### Track Despliegue / QA

| ID | Historia / tarea | Pts | Estado |
|---|---|---|---|
| HU-D1 | Amplify Hosting con CI/CD: build y despliegue automáticos por `git push` a `master`. | 2 | ✅ Sprint 5 |
| HU-D2 | Pruebas end-to-end del flujo completo y ajustes finales. | 3 | ✅ Sprint 5 (verificación manual; las pruebas automatizadas quedan como deuda) |

**Total del Product Backlog: 46 story points, todos completados.**

---

## Distribución en los 4 sprints

### Sprint 2 — Fundaciones (11 pts) ✅
HU-B1, HU-B2, HU-F1.

### Sprint 3 — Backend de datos (11 pts) ✅
HU-B3, HU-B4, HU-B6.

### Sprint 4 — Frontend + catálogo público (11 pts) ✅
HU-B5, HU-F2, HU-F3, HU-F5.

### Sprint 5 — Cierre (13 pts) ✅
HU-F4, HU-F6, HU-D1, HU-D2.

---

## Trabajo adicional realizado en el cierre (fuera del backlog original)

| Tema | Detalle |
|---|---|
| Bucket privado con URLs firmadas | Las Lambdas de lectura firman `GetObject` (1 h); se eliminó la lectura pública del bucket (ADR 008). |
| Flujo de subida de imágenes desde el panel | Subida directa a S3 al guardar, con vista previa, cambio y quitado de imagen; CORS del bucket configurado para local y Amplify. |
| Detalle de producto por id | Lambda propia con rol de base de datos y de IAM dedicados; es la única ruta pública que entrega el teléfono (para WhatsApp). |
| Identidad visual completa | Paleta, logo, header, navbar, hero, footer, detalle, login, panel y 404, con responsividad (sistema de diseño en `DESIGN.md`). |
| Carrusel de regiones | Calculado en el frontend con datos que ya entrega la API; sin tabla ni imágenes propias. |
| Lambda de prueba `GET /admin-test` | Se conserva a propósito como evidencia del proceso de construcción. |

---

## Explícitamente fuera del MVP

- Registro y autopublicación de artesanos (decisión de curaduría por admin).
- Roles o grupos diferenciados en Cognito (solo existe el rol admin).
- Soft delete de productos.
- Flujos asíncronos: notificaciones, moderación, reportes.
- Carrito de compra o checkout.
- Ubicación o local físico como forma de contacto.

---

## Deuda técnica registrada

| Tema | Descripción |
|---|---|
| Rol de BD para el catálogo de artesanos | `catalogo-artesanos` comparte `artesanos_reader` con el panel; hoy los datos privados no salen por la consulta, no por permisos. Crear `catalogo_artesanos_reader` con `SELECT` solo sobre columnas públicas (ADR 009). |
| Archivos huérfanos en S3 | Una subida que luego se abandona deja un objeto sin referencia. Etiquetar los objetos y agregar una regla de ciclo de vida. |
| CORS de la API | Acepta cualquier origen (`*`); restringirlo a los dominios propios. |
| CloudFront | Servir imágenes con control de acceso al origen y caché, en lugar de URLs firmadas por consulta. |
| KMS propio para DSQL | Cifrado del clúster con clave administrada por el proyecto. |
| Lambda Authorizer | Diferenciar 401 (sin sesión) de 403 (sin permiso). |
| Múltiples entornos | Hoy solo existe `dev`; separar `dev` y `prod`. |
| Secrets Manager | Evaluar para configuración sensible futura. |
| Terraform | Migrar los recursos restantes a módulos reutilizables. |
| SQL | Script de migración que aplique `db/` en orden, y limpiar el bloque duplicado de `03-roles-productos.sql`. |
| Pruebas automatizadas | Pruebas unitarias de Lambdas y pruebas end-to-end del frontend. |

---

## Propuesta a futuro: Sprint 6 — Sección propia de Artesanos

Evaluada con el mismo nivel de detalle que el resto del backlog, para decidir conscientemente posponerla y no descartarla por defecto.

| Tarea | Por qué | Pts |
|---|---|---|
| Endpoint `GET /artesanos/{id}` | Datos de un artesano específico (nombre, historia, foto) | 1 |
| Endpoint `GET /artesanos/{id}/productos` | Todos los productos de ese artesano (misma consulta `WHERE artesano_id = X`) | 2 |
| Pantalla: perfil de artesano | Datos y lista de sus productos (reutiliza la card del catálogo) | 3 |
| Pantalla: listado de artesanos | Análogo al catálogo de productos | 3 |
| Navegación | Ruta y link nuevos en el menú | 1 |
| **Total** | | **~10 pts** |

**Por qué no entró:** equivale a un sprint completo adicional, y el tiempo de la mentoría no contemplaba un quinto sprint de implementación. No es una limitación técnica: el modelo de datos ya lo soporta (ADR 004).

---

## Nota de cierre

El orden de construcción fue deliberado: **primero lo que nadie puede evitar (infraestructura y autenticación), después el motor de datos, y al final la superficie visible (frontend)**, para no construir pantallas contra una API inexistente. En el cierre se tomó además una decisión de seguridad con costo real, pasar a un bucket privado con URLs firmadas, que se documentó en el ADR 008.