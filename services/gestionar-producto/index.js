"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const dsql_signer_1 = require("@aws-sdk/dsql-signer");
const pg_1 = require("pg");
const CLUSTER_ENDPOINT = process.env.DSQL_ENDPOINT;
const handler = async (event) => {
    const signer = new dsql_signer_1.DsqlSigner({
        hostname: CLUSTER_ENDPOINT,
        region: "us-east-1",
    });
    const token = await signer.getDbConnectAuthToken();
    const client = new pg_1.Client({
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
                const result = await client.query(`INSERT INTO productos (artesano_id, nombre, historia, imagen_url, precio, categoria)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id`, [body.artesano_id, body.nombre, body.historia, body.imagen_url, body.precio, body.categoria]);
                return { statusCode: 201, body: JSON.stringify(result.rows[0]) };
            }
            catch (err) {
                // Error 23503 = violacion de FOREIGN KEY (el artesano_id no existe)
                if (err.code === "23503") {
                    return { statusCode: 400, body: JSON.stringify({ mensaje: "El artesano especificado no existe" }) };
                }
                throw err;
            }
        }
        // EDITAR
        if (method === "PUT" && id) {
            await client.query(`UPDATE productos SET artesano_id=$1, nombre=$2, historia=$3, imagen_url=$4, precio=$5, categoria=$6
         WHERE id=$7`, [body.artesano_id, body.nombre, body.historia, body.imagen_url, body.precio, body.categoria, id]);
            return { statusCode: 200, body: JSON.stringify({ mensaje: "Producto actualizado" }) };
        }
        // ELIMINAR
        if (method === "DELETE" && id) {
            await client.query("DELETE FROM productos WHERE id=$1", [id]);
            return { statusCode: 200, body: JSON.stringify({ mensaje: "Producto eliminado" }) };
        }
        return { statusCode: 400, body: JSON.stringify({ mensaje: "Metodo no soportado" }) };
    }
    finally {
        await client.end();
    }
};
exports.handler = handler;
//# sourceMappingURL=index.js.map