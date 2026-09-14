# Matriz de responsabilidad (RACI) — AustralMarket

Proyecto ejecutado por una sola persona (Jorge), cubriendo distintos roles según la actividad. Danny participa como mentor: aprueba en los gates y es consultado en decisiones de arquitectura.

| Actividad | Responsable (R) | Aprueba (A) | Consultado (C) | Informado (I) |
|---|---|---|---|---|
| Decisiones de arquitectura (ADRs) | Jorge (Dev) | Jorge (PO) | Danny | — |
| Desarrollo de backend (Lambda, API) | Jorge (Dev) | Jorge (PO) | — | Danny |
| Desarrollo de frontend | Jorge (Dev) | Jorge (PO) | — | Danny |
| Infraestructura / despliegue (Terraform, Amplify) | Jorge (DevOps) | Jorge (PO) | — | Danny |
| Gestión del backlog / sprints | Jorge (PO) | Jorge (PO) | Danny | — |
| Aprobación en Gates | Jorge (PO) | **Danny** | — | — |
| Supuestos de costo y seguridad | Jorge (DevOps) | Jorge (PO) | Danny | — |

**Lectura para el gate:** Jorge concentra la ejecución (R) y la responsabilidad de negocio (A) en casi todo, dado que es un proyecto individual. La única actividad donde Danny tiene la aprobación final es en los Gates — es el punto de control externo del proyecto. En decisiones de arquitectura y de costo/seguridad, Danny es consultado antes de cerrar la decisión, no solo informado después.
