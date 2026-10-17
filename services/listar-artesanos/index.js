"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const dsql_signer_1 = require("@aws-sdk/dsql-signer");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const pg_1 = require("pg");
const CLUSTER_ENDPOINT = process.env.DSQL_ENDPOINT;
const BUCKET_NAME = process.env.BUCKET_NAME;
const URL_EXPIRA_SEGUNDOS = 3600;
const s3 = new client_s3_1.S3Client({ region: "us-east-1" });
// La base guarda solo la clave del objeto (o vacío).
// - vacío  -> null (el front muestra el placeholder)
// - http*  -> se devuelve tal cual (dato antiguo, no firmable)
// - otro   -> se firma como clave de S3
async function firmarImagen(valor) {
    if (!valor)
        return null;
    if (valor.startsWith("http"))
        return valor;
    return (0, s3_request_presigner_1.getSignedUrl)(s3, new client_s3_1.GetObjectCommand({ Bucket: BUCKET_NAME, Key: valor }), { expiresIn: URL_EXPIRA_SEGUNDOS });
}
const handler = async () => {
    // 1. Genera el token de conexion NO-ADMIN (dsql:DbConnect, no DbConnectAdmin)
    const signer = new dsql_signer_1.DsqlSigner({
        hostname: CLUSTER_ENDPOINT,
        region: "us-east-1",
    });
    const token = await signer.getDbConnectAuthToken();
    // 2. Conecta como el rol acotado "artesanos_reader" (no como admin)
    const client = new pg_1.Client({
        host: CLUSTER_ENDPOINT,
        user: "artesanos_reader",
        password: token,
        database: "postgres",
        ssl: true,
        client_encoding: "UTF8",
    });
    await client.connect();
    try {
        const result = await client.query("SELECT id, nombre, historia, region, foto_perfil_url, telefono, red_social, mail FROM artesanos");
        // foto_perfil_url conserva la clave (es lo que el formulario guarda de vuelta);
        // foto_perfil_url_firmada es una URL temporal solo para mostrar la imagen.
        const artesanos = await Promise.all(result.rows.map(async (fila) => ({
            ...fila,
            foto_perfil_url_firmada: await firmarImagen(fila.foto_perfil_url),
        })));
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(artesanos),
        };
    }
    finally {
        await client.end();
    }
};
exports.handler = handler;
//# sourceMappingURL=index.js.map