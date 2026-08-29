# ADR 005: Base de datos — Aurora Serverless v2

## Estado
Aceptado (revisado — decisión inicial fue Aurora DSQL, revertida tras análisis adicional)

## Contexto
Definido el modelo relacional de dos tablas con relación uno-a-muchos (ver ADR 004), se evaluaron las variantes de base de datos relacional serverless disponibles en AWS: **Aurora Serverless v2** y **Aurora DSQL**.

**Aurora Serverless v2**: variante autoescalable de Aurora, medida en ACUs. Desde nov. 2024 puede escalar hasta 0 ACU (pausa completa sin cómputo facturado) con motor PostgreSQL 13.15+/14.12+/15.7+/16.3+. Soporta el conjunto completo de PostgreSQL, incluyendo `FOREIGN KEY` real y `SEQUENCES`.

**Aurora DSQL**: motor serverless distribuido más nuevo (GA mayo 2025), compatible con un subconjunto de PostgreSQL 16. Se factura por DPU sin piso de costo bajo ninguna configuración. No soporta `FOREIGN KEY` ni constraints de exclusión, ni `SEQUENCES` — la integridad referencial debe validarse a nivel de aplicación (Lambda, vía subconsulta antes de cada insert/update relacionado).

### Decisión inicial (revertida)
Se eligió primero **Aurora DSQL**, priorizando: ausencia de piso de costo bajo cualquier configuración, modelo de facturación por uso real (DPU) alineado con el resto del stack serverless, y free tier "always free" indefinido (100.000 DPU + 1 GB-mes/mes, sin expiración) frente al free tier de Aurora Serverless v2, atado al "Free Plan" de 6 meses de la cuenta.

### Por qué se revirtió
Al evaluar el trade-off pensando en la escalabilidad del **modelo de datos** (no de la base de datos como motor, que sí escala en ambos casos), se identificó que la falta de `FOREIGN KEY` en DSQL no es un problema de escalabilidad técnica, sino que **traslada la responsabilidad de integridad referencial al código de aplicación (Lambda)**. A medida que el modelo crezca con más tablas y relaciones (ej. Producto→Categoría, Producto→Materiales, Pedido→Cliente), cada Lambda que inserte o actualice datos relacionados tendría que implementar manualmente la validación que el motor de Serverless v2 haría de forma automática — aumentando la superficie de código, las pruebas necesarias, y el riesgo de errores de integridad silenciosos en producción (datos corruptos que no fallan al insertarse, a diferencia de una FK que rechaza la operación al momento).

A esto se suma un argumento de diseño de código: el principio de responsabilidad única aplicado a Lambda establece que cada función debería hacer una cosa y hacerla bien, sin mezclar lógica de negocio con trabajo de infraestructura que en rigor le corresponde a la base de datos. Con DSQL, una Lambda que crea un producto tendría que primero buscar el artesano, validar que exista y manejar el caso de error antes de ejecutar su lógica real — dejando de hacer una sola cosa. Ese trabajo adicional no nace de una necesidad del dominio, sino que compensa una limitación de la base de datos elegida.

## Decisión
Se usa **Aurora Serverless v2** (PostgreSQL) como base de datos de AustralMarket.

## Consecuencias
- Integridad referencial garantizada por el motor (`FOREIGN KEY` nativa) — sin depender de lógica manual repetida en cada Lambda que toque datos relacionados.
- Menor riesgo de errores silenciosos de datos a medida que el modelo crezca con más tablas y relaciones.
- Con motor PostgreSQL reciente, escala a 0 ACU en reposo — sin piso de costo mientras no hay tráfico, mitigando la principal ventaja de costo que ofrecía DSQL.
- Se acepta como trade-off consciente que su free tier (4 ACU / 1 GiB por clúster) depende del "Free Plan" de 6 meses de la cuenta (créditos de $100–$200 al crear la cuenta) y no es "always free" como el de DSQL — pasada esa ventana, el costo deja de ser $0 garantizado si hay tráfico real, incluso escalando a 0 ACU en reposo.
- Requiere configurar VPC y Security Group explícitamente (Aurora DSQL no lo exige, ya que da un endpoint público administrado por defecto) — mayor complejidad de aprovisionamiento inicial, aceptada a cambio de la integridad referencial nativa.

## Alternativas consideradas
- **DynamoDB**: descartada — ver ADR 004 (modelo relacional explícito).
- **RDS (no Aurora)**: descartada por capacidad fija con costo constante, sin autoescalado.
- **Aurora DSQL**: decisión inicial, revertida por trasladar la integridad referencial y el riesgo de errores de datos al código de aplicación (Lambda) a medida que el modelo de datos crezca — ver sección "Por qué se revirtió" arriba.
