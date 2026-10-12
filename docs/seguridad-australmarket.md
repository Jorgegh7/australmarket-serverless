# Seguridad — Supuestos explícitos, AustralMarket

## Autenticación e identidad

- **Cognito User Pool** gestiona la identidad de usuarios finales. Único grupo poblado en el MVP: **admin** (los visitantes navegan el catálogo sin login).
- Login integrado directo vía SDK (`amazon-cognito-identity-js`), sin Hosted UI — Cognito devuelve un **JWT** al autenticarse correctamente, incluyendo el claim `cognito:groups`.
- Autorización de rutas protegidas vía **Cognito User Pool Authorizer** en API Gateway (valida firma y expiración) + verificación explícita del grupo (`cognito:groups` contiene `admin`) antes de ejecutar la Lambda de negocio.
- **Decisión de diseño:** se valida grupo desde el día uno, no solo "¿existe un JWT válido?" — aunque hoy solo exista el grupo `admin`, el costo de verificar el grupo es el mismo que verificar solo el token. Esto evita que agregar un segundo rol (ej. artesano registrado) en una futura iteración requiera rediseñar la lógica de autorización — solo se crea el grupo nuevo y se ajusta qué endpoints lo aceptan, sin tocar el mecanismo ya construido.

## Integridad de datos

- **Aurora DSQL** aplica `FOREIGN KEY` nativa entre `productos.artesano_id` y `artesanos.id` — el motor rechaza inserts/updates que referencien un artesano inexistente, sin depender de validación manual en cada Lambda (ver ADR 007).
- **Nota histórica:** esta garantía no estuvo disponible durante todo el proyecto — Aurora DSQL no soportaba FK hasta el 27 de agosto de 2026 (ver ADR 005), lo que motivó dos migraciones intermedias (Aurora Serverless v2, luego DynamoDB con `TransactWriteItems`+`ConditionCheck` como equivalente funcional) antes de volver a DSQL con FK ya disponible (ver ADR 006 y 007).
- **Supuesto explícito:** esta garantía es del motor de base de datos, no de la aplicación — si en el futuro se migrara a un motor sin FK nativa, esa validación tendría que reconstruirse a mano en cada función que toque datos relacionados.

## Permisos de infraestructura (IAM)

- **Acceso administrativo a la cuenta:** usuario IAM `jorge-admin` con `AdministratorAccess` + MFA, reemplazando el uso operativo de root (root queda solo con MFA activado, sin uso diario).
- **Usuario de desarrollo separado (`australmarket-dev`):** creado para uso exclusivo de Terraform, con permisos acotados por servicio (no `AdministratorAccess`) — API Gateway, Cognito, IAM, KMS, S3, Lambda, Aurora DSQL. Revisado periódicamente para remover permisos de servicios ya no usados (ej. se removieron VPC/RDS/DynamoDB tras las revisiones de arquitectura de base de datos).
- **Execution role de Lambda** (`australmarket-lambda-execution`): aplicado en el Sprint 2, con el permiso base de logs en CloudWatch (`AWSLambdaBasicExecutionRole`). Permisos específicos por función (ej. acceso a Aurora DSQL vía Data API) se agregan progresivamente a medida que se escriben las Lambdas de negocio reales, no se pre-otorgan de forma genérica.

## Superficie de exposición

- Todos los servicios de cara al usuario (Cognito, API Gateway, Lambda, Amplify) están expuestos públicamente por HTTPS — **no se usa VPN**, porque no hay una red privada que un humano externo necesite atravesar para operar el sistema.
- **Aurora DSQL también tiene endpoint público administrado por AWS** — a diferencia del modelo de Aurora Serverless v2 evaluado inicialmente (que requería VPC, subredes privadas y Security Group), DSQL no necesita ni usa VPC. La protección de acceso no es de red (no hay "puerta cerrada" que atravesar), sino de **identidad**: cada conexión requiere un token de autenticación IAM de corta duración (`aws dsql generate-db-connect-admin-auth-token`, expira en 1 hora por defecto), generado solo por identidades con el permiso `dsql:DbConnectAdmin` — sin ese permiso IAM, ninguna conexión es posible, sin importar que el endpoint sea alcanzable por internet.
- Las imágenes van directo del navegador a S3 (no pasan por Lambda) — se acota la superficie de código que maneja archivos subidos por el admin.

## Decisión de diseño con impacto en seguridad

- **Curaduría por admin en vez de autopublicación por artesanos:** decisión tomada explícitamente por seguridad, no solo editorial. El argumento no es "público vs. privado" (un formulario de autopublicación podría requerir login de artesano igual) — es **un actor de confianza vs. múltiples actores externos**: (1) menos identidades autenticadas que gestionar y que podrían ser comprometidas (credential stuffing, phishing) — un solo punto de entrada admin en vez de N cuentas de artesanos; (2) el riesgo de inyección en campos de texto libre no depende de si el emisor está autenticado — una cuenta de artesano comprometida o maliciosa igual podría inyectar contenido dañino, la autenticación prueba identidad, no buena intención del contenido; (3) menor gestión de datos personales de terceros (nombres, contacto, credenciales de múltiples artesanos).

## Explícitamente fuera de alcance (Sprint 1)

- **Un segundo grupo poblado en Cognito** (ej. artesano registrado) — el mecanismo de verificación de grupo sí se construye desde el Sprint 2 (ver arriba), pero solo existe el grupo `admin`; no hay usuarios ni endpoints para un rol adicional todavía.
- Rate limiting o WAF — no incluidos porque se eligió HTTP API sobre REST API (ver ADR 002); a evaluar si el tráfico o el riesgo de abuso lo justifican en una futura iteración.
- ~~Execution roles de Lambda con permisos mínimos por función~~ — **aplicado en Sprint 2** (ver sección de Permisos de infraestructura arriba).
- Sistema de monitoreo con alertas (CloudWatch Alarms + SNS) — identificado como necesario (feedback de mentoría), pero requiere que exista infraestructura/tráfico real para tener sentido; queda para un sprint posterior.
- Secrets Manager con rotación automática de credenciales — no hay credenciales de servicio que rotar todavía en el alcance actual.
