# ADR 002: API Gateway — HTTP API en vez de REST API

## Estado
Aceptado

## Contexto
API Gateway ofrece dos productos: **HTTP API** ($1.00/millón de requests, simple) y **REST API** ($3.50/millón, incluye validación de requests, transformación de payloads, caché, API keys y WAF nativo).

El MVP de AustralMarket (CRUD simple de productos/artesanos) no necesita caché avanzado ni límites de uso por cliente.

**Corrección de análisis:** a la escala de tráfico de AustralMarket, la diferencia de costo entre ambos productos es marginal (+$0.01 a +$2.50/mes según escenario — ver `pricing-calculator-australmarket.md`). El costo por sí solo no es un argumento de peso.

De las funciones exclusivas de REST API, la única con valor real sería **WAF (Web Application Firewall)** — filtra tráfico malicioso (inyección SQL, XSS, bots) antes de que llegue a la aplicación. Pero WAF tiene costo propio, separado de API Gateway: $5/mes por Web ACL + $1/mes por regla + $0.60/millón de requests procesados. Un setup mínimo (1 ACL + 5 reglas) ya son ~$10/mes **fijos**, sin importar el tráfico.

## Decisión
Se usa **HTTP API**. Se renuncia a caché, transformación de payloads y API keys (no necesarios para el MVP) y a WAF.

El argumento no es de costo de API Gateway (trivial en ambos productos) — es de **coherencia arquitectónica**: WAF introduciría la única pieza del stack con costo fijo garantizado, contradiciendo el principio de pago-por-uso de toda la arquitectura (mismo criterio que descartó RDS en el ADR 005). No es que el riesgo no exista, es que el riesgo actual (tráfico bajo, sin superficie de ataque real) no justifica ese piso de costo todavía.

Migrar a REST API o agregar WAF queda como decisión de una futura iteración, con datos reales de tráfico/riesgo.

## Alternativas consideradas
- **REST API**: descartada no por costo, sino porque su única función de valor (WAF) rompería el principio de diseño de pago-por-uso de la arquitectura.

## Nota técnica: patrón de integración por Lambda (no trivial, repetible)

Conectar cada Lambda de negocio a una ruta de este HTTP API requiere **3 recursos de Terraform, siempre juntos**, no uno solo:

1. **`aws_apigatewayv2_integration`** — conecta la API con la Lambda específica (le dice a API Gateway "esta Lambda existe y puede recibir tráfico").
2. **`aws_apigatewayv2_route`** — define el método + path (`GET /productos`, `POST /productos`, etc.) y si requiere autenticación (`authorizer_id` del Cognito Authorizer, si es una ruta protegida).
3. **`aws_lambda_permission`** — autoriza explícitamente a API Gateway a invocar esa Lambda. Sin este recurso, la integración y la ruta existen pero la invocación real falla — AWS no asume permiso solo porque la integración está declarada.

**Implicación de escala:** con ~10 Lambdas de negocio planificadas (crear/listar/editar productos y artesanos, etc.), esto son **~30 recursos** solo para las conexiones API Gateway↔Lambda, sin contar las Lambdas en sí ni sus permisos de IAM hacia otros servicios (Aurora DSQL, S3).

**Decisión de implementación (a aplicar cuando se escriban las próximas 2-3 Lambdas reales):** construir un módulo de Terraform reutilizable (`lambda-api-route`) que reciba `function_name`, `method`, `path`, `protegida` (booleano) como parámetros, y genere internamente los 3 recursos — evita repetir el bloque completo a mano por cada Lambda. No se construyó para la primera Lambda de prueba porque el beneficio de un módulo es marginal con 1-2 usos; se vuelve significativo a partir de la 3ra-4ta Lambda.
