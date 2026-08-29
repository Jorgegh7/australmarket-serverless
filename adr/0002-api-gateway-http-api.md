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
