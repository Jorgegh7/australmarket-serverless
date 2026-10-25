# ADR 008: Imágenes — bucket S3 privado con URLs firmadas

## Estado
Aceptado

## Contexto
Las imágenes de productos y artesanos viven en S3. La primera versión del proyecto permitía lectura pública de todo el bucket mediante una policy, de modo que el navegador cargaba cada imagen con su URL directa.

Eso tenía tres problemas:

- Cualquier persona que conociera o adivinara una clave podía leer el contenido del bucket, y obligaba a mantener desactivados los bloqueos de acceso público.
- Los objetos se cifran con una clave KMS propia (`aws_kms_key.s3`), y el cifrado con KMS **no permite lectura anónima**: una policy pública no habría funcionado de todos modos para objetos cifrados con esa clave.
- El panel de administración debía subir imágenes desde la sesión del navegador del administrador, lo que exigía una forma controlada de escritura.

## Decisión
El bucket queda **completamente privado**: los cuatro bloqueos de acceso público activos y sin policy de lectura pública. El acceso se hace solo con URLs firmadas:

- **Lectura:** las Lambdas del catálogo firman un `GetObject` válido por 1 hora, con las credenciales de su propio rol.
- **Subida:** la Lambda `generar-url-subida`, restringida al grupo `admin` de Cognito, firma un `PutObject` válido por 5 minutos con `Content-Type` fijado. El navegador sube directo a S3, sin pasar por la API. La subida ocurre al guardar el formulario, para no dejar archivos huérfanos.
- La base de datos guarda **solo la clave** del objeto, nunca la URL firmada, porque ésta expira.

Cada rol de Lambda recibe únicamente `s3:GetObject` (o `s3:PutObject`) sobre el prefijo que necesita (`productos/*`, `artesanos/*`), más `kms:Decrypt` o `kms:GenerateDataKey` según corresponda.

## Consecuencias
- El bucket nunca es accesible sin una firma, y los permisos son mínimos por rol (verificado: una URL directa devuelve 403).
- Las subidas no pasan por API Gateway, así que no hay límite de tamaño de payload ni consumo de cómputo adicional.
- Las URLs expiran y se regeneran en cada consulta; a esta escala, la firma por imagen no tiene costo apreciable.
- Un archivo inexistente responde 403 (no 404), porque el rol no tiene `s3:ListBucket`. En el navegador aparece como un bloqueo ORB, lo que dificultó el diagnóstico inicial.
- Se requiere configuración de CORS en el bucket para el origen del frontend (local y Amplify).
- **Deuda registrada:** limpieza de archivos huérfanos (por ejemplo, con etiqueta y regla de ciclo de vida) y CloudFront con control de acceso al origen para servir imágenes con caché.

## Alternativas consideradas
- **Bucket público de solo lectura**: descartada por exponer todo el contenido y ser incompatible con el cifrado KMS.
- **Prefijo público solo para imágenes**: descartada porque deja una excepción de seguridad y obliga a usar otro tipo de cifrado en esa parte del bucket.
- **CloudFront con acceso privado al origen**: es la opción más adecuada para producción, pero añade infraestructura fuera del alcance del proyecto. Queda como mejora futura.