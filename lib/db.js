import { awsCredentialsProvider } from "@vercel/functions/oidc";
import { attachDatabasePool } from "@vercel/functions";
import { Signer } from "@aws-sdk/rds-signer";
import { Pool } from "pg";

const signer = new Signer({
  hostname: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  username: process.env.PGUSER,
  region: process.env.AWS_REGION,
  credentials: awsCredentialsProvider({
    roleArn: process.env.AWS_ROLE_ARN,
    clientConfig: { region: process.env.AWS_REGION },
  }),
});

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  database: process.env.PGDATABASE || "postgres",
  password: () => signer.getAuthToken(),
  port: Number(process.env.PGPORT),
  ssl: { rejectUnauthorized: false },
  max: 20,
});

attachDatabasePool(pool);

// Single query
export async function query(sql, args) {
  return pool.query(sql, args);
}

// Multiple queries with same connection
export async function withConnection(fn) {
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

// Extra exports (agar kahin pool/db import ho raha ho)
export { pool };
export const db = pool;
