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

    if ((method === "POST" || method === "PUT") && (!body.nombre || !body.telefono)) {
        return respuesta(400, { mensaje: "Nombre y telefono son obligatorios" });
    }

    const signer = new DsqlSigner({
        hostname: CLUSTER_ENDPOINT,
        region: "us-east-1",
    });
    const token = await signer.getDbConnectAuthToken();

    const client = new Client({
        host: CLUSTER_ENDPOINT,
        user: "artesanos_writer",
        password: token,
        database: "postgres",
        ssl: true,
        client_encoding: "UTF8",
    });

    await client.connect();

    try {
        // CREAR
        if (method === "POST") {
            const result = await client.query(
                `INSERT INTO artesanos (nombre, historia, region, foto_perfil_url, telefono, red_social, mail)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
                [body.nombre, body.historia, body.region, body.foto_perfil_url, body.telefono, body.red_social, body.mail]
            );
            return respuesta(201, result.rows[0]);
        }

        // EDITAR
        if (method === "PUT" && id) {
            const result = await client.query(
                `UPDATE artesanos SET nombre=$1, historia=$2, region=$3, foto_perfil_url=$4, telefono=$5, red_social=$6, mail=$7
         WHERE id=$8`,
                [body.nombre, body.historia, body.region, body.foto_perfil_url, body.telefono, body.red_social, body.mail, id]
            );
            if (result.rowCount === 0) {
                return respuesta(404, { mensaje: "Artesano no encontrado" });
            }
            return respuesta(200, { mensaje: "Artesano actualizado" });
        }

        // ELIMINAR
        if (method === "DELETE" && id) {
            try {
                const result = await client.query("DELETE FROM artesanos WHERE id=$1", [id]);
                if (result.rowCount === 0) {
                    return respuesta(404, { mensaje: "Artesano no encontrado" });
                }
                return respuesta(200, { mensaje: "Artesano eliminado" });
            } catch (err: any) {
                // Error 23503 = violacion de FOREIGN KEY (el artesano todavia tiene productos)
                if (err.code === "23503") {
                    return respuesta(409, { mensaje: "No se puede eliminar: el artesano tiene productos asociados" });
                }
                throw err;
            }
        }

        return respuesta(400, { mensaje: "Metodo no soportado" });
    } finally {
        await client.end();
    }
};