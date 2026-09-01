// import { Pool } from "pg";

// const globalForDb = globalThis;

// export const db =
//   globalForDb.postgresPool ||
//   new Pool({
//     connectionString: process.env.DATABASE_URL,
//     ssl: { rejectUnauthorized: false },
//   });

// if (process.env.NODE_ENV !== "production") {
//   globalForDb.postgresPool = db;
// }

// export const pool = db;

// export async function query(sql, args) {
//   return pool.query(sql, args);
// }

import { Pool } from "pg";

const globalForDb = globalThis;

export const db =
  globalForDb.postgresPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.postgresPool = db;
}

export const pool = db;

export async function query(sql, args) {
  return pool.query(sql, args);
}
