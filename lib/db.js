import { Pool } from "pg";

const globalForDb = globalThis;

export const db =
  globalForDb.postgresPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.postgresPool = db;
}

// Agar kahin `pool` import ho raha hai to yeh bhi add kar do
export const pool = db;
