import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// ========================================
// GET DOCTOR CONSULTATIONS
// ========================================

export async function GET(request) {
  try {
    // ========================================
    // SESSION
    // ========================================

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

    // ========================================
    // ROLE CHECK
    // ========================================

    if (session.role !== "doctor") {
      return NextResponse.json(
        {
          success: false,
          message: "Only doctors can access consultations.",
        },
        { status: 403 },
      );
    }

    // ========================================
    // VERIFY DOCTOR
    // ========================================

    const doctorResult = await db.query(
      `
      SELECT
        id,
        name,
        email,
        phone,
        role,
        is_active
      FROM users
      WHERE id = $1
        AND role = 'doctor'
        AND is_active = TRUE
      LIMIT 1
      `,
      [session.userId],
    );

    if (doctorResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor account not found or inactive.",
        },
        { status: 403 },
      );
    }

    const doctor = doctorResult.rows[0];

    // ========================================
    // QUERY PARAMS
    // ========================================

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";

    // ========================================
    // VALID STATUS
    // ========================================

    const validStatuses = [
      "draft",
      "recorded",
      "processing",
      "transcribed",
      "reviewed",
      "completed",
      "failed",
    ];

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid consultation status.",
        },
        { status: 400 },
      );
    }

    // ========================================
    // BUILD FILTERS
    // ========================================

    const values = [doctor.id];

    let whereClause = `
      WHERE consultations.doctor_id = $1
    `;

    if (search) {
      values.push(`%${search}%`);

      whereClause += `
        AND (
          patients.name ILIKE $${values.length}
          OR patients.patient_code ILIKE $${values.length}
          OR patients.phone ILIKE $${values.length}
        )
      `;
    }

    if (status) {
      values.push(status);

      whereClause += `
        AND consultations.status = $${values.length}
      `;
    }

    // ========================================
    // GET CONSULTATIONS
    // ========================================

    const consultationsResult = await db.query(
      `
      SELECT
        consultations.id,
        consultations.appointment_id,
        consultations.patient_id,
        consultations.doctor_id,
        consultations.started_at,
        consultations.ended_at,
        consultations.status,
        consultations.clinical_notes,
        consultations.diagnosis,
        consultations.created_at,
        consultations.updated_at,

        patients.name AS patient_name,
        patients.patient_code,
        patients.phone AS patient_phone,
        patients.gender,
        patients.date_of_birth,

        appointments.appointment_date,
        appointments.appointment_time,
        appointments.token_number,
        appointments.status AS appointment_status,

        (
          SELECT COUNT(*)::INTEGER
          FROM audio_recordings
          WHERE audio_recordings.consultation_id = consultations.id
        ) AS audio_count,

        (
          SELECT audio_recordings.status
          FROM audio_recordings
          WHERE audio_recordings.consultation_id = consultations.id
          ORDER BY audio_recordings.created_at DESC
          LIMIT 1
        ) AS latest_audio_status,

        (
          SELECT audio_recordings.duration_seconds
          FROM audio_recordings
          WHERE audio_recordings.consultation_id = consultations.id
          ORDER BY audio_recordings.created_at DESC
          LIMIT 1
        ) AS audio_duration_seconds,

        transcripts.id AS transcript_id,
        transcripts.status AS transcript_status,
        transcripts.language AS transcript_language,
        transcripts.word_count,
        transcripts.confidence,
        transcripts.reviewed_at

      FROM consultations

      INNER JOIN patients
        ON patients.id = consultations.patient_id

      LEFT JOIN appointments
        ON appointments.id = consultations.appointment_id

      LEFT JOIN transcripts
        ON transcripts.consultation_id = consultations.id

      ${whereClause}

      ORDER BY
        COALESCE(
          consultations.started_at,
          consultations.created_at
        ) DESC
      `,
      values,
    );

    const consultations = consultationsResult.rows;

    // ========================================
    // STATS
    // ========================================

    const statsResult = await db.query(
      `
      SELECT

        COUNT(*)::INTEGER AS total,

        COUNT(*) FILTER (
          WHERE status = 'draft'
        )::INTEGER AS draft,

        COUNT(*) FILTER (
          WHERE status = 'recorded'
        )::INTEGER AS recorded,

        COUNT(*) FILTER (
          WHERE status = 'processing'
        )::INTEGER AS processing,

        COUNT(*) FILTER (
          WHERE status = 'transcribed'
        )::INTEGER AS transcribed,

        COUNT(*) FILTER (
          WHERE status = 'reviewed'
        )::INTEGER AS reviewed,

        COUNT(*) FILTER (
          WHERE status = 'completed'
        )::INTEGER AS completed,

        COUNT(*) FILTER (
          WHERE status = 'failed'
        )::INTEGER AS failed

      FROM consultations

      WHERE doctor_id = $1
      `,
      [doctor.id],
    );

    const stats = statsResult.rows[0];

    // ========================================
    // RESPONSE
    // ========================================

    return NextResponse.json(
      {
        success: true,

        doctor,

        stats,

        count: consultations.length,

        filters: {
          search,
          status,
        },

        consultations,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET DOCTOR CONSULTATIONS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load consultations.",

        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
