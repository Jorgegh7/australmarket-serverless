# Pricing Calculator — AustralMarket (Sprint 2)

Estimación de gasto mensual según volumen de tráfico (no según créditos disponibles, que son una condición temporal de la cuenta, no una variable de negocio). Tarifas oficiales AWS us-east-1, sep. 2026.

**Actualizado tras ADR 007** (reversión de DynamoDB a Aurora DSQL, tras el soporte de FOREIGN KEY anunciado por AWS el 27 de agosto de 2026 — ver `adr/0007-base-datos-aurora-dsql.md`).

## Supuestos de tráfico por escenario

| | Bajo (lanzamiento) | Medio (tracción) | Alto (crecimiento) |
|---|---|---|---|
| Visitas al sitio/mes | ~500 | ~5.000 | ~50.000 |
| Requests a la API/mes | 2.000 | 20.000 | 200.000 |
| Productos en catálogo (curado a mano por 1 admin) | 10-20 | 25-50 | 50-100 |
| Almacenamiento S3 | ~25 MB | ~65 MB | ~130 MB |

## Costo mensual estimado por servicio

| Servicio | Bajo | Medio | Alto |
|---|---|---|---|
| Amplify Hosting | $0.44 | $1.41 | $6.14 |
| API Gateway | ~$0.00 | $0.02 | $0.20 |
| AWS Lambda ✅ *Always Free* | $0.00 | $0.00 | $0.00 |
| **Aurora DSQL** ✅ *Always Free* | $0.00 | $0.00 | $0.00 |
| Amazon S3 | ~$0.00 | ~$0.00 | ~$0.00 |
| Amazon Cognito ✅ *Always Free* | $0.00 | $0.00 | $0.00 |
| **Total estimado** | **~$0.44/mes** | **~$1.43/mes** | **~$6.34/mes** |

**Lecturas clave:**
- **Aurora DSQL se mantiene dentro de su capa "Always Free" (100.000 DPU + 1 GB/mes, indefinida) en los tres escenarios.** Consistente con la evidencia real de las pruebas del Gate 1, donde una sesión completa de prueba (creación de esquema + inserts + JOINs) consumió apenas 4 DPU — muy por debajo del límite gratuito, incluso extrapolado al escenario "Alto" (200.000 requests/mes).
- **El total del stack no cambió respecto al análisis con DynamoDB** — la base de datos vuelve a ser relacional con `FOREIGN KEY` real (mejor para el modelo de datos, ver ADR 007), sin perder el beneficio de costo $0 que ya se había logrado.
- **El costo total sigue dominado por Amplify Hosting**, no por la base de datos.
- Este es el mismo comportamiento de costo que Aurora Serverless v2 *no* podía ofrecer (que sí tenía costo variable por ACU-hora activa, con un piso de complejidad de aprovisionamiento) — Aurora DSQL da lo mejor de ambos mundos: modelo relacional con FK + costo $0 sostenido a este nivel de tráfico.

## Nota histórica: por qué este documento cambió de motor 3 veces

Ver ADR 005, 006 y 007 para el detalle completo de cada reversión. En resumen: Aurora Serverless v2 (bloqueada por Free Plan) → DynamoDB (funcional, pero con complejidad de `TransactWriteItems`) → Aurora DSQL (FK nativa disponible desde agosto 2026, sin el bloqueo que tuvo Serverless v2). El análisis de costo de Aurora Serverless v2 (con su punto de quiebre contra RDS) queda documentado históricamente en versiones anteriores de este archivo, ya no vigente.

## Notas metodológicas

- Tarifas: Aurora DSQL $0 dentro de la capa Always Free (100.000 DPU + 1 GB/mes); sobre ese umbral, facturación por DPU consumido. API Gateway HTTP API $1.00/millón requests; Lambda $0.20/millón + $0.0000166667/GB-s (dentro del free tier en los 3 escenarios); Amplify $0.01/min build + $0.023/GB storage + $0.15/GB transferencia; S3 $0.023/GB.
- Supuestos de tráfico son estimaciones razonables, no datos reales — el objetivo es mostrar la mecánica de cómo escala el costo.
- Complementar con una estimación real en [AWS Pricing Calculator](https://calculator.aws) para el gate, como respaldo visual.
