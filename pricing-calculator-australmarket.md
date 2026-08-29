# Pricing Calculator — AustralMarket (Sprint 1)

Estimación de gasto mensual según volumen de tráfico (no según créditos disponibles, que son una condición temporal de la cuenta, no una variable de negocio). Tarifas oficiales AWS us-east-1, ago. 2026.

## Supuestos de tráfico por escenario

| | Bajo (lanzamiento) | Medio (tracción) | Alto (crecimiento) |
|---|---|---|---|
| Visitas al sitio/mes | ~500 | ~10.000 | ~200.000 |
| Requests a la API/mes | 2.000 | 50.000 | 1.000.000 |
| Horas/mes con la BD activa | 5 h (0.5 ACU) | 50 h (1 ACU) | 700 h (2 ACU) |
| Productos en catálogo (curado a mano por 1 admin) | 10-20 | 25-50 | 50-100 |
| Almacenamiento S3 | ~25 MB | ~65 MB | ~130 MB |

## Costo mensual estimado por servicio

| Servicio | Bajo | Medio | Alto |
|---|---|---|---|
| Amplify Hosting | $0.44 | $2.54 | $23.02 |
| API Gateway | ~$0.00 | $0.05 | $1.00 |
| AWS Lambda ✅ *Always Free* | $0.00 | $0.00 | $0.00 |
| **Aurora Serverless v2** | $0.40 | $6.21 | **$168.70** |
| Amazon S3 | ~$0.00 | ~$0.00 | ~$0.00 |
| Amazon Cognito ✅ *Always Free* | $0.00 | $0.00 | $0.00 |
| **Total estimado** | **~$0.84/mes** | **~$8.80/mes** | **~$192.70/mes** |

**Lecturas clave:**
- **Cognito se mantiene en $0 en los tres escenarios** — solo el admin se autentica (visitantes sin login), así que los MAU no crecen aunque el tráfico se multiplique por 400x.
- **S3 es prácticamente gratis en cualquier escenario** — con un catálogo curado a mano por un solo admin (10-100 productos según el escenario, no autopublicación masiva), el volumen de imágenes queda muy por debajo del límite de 5 GB del free tier.
- **Aurora Serverless v2 domina el costo a escala** — de $0.40 (irrelevante) a $168.70 (~87% del total). Es el trade-off consciente del ADR 005: se priorizó integridad referencial sobre el ahorro de costo de DSQL.

## ¿Cuándo migrar de Aurora Serverless v2 a RDS provisionado?

El costo de Aurora no depende del número de visitas — depende de **cuántas horas al mes la BD deja de estar pausada (0 ACU)**. El salto de costo ocurre cuando el tráfico pasa de intermitente a prácticamente continuo.

**Comparación:** RDS `db.t4g.medium` (2 vCPU/4 GiB, Single-AZ, PostgreSQL) — costo fijo de **~$49.75/mes** ($0.065/hora × 730h compute + ~$2.30 storage gp3), corra 1 hora o el mes completo.

| Horas/mes BD activa | ACU promedio | Aurora (total) | RDS (fijo) | Más barata | % de ahorro |
|---|---|---|---|---|---|
| 5 h (<1%) | 0.5 | $0.40 | $49.75 | Aurora | 99% |
| 100 h (~14%) | 1.0 | $12.20 | $49.75 | Aurora | 76% |
| **300 h (~41%) — punto de quiebre** | 1.5 | $54.30 | $49.75 | *(empate)* | ~8% |
| 500 h (~68%) | 2.0 | $120.40 | $49.75 | RDS | 59% |
| 700 h (~96%) | 2.0 | $168.70 | $49.75 | RDS | 70% |

**Criterio de decisión (frase para el gate):** no se migra por "más tráfico" en general — se migra cuando la utilización mensual sostenida supera ~40%, porque ahí el pago-por-uso deja de tener ventaja y el costo fijo se vuelve más racional. Esto refuerza el ADR 005, no lo contradice: Aurora Serverless v2 es correcta *mientras* el tráfico sea bajo o variable (el caso actual); migrar sería decisión de una futura iteración, con datos reales de uso sostenido.

*Nota: comparación sin Multi-AZ (duplicaría el costo de RDS) — se dejó fuera para comparar contra la instancia única que usa el proyecto hoy.*

## Notas metodológicas

- Tarifas: Aurora Serverless v2 $0.12/ACU-hora + $0.10/GB-mes storage + $0.20/millón I/O; API Gateway HTTP API $1.00/millón requests; Lambda $0.20/millón + $0.0000166667/GB-s (dentro del free tier en los 3 escenarios); Amplify $0.01/min build + $0.023/GB storage + $0.15/GB transferencia; S3 $0.023/GB; RDS `db.t4g.medium` $0.065/hora + gp3 ~$0.115/GB-mes.
- Supuestos de tráfico son estimaciones razonables, no datos reales — el objetivo es mostrar la mecánica de cómo escala el costo.
- Complementar con una estimación real en [AWS Pricing Calculator](https://calculator.aws) para el gate, como respaldo visual.
