import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { getSession } from "../../../../lib/auth";

export async function GET(request, { params }) {
  try {
    // =========================
    // SESSION CHECK
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

    // Doctor + Compounder both can view
    if (!["doctor", "compounder"].includes(session.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not allowed to view this patient.",
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
    // PATIENT BASIC DATA
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
        created_at,
        updated_at
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
        mh.updated_at,

        u.id AS created_by_id,
        u.name AS created_by_name,
        u.role AS created_by_role

      FROM medical_history mh

      LEFT JOIN users u
        ON u.id = mh.created_by

      WHERE mh.patient_id = $1

      ORDER BY mh.created_at DESC
      `,
      [patientId],
    );

    // =========================
    // APPOINTMENTS
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

        u.id AS doctor_id,
        u.name AS doctor_name

      FROM appointments a

      INNER JOIN users u
        ON u.id = a.doctor_id

      WHERE a.patient_id = $1

      ORDER BY
        a.appointment_date DESC,
        a.appointment_time DESC

      LIMIT 10
      `,
      [patientId],
    );

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json(
      {
        success: true,
        patient,
        medical_history: historyResult.rows,
        appointments: appointmentsResult.rows,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET SINGLE PATIENT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load patient.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
