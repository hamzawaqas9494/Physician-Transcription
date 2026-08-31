import { NextResponse } from "next/server";

import { db } from "../../../../../lib/db";
import { getSession } from "../../../../../lib/auth";

const ALLOWED_STATUSES = [
  "scheduled",
  "checked_in",
  "waiting",
  "in_consultation",
  "completed",
  "cancelled",
  "no_show",
];

export async function PATCH(request, { params }) {
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

    if (!["doctor", "compounder"].includes(session.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied.",
        },
        { status: 403 },
      );
    }

    const { id } = await params;

    const appointmentId = Number(id);

    if (!appointmentId || Number.isNaN(appointmentId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid appointment ID.",
        },
        { status: 400 },
      );
    }

    const body = await request.json();

    const status = body.status?.trim();

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid appointment status.",
        },
        { status: 400 },
      );
    }

    const existingResult = await db.query(
      `
        SELECT
          id,
          doctor_id,
          patient_id,
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

    const appointment = existingResult.rows[0];

    if (session.role === "doctor" && appointment.doctor_id !== session.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot update another doctor's appointment.",
        },
        { status: 403 },
      );
    }

    const result = await db.query(
      `
      UPDATE appointments

      SET
        status = $1,
        updated_at = CURRENT_TIMESTAMP

      WHERE id = $2

      RETURNING
        id,
        patient_id,
        doctor_id,
        appointment_date,
        appointment_time,
        token_number,
        status,
        notes,
        updated_at
      `,
      [status, appointmentId],
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
        "UPDATE_APPOINTMENT_STATUS",
        "appointment",
        appointmentId,
        JSON.stringify({
          old_status: appointment.status,
          new_status: status,
        }),
      ],
    );

    return NextResponse.json({
      success: true,
      message: "Appointment status updated successfully.",
      appointment: result.rows[0],
    });
  } catch (error) {
    console.error("APPOINTMENT STATUS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update appointment status.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
