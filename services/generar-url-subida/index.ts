import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const BUCKET_NAME = process.env.BUCKET_NAME!;
const URL_EXPIRA_SEGUNDOS = 300;

// WHEN_REQUIRED evita que el SDK agregue parametros de checksum a la URL
// firmada, que romperian la subida directa desde el navegador.
const s3 = new S3Client({
    region: "us-east-1",
    requestChecksumCalculation: "WHEN_REQUIRED",
});

const PREFIJOS: Record<string, string> = {
    producto: "productos",
    artesano: "artesanos",
};

const EXTENSIONES: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
};

function respuesta(statusCode: number, data: unknown) {
    return {
        statusCode,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };
}

// El autorizador JWT solo valida que el token sea de Cognito;
// aqui se exige ademas pertenecer al grupo admin.
function esAdmin(claims: Record<string, unknown>): boolean {
    const grupos = claims["cognito:groups"];
    if (Array.isArray(grupos)) return grupos.includes("admin");
    if (typeof grupos === "string") {
        return grupos.replace(/[\[\]]/g, "").split(/[\s,]+/).includes("admin");
    }
    return false;
}

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (event) => {
    const claims = event.requestContext.authorizer.jwt.claims;
    if (!esAdmin(claims)) {
        return respuesta(403, { mensaje: "Solo los administradores pueden subir imágenes" });
    }

    let body: { tipo?: string; content_type?: string };
    try {
        const raw =
            event.isBase64Encoded && event.body
                ? Buffer.from(event.body, "base64").toString("utf-8")
                : event.body ?? "{}";
        body = JSON.parse(raw);
    } catch {
        return respuesta(400, { mensaje: "El cuerpo de la solicitud no es un JSON válido" });
    }

    const prefijo = body.tipo ? PREFIJOS[body.tipo] : undefined;
    if (!prefijo) {
        return respuesta(400, { mensaje: "tipo debe ser 'producto' o 'artesano'" });
    }

    const extension = body.content_type ? EXTENSIONES[body.content_type] : undefined;
    if (!extension || !body.content_type) {
        return respuesta(400, {
            mensaje: "content_type debe ser image/jpeg, image/png o image/webp",
        });
    }

    // La clave la decide el servidor: el cliente no elige la ruta en el bucket
    const clave = `${prefijo}/${randomUUID()}.${extension}`;

    const url = await getSignedUrl(
        s3,
        new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: clave,
            ContentType: body.content_type,
        }),
        { expiresIn: URL_EXPIRA_SEGUNDOS }
    );

    return respuesta(200, {
        url_subida: url,
        clave,
        content_type: body.content_type,
        expira_en_segundos: URL_EXPIRA_SEGUNDOS,
    });
};