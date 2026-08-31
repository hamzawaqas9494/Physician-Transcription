import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// ======================================================
// GET /api/doctor/consultations/start?appointment=7
// LOAD START CONSULTATION PAGE DATA
// ======================================================

export async function GET(request) {
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

    if (session.role !== "doctor") {
      return NextResponse.json(
        {
          success: false,
          message: "Only doctors can access consultations.",
        },
        { status: 403 },
      );
    }

    // =========================
    // APPOINTMENT ID
    // =========================

    const { searchParams } = new URL(request.url);

    const appointmentId = Number(searchParams.get("appointment"));

    if (!appointmentId || Number.isNaN(appointmentId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid appointment ID is required.",
        },
        { status: 400 },
      );
    }

    // =========================
    // APPOINTMENT + PATIENT
    // =========================

    const appointmentResult = await db.query(
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

        p.patient_code,
        p.name AS patient_name,
        p.date_of_birth,
        p.gender,
        p.phone,
        p.address,
        p.emergency_contact_name,
        p.emergency_contact_phone

      FROM appointments a

      INNER JOIN patients p
        ON p.id = a.patient_id

      WHERE a.id = $1

      LIMIT 1
      `,
      [appointmentId],
    );

    if (appointmentResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Appointment not found.",
        },
        { status: 404 },
      );
    }

    const appointment = appointmentResult.rows[0];

    // =========================
    // DOCTOR OWNERSHIP
    // =========================

    if (Number(appointment.doctor_id) !== Number(session.userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "This appointment does not belong to you.",
        },
        { status: 403 },
      );
    }

    // =========================
    // STATUS CHECK
    // =========================

    const allowedStatuses = ["waiting", "in_consultation"];

    if (!allowedStatuses.includes(appointment.status)) {
      return NextResponse.json(
        {
          success: false,
          message: "This appointment is not ready for consultation.",
        },
        { status: 400 },
      );
    }

    // =========================
    // MEDICAL HISTORY
    // =========================

    const historyResult = await db.query(
      `
      SELECT
        mh.id,
        mh.patient_id,
        mh.previous_diseases,
        mh.allergies,
        mh.current_medications,
        mh.previous_surgeries,
        mh.family_history,
        mh.additional_notes,
        mh.created_by,
        mh.created_at,
        mh.updated_at,

        u.name AS created_by_name

      FROM medical_history mh

      LEFT JOIN users u
        ON u.id = mh.created_by

      WHERE mh.patient_id = $1

      ORDER BY mh.created_at DESC
      `,
      [appointment.patient_id],
    );

    // =========================
    // EXISTING CONSULTATION
    // =========================

    const consultationResult = await db.query(
      `
      SELECT
        id,
        appointment_id,
        patient_id,
        doctor_id,
        started_at,
        ended_at,
        status,
        clinical_notes,
        diagnosis,
        created_at,
        updated_at

      FROM consultations

      WHERE appointment_id = $1

      LIMIT 1
      `,
      [appointmentId],
    );

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json(
      {
        success: true,

        appointment: {
          id: appointment.id,
          patient_id: appointment.patient_id,
          doctor_id: appointment.doctor_id,
          appointment_date: appointment.appointment_date,
          appointment_time: appointment.appointment_time,
          token_number: appointment.token_number,
          status: appointment.status,
          notes: appointment.notes,
        },

        patient: {
          id: appointment.patient_id,
          patient_code: appointment.patient_code,
          name: appointment.patient_name,
          date_of_birth: appointment.date_of_birth,
          gender: appointment.gender,
          phone: appointment.phone,
          address: appointment.address,
          emergency_contact_name: appointment.emergency_contact_name,
          emergency_contact_phone: appointment.emergency_contact_phone,
        },

        medical_history: historyResult.rows,

        consultation: consultationResult.rows[0] || null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("LOAD START CONSULTATION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load consultation.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// ======================================================
// POST /api/doctor/consultations/start
// START CONSULTATION
// ======================================================

export async function POST(request) {
  const client = await db.connect();

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

    if (session.role !== "doctor") {
      return NextResponse.json(
        {
          success: false,
          message: "Only doctors can start consultations.",
        },
        { status: 403 },
      );
    }

    // =========================
    // BODY
    // =========================

    const body = await request.json();

    const appointmentId = Number(body.appointment_id);

    if (!appointmentId || Number.isNaN(appointmentId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid appointment ID is required.",
        },
        { status: 400 },
      );
    }

    // =========================
    // TRANSACTION
    // =========================

    await client.query("BEGIN");

    // =========================
    // LOCK APPOINTMENT
    // =========================

    const appointmentResult = await client.query(
      `
      SELECT
        id,
        patient_id,
        doctor_id,
        appointment_date,
        appointment_time,
        token_number,
        status

      FROM appointments

      WHERE id = $1

      FOR UPDATE
      `,
      [appointmentId],
    );

    if (appointmentResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: "Appointment not found.",
        },
        { status: 404 },
      );
    }

    const appointment = appointmentResult.rows[0];

    // =========================
    // DOCTOR OWNERSHIP
    // =========================

    if (Number(appointment.doctor_id) !== Number(session.userId)) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: "This appointment does not belong to you.",
        },
        { status: 403 },
      );
    }

    // =========================
    // EXISTING CONSULTATION
    // =========================

    const existingConsultationResult = await client.query(
      `
        SELECT
          id,
          appointment_id,
          patient_id,
          doctor_id,
          started_at,
          ended_at,
          status,
          clinical_notes,
          diagnosis,
          created_at,
          updated_at

        FROM consultations

        WHERE appointment_id = $1

        LIMIT 1
        `,
      [appointmentId],
    );

    // =========================
    // EXISTING CONSULTATION
    // RETURN IT
    // =========================

    if (existingConsultationResult.rows.length > 0) {
      const existingConsultation = existingConsultationResult.rows[0];

      // Appointment status repair if needed
      if (
        appointment.status !== "in_consultation" &&
        existingConsultation.status !== "completed"
      ) {
        await client.query(
          `
          UPDATE appointments

          SET
            status = 'in_consultation',
            updated_at = CURRENT_TIMESTAMP

          WHERE id = $1
          `,
          [appointmentId],
        );
      }

      await client.query("COMMIT");

      return NextResponse.json(
        {
          success: true,
          message: "Consultation already started.",
          consultation: existingConsultation,
        },
        { status: 200 },
      );
    }

    // =========================
    // APPOINTMENT STATUS
    // =========================

    if (appointment.status !== "waiting") {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message:
            "Patient must be in waiting status before consultation can start.",
        },
        { status: 400 },
      );
    }

    // =========================
    // CREATE CONSULTATION
    // =========================

    const consultationResult = await client.query(
      `
      INSERT INTO consultations (
        appointment_id,
        patient_id,
        doctor_id,
        started_at,
        status
      )

      VALUES (
        $1,
        $2,
        $3,
        CURRENT_TIMESTAMP,
        'draft'
      )

      RETURNING
        id,
        appointment_id,
        patient_id,
        doctor_id,
        started_at,
        ended_at,
        status,
        clinical_notes,
        diagnosis,
        created_at,
        updated_at
      `,
      [appointment.id, appointment.patient_id, appointment.doctor_id],
    );

    const consultation = consultationResult.rows[0];

    // =========================
    // APPOINTMENT
    // waiting → in_consultation
    // =========================

    await client.query(
      `
      UPDATE appointments

      SET
        status = 'in_consultation',
        updated_at = CURRENT_TIMESTAMP

      WHERE id = $1
      `,
      [appointmentId],
    );

    // =========================
    // AUDIT LOG
    // =========================

    await client.query(
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
        "START_CONSULTATION",
        "consultation",
        consultation.id,

        JSON.stringify({
          consultation_id: consultation.id,
          appointment_id: appointment.id,
          patient_id: appointment.patient_id,
          doctor_id: appointment.doctor_id,
          previous_appointment_status: "waiting",
          new_appointment_status: "in_consultation",
        }),
      ],
    );

    // =========================
    // COMMIT
    // =========================

    await client.query("COMMIT");

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json(
      {
        success: true,
        message: "Consultation started successfully.",
        consultation,
      },
      { status: 201 },
    );
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("CONSULTATION ROLLBACK ERROR:", rollbackError);
    }

    console.error("START CONSULTATION ERROR:", error);

    // =========================
    // DUPLICATE APPOINTMENT
    // =========================

    if (error.code === "23505") {
      return NextResponse.json(
        {
          success: false,
          message: "A consultation already exists for this appointment.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to start consultation.",
        error: error.message,
      },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
