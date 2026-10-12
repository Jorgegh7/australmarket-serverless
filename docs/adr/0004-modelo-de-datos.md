# ADR 004: Modelo de datos — relacional (Aurora DSQL, con FOREIGN KEY)

## Estado
Aceptado (tercera revisión — ver historial completo abajo)

## Contexto
AustralMarket necesita persistir dos entidades relacionadas: **artesanos** (autores de los productos) y **productos** (con su historia, categoría/región, precio, URL de imagen y contacto), donde cada producto pertenece a un artesano.

### Historial de la decisión
1. **Modelo relacional en Aurora Serverless v2** — decisión inicial, priorizando integridad referencial nativa.
2. **Single-table design en DynamoDB** (ver ADR 006) — revertido tras bloqueo de aprovisionamiento de Aurora Serverless v2 (Free Plan exige Express Configuration, incompatible con la VPC diseñada).
3. **Modelo relacional en Aurora DSQL** (decisión actual, ver ADR 007) — AWS agregó soporte de `FOREIGN KEY` a Aurora DSQL el 27 de agosto de 2026, eliminando la única razón por la que DSQL había sido descartada originalmente (ver ADR 005). DSQL nunca tuvo el problema de aprovisionamiento que sí tuvo Serverless v2, así que se revierte a un modelo relacional simple, ahora sobre DSQL en vez de Serverless v2.

## Decisión
Se usa un **modelo relacional** con dos tablas, `artesanos` y `productos`, relacionadas uno-a-muchos vía `productos.artesano_id`, con `FOREIGN KEY` real (soportada nativamente por Aurora DSQL desde agosto de 2026).

```sql
CREATE TABLE artesanos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    historia TEXT,
    region TEXT,
    foto_perfil_url TEXT,
    telefono TEXT NOT NULL,
    red_social TEXT,
    mail TEXT
);

CREATE TABLE productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artesano_id UUID NOT NULL REFERENCES artesanos(id),
    nombre TEXT NOT NULL,
    historia TEXT,
    imagen_url TEXT,
    precio NUMERIC,
    categoria TEXT
);
```

**Nota técnica:** los IDs usan `gen_random_uuid()`, no `SEQUENCES`/`IDENTITY` — Aurora DSQL sigue sin soportar `SEQUENCES` (el anuncio de agosto de 2026 fue específicamente sobre `FOREIGN KEY`, no cambió esta otra limitación).

Las imágenes no se almacenan en la base de datos: `imagen_url` y `foto_perfil_url` son solo punteros a objetos en S3.

## Consecuencias
- Las consultas que combinan producto + artesano se resuelven con SQL estándar (`JOIN`), sin lógica de aplicación adicional para reconstruir relaciones.
- **La integridad referencial la garantiza el motor** — Aurora DSQL rechaza automáticamente un `INSERT`/`UPDATE` de producto que referencie un artesano inexistente. Ninguna Lambda necesita validar esto manualmente (a diferencia de lo que hubiera requerido DynamoDB sin `TransactWriteItems`, o Aurora DSQL antes de agosto de 2026).
- El esquema SQL se gestiona por fuera de Terraform, vía script versionado (`db/schema.sql`), aplicado con `psql` — Terraform aprovisiona el clúster, no las tablas dentro de él.
- `foto_perfil_url`, `telefono`, `red_social` y `mail` se mantienen sin cambios respecto a los diseños anteriores.

## Alternativas consideradas
- **DynamoDB / single-table design** (ADR 006): revertida — con FK ya disponible en DSQL, DynamoDB ya no ofrece ninguna ventaja que justifique la complejidad adicional de `TransactWriteItems` y el modelo single-table.

## Fuera de alcance (evaluado, no incluido en el MVP)
Ubicación/dirección para artesanos con local físico. `telefono`, `red_social` y `mail` ya están en el esquema.

**Nota sobre `mail`:** además de ser dato de contacto, es el campo que Cognito usa típicamente como identificador de login. Tenerlo ya guardado no crea una cuenta de Cognito por sí solo (son sistemas distintos — ver `seguridad-australmarket.md`), pero es el dato puente necesario para vincular, en una futura iteración, cada artesano con su propia cuenta autenticada, sin tener que pedírselo después.
