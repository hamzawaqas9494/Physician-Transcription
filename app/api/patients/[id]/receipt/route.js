import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

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

    // =========================
    // ROLE CHECK
    // =========================

    if (!["compounder", "doctor"].includes(session.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied.",
        },
        { status: 403 },
      );
    }

    // =========================
    // APPOINTMENT ID
    // =========================

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

    // =========================
    // GET RECEIPT DATA
    // =========================

    const result = await db.query(
      `
      SELECT
        a.id AS appointment_id,
        a.patient_id,
        a.doctor_id,
        a.appointment_date,
        a.appointment_time,
        a.token_number,
        a.status,
        a.notes,
        a.created_by,
        a.created_at,
        a.updated_at,

        p.patient_code,
        p.name AS patient_name,
        p.date_of_birth AS patient_date_of_birth,
        p.gender AS patient_gender,
        p.phone AS patient_phone,
        p.address AS patient_address,

        d.name AS doctor_name,
        d.email AS doctor_email,
        d.phone AS doctor_phone,

        creator.name AS created_by_name

      FROM appointments a

      INNER JOIN patients p
        ON p.id = a.patient_id

      INNER JOIN users d
        ON d.id = a.doctor_id

      LEFT JOIN users creator
        ON creator.id = a.created_by

      WHERE a.id = $1

      LIMIT 1
      `,
      [appointmentId],
    );

    // =========================
    // NOT FOUND
    // =========================

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Appointment not found.",
        },
        { status: 404 },
      );
    }

    const receipt = result.rows[0];

    // =========================
    // DOCTOR ACCESS
    // Doctor can only access
    // own appointment receipt
    // =========================

    if (
      session.role === "doctor" &&
      Number(receipt.doctor_id) !== Number(session.userId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot access this appointment receipt.",
        },
        { status: 403 },
      );
    }

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json(
      {
        success: true,

        receipt: {
          appointment_id: receipt.appointment_id,

          patient_id: receipt.patient_id,
          patient_code: receipt.patient_code,
          patient_name: receipt.patient_name,
          patient_date_of_birth: receipt.patient_date_of_birth,
          patient_gender: receipt.patient_gender,
          patient_phone: receipt.patient_phone,
          patient_address: receipt.patient_address,

          doctor_id: receipt.doctor_id,
          doctor_name: receipt.doctor_name,
          doctor_email: receipt.doctor_email,
          doctor_phone: receipt.doctor_phone,

          appointment_date: receipt.appointment_date,

          appointment_time: receipt.appointment_time,

          token_number: receipt.token_number,

          status: receipt.status,

          notes: receipt.notes,

          created_by: receipt.created_by,

          created_by_name: receipt.created_by_name,

          created_at: receipt.created_at,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET APPOINTMENT RECEIPT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load appointment receipt.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
