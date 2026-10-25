# AustralMarket

Catálogo serverless de productos artesanales del sur de Chile, construido en AWS. Proyecto nacido de la mentoría **AWS Nexus Mentorship** (mentor: Danny Friz).

**Sitio de demostración:** https://master.dy9whm0ljtf0l.amplifyapp.com (temporal; se retira tras la presentación)

## Finalidad

AustralMarket fue el medio para aprender IaC (infraestructura como código), seguridad en la nube, servicios de AWS y buenas prácticas de la industria sobre una arquitectura serverless. El desafío fue lograr una arquitectura funcional con el menor gasto posible, tratando el proyecto como un caso real: con un cliente, restricciones y decisiones que había que justificar.

## Qué hace

- **Público:** catálogo de productos y artesanos, detalle de producto, carrusel de regiones y contacto directo con el artesano por WhatsApp (con modal de confirmación).
- **Administración:** inicio de sesión con Cognito y panel para crear, editar y eliminar productos y artesanos, incluida la subida de imágenes desde el navegador.

### Alcance (MVP acotado)

Se decidió evitar guardar información sensible. Por eso no se almacenan datos de los visitantes, el único usuario registrado en Cognito es el administrador, y no hay carrito de compra ni pagos: el contacto es directo por WhatsApp.

## Arquitectura

```
Navegador ──► AWS Amplify Hosting (React + Vite)
                 │
                 ▼
            API Gateway (HTTP API v2) ──► Cognito (autorizador JWT en rutas de gestión)
                 │
                 ▼
            Lambdas (Node 20 + TypeScript), una por responsabilidad
                 │                         │
                 ▼                         ▼
        Aurora DSQL (auth IAM)       S3 privado (cifrado KMS)
                                      └─ URLs firmadas de lectura y subida

        CloudWatch (logs y alarmas) ──► SNS ──► correo del administrador
```

| Capa | Servicio | Decisión clave |
|---|---|---|
| Frontend | Amplify Hosting + React, Vite, TypeScript, CSS Modules | Despliegue continuo desde GitHub (`master`) |
| API | API Gateway HTTP API v2 | Rutas públicas de catálogo y rutas de gestión protegidas con JWT |
| Cómputo | Lambda Node 20 | Una Lambda por responsabilidad, con un módulo Terraform reutilizable y un rol de permisos propio |
| Datos | Aurora DSQL | Autenticación con token IAM (sin contraseñas) y roles de base de datos por responsabilidad |
| Imágenes | S3 + KMS | Bucket totalmente privado; lecturas y subidas con URLs firmadas |
| Identidad | Cognito | Grupo `admin`; el IdToken viaja en el header `Authorization` |
| Observabilidad | CloudWatch + SNS | Logs con retención de 30 días y alarmas de errores (una por Lambda y otra de 5xx de la API) con aviso por correo |
| Infraestructura | Terraform | Todo versionado en `australmarket-infra/` |

### Imágenes

La base de datos guarda solo la **clave** del objeto en S3. Las Lambdas de lectura generan una URL firmada de 1 hora. Para subir, el panel pide a `POST /admin/imagenes/url-subida` una URL firmada de 5 minutos y el navegador envía el archivo directo a S3, sin pasar por la API. La subida ocurre al guardar el formulario, para no dejar archivos huérfanos.

## Costo estimado

Escenarios de tráfico mensual considerados:

| | Bajo (lanzamiento) | Medio (tracción) | Alto (crecimiento) |
|---|---|---|---|
| Visitas al sitio | ~500 | ~5.000 | ~50.000 |
| Requests a la API | 2.000 | 20.000 | 200.000 |
| Productos en catálogo | 10-20 | 25-50 | 50-100 |

| Servicio | Bajo | Medio | Alto |
|---|---|---|---|
| Amplify Hosting | 0,44 USD | 1,41 USD | 6,14 USD |
| API Gateway | ~0,00 USD | 0,02 USD | 0,20 USD |
| Lambda (capa gratuita permanente) | 0 | 0 | 0 |
| Aurora DSQL (capa gratuita permanente) | 0 | 0 | 0 |
| S3 | ~0,00 USD | ~0,00 USD | ~0,00 USD |
| Cognito (capa gratuita permanente) | 0 | 0 | 0 |
| **Total estimado** | **~0,44 USD/mes** | **~1,43 USD/mes** | **~6,34 USD/mes** |

CloudWatch y SNS quedan dentro de la capa gratuita con la configuración actual.

## Estructura del repositorio

```
australmarket-frontend/   React + Vite (SPA)
australmarket-infra/      Terraform (API, Lambdas, IAM, S3, Cognito, DSQL, alarmas)
services/                 Código de cada Lambda (TypeScript)
db/                       Esquema, roles y datos de ejemplo (SQL versionado)
docs/                     Backlog, ADRs, seguridad y diagramas
```

## Documentación

