import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
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

    if (!["compounder", "doctor"].includes(session.role)) {
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

    const result = await db.query(
      `
      SELECT
        a.id AS appointment_id,
        a.appointment_date,
        a.appointment_time,
        a.token_number,
        a.status,
        a.notes,
        a.created_at,

        p.id AS patient_id,
        p.patient_code,
        p.name AS patient_name,
        p.phone AS patient_phone,
        p.gender AS patient_gender,

        d.id AS doctor_id,
        d.name AS doctor_name,

        creator.id AS created_by_id,
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

    if (session.role === "doctor" && receipt.doctor_id !== session.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot access this appointment receipt.",
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        receipt,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET RECEIPT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load receipt.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
