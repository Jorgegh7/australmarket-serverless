import { APIGatewayProxyHandler } from "aws-lambda";
import { DsqlSigner } from "@aws-sdk/dsql-signer";
import { Client } from "pg";

const CLUSTER_ENDPOINT = process.env.DSQL_ENDPOINT!;

export const handler: APIGatewayProxyHandler = async () => {
    // 1. Genera el token de conexion NO-ADMIN (dsql:DbConnect, no DbConnectAdmin)
    const signer = new DsqlSigner({
        hostname: CLUSTER_ENDPOINT,
        region: "us-east-1",
    });
    const token = await signer.getDbConnectAuthToken();

    // 2. Conecta como el rol acotado "artesanos_reader" (no como admin)
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
        const result = await client.query(
            "SELECT id, nombre, historia, region, foto_perfil_url, telefono, red_social, mail FROM artesanos"
        );

        return {
            statusCode: 200,
            body: JSON.stringify(result.rows),
        };
    } finally {
        await client.end();
    }
};