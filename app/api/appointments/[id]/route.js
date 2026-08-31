import { NextResponse } from "next/server";

import { db } from "../../../../lib/db";
import { getSession } from "../../../../lib/auth";

export async function GET(request, { params }) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    const { id } = await params;

    const appointmentId = Number(id);

    const result = await db.query(
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

        p.name AS patient_name,
        p.patient_code,

        u.name AS doctor_name

      FROM appointments a

      INNER JOIN patients p
        ON p.id = a.patient_id

      INNER JOIN users u
        ON u.id = a.doctor_id

      WHERE a.id = $1

      LIMIT 1
      `,
      [appointmentId],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Appointment not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      appointment: result.rows[0],
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to load appointment.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    if (session.role !== "compounder") {
      return NextResponse.json(
        {
          success: false,
          message: "Only compounder can reschedule appointments.",
        },
        { status: 403 },
      );
    }

    const { id } = await params;

    const appointmentId = Number(id);

    const body = await request.json();

    const appointmentDate = body.appointment_date;

    const appointmentTime = body.appointment_time;

    if (!appointmentDate || !appointmentTime) {
      return NextResponse.json(
        {
          success: false,
          message: "New date and time are required.",
        },
        { status: 400 },
      );
    }

    const existingResult = await db.query(
      `
        SELECT
          id,
          doctor_id,
          appointment_date,
          appointment_time,
          status
        FROM appointments
        WHERE id = $1
        LIMIT 1
        `,
      [appointmentId],
    );

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Appointment not found.",
        },
        { status: 404 },
      );
    }

    const existing = existingResult.rows[0];

    const conflict = await db.query(
      `
        SELECT id
        FROM appointments
        WHERE doctor_id = $1
          AND appointment_date = $2
          AND appointment_time = $3
          AND id <> $4
          AND status NOT IN (
            'cancelled',
            'no_show'
          )
        LIMIT 1
        `,
      [existing.doctor_id, appointmentDate, appointmentTime, appointmentId],
    );

    if (conflict.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected slot is already booked.",
        },
        { status: 409 },
      );
    }

    const result = await db.query(
      `
      UPDATE appointments

      SET
        appointment_date = $1,
        appointment_time = $2,
        status = 'scheduled',
        updated_at = CURRENT_TIMESTAMP

      WHERE id = $3

      RETURNING *
      `,
      [appointmentDate, appointmentTime, appointmentId],
    );

    await db.query(
      `
      INSERT INTO audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        details
      )

      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5
      )
      `,
      [
        session.userId,
        "RESCHEDULE_APPOINTMENT",
        "appointment",
        appointmentId,
        JSON.stringify({
          old_date: existing.appointment_date,
          old_time: existing.appointment_time,
          new_date: appointmentDate,
          new_time: appointmentTime,
        }),
      ],
    );

    return NextResponse.json({
      success: true,
      message: "Appointment rescheduled successfully.",
      appointment: result.rows[0],
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to reschedule appointment.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
