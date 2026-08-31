import { NextResponse } from "next/server";

import { db } from "../../../../../lib/db";
import { getSession } from "../../../../../lib/auth";

// ======================================================
// POST /api/patients/[id]/history
// ADD NEW MEDICAL HISTORY ENTRY
// Compounder only
// ======================================================

export async function POST(request, { params }) {
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

    if (session.role !== "compounder") {
      return NextResponse.json(
        {
          success: false,
          message: "Only compounder can add medical history.",
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
    // CHECK PATIENT EXISTS
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
    // REQUEST BODY
    // =========================

    const body = await request.json();

    const previousDiseases = body.previous_diseases?.trim() || null;

    const allergies = body.allergies?.trim() || null;

    const currentMedications = body.current_medications?.trim() || null;

    const previousSurgeries = body.previous_surgeries?.trim() || null;

    const familyHistory = body.family_history?.trim() || null;

    const additionalNotes = body.additional_notes?.trim() || null;

    // =========================
    // VALIDATION
    // =========================

    const hasHistory =
      previousDiseases ||
      allergies ||
      currentMedications ||
      previousSurgeries ||
      familyHistory ||
      additionalNotes;

    if (!hasHistory) {
      return NextResponse.json(
        {
          success: false,
          message: "Please add at least one medical history field.",
        },
        { status: 400 },
      );
    }

    // =========================
    // INSERT NEW HISTORY ROW
    // =========================

    const result = await db.query(
      `
      INSERT INTO medical_history (
        patient_id,
        previous_diseases,
        allergies,
        current_medications,
        previous_surgeries,
        family_history,
        additional_notes,
        created_by
      )

      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8
      )

      RETURNING
        id,
        patient_id,
        previous_diseases,
        allergies,
        current_medications,
        previous_surgeries,
        family_history,
        additional_notes,
        created_by,
        created_at,
        updated_at
      `,
      [
        patientId,
        previousDiseases,
        allergies,
        currentMedications,
        previousSurgeries,
        familyHistory,
        additionalNotes,
        session.userId,
      ],
    );

    const history = result.rows[0];

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
        "CREATE_MEDICAL_HISTORY",
        "medical_history",
        history.id,
        JSON.stringify({
          patient_id: patient.id,
          patient_code: patient.patient_code,
          patient_name: patient.name,
        }),
      ],
    );

    return NextResponse.json(
      {
        success: true,
        message: "Medical history added successfully.",
        history,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("CREATE MEDICAL HISTORY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to add medical history.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// ======================================================
// GET /api/patients/[id]/history
// GET COMPLETE HISTORY TIMELINE
// Doctor + Compounder
// ======================================================

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

    const result = await db.query(
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

    return NextResponse.json({
      success: true,
      count: result.rows.length,
      medical_history: result.rows,
    });
  } catch (error) {
    console.error("GET MEDICAL HISTORY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load medical history.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
