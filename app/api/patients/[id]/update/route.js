import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// ======================================================
// PUT /api/patients/[id]/update
// UPDATE PATIENT BASIC INFORMATION
// COMPOUNDER ONLY
// ======================================================

export async function PUT(request, { params }) {
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
          message: "Only compounder can update patient information.",
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
    // REQUEST BODY
    // =========================

    const body = await request.json();

    const name = body.name?.trim();

    const dateOfBirth = body.date_of_birth || null;

    const gender = body.gender?.trim();

    const phone = body.phone?.trim() || null;

    const address = body.address?.trim() || null;

    const emergencyContactName = body.emergency_contact_name?.trim() || null;

    const emergencyContactPhone = body.emergency_contact_phone?.trim() || null;

    // =========================
    // VALIDATION
    // =========================

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient name is required.",
        },
        { status: 400 },
      );
    }

    if (!gender) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient gender is required.",
        },
        { status: 400 },
      );
    }

    const allowedGenders = ["Male", "Female", "Other"];

    if (!allowedGenders.includes(gender)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid patient gender.",
        },
        { status: 400 },
      );
    }

    // =========================
    // DATE VALIDATION
    // =========================

    if (dateOfBirth) {
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;

      if (!datePattern.test(dateOfBirth)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid date of birth.",
          },
          { status: 400 },
        );
      }
    }

    // =========================
    // CHECK PATIENT
    // =========================

    const existingResult = await db.query(
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

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient not found.",
        },
        { status: 404 },
      );
    }

    const oldPatient = existingResult.rows[0];

    // =========================
    // UPDATE PATIENT
    // =========================

    const updateResult = await db.query(
      `
      UPDATE patients

      SET
        name = $1,
        date_of_birth = $2,
        gender = $3,
        phone = $4,
        address = $5,
        emergency_contact_name = $6,
        emergency_contact_phone = $7,
        updated_at = CURRENT_TIMESTAMP

      WHERE id = $8

      RETURNING
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
      `,
      [
        name,
        dateOfBirth,
        gender,
        phone,
        address,
        emergencyContactName,
        emergencyContactPhone,
        patientId,
      ],
    );

    const patient = updateResult.rows[0];

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
        "UPDATE_PATIENT",
        "patient",
        patientId,
        JSON.stringify({
          patient_code: patient.patient_code,

          before: {
            name: oldPatient.name,
            date_of_birth: oldPatient.date_of_birth,
            gender: oldPatient.gender,
            phone: oldPatient.phone,
            address: oldPatient.address,
            emergency_contact_name: oldPatient.emergency_contact_name,
            emergency_contact_phone: oldPatient.emergency_contact_phone,
          },

          after: {
            name: patient.name,
            date_of_birth: patient.date_of_birth,
            gender: patient.gender,
            phone: patient.phone,
            address: patient.address,
            emergency_contact_name: patient.emergency_contact_name,
            emergency_contact_phone: patient.emergency_contact_phone,
          },
        }),
      ],
    );

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json(
      {
        success: true,
        message: "Patient updated successfully.",
        patient,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("UPDATE PATIENT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update patient.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
