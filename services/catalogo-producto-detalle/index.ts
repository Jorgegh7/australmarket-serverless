import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DsqlSigner } from "@aws-sdk/dsql-signer";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Client } from "pg";

const CLUSTER_ENDPOINT = process.env.DSQL_ENDPOINT!;
const BUCKET_NAME = process.env.BUCKET_NAME!;
const URL_EXPIRA_SEGUNDOS = 3600;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const s3 = new S3Client({ region: "us-east-1" });

function respuesta(statusCode: number, data: unknown) {
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
async function firmarImagen(valor: string | null): Promise<string | null> {
    if (!valor) return null;
    if (valor.startsWith("http")) return valor;
    return getSignedUrl(
        s3,
        new GetObjectCommand({ Bucket: BUCKET_NAME, Key: valor }),
        { expiresIn: URL_EXPIRA_SEGUNDOS }
    );
}

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    const id = event.pathParameters?.id;
    if (!id || !UUID_RE.test(id)) {
        return respuesta(400, { mensaje: "El id del producto no es válido" });
    }

    const signer = new DsqlSigner({
        hostname: CLUSTER_ENDPOINT,
        region: "us-east-1",
    });
    const token = await signer.getDbConnectAuthToken();

    const client = new Client({
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
        const result = await client.query(
            `SELECT
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
             WHERE p.id = $1`,
            [id]
        );

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
    } finally {
        await client.end();
    }
};