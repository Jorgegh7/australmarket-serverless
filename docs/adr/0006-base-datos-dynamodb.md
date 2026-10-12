# ADR 006: Base de datos — DynamoDB (revertido desde Aurora Serverless v2)

## Estado
Aceptado

## Contexto
Durante la implementación del Sprint 2 (HU-B1), se intentó aprovisionar Aurora Serverless v2 vía Terraform. La cuenta de AWS, bajo el modelo "Free Plan", exige el uso de **Express Configuration** para crear cualquier clúster Aurora — un modo de creación simplificado que AWS impone a cuentas gratuitas.

**El punto central del problema:** esto no es una limitación del diseño de red construido (`networking.tf`: VPC privada, 2 subredes en distintas AZs, Security Group sin acceso público) — ese diseño es correcto y necesario para cualquier despliegue real de Aurora. **La limitación es de la cuenta gratuita en sí**: Express Configuration usa su propio modelo de red interno ("Internet Access Gateway"), y **no permite asociar ninguna VPC personalizada**, sin importar qué tan bien esté diseñada. Una cuenta sin esta restricción (plan pagado) podría usar exactamente la VPC ya construida sin ningún cambio.

Adicionalmente, el proveedor de Terraform para AWS (`hashicorp/aws`, v6.62.0) **no expone un argumento equivalente a `WithExpressConfiguration`** en el recurso `aws_rds_cluster` — no hay forma 100% declarativa de crear el clúster bajo esta restricción de cuenta.

Se evaluó un workaround (`null_resource` + `local-exec` + `terraform import`), pero el problema de fondo (Express Configuration no admite VPC personalizada) no se resuelve con eso — el clúster quedaría en la red autogestionada de Express Configuration, no en la VPC diseñada, comprometiendo el modelo de seguridad ya definido (sin acceso público, subredes propias).

## Decisión
Se usa **DynamoDB** en lugar de Aurora Serverless v2.

**Motivo principal — no es solo evitar el bloqueo de la cuenta:** se identificó que el patrón `TransactWriteItems` con `ConditionCheck` de DynamoDB preserva el mismo principio arquitectónico que motivó la reversión de DSQL a Serverless v2 en el ADR 005 — **la integridad referencial la garantiza el motor de base de datos, no el código de aplicación**. Una sola llamada a `TransactWriteItems` agrupa, de forma atómica y del lado del servidor:
1. Un `ConditionCheck` que confirma que el artesano referenciado existe.
2. El `Put` del nuevo producto.

Si el `ConditionCheck` falla, toda la transacción se cancela — el producto nunca se crea. Es el equivalente funcional de una `FOREIGN KEY`, con sintaxis distinta.

**Por qué esto no es lo mismo que el "check-then-write" descartado en discusiones previas:** una validación manual en dos llamadas separadas (Lambda pregunta, Lambda escribe) tiene una ventana de *race condition* — el dato podría cambiar entre la consulta y la escritura. `TransactWriteItems` no tiene esa ventana: ambas acciones se evalúan y ejecutan como una sola unidad atómica en DynamoDB.

**Hallazgo de costo (no anticipado al tomar la decisión, confirmado al recalcular el pricing calculator):** con capacidad provisionada de DynamoDB (25 WCU/25 RCU, capa "Always Free" indefinida), el tráfico esperado del MVP se mantiene dentro de esa capacidad gratuita en los 3 escenarios — el costo de base de datos pasa de ser **~91% del total con Aurora** ($63.50 de $69.84/mes en el escenario de crecimiento) a **$0 con DynamoDB**. Esto representa una **reducción del 90.9% en el costo total del stack** en ese mismo escenario (de ~$69.84/mes a ~$6.34/mes). Ver `pricing-calculator-australmarket.md` para el detalle completo.

**Ventajas adicionales de DynamoDB para este proyecto:**
- Free tier **"Always Free"** indefinido (25 GB de almacenamiento), sin depender del "Free Plan" de créditos.
- Se aprovisiona 100% desde Terraform, sin restricciones de cuenta.
- No requiere VPC — elimina la complejidad de red y el riesgo de necesitar un NAT Gateway (costo fijo ~$33/mes, ver análisis de costo de esta sesión).
- Escalado horizontal nativo, sin gestión de capacidad manual.

## Consecuencias
- El modelo de datos pasa de relacional (tablas `artesanos`/`productos` con `FOREIGN KEY`, ver ADR 004) a **single-table design** — ambas entidades conviven en una sola tabla DynamoDB, distinguidas por Partition Key/Sort Key (`ARTESANO#id` / `PRODUCTO#id`). Esto requiere revisar el ADR 004.
- Cada operación de escritura que involucre una relación (crear/actualizar producto) debe implementarse con `TransactWriteItems`, no con un `Put` simple — costo ligeramente mayor por operación (~2x unidades de escritura), pero sigue siendo pago-por-uso, sin costo fijo.
- Se pierde la posibilidad de hacer consultas ad-hoc complejas tipo SQL (`JOIN`s arbitrarios) — las consultas en DynamoDB deben diseñarse de antemano según los patrones de acceso conocidos (ya identificados: producto con su artesano, productos de un artesano).
- El código de S3, Cognito, API Gateway ya construido no se ve afectado — este cambio es exclusivamente de la capa de datos.
- **La VPC, subredes y subnet group ya construidos y aplicados (`networking.tf`) quedan sin uso** — DynamoDB es un servicio nativo de AWS (vía API HTTPS), no requiere vivir dentro de una VPC. Se elimina este código de la infraestructura del proyecto (ver nota de limpieza). El trabajo de diseño de red no fue en vano: documenta que el equipo sabe construir la topología que Aurora hubiera necesitado en una cuenta sin esta restricción — la razón de no usarlo es la limitación de cuenta descrita arriba, no una falencia del diseño.

## Alternativas consideradas
- **Aurora Serverless v2 (decisión previa, ADR 005)**: revertida por el bloqueo de aprovisionamiento del Free Plan descrito arriba — no por invalidez del argumento original de integridad referencial, que de hecho se preserva con el patrón `TransactWriteItems`.
- **Workaround de Terraform (`null_resource` + `import`)**: descartado porque no resuelve el conflicto de fondo entre Express Configuration y la VPC personalizada ya diseñada.
