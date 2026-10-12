import { APIGatewayProxyHandlerV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { DsqlSigner } from "@aws-sdk/dsql-signer";
import { Client } from "pg";

const CLUSTER_ENDPOINT = process.env.DSQL_ENDPOINT!;

function respuesta(statusCode: number, data: unknown): APIGatewayProxyStructuredResultV2 {
    return {
        statusCode,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };
}

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    // HTTP API con payload format 2.0: el metodo viene en requestContext.http.method
    const method = event.requestContext.http.method;
    const id = event.pathParameters?.id;

    // Body: validar antes de abrir la conexion a la base
    let body: any = {};
    if (event.body) {
        try {
            const raw = event.isBase64Encoded
                ? Buffer.from(event.body, "base64").toString("utf-8")
                : event.body;
            body = JSON.parse(raw);
        } catch {
            return respuesta(400, { mensaje: "El cuerpo de la solicitud no es un JSON valido" });
        }
    }

    if ((method === "POST" || method === "PUT") && (!body.artesano_id || !body.nombre)) {
        return respuesta(400, { mensaje: "Artesano y nombre son obligatorios" });
    }

    const signer = new DsqlSigner({
        hostname: CLUSTER_ENDPOINT,
        region: "us-east-1",
    });
    const token = await signer.getDbConnectAuthToken();

    const client = new Client({
        host: CLUSTER_ENDPOINT,
        user: "productos_writer",
        password: token,
        database: "postgres",
        ssl: true,
        client_encoding: "UTF8",
    });

    await client.connect();

    try {
        // CREAR
        if (method === "POST") {
            try {
                const result = await client.query(
                    `INSERT INTO productos (artesano_id, nombre, historia, imagen_url, precio, categoria)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id`,
                    [body.artesano_id, body.nombre, body.historia, body.imagen_url, body.precio, body.categoria]
                );
                return respuesta(201, result.rows[0]);
            } catch (err: any) {
                // Error 23503 = violacion de FOREIGN KEY (el artesano_id no existe)
                if (err.code === "23503") {
                    return respuesta(400, { mensaje: "El artesano especificado no existe" });
                }
                throw err;
            }
        }

        // EDITAR
        if (method === "PUT" && id) {
            try {
                const result = await client.query(
                    `UPDATE productos SET artesano_id=$1, nombre=$2, historia=$3, imagen_url=$4, precio=$5, categoria=$6
           WHERE id=$7`,
                    [body.artesano_id, body.nombre, body.historia, body.imagen_url, body.precio, body.categoria, id]
                );
                if (result.rowCount === 0) {
                    return respuesta(404, { mensaje: "Producto no encontrado" });
                }
                return respuesta(200, { mensaje: "Producto actualizado" });
            } catch (err: any) {
                if (err.code === "23503") {
                    return respuesta(400, { mensaje: "El artesano especificado no existe" });
                }
                throw err;
            }
        }

        // ELIMINAR
        if (method === "DELETE" && id) {
            const result = await client.query("DELETE FROM productos WHERE id=$1", [id]);
            if (result.rowCount === 0) {
                return respuesta(404, { mensaje: "Producto no encontrado" });
            }
            return respuesta(200, { mensaje: "Producto eliminado" });
        }

        return respuesta(400, { mensaje: "Metodo no soportado" });
    } finally {
        await client.end();
    }
};