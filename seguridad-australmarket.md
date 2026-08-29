# Seguridad — Supuestos explícitos, AustralMarket

## Autenticación e identidad

- **Cognito User Pool** gestiona la identidad de usuarios finales. Único grupo poblado en el MVP: **admin** (los visitantes navegan el catálogo sin login).
- Login integrado directo vía SDK (`amazon-cognito-identity-js`), sin Hosted UI — Cognito devuelve un **JWT** al autenticarse correctamente, incluyendo el claim `cognito:groups`.
- Autorización de rutas protegidas vía **Cognito User Pool Authorizer** en API Gateway (valida firma y expiración) + verificación explícita del grupo (`cognito:groups` contiene `admin`) antes de ejecutar la Lambda de negocio.
- **Decisión de diseño:** se valida grupo desde el día uno, no solo "¿existe un JWT válido?" — aunque hoy solo exista el grupo `admin`, el costo de verificar el grupo es el mismo que verificar solo el token. Esto evita que agregar un segundo rol (ej. artesano registrado) en una futura iteración requiera rediseñar la lógica de autorización — solo se crea el grupo nuevo y se ajusta qué endpoints lo aceptan, sin tocar el mecanismo ya construido.

## Integridad de datos

- **Aurora Serverless v2** aplica `FOREIGN KEY` nativa entre `productos.artesano_id` y `artesanos.id` — el motor rechaza inserts/updates que referencien un artesano inexistente, sin depender de validación manual en cada Lambda (ver ADR 005).
- **Supuesto explícito:** esta garantía es del motor de base de datos, no de la aplicación — si en el futuro se migrara a un motor sin FK nativa (ej. Aurora DSQL), esa validación tendría que reconstruirse a mano en cada función que toque datos relacionados.

## Permisos de infraestructura (IAM)

- **Acceso administrativo a la cuenta:** usuario IAM `jorge-admin` con `AdministratorAccess` + MFA, reemplazando el uso operativo de root (root queda solo con MFA activado, sin uso diario).
- **Execution roles de Lambda** (pendiente, siguiente paso técnico): cada función necesitará su propio rol con permisos mínimos explícitos (leer/escribir en Aurora, logs en CloudWatch) — sin este rol, Lambda no puede operar aunque el JWT del usuario sea válido. Principio aplicado: permisos explícitos por función, no un rol genérico compartido.

## Superficie de exposición

- Todos los servicios de cara al usuario (Cognito, API Gateway, Lambda, Amplify) están expuestos públicamente por HTTPS — **no se usa VPN**, porque no hay una red privada que un humano externo necesite atravesar para operar el sistema.
- **Aurora Serverless v2 es la excepción explícita:** vive en subredes privadas dentro de la VPC, con "Acceso público" **desactivado** y Security Group restringido a conexiones desde Lambda — nadie debería poder conectarse directo a la BD desde internet. Durante las pruebas de la sesión anterior se usó acceso público temporal para conectar fácil desde la consola; queda pendiente confirmar que esto se desactive explícitamente al construir la infraestructura definitiva con Terraform en el Sprint 2.
- Las imágenes van directo del navegador a S3 (no pasan por Lambda) — se acota la superficie de código que maneja archivos subidos por el admin.

## Decisión de diseño con impacto en seguridad

- **Curaduría por admin en vez de autopublicación por artesanos:** decisión tomada explícitamente por seguridad, no solo editorial. El argumento no es "público vs. privado" (un formulario de autopublicación podría requerir login de artesano igual) — es **un actor de confianza vs. múltiples actores externos**: (1) menos identidades autenticadas que gestionar y que podrían ser comprometidas (credential stuffing, phishing) — un solo punto de entrada admin en vez de N cuentas de artesanos; (2) el riesgo de inyección en campos de texto libre no depende de si el emisor está autenticado — una cuenta de artesano comprometida o maliciosa igual podría inyectar contenido dañino, la autenticación prueba identidad, no buena intención del contenido; (3) menor gestión de datos personales de terceros (nombres, contacto, credenciales de múltiples artesanos).

## Explícitamente fuera de alcance (Sprint 1)

- **Un segundo grupo poblado en Cognito** (ej. artesano registrado) — el mecanismo de verificación de grupo sí se construye desde el Sprint 2 (ver arriba), pero solo existe el grupo `admin`; no hay usuarios ni endpoints para un rol adicional todavía.
- Rate limiting o WAF — no incluidos porque se eligió HTTP API sobre REST API (ver ADR 002); a evaluar si el tráfico o el riesgo de abuso lo justifican en una futura iteración.
- **Execution roles de Lambda con permisos mínimos por función** (principio de menor privilegio) — no implementados en el Sprint 1, ya que este sprint es de diseño y propuesta, sin código. Queda como principio de diseño a aplicar en la implementación (Sprint 2 en adelante).
