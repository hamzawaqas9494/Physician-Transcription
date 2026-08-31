import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { getSession } from "../../../../lib/auth";

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

    if (!["doctor", "compounder"].includes(session.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not allowed to access patients.",
        },
        { status: 403 },
      );
    }

    // =========================
    // SEARCH PARAMETER
    // =========================

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";

    // =========================
    // GET PATIENTS
    // =========================

    let result;

    if (search) {
      result = await db.query(
        `
        SELECT
          p.id,
          p.patient_code,
          p.name,
          p.date_of_birth,
          p.gender,
          p.phone,
          p.address,
          p.emergency_contact_name,
          p.emergency_contact_phone,
          p.created_at,
          p.updated_at,

          (
            SELECT MAX(a.appointment_date)
            FROM appointments a
            WHERE a.patient_id = p.id
          ) AS last_visit

        FROM patients p

        WHERE
          p.name ILIKE $1
          OR p.phone ILIKE $1
          OR p.patient_code ILIKE $1

        ORDER BY p.created_at DESC
        `,
        [`%${search}%`],
      );
    } else {
      result = await db.query(`
        SELECT
          p.id,
          p.patient_code,
          p.name,
          p.date_of_birth,
          p.gender,
          p.phone,
          p.address,
          p.emergency_contact_name,
          p.emergency_contact_phone,
          p.created_at,
          p.updated_at,

          (
            SELECT MAX(a.appointment_date)
            FROM appointments a
            WHERE a.patient_id = p.id
          ) AS last_visit

        FROM patients p

        ORDER BY p.created_at DESC
      `);
    }

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
    console.error("GET PATIENTS ERROR:", error);

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
