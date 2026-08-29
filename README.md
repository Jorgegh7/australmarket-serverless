# AustralMarket

Portal serverless en AWS para conectar artesanos y emprendedores del sur de Chile con compradores, mostrando la historia detrás de cada producto.

Proyecto de portafolio desarrollado en el marco de una mentoría AWS con Danny Friz (16 ago – 23 oct 2026).

---

## Problema

Emprendedores y artesanos locales tienen dificultad para lanzar o promover sus productos de forma individual. Sus productos tienen valor artesanal y cultural importante —mermeladas, merkén, tejidos, entre otros, como los que se encuentran en ferias como Angelmó en Puerto Montt—, pero ese valor cuesta que se dé a conocer cuando se vende de forma aislada, sin contexto ni relato.

AustralMarket nace bajo el concepto de **"productos con historia"**: no es solo un catálogo de venta, sino un espacio que une en un solo lugar la cultura del territorio y el impulso al emprendimiento local. Cada producto tiene una vida detrás —un artesano, una familia, una motivación cultural— y el portal busca hacer visible esa historia, no solo el producto.

## Usuarios

- **Cliente / visitante**: navega la vitrina de productos, ve el detalle de cada uno (incluyendo la historia del artesano o institución detrás), y puede contactar al expositor vía WhatsApp. No requiere registro ni autenticación.
- **Administrador**: gestiona el catálogo completo de productos (alta, edición, baja). El acceso administrativo se diseña desde el inicio bajo un modelo de usuarios, grupos y roles desacoplados, en lugar de un único usuario administrador fijo. Esto permite que distintas personas —dentro o fuera de una estructura de empresa tradicional— puedan pertenecer a distintos grupos con distintos niveles de permiso (por ejemplo, admin, editor, developer) a medida que el proyecto escale. Para el MVP se implementa al menos un grupo funcional con permisos de gestión de productos, dejando la estructura preparada para añadir más grupos sin rediseñar el sistema de autenticación.

## Alcance (MVP)

- Frontend tipo vitrina: cada producto se muestra en una card con su imagen y un botón de contacto.
- Al hacer clic en la imagen/producto, se despliega el detalle: la historia del producto junto con la historia del artesano, familia o institución detrás.
- El administrador cuenta con un CRUD completo sobre productos (crear, leer, actualizar, eliminar).
- Cada producto incluye: historia, descripción del producto, imagen y datos de contacto.
- Filtro por localidad/región (ej. Región de Los Lagos, Región de Los Ríos) en lugar de categoría de producto, dado lo difícil de clasificar productos artesanales por tipo.
- El botón de contacto redirige a WhatsApp — no existe flujo de pago dentro de la plataforma.
- El administrador debe autenticarse antes de poder gestionar productos.

## Fuera de alcance (por ahora)

- **Autopublicación por parte de artesanos**: se optó por un modelo de curaduría (el administrador gestiona el catálogo) en lugar de que cada artesano suba directamente su contenido, para limitar la superficie de riesgo del MVP: evita moderación de contenido multimedia, reduce la exposición a inyección en campos de texto libre, permite mantener control editorial sobre el nicho del portal, y evita tener que gestionar y proteger datos sensibles de múltiples usuarios externos autenticándose en el sistema.
- Registro o cuenta para clientes — navegan siempre como visitantes anónimos.
- Pagos o checkout dentro de la plataforma — el contacto se resuelve externamente vía WhatsApp.
- Newsletter — queda como posible extensión a evaluar, no incluida en este MVP.
- Múltiples grupos de administración poblados (ej. developer) — se deja como pregunta abierta para el mentor; el diseño lo permite, pero no se implementa en esta vuelta.
- **Sección propia para Artesanos**: hoy el artesano se muestra dentro del detalle de cada producto (historia y foto de perfil, ambas ya parte del MVP). Se evalúa para una iteración futura darle presencia propia dentro de la página — una sección "Artesanos" navegable por sí sola, con página personalizada por artesano donde se listen todos sus productos asociados. La relación de datos no cambia (sigue siendo un artesano con muchos productos, mismo `FOREIGN KEY` del ADR 004) — lo que falta es un endpoint de consulta (`GET /artesanos/{id}/productos`) y una pantalla de frontend dedicada. Costeada como propuesta a futuro ("Sprint 6") en `product-backlog-australmarket.md`: ~10 story points, equivalente a un sprint adicional — no entra en los 4 sprints actuales por tiempo/alcance, no por limitación técnica.

## Restricciones

- **Costo**: el modelo serverless se elige explícitamente para mantener bajo consumo — el gasto escala con el tráfico real de la página, en lugar de un pago sostenido por infraestructura corriendo constantemente (como ocurriría con EC2 encendido 24/7). Presupuesto objetivo: ≤ USD 30/mes, con crédito disponible de USD 100.
- **Plazo**: el proyecto opera bajo un calendario fijo de sprints quincenales definidos por la mentoría (16 ago – 23 oct 2026), con evaluación tipo gate en cada sesión. El Sprint 1 debe estar cerrado para el 29 de agosto.
- **Región AWS**: `us-east-1`, definida como la región de trabajo esperada para el proyecto.
- **Sin infraestructura de servidor propia** (restricción de negocio y técnica): AustralByte no administra servidores. A nivel de negocio, esto acota el gasto al tráfico real en vez de un costo fijo de infraestructura en funcionamiento constante. A nivel técnico, al operar bajo FaaS en lugar de IaaS, gran parte de la carga de mantenibilidad (parches, escalado, disponibilidad del runtime) recae en AWS y no en el equipo de AustralByte — ideal para una empresa pequeña que no puede invertir muchos recursos en mantener su propia infraestructura. Además, el modelo de funciones permite mayor granularidad funcional frente a un backend monolítico tradicional.
- **Alineación con certificación**: cada decisión de arquitectura debe poder conectarse con los dominios y servicios del examen AWS Cloud Practitioner (CLF-C02) —incluyendo EC2, ECS, Lambda, Cognito, API Gateway, grupos de seguridad, entre otros— de modo que el desarrollo del proyecto refuerce directamente la preparación para la certificación.

