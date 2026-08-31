import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
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

    if (!["doctor", "compounder"].includes(session.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied.",
        },
        { status: 403 },
      );
    }

    let result;

    // =========================
    // DOCTOR
    // Only own appointments
    // =========================

    if (session.role === "doctor") {
      result = await db.query(
        `
        SELECT
          a.id,
          a.patient_id,
          a.doctor_id,
          a.appointment_date,
          a.appointment_time,
          a.token_number,
          a.status,
          a.notes,
          a.created_by,
          a.created_at,
          a.updated_at,

          p.name AS patient_name,
          p.patient_code,
          p.phone AS patient_phone,

          u.name AS doctor_name

        FROM appointments a

        INNER JOIN patients p
          ON p.id = a.patient_id

        INNER JOIN users u
          ON u.id = a.doctor_id

        WHERE a.doctor_id = $1

        ORDER BY
          a.appointment_date DESC,
          a.appointment_time DESC
        `,
        [session.userId],
      );
    } else {
      // =========================
      // COMPOUNDER
      // All appointments
      // =========================

      result = await db.query(
        `
        SELECT
          a.id,
          a.patient_id,
          a.doctor_id,
          a.appointment_date,
          a.appointment_time,
          a.token_number,
          a.status,
          a.notes,
          a.created_by,
          a.created_at,
          a.updated_at,

          p.name AS patient_name,
          p.patient_code,
          p.phone AS patient_phone,

          u.name AS doctor_name

        FROM appointments a

        INNER JOIN patients p
          ON p.id = a.patient_id

        INNER JOIN users u
          ON u.id = a.doctor_id

        ORDER BY
          a.appointment_date DESC,
          a.appointment_time DESC
        `,
      );
    }

    return NextResponse.json(
      {
        success: true,
        count: result.rows.length,
        appointments: result.rows,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET APPOINTMENTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load appointments.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
