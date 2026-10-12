# ADR 007: Base de datos — Aurora DSQL (revertido desde DynamoDB)

## Estado
Aceptado

## Contexto
El 27 de agosto de 2026, AWS anunció que **Aurora DSQL ahora soporta `FOREIGN KEY`** — con las opciones estándar `NO ACTION`, `RESTRICT`, `CASCADE`, `SET NULL`, `SET DEFAULT`. Este era, hasta esa fecha, el motivo original por el cual se descartó Aurora DSQL en el ADR 005 (revertido a Aurora Serverless v2) y, en consecuencia, en el ADR 006 (revertido de Serverless v2 a DynamoDB tras el bloqueo de Free Plan).

Con FK ya soportado, se reevaluaron las 3 opciones de base de datos usadas por el proyecto hasta ahora:

| | DynamoDB (ADR 006) | Aurora DSQL (con FK) |
|---|---|---|
| Integridad referencial | `TransactWriteItems` + `ConditionCheck` (construida a medida) | `FOREIGN KEY` nativa — motor SQL estándar |
| Modelo de datos | Single-table design (PK/SK) | Relacional (el diseño original del ADR 004 v1) |
| VPC requerida | No | No — endpoint público administrado (confirmado en pruebas del Gate 1) |
| Bloqueo de Free Plan | No | No — DSQL nunca tuvo el problema de Express Configuration que sí tuvo Aurora Serverless v2/RDS |
| Free tier | Always Free, 25 GB (capacidad provisionada) | Always Free, 100.000 DPU + 1 GB — indefinido |
| Soporte en Terraform | Recurso estable (`aws_dynamodb_table`) | Recurso estable (`aws_dsql_cluster`), sin bloqueo de aprovisionamiento conocido |

**Verificado antes de decidir:** el recurso `aws_dsql_cluster` del proveedor `hashicorp/aws` es estable y no presenta el problema de "Express Configuration" que bloqueó Aurora Serverless v2 — ese bloqueo era específico de RDS/Serverless v2 bajo el Free Plan, no de DSQL.

## Decisión
Se revierte de DynamoDB a **Aurora DSQL**, con modelo de datos **relacional** (tablas `artesanos`/`productos` con `FOREIGN KEY`), retomando el diseño original del ADR 004 v1.

**Por qué esto no invalida el trabajo de DynamoDB/ADR 006:** esa decisión fue correcta *con la información disponible en ese momento* — DSQL no soportaba FK, y Serverless v2 estaba bloqueada por el Free Plan. El soporte de FK en DSQL es un cambio externo (una feature nueva de AWS), no un error de análisis previo.

**Honestidad sobre el patrón de decisiones:** esta es la cuarta decisión de motor de base de datos del proyecto (DSQL → Serverless v2 → DynamoDB → DSQL). Cada cambio individual está documentado con su razón técnica específica y verificable (ADR 005, 006, 007) — no son cambios de opinión, son respuestas a restricciones reales encontradas en cada momento (falta de FK, bloqueo de aprovisionamiento, y ahora, remoción de esa falta de FK). Se documenta así de manera explícita para que quede claro que el patrón es de **adaptación basada en evidencia**, no de indecisión.

## Consecuencias
- El modelo de datos vuelve a ser relacional — se recupera el diseño de 2 tablas del ADR 004 v1 (`artesanos`, `productos`, con `FOREIGN KEY` real).
- El código de `database.tf` se reemplaza: de `aws_dynamodb_table` a `aws_dsql_cluster`.
- **A diferencia de DynamoDB, el esquema SQL (`CREATE TABLE ... REFERENCES ...`) no se gestiona como recurso de Terraform** — Terraform aprovisiona el clúster; las tablas se crean vía SQL (cliente `psql`, o un script de migración), igual que se hizo en las pruebas del Gate 1.
- Se elimina la complejidad de `TransactWriteItems`/`ConditionCheck` en el código de las futuras Lambdas — las inserciones simples (`INSERT`) bastan, el motor rechaza automáticamente referencias inválidas.
- Se recupera la capacidad de hacer `JOIN`s SQL estándar, perdida temporalmente con el diseño single-table de DynamoDB.
- Los recursos de DynamoDB ya aplicados (`aws_dynamodb_table.australmarket`) se destruyen.
- Requiere agregar permisos de IAM para DSQL (`dsql:*`) al usuario `australmarket-dev`, no incluidos en las políticas actuales.

## Alternativas consideradas
- **DynamoDB (ADR 006)**: revertida — aunque funcional y con el ahorro de costo documentado en su momento, ya no ofrece ninguna ventaja sobre DSQL ahora que este soporta FK nativamente, y DSQL evita la complejidad adicional de `TransactWriteItems` y el modelo single-table (menos familiar, más trabajo de diseño de acceso).
