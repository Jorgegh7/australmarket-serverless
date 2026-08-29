# ADR 003: Amplify solo como Hosting (no Gen 2 full-stack)

## Estado
Aceptado

## Contexto
AWS Amplify ofrece dos modos de uso:

- **Amplify Hosting**: solo sirve el frontend estático (HTML/CSS/JS compilado). No ejecuta lógica de negocio.
- **Amplify Gen 2 (full-stack/BaaS)**: puede provisionar por sí solo Cognito, API, Lambda y S3, usando su propio motor (CDK), sin definiciones explícitas de infraestructura.

El proyecto tiene un requisito de Infraestructura como Código (IaC) explícita y la necesidad pedagógica/evaluativa de poder explicar cada servicio en detalle ante el mentor (Danny). Usar Amplify Gen 2 ocultaría gran parte de la infraestructura detrás de abstracciones automáticas del propio Amplify, dificultando tanto el control explícito vía Terraform como la capacidad de explicar cada pieza por separado.

También se evaluó la alternativa de prescindir de Amplify por completo (S3 + CloudFront manual). Se descartó porque el valor diferencial real de Amplify Hosting es el **CI/CD integrado**: build y deploy automático por `git push`, HTTPS/SSL gestionado automáticamente (a través de CloudFront interno), e invalidación de caché automática. Replicar ese pipeline manualmente con S3 + CloudFront habría requerido herramientas adicionales (CodeBuild/CodePipeline) sin aportar valor de aprendizaje adicional relevante para el alcance del MVP — a diferencia de las piezas de backend, donde sí se priorizó visibilidad explícita de cada servicio.

## Decisión
Se usa **Amplify Hosting únicamente** para servir el frontend estático. El resto del stack (API Gateway, Lambda, Aurora Serverless v2, Cognito) se arma por separado, de forma explícita, con Terraform.

CloudFront no se provisiona como recurso aparte: viene incluido automáticamente por debajo de Amplify Hosting (distribución global a edge locations y HTTPS gestionado), sin que sea necesario configurarlo manualmente.

## Consecuencias
- Cada servicio de backend queda visible y explicable individualmente, alineado con el requisito de IaC y con el objetivo de dominio conceptual del Gate 1.
- Se obtiene CI/CD (build + deploy automático) y CDN (vía CloudFront interno) sin tener que armar ese pipeline a mano.
- Se pierde la posibilidad de personalizar configuraciones avanzadas de CloudFront que sí estarían disponibles si se provisionara como recurso Terraform independiente — no es una limitación relevante para el alcance del MVP.

## Alternativas consideradas
- **Amplify Gen 2 full-stack**: descartada por ocultar infraestructura detrás de abstracciones, en conflicto con el requisito de IaC explícita.
- **S3 + CloudFront manual**: descartada porque replicar el CI/CD que Amplify Hosting ofrece nativamente no aporta valor de aprendizaje adicional para el MVP.
