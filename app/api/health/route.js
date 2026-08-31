import { pool } from "@/lib/db";
export async function GET() {
  try {
    const r = await pool.query("SELECT NOW() AS now");
    return Response.json({ ok: true, database: true, time: r.rows[0].now });
  } catch (e) {
    return Response.json({ ok: false, database: false, error: e.message }, { status: 500 });
  }
}