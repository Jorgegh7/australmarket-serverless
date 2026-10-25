# AustralMarket

Catálogo serverless de productos artesanales del sur de Chile. Proyecto de mentoría AWS construido sobre una arquitectura sin servidores, con infraestructura como código.

**Sitio en producción (demo):** https://master.dy9whm0ljtf0l.amplifyapp.com

## Qué hace

- **Público:** catálogo de productos y artesanos, detalle de producto, carrusel de regiones y contacto directo con el artesano por WhatsApp (con modal de confirmación).
- **Administración:** inicio de sesión con Cognito y panel para crear, editar y eliminar productos y artesanos, incluida la subida de imágenes desde el navegador.

## Arquitectura

```
Navegador ──► AWS Amplify Hosting (React + Vite)
                 │
                 ▼
            API Gateway (HTTP API v2) ──► Cognito (autorizador JWT, solo rutas /admin)
                 │
                 ▼
            Lambdas (Node 20 + TypeScript), una por función
                 │                         │
                 ▼                         ▼
        Aurora DSQL (auth IAM)       S3 privado (cifrado KMS)
                                      └─ URLs firmadas de lectura y subida
```

| Capa | Servicio | Decisión clave |
|---|---|---|
| Frontend | Amplify Hosting + React, Vite, TypeScript, CSS Modules | Despliegue continuo desde GitHub (`master`) |
| API | API Gateway HTTP API v2 | Rutas públicas de catálogo y rutas `/admin` protegidas con JWT |
| Cómputo | Lambda Node 20 | Una Lambda por responsabilidad, empaquetadas con un módulo Terraform reutilizable |
| Datos | Aurora DSQL | Autenticación con token IAM y un rol de base de datos por Lambda con permisos mínimos |
| Imágenes | S3 + KMS | Bucket totalmente privado; lecturas y subidas con URLs firmadas |
| Identidad | Cognito | Grupo `admin`; el IdToken viaja en el header `Authorization` |
| Infraestructura | Terraform | Todo versionado en `australmarket-infra/` |

### Imágenes

La base de datos guarda solo la **clave** del objeto en S3. Las Lambdas de lectura generan una URL firmada de 1 hora. Para subir, el panel pide a `POST /admin/imagenes/url-subida` una URL firmada de 5 minutos y el navegador envía el archivo directo a S3, sin pasar por la API. La subida ocurre al guardar el formulario, para no dejar archivos huérfanos.

## Estructura del repositorio

```
australmarket-frontend/   React + Vite (SPA)
australmarket-infra/      Terraform (API, Lambdas, IAM, S3, Cognito, DSQL)
services/                 Código de cada Lambda (TypeScript)
db/                       Esquema, roles y datos de ejemplo (SQL versionado)
```

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
# Compilar cada servicio antes de aplicar
npx tsc            # dentro de cada carpeta de services/
terraform init
terraform plan
terraform apply
```

**Base de datos:** ejecutar los scripts de `db/` en orden numérico con `psql` (conexión con token IAM de DSQL).

**Frontend:** conectado a Amplify; cada `git push` a `master` construye y publica. Variables de entorno necesarias en Amplify:

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API |
| `VITE_COGNITO_REGION` | Región del User Pool |
| `VITE_COGNITO_CLIENT_ID` | Client ID de la app en Cognito |

## Desarrollo local

```powershell
cd australmarket-frontend
npm install
npm run dev
```

Crea un `.env.local` con las tres variables anteriores. El origen `http://localhost:5173` está permitido en el CORS del bucket.

## Notas y limitaciones conocidas

- Proyecto de demostración académica; las imágenes son de referencia.
- El CORS de la API acepta cualquier origen (`*`); restringirlo a los dominios propios es una mejora pendiente.
- Deuda técnica registrada: KMS propio para DSQL, Lambda Authorizer (respuesta 401 vs 403), múltiples entornos, Secrets Manager, migrar el resto de la infraestructura a módulos y pruebas automatizadas.
- Extra del frontend: el carrusel de regiones se calcula con datos que ya entrega la API; no tiene tabla ni imágenes propias.
- `GET /admin-test` es la Lambda "hola mundo" del inicio del proyecto. Se conserva a propósito como evidencia del proceso de construcción; está protegida con el mismo autorizador.

## Mentor

Danny Friz · Mentoría AWS 

## Autor

Jorge Gallardo Heck · Mentoría AWS 