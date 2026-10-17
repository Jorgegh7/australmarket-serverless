import { APIGatewayProxyHandler } from "aws-lambda";
import { DsqlSigner } from "@aws-sdk/dsql-signer";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Client } from "pg";

const CLUSTER_ENDPOINT = process.env.DSQL_ENDPOINT!;
const BUCKET_NAME = process.env.BUCKET_NAME!;
const URL_EXPIRA_SEGUNDOS = 3600;

const s3 = new S3Client({ region: "us-east-1" });

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

export const handler: APIGatewayProxyHandler = async () => {
    const signer = new DsqlSigner({
        hostname: CLUSTER_ENDPOINT,
        region: "us-east-1",
    });
    const token = await signer.getDbConnectAuthToken();

    const client = new Client({
        host: CLUSTER_ENDPOINT,
        user: "artesanos_reader",
        password: token,
        database: "postgres",
        ssl: true,
        client_encoding: "UTF8",
    });

    await client.connect();

    try {
        // Solo columnas seguras para exposicion publica —
        // excluye telefono, mail, red_social (datos de contacto sensibles)
        const result = await client.query(
            "SELECT id, nombre, historia, region, foto_perfil_url FROM artesanos"
        );

        const artesanos = await Promise.all(
            result.rows.map(async (fila) => ({
                ...fila,
                foto_perfil_url: await firmarImagen(fila.foto_perfil_url),
            }))
        );

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(artesanos),
        };
    } finally {
        await client.end();
    }
};