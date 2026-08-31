import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { getSession } from "../../../../lib/auth";

export async function GET() {
  try {
    // =========================
    // SESSION
    // =========================

    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please login.",
        },
        { status: 401 },
      );
    }

    // =========================
    // ROLE CHECK
    // =========================

    if (!["doctor", "compounder"].includes(session.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not allowed to access doctors.",
        },
        { status: 403 },
      );
    }

    // =========================
    // GET ACTIVE DOCTORS
    // =========================

    const result = await db.query(`
      SELECT
        id,
        name,
        email,
        phone,
        role,
        is_active,
        last_login_at,
        created_at
      FROM users
      WHERE role = 'doctor'
        AND is_active = TRUE
      ORDER BY name ASC
    `);

    return NextResponse.json(
      {
        success: true,
        count: result.rows.length,
        doctors: result.rows,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET DOCTORS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load doctors.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
