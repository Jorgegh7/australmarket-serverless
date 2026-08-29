# ADR 002: API Gateway — HTTP API en vez de REST API

## Estado
Aceptado

## Contexto
API Gateway ofrece dos productos distintos para exponer endpoints hacia Lambda: **HTTP API** (simple, liviana) y **REST API** (más completa). No son dos nombres para lo mismo, sino dos productos con distinto set de funcionalidades y distinto costo.

- **HTTP API**: recibe el request, lo pasa a Lambda, devuelve la respuesta. ~70% más barata y de menor latencia que REST API, pero sin funcionalidades avanzadas.
- **REST API**: incluye validación de requests integrada, transformación de payloads, caché de respuestas, planes de uso con API keys, e integración nativa con WAF.

Los endpoints que necesita el MVP de AustralMarket son simples: listar productos, crear/editar/eliminar producto (CRUD básico), sin necesidad de caché avanzado ni límites de uso diferenciados por cliente.

## Decisión
Se usa **HTTP API** para todos los endpoints de AustralMarket.

## Consecuencias
- ~70% de ahorro de costo frente a REST API, y menor latencia por petición.
- Se renuncia a caché de respuestas, transformación de payloads y planes de uso con API keys — ninguna de estas funciones es necesaria para el alcance actual del MVP.
- Si en una futura iteración se necesitara limitar el uso por cliente (ej. artesanos con cuota de publicaciones) o caché de respuestas de alto tráfico, sería necesario evaluar migrar a REST API o resolverlo en otra capa (ej. lógica propia en Lambda).

## Alternativas consideradas
- **REST API**: descartada para este sprint por mayor costo y complejidad de configuración sin necesidad real de sus funcionalidades avanzadas — no aporta valor al MVP actual.
