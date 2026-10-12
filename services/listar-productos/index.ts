import { APIGatewayProxyHandler } from "aws-lambda";
import { DsqlSigner } from "@aws-sdk/dsql-signer";
import { Client } from "pg";

const CLUSTER_ENDPOINT = process.env.DSQL_ENDPOINT!;

export const handler: APIGatewayProxyHandler = async () => {
    const signer = new DsqlSigner({
        hostname: CLUSTER_ENDPOINT,
        region: "us-east-1",
    });
    const token = await signer.getDbConnectAuthToken();

    const client = new Client({
        host: CLUSTER_ENDPOINT,
        user: "productos_reader",
        password: token,
        database: "postgres",
        ssl: true,
        client_encoding: "UTF8",
    });

    await client.connect();

    try {
        const result = await client.query(
            "SELECT id, artesano_id, nombre, historia, imagen_url, precio, categoria FROM productos"
        );

        return {
            statusCode: 200,
            body: JSON.stringify(result.rows),
        };
    } finally {
        await client.end();
    }
};