- `docs/adr/`: decisiones de arquitectura y sus trade-offs (incluye las que se revirtieron, como los cambios de motor de base de datos).
- `docs/product-backlog-australmarket.md`: backlog completo, estado de cierre y deuda técnica.
- `docs/seguridad-australmarket.md`: decisiones de seguridad.
- `docs/pricing-calculator-*.md`: estimación de costos.

## Endpoints

**Públicos** (sin autenticación):

| Método y ruta | Descripción |
|---|---|
| `GET /catalogo/productos` | Lista de productos con imagen firmada |
| `GET /catalogo/productos/{id}` | Detalle de producto con datos del artesano (única ruta pública que devuelve el teléfono, necesario para el botón de WhatsApp) |
| `GET /catalogo/artesanos` | Artesanos, sin datos de contacto privados |

**Protegidos** (JWT de Cognito, grupo `admin`):

| Método y ruta | Descripción |
|---|---|
| `GET /productos` | Lista completa para el panel |
| `POST /productos` | Crear producto |
| `PUT /productos/{id}` | Editar producto |
| `DELETE /productos/{id}` | Eliminar producto |
| `GET /artesanos` | Lista completa para el panel (incluye datos de contacto) |
| `POST /artesanos` | Crear artesano |
| `PUT /artesanos/{id}` | Editar artesano |
| `DELETE /artesanos/{id}` | Eliminar artesano |
| `POST /admin/imagenes/url-subida` | URL firmada para subir una imagen |

## Despliegue

**Infraestructura** (desde `australmarket-infra/`, con el perfil AWS configurado):

```powershell
# Compilar cada servicio de services/ antes de aplicar
npx tsc

# El correo que recibe los avisos de las alarmas no se guarda en el repositorio
$env:TF_VAR_email_alertas = "correo-del-administrador@ejemplo.com"

terraform init
terraform plan
terraform apply
```

Tras el primer `apply`, AWS envía un correo de confirmación a esa dirección; hay que pulsar el enlace para activar los avisos.

**Base de datos:** ejecutar los scripts de `db/` en orden numérico con `psql` (conexión con token IAM de DSQL).

**Frontend:** conectado a Amplify; cada `git push` a `master` construye y publica. Variables de entorno necesarias en Amplify:

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API |
| `VITE_COGNITO_REGION` | Región del User Pool |
| `VITE_COGNITO_CLIENT_ID` | Client ID de la app en Cognito |

La app de Amplify incluye la regla de reescritura `/<*>` → `/index.html` (404-200) para que funcionen las rutas de React Router al recargar.

## Desarrollo local

```powershell
cd australmarket-frontend
npm install
npm run dev
```

Crea un `.env.local` con las tres variables anteriores. El origen `http://localhost:5173` está permitido en el CORS del bucket.

## Decisiones y trade-offs

- **Serverless**, porque no hay equipo de TI, el tráfico es bajo e irregular y el presupuesto es mínimo: se paga solo por uso.
- **Servicios descartados por costo y alcance:** AWS WAF y la observabilidad avanzada (tableros y trazas). Son trade-offs conscientes entre seguridad, operación y presupuesto.
- **Observabilidad nivel básico:** retención de logs, alarmas de errores y aviso por correo, que es lo que una sola persona administradora puede atender.
- **Seguridad en cada capa:** bucket privado con URLs firmadas, autorización en el borde con Cognito y JWT, un rol de permisos por Lambda y roles de base de datos separados por responsabilidad (ADR 008 y 009).

## Notas y limitaciones conocidas

- Proyecto de demostración académica; las imágenes son de referencia.
- El CORS de la API acepta cualquier origen (`*`); restringirlo a los dominios propios es una mejora pendiente.
- El catálogo público de artesanos comparte rol de base de datos con el panel: la barrera de los datos privados es la consulta y no un permiso (ver ADR 009).
- `GET /admin-test` es la Lambda "hola mundo" del inicio del proyecto. Se conserva a propósito como evidencia del proceso de construcción; está protegida con el mismo autorizador.
- Extra del frontend: el carrusel de regiones se calcula con datos que ya entrega la API; no tiene tabla ni imágenes propias.
- Deuda técnica registrada: AWS WAF, observabilidad avanzada (tableros y trazas), CloudFront, KMS propio para DSQL, Lambda Authorizer (401 vs 403), entornos separados, Secrets Manager, migrar el resto de la infraestructura a módulos, automatizar la ejecución de los scripts SQL, definir Amplify como código y pruebas automatizadas.

## Un patrón replicable

La arquitectura no depende de los productos artesanales. Sirve para cualquier contenido que funcione como catálogo: pocos administradores que cargan y curan la información, y muchos visitantes que la consultan (la carta de un restaurante, el portafolio de un estudio, un catálogo de cursos, un directorio local, un listado de propiedades). Cambian las tablas y los campos; la base serverless, la seguridad y la forma de desplegar se mantienen.

## Mentoría

Danny Friz · AWS Nexus Mentorship

## Autor

Jorge Gallardo Heck · 2026