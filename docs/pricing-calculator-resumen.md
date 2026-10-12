# Costos — AustralMarket

## Gasto mensual estimado por nivel de tráfico

| | Lanzamiento | Tracción inicial | Crecimiento |
|---|---|---|---|
| Visitas/mes | ~500 | ~5.000 | ~50.000 |
| **Total AWS/mes** | **~$0.44** | **~$1.43** | **~$6.34** |

*(Amplify Hosting concentra la mayor parte del costo — Aurora DSQL, Lambda y Cognito se mantienen en $0 en los tres escenarios, dentro de sus capas "Always Free".)*

## La base de datos final: Aurora DSQL, con integridad referencial y costo $0

Tras 3 revisiones documentadas (ADR 005, 006, 007), la base de datos de AustralMarket es **Aurora DSQL** — relacional, con `FOREIGN KEY` nativa (soporte agregado por AWS el 27 de agosto de 2026), y dentro de su capa "Always Free" (100.000 DPU/mes) en los tres escenarios de tráfico.

**Por qué llegó a esta versión final:** se priorizó integridad referencial garantizada por el motor desde el principio (Aurora Serverless v2), se revirtió por un bloqueo de aprovisionamiento de cuenta (a DynamoDB), y se revirtió de nuevo apenas AWS eliminó la limitación original de DSQL que motivó el primer cambio — sin perder en ningún punto el costo $0 ya alcanzado.

---
*Detalle completo de supuestos, tarifas y cálculo por servicio: `pricing-calculator-australmarket.md`.*
