"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const dsql_signer_1 = require("@aws-sdk/dsql-signer");
const pg_1 = require("pg");
const CLUSTER_ENDPOINT = process.env.DSQL_ENDPOINT;
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
        return {
            statusCode: 200,
            body: JSON.stringify(result.rows),
        };
    }
    finally {
        await client.end();
    }
};
exports.handler = handler;
//# sourceMappingURL=index.js.map