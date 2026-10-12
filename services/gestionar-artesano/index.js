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
        user: "artesanos_writer",
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
            const result = await client.query(`INSERT INTO artesanos (nombre, historia, region, foto_perfil_url, telefono, red_social, mail)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`, [body.nombre, body.historia, body.region, body.foto_perfil_url, body.telefono, body.red_social, body.mail]);
            return { statusCode: 201, body: JSON.stringify(result.rows[0]) };
        }
        // EDITAR
        if (method === "PUT" && id) {
            await client.query(`UPDATE artesanos SET nombre=$1, historia=$2, region=$3, foto_perfil_url=$4, telefono=$5, red_social=$6, mail=$7
         WHERE id=$8`, [body.nombre, body.historia, body.region, body.foto_perfil_url, body.telefono, body.red_social, body.mail, id]);
            return { statusCode: 200, body: JSON.stringify({ mensaje: "Artesano actualizado" }) };
        }
        // ELIMINAR
        if (method === "DELETE" && id) {
            await client.query("DELETE FROM artesanos WHERE id=$1", [id]);
            return { statusCode: 200, body: JSON.stringify({ mensaje: "Artesano eliminado" }) };
        }
        return { statusCode: 400, body: JSON.stringify({ mensaje: "Metodo no soportado" }) };
    }
    finally {
        await client.end();
    }
};
exports.handler = handler;
//# sourceMappingURL=index.js.map