---

## Nota sobre endpoints técnicos

Además de los endpoints de negocio (listar productos, gestionar productos), el backend contempla endpoints de uso interno (`/health`, `/version`) para monitoreo y trazabilidad de despliegues. Tienen una utilidad real en el desarrollo: deben implementarse, documentarse, proteger y utilizarse como corresponde, pero no estarán disponibles al público. Se documentan en la sección de arquitectura/stack técnico, no como parte del alcance de negocio.

---

## Documentación del Sprint 1 (Gate 1 — 29 de agosto de 2026)

- **Arquitectura**: [diagrama principal](./arquitectura-australmarket-presentacion.svg)
- **[ADRs 001–005](./adr/)** — decisiones de arquitectura formalizadas (región, HTTP API, Amplify Hosting, modelo de datos, base de datos).
- **Costos**: [resumen](./pricing-calculator-resumen.md) · [detalle completo con supuestos y tarifas](./pricing-calculator-australmarket.md)
- **[Seguridad](./seguridad-australmarket.md)** — supuestos explícitos de autenticación, integridad de datos, IAM y superficie de exposición.
- **[Product Backlog](./product-backlog-australmarket.md)** — 46 story points, distribuidos en los 4 sprints de implementación (Sprint 2 a 5).
- **[Matriz de responsabilidad (RACI)](./matriz-responsabilidad-australmarket.md)**

**Base de datos elegida:** Aurora Serverless v2 (PostgreSQL) — se evaluó primero Aurora DSQL por su free tier permanente, pero se revirtió por priorizar integridad referencial nativa (`FOREIGN KEY`) sobre el ahorro de costo; ver ADR 005 para el razonamiento completo.

**Costo: serverless no es gratis para siempre.** El gasto mensual va de ~$0.86 (lanzamiento) a ~$193 (tráfico alto sostenido), concentrado en Aurora Serverless v2 (~87% del total en el escenario de crecimiento). El costo escala con **cuánto tiempo la base de datos deja de estar pausada**, no con el número de visitas: por debajo de ~40% de utilización mensual sostenida, Aurora es hasta 99% más barato que una instancia RDS de costo fijo; por encima de ese umbral, la relación se invierte y RDS se vuelve hasta 70% más barato. Ver `pricing-calculator-australmarket.md` para el detalle completo.

*Pendiente: tabla de servicios CLF-C02 (estudio personal, no crítico para el gate) y subir Epic + historias de usuario a GitHub Issues/Milestones.*

---

## Propuesta para Sprint 2 (primer sprint de implementación)

Con el Gate 1 cerrado, el Sprint 2 arranca la implementación real, priorizando lo que el resto de los sprints necesita como base:

- **Infraestructura base con Terraform**: VPC, Aurora Serverless v2, Cognito User Pool, bucket S3, API Gateway (esqueleto), IAM (execution role base para Lambda).
- **Login backend**: integración Cognito + JWT Authorizer en API Gateway.
- **Setup del frontend**: proyecto React, ruteo, conexión a la API, y wireframes rápidos de las 4 pantallas principales (login, catálogo, detalle de producto, panel admin) antes de programarlas.

**Por qué este orden:** ninguna otra pieza del proyecto puede avanzar sin esto — es la base sobre la que se paran los sprints 3, 4 y 5. Detalle completo de la distribución de los 4 sprints en `product-backlog-australmarket.md`.

---

## FaaS — el modelo detrás de "serverless"

AWS Lambda (y por extensión, buena parte de esta arquitectura) opera bajo el modelo **FaaS (Function as a Service)**, distinto del modelo tradicional de servidor (**IaaS**, Infrastructure as a Service, ej. EC2):

| | IaaS (ej. EC2) | FaaS (ej. Lambda) |
|---|---|---|
| Qué gestiona el equipo | El servidor completo — sistema operativo, parches, escalado manual | Solo el código de negocio (una función que hace una cosa puntual) |
| Qué gestiona AWS | Solo el hardware físico | Todo el runtime — SO, parches, escalado automático, disponibilidad |
| Costo | Fijo, mientras el servidor esté encendido, use o no tráfico | Por ejecución real — $0 si nadie invoca la función |

En FaaS, el equipo escribe funciones individuales (ej. "crear producto", "listar catálogo") en vez de mantener un servidor monolítico corriendo 24/7. AWS decide dónde y cuántas copias ejecutar según la demanda real, sin intervención del equipo. Es la base técnica de por qué el costo de AustralMarket escala con el tráfico real en vez de ser un gasto fijo mensual — ver la sección de Restricciones más arriba.
