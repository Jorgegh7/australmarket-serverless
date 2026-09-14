# ADR 003: Amplify solo como Hosting (no Gen 2 full-stack)

## Estado
Aceptado

## Contexto
Amplify ofrece dos modos: **Hosting** (solo sirve el frontend estático) y **Gen 2** (BaaS — provisiona Cognito, API, Lambda y S3 automáticamente vía su propio motor CDK, sin definiciones explícitas de infraestructura).

También se evaluó prescindir de Amplify (S3 + CloudFront manual).

## Decisión
Se usa **Amplify Hosting únicamente**. El resto del stack (API Gateway, Lambda, Aurora, Cognito) se arma por separado y explícito con Terraform. CloudFront no se provisiona aparte — viene incluido automáticamente por debajo de Amplify Hosting (distribución global + HTTPS gestionado).

- **Se descarta Gen 2** porque oculta infraestructura detrás de abstracciones automáticas — el proyecto exige IaC explícita vía Terraform y poder explicar cada servicio por separado ante Danny.
- **Se descarta S3 + CloudFront manual** porque el valor real de Amplify Hosting es el CI/CD integrado (build/deploy por `git push`, HTTPS automático). Replicarlo a mano requeriría CodeBuild/CodePipeline sin aportar aprendizaje adicional al MVP.

## Consecuencias
Se pierde la posibilidad de personalizar configuraciones avanzadas de CloudFront (solo disponibles si se provisionara como recurso Terraform independiente) — no relevante para el alcance del MVP.
