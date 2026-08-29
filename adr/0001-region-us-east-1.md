# ADR 001: Región de despliegue — us-east-1

## Estado
Aceptado

## Contexto
La documentación de la mentoría exige trabajar en la región **us-east-1** (Norte de Virginia). No es una decisión evaluada contra alternativas — es una restricción de partida del proyecto.

## Decisión
Toda la infraestructura de AustralMarket (Aurora Serverless v2, Lambda, API Gateway, Cognito, S3, Amplify) se despliega en **us-east-1**.

## Consecuencias
- Todos los servicios en la misma región evita latencia entre ellos por estar dispersos.
- No se evaluó latencia hacia usuarios finales en Chile — la región viene dada, no es una variable de decisión en este sprint.

## Alternativas consideradas
No aplica — restricción impuesta por la documentación del proyecto.
