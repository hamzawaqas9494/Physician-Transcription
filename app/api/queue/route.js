import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

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
          message: "Access denied.",
        },
        { status: 403 },
      );
    }

    let result;

    // =========================
    // DOCTOR QUEUE
    // Only doctor's own patients
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
          a.created_at,
          a.updated_at,

          p.name AS patient_name,
          p.patient_code,
          p.phone AS patient_phone,

          d.name AS doctor_name

        FROM appointments a

        INNER JOIN patients p
          ON p.id = a.patient_id

        INNER JOIN users d
          ON d.id = a.doctor_id

        WHERE a.appointment_date = CURRENT_DATE
          AND a.doctor_id = $1
          AND a.status IN (
            'scheduled',
            'checked_in',
            'waiting',
            'in_consultation'
          )

        ORDER BY
          CASE a.status
            WHEN 'in_consultation' THEN 1
            WHEN 'waiting' THEN 2
            WHEN 'checked_in' THEN 3
            WHEN 'scheduled' THEN 4
            ELSE 5
          END,
          a.appointment_time ASC
        `,
        [session.userId],
      );
    } else {
      // =========================
      // COMPOUNDER QUEUE
      // All doctors
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
          a.created_at,
          a.updated_at,

          p.name AS patient_name,
          p.patient_code,
          p.phone AS patient_phone,

          d.name AS doctor_name

        FROM appointments a

        INNER JOIN patients p
          ON p.id = a.patient_id

        INNER JOIN users d
          ON d.id = a.doctor_id

        WHERE a.appointment_date = CURRENT_DATE
          AND a.status IN (
            'scheduled',
            'checked_in',
            'waiting',
            'in_consultation'
          )

        ORDER BY
          CASE a.status
            WHEN 'in_consultation' THEN 1
            WHEN 'waiting' THEN 2
            WHEN 'checked_in' THEN 3
            WHEN 'scheduled' THEN 4
            ELSE 5
          END,
          a.appointment_time ASC
        `,
      );
    }

    // =========================
    // COUNTS
    // =========================

    const queue = result.rows;

    const counts = {
      total: queue.length,

      scheduled: queue.filter((item) => item.status === "scheduled").length,

      checked_in: queue.filter((item) => item.status === "checked_in").length,

      waiting: queue.filter((item) => item.status === "waiting").length,

      in_consultation: queue.filter((item) => item.status === "in_consultation")
        .length,
    };

    return NextResponse.json(
      {
        success: true,
        counts,
        queue,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET QUEUE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load today's queue.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
