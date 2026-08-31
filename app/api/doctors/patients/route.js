import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request) {
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

    if (session.role !== "doctor") {
      return NextResponse.json(
        {
          success: false,
          message: "Only doctors can access this resource.",
        },
        { status: 403 },
      );
    }

    // =========================
    // SEARCH PARAM
    // =========================

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";

    // =========================
    // GET PATIENTS
    // =========================

    const result = await db.query(
      `
      SELECT
        p.id,
        p.patient_code,
        p.name,
        p.date_of_birth,
        p.gender,
        p.phone,
        p.created_at,

        MAX(
          CASE
            WHEN a.doctor_id = $1
              AND a.status = 'completed'
            THEN a.appointment_date
            ELSE NULL
          END
        ) AS last_visit

      FROM patients p

      LEFT JOIN appointments a
        ON a.patient_id = p.id

      WHERE
        (
          $2 = ''
          OR p.name ILIKE '%' || $2 || '%'
          OR COALESCE(p.phone, '') ILIKE '%' || $2 || '%'
          OR p.patient_code ILIKE '%' || $2 || '%'
        )

      GROUP BY
        p.id,
        p.patient_code,
        p.name,
        p.date_of_birth,
        p.gender,
        p.phone,
        p.created_at

      ORDER BY
        p.name ASC
      `,
      [session.userId, search],
    );

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json(
      {
        success: true,
        count: result.rows.length,
        patients: result.rows,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET DOCTOR PATIENTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load patients.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
