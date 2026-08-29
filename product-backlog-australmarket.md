# Product Backlog — AustralMarket

Este es el backlog completo del proyecto (todo lo que hay que construir para el MVP), repartido en los **4 sprints de implementación** posteriores al Gate 1. El Sprint 1 (este) fue de diseño y propuesta — no construye funcionalidad, define cómo se va a construir.

## Backlog completo, por track

### Track Infraestructura / Backend

| ID | Historia / tarea | Story points |
|---|---|---|
| HU-B1 | Configurar infraestructura base con Terraform: VPC, Aurora Serverless v2, Cognito User Pool, bucket S3, API Gateway (esqueleto), IAM (execution roles con permisos mínimos definidos junto con la especificación de cada Lambda — no después de su código) | 5 |
| HU-B2 | Iniciar sesión — integración Cognito + JWT Authorizer en API Gateway, con verificación de grupo (`cognito:groups`) desde el diseño inicial, no solo validación de token | 3 |
| HU-B3 | CRUD de artesanos (backend) — crear y listar, incluyendo `foto_perfil_url` (S3), `telefono` (requerido para WhatsApp, HU-F6), `red_social` y `mail` (opcionales) | 3 |
| HU-B4 | CRUD de productos (backend) — crear, editar, eliminar, con `FOREIGN KEY` a artesano | 5 |
| HU-B5 | Endpoints públicos del catálogo — listar productos + detalle (sin autenticación) | 3 |
| HU-B6 | Subida de imagen a S3 — Lambda que genera URL prefirmada para que el frontend suba directo (reutilizada tanto para imagen de producto como foto de artesano) | 3 |

### Track Frontend

| ID | Historia / tarea | Story points |
|---|---|---|
| HU-F1 | Setup del proyecto frontend (React) — estructura, ruteo, conexión a la API. Incluye wireframes rápidos (login, catálogo, detalle producto, panel admin) antes de programar las pantallas | 3 |
| HU-F2 | Pantalla de login (admin) | 2 |
| HU-F3 | Panel admin — formulario crear/listar artesano, con upload de foto de perfil, teléfono, red social y mail (opcionales estos dos últimos) | 3 |
| HU-F4 | Panel admin — formulario crear/editar/eliminar producto, con upload de imagen | 5 |
| HU-F5 | Catálogo público — listado de productos (vista visitante) | 3 |
| HU-F6 | Detalle de producto — vista pública con historia y foto del artesano, y botón de contacto vía WhatsApp (redirige externo, sin flujo de pago ni chat dentro de la plataforma) | 3 |

### Track Despliegue / QA

| ID | Historia / tarea | Story points |
|---|---|---|
| HU-D1 | Configurar Amplify Hosting + CI/CD (build/deploy automático por `git push`) | 2 |
| HU-D2 | Pruebas end-to-end del flujo completo + ajustes finales | 3 |

**Total del Product Backlog: 46 story points.**

---

## Distribución en los 4 sprints

La distribución respeta dependencias reales: no se puede construir el panel admin (frontend) antes de tener login funcionando (backend), ni el catálogo público antes de tener el endpoint que lo sirve.

### Sprint 2 — Fundaciones (11 pts)
- HU-B1 — Infraestructura base (Terraform)
- HU-B2 — Login (backend)
- HU-F1 — Setup del frontend + wireframes de las pantallas principales

**Por qué primero:** sin esto, ningún otro track puede avanzar — es la base sobre la que se paran todos los sprints siguientes.

### Sprint 3 — Backend de datos (11 pts)
- HU-B3 — CRUD artesanos (backend)
- HU-B4 — CRUD productos (backend)
- HU-B6 — Subida de imagen a S3

**Por qué segundo:** el frontend de administración (Sprint 4) necesita que estos endpoints ya existan para poder consumirlos.

### Sprint 4 — Frontend + catálogo público (11 pts)
- HU-B5 — Endpoints públicos del catálogo
- HU-F2 — Pantalla de login
- HU-F3 — Panel admin: formulario artesano
- HU-F5 — Catálogo público (listado)

### Sprint 5 — Cierre (13 pts)
- HU-F4 — Panel admin: formulario producto (con upload)
- HU-F6 — Detalle de producto + botón de contacto WhatsApp
- HU-D1 — Amplify Hosting + CI/CD
- HU-D2 — Pruebas end-to-end y ajustes finales

**Por qué al final:** consolida lo construido, conecta el último flujo pendiente (upload de imagen desde el formulario), y deja el proyecto desplegado y probado de punta a punta.

---

## Explícitamente fuera de este backlog (MVP)

- Registro/autopublicación de artesanos (decisión de curaduría por admin).
- Roles/grupos diferenciados en Cognito (solo existe el rol admin).
- Soft delete de productos.
- Cualquier flujo asíncrono — notificaciones, moderación, reportes (ver roadmap a futuro, doc de estudio sección 7.1).
- Carrito de compra o checkout.
- Otra forma de contacto: ubicación/local físico — `telefono`, `red_social` y `mail` sí entran al MVP.

---

## Propuesta a futuro: Sprint 6 — Sección propia de Artesanos (extra, fuera de los 4 sprints)

Evaluada con el mismo nivel de detalle que el resto del backlog, para poder contrastarla — y decidir conscientemente posponerla, no descartarla por defecto.

| Tarea | Por qué | Story points |
|---|---|---|
| Endpoint `GET /artesanos/{id}` | Traer datos de un artesano específico (nombre, historia, foto) | 1 |
| Endpoint `GET /artesanos/{id}/productos` | Todos los productos de ese artesano (reutiliza la misma consulta `WHERE artesano_id = X` del detalle de producto) | 2 |
| Pantalla: perfil de artesano | Datos + lista de sus productos (reutiliza el componente de card de producto del catálogo) | 3 |
| Pantalla: listado de "Artesanos" | Catálogo de artesanos, análogo al de productos | 3 |
| Navegación | Ruta/link nuevo en el menú del sitio | 1 |
| **Total** | | **~10 pts** |

**Por qué no entra en los 4 sprints actuales:** ~10 puntos equivalen aproximadamente a un sprint completo adicional (los Sprints 2-5 rondan 11-13 pts cada uno) — el tiempo disponible de la mentoría (16 ago–23 oct 2026, sprints quincenales) no contempla un quinto sprint de implementación. No es una limitación técnica ni de diseño (el modelo de datos ya lo soporta sin cambios — ver ADR 004), es una limitación de tiempo/alcance frente al resto del backlog priorizado.

**Por qué el costo es relativamente bajo pese a ser "un sprint más":** reutiliza casi todo lo ya construido — mismo modelo de datos, misma lógica de consulta, mismo componente visual de card. No es una feature nueva desde cero, es una recombinación de piezas existentes.

## Nota para el gate

Los ~11-12 puntos por sprint son una carga pareja y realista para el ritmo de un estudiante trabajando en paralelo con otros ramos — ningún sprint concentra el doble de trabajo que otro. Si Danny pregunta por el "por qué de este orden", la respuesta corta es: **primero lo que nadie puede evitar depender de (infraestructura y auth), después el motor de datos, y al final la superficie visible (frontend) que consume todo lo anterior** — evita construir pantallas contra una API que todavía no existe.

---
*Para subir a GitHub: crear un Milestone por Sprint (Sprint 2, 3, 4, 5), un Issue por cada HU/tarea asignado a su Milestone correspondiente, y un Issue "Epic" que las enlace todas como checklist.*
