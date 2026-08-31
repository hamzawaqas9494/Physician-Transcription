import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { getSession } from "../../../lib/auth";

// =========================
// PATIENT CODE GENERATOR
// =========================

function generatePatientCode() {
  const time = Date.now().toString().slice(-6);

  const random = Math.floor(100 + Math.random() * 900);

  return `PT-${time}${random}`;
}

// ======================================================
// POST /api/patients
// CREATE PATIENT + INITIAL MEDICAL HISTORY
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
        {
          status: 401,
        },
      );
    }

    if (session.role !== "compounder") {
      return NextResponse.json(
        {
          success: false,
          message: "Only compounder can register patients.",
        },
        {
          status: 403,
        },
      );
    }

    // =========================
    // BODY
    // =========================

    const body = await request.json();

    // Patient
    const name = body.name?.trim();

    const dateOfBirth = body.date_of_birth || null;

    const gender = body.gender?.trim() || null;

    const phone = body.phone?.trim() || null;

    const address = body.address?.trim() || null;

    const emergencyContactName = body.emergency_contact_name?.trim() || null;

    const emergencyContactPhone = body.emergency_contact_phone?.trim() || null;

    // Medical History
    const previousDiseases =
      body.medical_history?.previous_diseases?.trim() || null;

    const allergies = body.medical_history?.allergies?.trim() || null;

    const currentMedications =
      body.medical_history?.current_medications?.trim() || null;

    const previousSurgeries =
      body.medical_history?.previous_surgeries?.trim() || null;

    const familyHistory = body.medical_history?.family_history?.trim() || null;

    const additionalNotes =
      body.medical_history?.additional_notes?.trim() || null;

    // =========================
    // VALIDATION
    // =========================

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient name is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!gender) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient gender is required.",
        },
        {
          status: 400,
        },
      );
    }

    // =========================
    // PATIENT CODE
    // =========================

    const patientCode = generatePatientCode();

    // =========================
    // INSERT PATIENT
    // =========================

    const patientResult = await db.query(
      `
        INSERT INTO patients (
          patient_code,
          name,
          date_of_birth,
          gender,
          phone,
          address,
          emergency_contact_name,
          emergency_contact_phone
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
        patientCode,
        name,
        dateOfBirth,
        gender,
        phone,
        address,
        emergencyContactName,
        emergencyContactPhone,
      ],
    );

    const patient = patientResult.rows[0];

    // =========================
    // CHECK MEDICAL HISTORY
    // =========================

    const hasMedicalHistory =
      previousDiseases ||
      allergies ||
      currentMedications ||
      previousSurgeries ||
      familyHistory ||
      additionalNotes;

    let medicalHistory = null;

    // =========================
    // INSERT MEDICAL HISTORY
    // =========================

    if (hasMedicalHistory) {
      const historyResult = await db.query(
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
          patient.id,
          previousDiseases,
          allergies,
          currentMedications,
          previousSurgeries,
          familyHistory,
          additionalNotes,
          session.userId,
        ],
      );

      medicalHistory = historyResult.rows[0];
    }

    // =========================
    // AUDIT LOG - PATIENT
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
        "CREATE_PATIENT",
        "patient",
        patient.id,
        JSON.stringify({
          patient_code: patient.patient_code,

          patient_name: patient.name,
        }),
      ],
    );

    // =========================
    // AUDIT LOG - HISTORY
    // =========================

    if (medicalHistory) {
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

          medicalHistory.id,

          JSON.stringify({
            patient_id: patient.id,

            patient_code: patient.patient_code,
          }),
        ],
      );
    }

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json(
      {
        success: true,

        message: medicalHistory
          ? "Patient and medical history registered successfully."
          : "Patient registered successfully.",

        patient,

        medical_history: medicalHistory,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("CREATE PATIENT ERROR:", error);

    return NextResponse.json(
      {
        success: false,

        message: "Unable to register patient.",

        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}

// ======================================================
// GET /api/patients
// DOCTOR + COMPOUNDER
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
        {
          status: 401,
        },
      );
    }

    if (!["doctor", "compounder"].includes(session.role)) {
      return NextResponse.json(
        {
          success: false,

          message: "You are not allowed to access patients.",
        },
        {
          status: 403,
        },
      );
    }

    // =========================
    // SEARCH
    // =========================

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";

    let result;

    // =========================
    // SEARCH PATIENTS
    // =========================

    if (search) {
      result = await db.query(
        `
        SELECT
          p.id,
          p.patient_code,
          p.name,
          p.date_of_birth,
          p.gender,
          p.phone,
          p.address,
          p.emergency_contact_name,
          p.emergency_contact_phone,
          p.created_at,
          p.updated_at,

          (
            SELECT
              MAX(a.appointment_date)

            FROM appointments a

            WHERE
              a.patient_id = p.id
          ) AS last_visit

        FROM patients p

        WHERE
          p.name ILIKE $1
          OR p.phone ILIKE $1
          OR p.patient_code ILIKE $1

        ORDER BY
          p.created_at DESC
        `,
        [`%${search}%`],
      );
    } else {
      // =========================
      // ALL PATIENTS
      // =========================

      result = await db.query(
        `
        SELECT
          p.id,
          p.patient_code,
          p.name,
          p.date_of_birth,
          p.gender,
          p.phone,
          p.address,
          p.emergency_contact_name,
          p.emergency_contact_phone,
          p.created_at,
          p.updated_at,

          (
            SELECT
              MAX(a.appointment_date)

            FROM appointments a

            WHERE
              a.patient_id = p.id
          ) AS last_visit

        FROM patients p

        ORDER BY
          p.created_at DESC
        `,
      );
    }

    return NextResponse.json(
      {
        success: true,

        count: result.rows.length,

        patients: result.rows,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("GET PATIENTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,

        message: "Unable to load patients.",

        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
