# Costos — AustralMarket

## Gasto mensual estimado por nivel de tráfico

| | Lanzamiento | Tracción inicial | Crecimiento |
|---|---|---|---|
| Visitas/mes | ~500 | ~10.000 | ~200.000 |
| **Total AWS/mes** | **~$0.84** | **~$8.80** | **~$193** |

*(Aurora Serverless v2 concentra ~87% del costo en el escenario de crecimiento — el resto del stack es marginal.)*

## Serverless no es gratis para siempre — depende de cuánto se usa

Aurora Serverless v2 cobra por hora activa, no por visita. El costo se dispara cuando el tráfico deja de ser intermitente y pasa a ser casi continuo:

| Utilización sostenida de la BD | Costo Aurora | vs. RDS fijo (~$49.75/mes) |
|---|---|---|
| Baja (<15% del mes) | $0.40 – $12 | Aurora hasta 99% más barato |
| **~40% del mes — punto de quiebre** | ~$54 | prácticamente empatado |
| Alta (>65% del mes) | $120 – $169 | RDS hasta 70% más barato |

**Regla de decisión:** mientras la base de datos esté activa menos del ~40% del mes, Aurora Serverless v2 es la opción correcta (paga por uso). Si el tráfico se vuelve constante y sostenido por encima de ese umbral, migrar a un RDS provisionado de costo fijo se vuelve más barato.

**Para el Sprint 1:** se elige Aurora Serverless v2 porque el tráfico esperado es bajo/variable — la migración a RDS es una decisión de una futura iteración, no una corrección de la actual (ver ADR 005).

---
*Detalle completo de supuestos, tarifas y cálculo por servicio: `pricing-calculator-australmarket.md`.*
