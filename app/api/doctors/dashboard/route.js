import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

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

    if (session.role !== "doctor") {
      return NextResponse.json(
        {
          success: false,
          message: "Only doctor can access this dashboard.",
        },
        { status: 403 },
      );
    }

    // =========================
    // DOCTOR
    // =========================

    const doctorResult = await db.query(
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
        AND role = 'doctor'
      LIMIT 1
      `,
      [session.userId],
    );

    if (doctorResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor account not found.",
        },
        { status: 404 },
      );
    }

    const doctor = doctorResult.rows[0];

    if (!doctor.is_active) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor account is inactive.",
        },
        { status: 403 },
      );
    }

    // =========================
    // TODAY STATS
    // =========================

    const statsResult = await db.query(
      `
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

      WHERE doctor_id = $1
        AND appointment_date = CURRENT_DATE
      `,
      [doctor.id],
    );

    const stats = statsResult.rows[0];

    // =========================
    // TODAY APPOINTMENTS
    // =========================

    const appointmentsResult = await db.query(
      `
      SELECT
        appointments.id,
        appointments.patient_id,
        appointments.doctor_id,
        appointments.appointment_date,
        appointments.appointment_time,
        appointments.token_number,
        appointments.status,
        appointments.notes,
        appointments.created_at,

        patients.name AS patient_name,
        patients.patient_code,
        patients.gender,
        patients.date_of_birth,
        patients.phone AS patient_phone

      FROM appointments

      INNER JOIN patients
        ON patients.id = appointments.patient_id

      WHERE appointments.doctor_id = $1
        AND appointments.appointment_date = CURRENT_DATE

      ORDER BY
        CASE appointments.status
          WHEN 'in_consultation' THEN 1
          WHEN 'waiting' THEN 2
          WHEN 'checked_in' THEN 3
          WHEN 'scheduled' THEN 4
          WHEN 'completed' THEN 5
          WHEN 'cancelled' THEN 6
          WHEN 'no_show' THEN 7
          ELSE 8
        END,
        appointments.appointment_time ASC
      `,
      [doctor.id],
    );

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json(
      {
        success: true,

        doctor,

        stats: {
          total: stats?.total || 0,
          scheduled: stats?.scheduled || 0,
          checked_in: stats?.checked_in || 0,
          waiting: stats?.waiting || 0,
          in_consultation: stats?.in_consultation || 0,
          completed: stats?.completed || 0,
          cancelled: stats?.cancelled || 0,
          no_show: stats?.no_show || 0,
        },

        appointments: appointmentsResult.rows,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("DOCTOR DASHBOARD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load doctor dashboard.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
