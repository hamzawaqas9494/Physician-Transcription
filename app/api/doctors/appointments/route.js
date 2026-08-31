import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// ========================================
// GET DOCTOR APPOINTMENTS
// ========================================

export async function GET(request) {
  try {
    // ========================================
    // SESSION
    // ========================================

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

    // ========================================
    // ROLE CHECK
    // ========================================

    if (session.role !== "doctor") {
      return NextResponse.json(
        {
          success: false,
          message: "Only doctors can access this resource.",
        },
        { status: 403 },
      );
    }

    // ========================================
    // GET QUERY PARAMS
    // ========================================

    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          message: "start_date and end_date are required.",
        },
        { status: 400 },
      );
    }

    // Basic YYYY-MM-DD validation

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD.",
        },
        { status: 400 },
      );
    }

    if (startDate > endDate) {
      return NextResponse.json(
        {
          success: false,
          message: "start_date cannot be after end_date.",
        },
        { status: 400 },
      );
    }

    // ========================================
    // VERIFY DOCTOR
    // ========================================

    const doctorResult = await db.query(
      `
      SELECT
        id,
        name,
        email,
        phone,
        role,
        is_active
      FROM users
      WHERE id = $1
        AND role = 'doctor'
        AND is_active = TRUE
      LIMIT 1
      `,
      [session.userId],
    );

    if (doctorResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor account not found or inactive.",
        },
        { status: 403 },
      );
    }

    const doctor = doctorResult.rows[0];

    // ========================================
    // GET APPOINTMENTS
    // ========================================

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
        appointments.updated_at,

        patients.name AS patient_name,
        patients.patient_code,
        patients.phone AS patient_phone,
        patients.gender,
        patients.date_of_birth

      FROM appointments

      INNER JOIN patients
        ON patients.id = appointments.patient_id

      WHERE appointments.doctor_id = $1

        AND appointments.appointment_date
          BETWEEN $2::DATE AND $3::DATE

      ORDER BY
        appointments.appointment_date ASC,
        appointments.appointment_time ASC
      `,
      [doctor.id, startDate, endDate],
    );

    const appointments = appointmentsResult.rows;

    // ========================================
    // STATS
    // ========================================

    const stats = {
      total: appointments.length,

      scheduled: appointments.filter(
        (appointment) => appointment.status === "scheduled",
      ).length,

      checked_in: appointments.filter(
        (appointment) => appointment.status === "checked_in",
      ).length,

      waiting: appointments.filter(
        (appointment) => appointment.status === "waiting",
      ).length,

      in_consultation: appointments.filter(
        (appointment) => appointment.status === "in_consultation",
      ).length,

      completed: appointments.filter(
        (appointment) => appointment.status === "completed",
      ).length,

      cancelled: appointments.filter(
        (appointment) => appointment.status === "cancelled",
      ).length,

      no_show: appointments.filter(
        (appointment) => appointment.status === "no_show",
      ).length,
    };

    // ========================================
    // RESPONSE
    // ========================================

    return NextResponse.json(
      {
        success: true,

        doctor,

        range: {
          start_date: startDate,
          end_date: endDate,
        },

        stats,

        count: appointments.length,

        appointments,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET DOCTOR APPOINTMENTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load appointments.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
