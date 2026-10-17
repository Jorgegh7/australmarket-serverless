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
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const s3 = new client_s3_1.S3Client({ region: "us-east-1" });
function respuesta(statusCode, data) {
    return {
        statusCode,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };
}
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
const handler = async (event) => {
    const id = event.pathParameters?.id;
    if (!id || !UUID_RE.test(id)) {
        return respuesta(400, { mensaje: "El id del producto no es válido" });
    }
    const signer = new dsql_signer_1.DsqlSigner({
        hostname: CLUSTER_ENDPOINT,
        region: "us-east-1",
    });
    const token = await signer.getDbConnectAuthToken();
    const client = new pg_1.Client({
        host: CLUSTER_ENDPOINT,
        user: "catalogo_detalle_reader",
        password: token,
        database: "postgres",
        ssl: true,
        client_encoding: "UTF8",
    });
    await client.connect();
    try {
        // Un producto con su artesano anidado. El telefono solo sale en este
        // endpoint (un producto a la vez), nunca en los listados publicos.
        const result = await client.query(`SELECT
                p.id,
                p.nombre,
                p.historia,
                p.imagen_url,
                p.precio,
                p.categoria,
                json_build_object(
                    'id', a.id,
                    'nombre', a.nombre,
                    'historia', a.historia,
                    'region', a.region,
                    'foto_perfil_url', a.foto_perfil_url,
                    'telefono', a.telefono
                ) AS artesano
             FROM productos p
             JOIN artesanos a ON a.id = p.artesano_id
             WHERE p.id = $1`, [id]);
        const fila = result.rows[0];
        if (!fila) {
            return respuesta(404, { mensaje: "Producto no encontrado" });
        }
        const [imagen, foto] = await Promise.all([
            firmarImagen(fila.imagen_url),
            firmarImagen(fila.artesano.foto_perfil_url),
        ]);
        return respuesta(200, {
            ...fila,
            imagen_url: imagen,
            artesano: { ...fila.artesano, foto_perfil_url: foto },
        });
    }
    finally {
        await client.end();
    }
};
exports.handler = handler;
//# sourceMappingURL=index.js.map