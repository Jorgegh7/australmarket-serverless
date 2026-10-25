# ADR 009: Acceso a datos — roles de base de datos por responsabilidad con permisos mínimos

## Estado
Aceptado

## Contexto
Aurora DSQL (ADR 007) autentica con tokens IAM: cada Lambda genera un token y se conecta como un usuario de base de datos. La opción más simple era que todas las Lambdas usaran el usuario `admin`, pero eso entrega a cada función, incluso a las públicas del catálogo, permisos de lectura, escritura y cambio de esquema sobre todas las tablas. Una vulnerabilidad en cualquier endpoint expondría o destruiría todos los datos.

Además, las tablas contienen datos sensibles (teléfono, correo y red social de los artesanos) que solo deben salir por rutas específicas.

## Decisión
Se definen **roles de base de datos por responsabilidad** (tabla y tipo de acceso), cada uno vinculado a un rol IAM de Lambda:

| Rol de base de datos | Permisos | Usado por |
|---|---|---|
| `artesanos_reader` | `SELECT` sobre `artesanos` | Listado del panel y catálogo público de artesanos |
| `artesanos_writer` | Escritura sobre `artesanos` | Crear, editar y eliminar artesanos |
| `productos_reader` | `SELECT` sobre `productos` | Listado del panel y catálogo público de productos |
| `productos_writer` | Escritura sobre `productos` | Crear, editar y eliminar productos |
| `catalogo_detalle_reader` | `SELECT` sobre `productos` y sobre columnas específicas de `artesanos` | Detalle público de producto (incluye el teléfono para el botón de WhatsApp) |

- Los roles se crean con `CREATE ROLE ... WITH LOGIN` y se vinculan al rol IAM de la Lambda con `AWS IAM GRANT <rol> TO '<arn del rol IAM>'`.
- Las lecturas no tienen permiso de escritura y las escrituras no tienen permisos de administración. Ningún rol de aplicación puede cambiar el esquema.
- El detalle público de producto usa un rol propio con permisos por columna de `artesanos`, para que ese endpoint sea el único público que lee el teléfono.
- La definición de roles y permisos vive en **SQL versionado** en `db/`, numerado y ejecutado a mano. No va en Terraform, porque Terraform aprovisiona el clúster y los recursos de IAM, no el contenido de la base de datos (ADR 007).

## Consecuencias
- Un endpoint comprometido solo puede hacer lo que permite su rol: las lecturas no pueden escribir y ninguna Lambda puede alterar el esquema.
- Los permisos quedan documentados y auditables en archivos SQL.
- Cada Lambda nueva exige tres pasos: rol IAM en Terraform, rol de base de datos en SQL y el vínculo `AWS IAM GRANT`.
- El SQL no se aplica de forma automática: depende de ejecutarse en el orden correcto. Queda como deuda automatizarlo con un script de migración.
- **Limitación conocida:** el catálogo público de artesanos comparte `artesanos_reader` con el panel de administración, así que a nivel de base de datos ese rol puede leer `telefono`, `mail` y `red_social`. Hoy esos datos no salen porque la consulta de `catalogo-artesanos` no los selecciona, pero la barrera es el código y no un permiso. **Deuda registrada:** crear un rol `catalogo_artesanos_reader` con `GRANT SELECT` solo sobre las columnas públicas.

## Alternativas consideradas
- **Un único usuario `admin` para todas las Lambdas**: descartada por violar el principio de mínimo privilegio y ampliar el impacto de cualquier fallo.
- **Un rol de base de datos por cada Lambda**: más estricto, pero multiplica archivos SQL y roles IAM sin una ventaja clara a esta escala; se aplicó solo donde había datos sensibles (detalle de producto).
- **Gestionar roles y permisos de la base con Terraform**: descartada porque requiere un proveedor adicional y conexión a la base desde Terraform, sin ventaja clara a esta escala.