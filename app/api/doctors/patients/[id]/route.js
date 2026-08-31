import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
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
          message: "Only doctors can access this patient record.",
        },
        { status: 403 },
      );
    }

    // =========================
    // PATIENT ID
    // =========================

    const { id } = await params;

    const patientId = Number(id);

    if (!patientId || Number.isNaN(patientId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid patient ID.",
        },
        { status: 400 },
      );
    }

    // =========================
    // PATIENT
    // =========================

    const patientResult = await db.query(
      `
      SELECT
        id,
        patient_code,
        name,
        date_of_birth,
        gender,
        phone,
        address,
        emergency_contact_name,
        emergency_contact_phone,
        created_at
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

    // =========================
    // MEDICAL HISTORY
    // =========================

    const historyResult = await db.query(
      `
      SELECT
        mh.id,
        mh.previous_diseases,
        mh.allergies,
        mh.current_medications,
        mh.previous_surgeries,
        mh.family_history,
        mh.additional_notes,
        mh.created_at,

        u.name AS created_by_name

      FROM medical_history mh

      LEFT JOIN users u
        ON u.id = mh.created_by

      WHERE mh.patient_id = $1

      ORDER BY mh.created_at DESC
      `,
      [patientId],
    );

    // =========================
    // APPOINTMENTS WITH THIS DOCTOR
    // =========================

    const appointmentsResult = await db.query(
      `
      SELECT
        a.id,
        a.appointment_date,
        a.appointment_time,
        a.token_number,
        a.status,
        a.notes,
        a.created_at

      FROM appointments a

      WHERE a.patient_id = $1
        AND a.doctor_id = $2

      ORDER BY
        a.appointment_date DESC,
        a.appointment_time DESC
      `,
      [patientId, session.userId],
    );

    // =========================
    // ACTIVE APPOINTMENT
    // =========================

    const activeAppointmentResult = await db.query(
      `
      SELECT
        id,
        appointment_date,
        appointment_time,
        token_number,
        status

      FROM appointments

      WHERE patient_id = $1
        AND doctor_id = $2
        AND appointment_date = CURRENT_DATE
        AND status IN (
          'checked_in',
          'waiting',
          'in_consultation'
        )

      ORDER BY appointment_time ASC

      LIMIT 1
      `,
      [patientId, session.userId],
    );

    return NextResponse.json(
      {
        success: true,

        patient: patientResult.rows[0],

        medical_history: historyResult.rows,

        appointments: appointmentsResult.rows,

        active_appointment: activeAppointmentResult.rows[0] || null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET DOCTOR PATIENT PROFILE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load patient profile.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
