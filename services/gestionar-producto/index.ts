import { APIGatewayProxyHandler } from "aws-lambda";
import { DsqlSigner } from "@aws-sdk/dsql-signer";
import { Client } from "pg";

const CLUSTER_ENDPOINT = process.env.DSQL_ENDPOINT!;

export const handler: APIGatewayProxyHandler = async (event) => {
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
        const method = event.httpMethod;
        const body = event.body ? JSON.parse(event.body) : {};
        const id = event.pathParameters?.id;

        // CREAR
        if (method === "POST") {
            try {
                const result = await client.query(
                    `INSERT INTO productos (artesano_id, nombre, historia, imagen_url, precio, categoria)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id`,
                    [body.artesano_id, body.nombre, body.historia, body.imagen_url, body.precio, body.categoria]
                );
                return { statusCode: 201, body: JSON.stringify(result.rows[0]) };
            } catch (err: any) {
                // Error 23503 = violacion de FOREIGN KEY (el artesano_id no existe)
                if (err.code === "23503") {
                    return { statusCode: 400, body: JSON.stringify({ mensaje: "El artesano especificado no existe" }) };
                }
                throw err;
            }
        }

        // EDITAR
        if (method === "PUT" && id) {
            await client.query(
                `UPDATE productos SET artesano_id=$1, nombre=$2, historia=$3, imagen_url=$4, precio=$5, categoria=$6
         WHERE id=$7`,
                [body.artesano_id, body.nombre, body.historia, body.imagen_url, body.precio, body.categoria, id]
            );
            return { statusCode: 200, body: JSON.stringify({ mensaje: "Producto actualizado" }) };
        }

        // ELIMINAR
        if (method === "DELETE" && id) {
            await client.query("DELETE FROM productos WHERE id=$1", [id]);
            return { statusCode: 200, body: JSON.stringify({ mensaje: "Producto eliminado" }) };
        }

        return { statusCode: 400, body: JSON.stringify({ mensaje: "Metodo no soportado" }) };
    } finally {
        await client.end();
    }
};