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
    // ROLE
    // =========================

    if (session.role !== "compounder") {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied.",
        },
        { status: 403 },
      );
    }

    // =========================
    // COMPOUNDER DATA
    // =========================

    const compounderResult = await db.query(
      `
      SELECT
        id,
        name,
        email,
        phone,
        role,
        is_active,
        last_login_at
      FROM users
      WHERE id = $1
        AND role = 'compounder'
      LIMIT 1
      `,
      [session.userId],
    );

    if (compounderResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Compounder account not found.",
        },
        { status: 404 },
      );
    }

    const compounder = compounderResult.rows[0];

    // =========================
    // TOTAL PATIENTS
    // =========================

    const totalPatientsResult = await db.query(`
      SELECT COUNT(*)::INTEGER AS total
      FROM patients
    `);

    const totalPatients = totalPatientsResult.rows[0]?.total || 0;

    // =========================
    // TODAY STATS
    // =========================

    const statsResult = await db.query(`
      SELECT

        COUNT(*)::INTEGER AS total,

        COUNT(*) FILTER (
          WHERE status = 'scheduled'
        )::INTEGER AS scheduled,

        COUNT(*) FILTER (
          WHERE status = 'checked_in'
        )::INTEGER AS checked_in,

        COUNT(*) FILTER (
          WHERE status = 'waiting'
        )::INTEGER AS waiting,

        COUNT(*) FILTER (
          WHERE status = 'in_consultation'
        )::INTEGER AS in_consultation,

        COUNT(*) FILTER (
          WHERE status = 'completed'
        )::INTEGER AS completed,

        COUNT(*) FILTER (
          WHERE status = 'cancelled'
        )::INTEGER AS cancelled,

        COUNT(*) FILTER (
          WHERE status = 'no_show'
        )::INTEGER AS no_show

      FROM appointments

      WHERE appointment_date = CURRENT_DATE
    `);

    const stats = statsResult.rows[0];

    // =========================
    // TODAY QUEUE
    // =========================

    const queueResult = await db.query(`
      SELECT
        a.id,
        a.patient_id,
        a.doctor_id,
        a.appointment_date,
        a.appointment_time,
        a.token_number,
        a.status,
        a.notes,

        p.name AS patient_name,
        p.patient_code,

        d.name AS doctor_name

      FROM appointments a

      INNER JOIN patients p
        ON p.id = a.patient_id

      INNER JOIN users d
        ON d.id = a.doctor_id

      WHERE a.appointment_date = CURRENT_DATE

      ORDER BY
        CASE a.status
          WHEN 'in_consultation' THEN 1
          WHEN 'waiting' THEN 2
          WHEN 'checked_in' THEN 3
          WHEN 'scheduled' THEN 4
          WHEN 'completed' THEN 5
          WHEN 'cancelled' THEN 6
          WHEN 'no_show' THEN 7
          ELSE 8
        END,
        a.appointment_time ASC
    `);

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json(
      {
        success: true,

        compounder,

        stats: {
          total_patients: totalPatients,

          today_appointments: stats.total || 0,

          scheduled: stats.scheduled || 0,

          checked_in: stats.checked_in || 0,

          waiting: stats.waiting || 0,

          in_consultation: stats.in_consultation || 0,

          completed: stats.completed || 0,

          cancelled: stats.cancelled || 0,

          no_show: stats.no_show || 0,
        },

        queue: queueResult.rows,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("COMPOUNDER DASHBOARD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load compounder dashboard.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
