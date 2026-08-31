import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { getSession } from "../../../lib/auth";

// =========================
// TOKEN GENERATOR
// =========================

function generateTokenNumber(count) {
  return `A-${String(count + 1).padStart(2, "0")}`;
}

// ======================================================
// POST /api/appointments
// BOOK NEW APPOINTMENT
// COMPOUNDER ONLY
// ======================================================

export async function POST(request) {
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

    if (session.role !== "compounder") {
      return NextResponse.json(
        {
          success: false,
          message: "Only compounder can book appointments.",
        },
        { status: 403 },
      );
    }

    // =========================
    // REQUEST BODY
    // =========================

    const body = await request.json();

    const patientId = Number(body.patient_id);
    const doctorId = Number(body.doctor_id);

    const appointmentDate = body.appointment_date?.trim();

    const appointmentTime = body.appointment_time?.trim();

    const notes = body.notes?.trim() || null;

    // =========================
    // VALIDATION
    // =========================

    if (!patientId || Number.isNaN(patientId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid patient is required.",
        },
        { status: 400 },
      );
    }

    if (!doctorId || Number.isNaN(doctorId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid doctor is required.",
        },
        { status: 400 },
      );
    }

    if (!appointmentDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Appointment date is required.",
        },
        { status: 400 },
      );
    }

    if (!appointmentTime) {
      return NextResponse.json(
        {
          success: false,
          message: "Appointment time is required.",
        },
        { status: 400 },
      );
    }

    // =========================
    // DATE FORMAT CHECK
    // =========================

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(appointmentDate)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid appointment date format.",
        },
        { status: 400 },
      );
    }

    // =========================
    // CHECK PATIENT
    // =========================

    const patientResult = await db.query(
      `
      SELECT
        id,
        patient_code,
        name
      FROM patients
      WHERE id = $1
      LIMIT 1
      `,
      [patientId],
    );

    if (patientResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient not found.",
        },
        { status: 404 },
      );
    }

    const patient = patientResult.rows[0];

    // =========================
    // CHECK DOCTOR
    // =========================

    const doctorResult = await db.query(
      `
      SELECT
        id,
        name,
        is_active
      FROM users
      WHERE id = $1
        AND role = 'doctor'
      LIMIT 1
      `,
      [doctorId],
    );

    if (doctorResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor not found.",
        },
        { status: 404 },
      );
    }

    const doctor = doctorResult.rows[0];

    if (!doctor.is_active) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected doctor is inactive.",
        },
        { status: 400 },
      );
    }

    // =========================
    // CHECK DOCTOR SLOT
    // =========================

    const existingSlot = await db.query(
      `
        SELECT id

        FROM appointments

        WHERE doctor_id = $1
          AND appointment_date = $2
          AND appointment_time = $3
          AND status NOT IN (
            'cancelled',
            'no_show'
          )

        LIMIT 1
        `,
      [doctorId, appointmentDate, appointmentTime],
    );

    if (existingSlot.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This appointment slot is already booked. Please select another slot.",
        },
        { status: 409 },
      );
    }

    // =========================
    // CHECK PATIENT CONFLICT
    // =========================

    const patientConflict = await db.query(
      `
        SELECT id

        FROM appointments

        WHERE patient_id = $1
          AND appointment_date = $2
          AND appointment_time = $3
          AND status NOT IN (
            'cancelled',
            'no_show'
          )

        LIMIT 1
        `,
      [patientId, appointmentDate, appointmentTime],
    );

    if (patientConflict.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This patient already has an appointment at the selected time.",
        },
        { status: 409 },
      );
    }

    // =========================
    // GENERATE TOKEN
    // =========================

    const countResult = await db.query(
      `
        SELECT
          COUNT(*)::INTEGER AS total

        FROM appointments

        WHERE doctor_id = $1
          AND appointment_date = $2
          AND status NOT IN (
            'cancelled',
            'no_show'
          )
        `,
      [doctorId, appointmentDate],
    );

    const appointmentCount = countResult.rows[0]?.total || 0;

    const tokenNumber = generateTokenNumber(appointmentCount);

    // =========================
    // CREATE APPOINTMENT
    // =========================

    const result = await db.query(
      `
      INSERT INTO appointments (
        patient_id,
        doctor_id,
        appointment_date,
        appointment_time,
        token_number,
        status,
        notes,
        created_by
      )

      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        'scheduled',
        $6,
        $7
      )

      RETURNING
        id,
        patient_id,
        doctor_id,
        appointment_date,
        appointment_time,
        token_number,
        status,
        notes,
        created_by,
        created_at,
        updated_at
      `,
      [
        patientId,
        doctorId,
        appointmentDate,
        appointmentTime,
        tokenNumber,
        notes,
        session.userId,
      ],
    );

    const appointment = result.rows[0];

    // =========================
    // AUDIT LOG
    // =========================

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
        "CREATE_APPOINTMENT",
        "appointment",
        appointment.id,

        JSON.stringify({
          patient_id: patient.id,

          patient_code: patient.patient_code,

          patient_name: patient.name,

          doctor_id: doctor.id,

          doctor_name: doctor.name,

          appointment_date: appointment.appointment_date,

          appointment_time: appointment.appointment_time,

          token_number: appointment.token_number,
        }),
      ],
    );

    // =========================
    // SUCCESS RESPONSE
    // =========================

    return NextResponse.json(
      {
        success: true,

        message: "Appointment booked successfully.",

        appointment: {
          ...appointment,

          patient_name: patient.name,

          patient_code: patient.patient_code,

          doctor_name: doctor.name,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("BOOK APPOINTMENT ERROR:", error);

    // =========================
    // DATABASE UNIQUE CONSTRAINT
    // =========================

    if (error.code === "23505") {
      return NextResponse.json(
        {
          success: false,

          message:
            "This doctor already has an appointment in the selected slot.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,

        message: "Unable to book appointment.",

        error: error.message,
      },
      { status: 500 },
    );
  }
}
