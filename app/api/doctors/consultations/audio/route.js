import { NextResponse } from "next/server";

import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

// ======================================================
// POST /api/doctor/consultations/audio
// UPLOAD CONSULTATION AUDIO
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

    if (session.role !== "doctor") {
      return NextResponse.json(
        {
          success: false,
          message: "Only doctors can upload consultation audio.",
        },
        { status: 403 },
      );
    }

    // =========================
    // FORM DATA
    // =========================

    const formData = await request.formData();

    const audio = formData.get("audio");

    const consultationId = Number(formData.get("consultation_id"));

    const durationSeconds = Number(formData.get("duration_seconds") || 0);

    // =========================
    // VALIDATION
    // =========================

    if (!consultationId || Number.isNaN(consultationId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid consultation ID is required.",
        },
        { status: 400 },
      );
    }

    if (!audio || typeof audio === "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Audio file is required.",
        },
        { status: 400 },
      );
    }

    // =========================
    // CONSULTATION CHECK
    // =========================

    const consultationResult = await db.query(
      `
      SELECT
        id,
        appointment_id,
        patient_id,
        doctor_id,
        status

      FROM consultations

      WHERE id = $1

      LIMIT 1
      `,
      [consultationId],
    );

    if (consultationResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Consultation not found.",
        },
        { status: 404 },
      );
    }

    const consultation = consultationResult.rows[0];

    if (Number(consultation.doctor_id) !== Number(session.userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "This consultation does not belong to you.",
        },
        { status: 403 },
      );
    }

    if (consultation.status === "completed") {
      return NextResponse.json(
        {
          success: false,
          message: "Audio cannot be uploaded to a completed consultation.",
        },
        { status: 400 },
      );
    }

    // =========================
    // FILE INFORMATION
    // =========================

    const bytes = await audio.arrayBuffer();

    const buffer = Buffer.from(bytes);

    const mimeType = audio.type || "audio/webm";

    let extension = "webm";

    if (mimeType.includes("ogg")) {
      extension = "ogg";
    } else if (mimeType.includes("mp4")) {
      extension = "mp4";
    } else if (mimeType.includes("mpeg")) {
      extension = "mp3";
    } else if (mimeType.includes("wav")) {
      extension = "wav";
    }

    const fileName = `consultation-${consultationId}-${Date.now()}.${extension}`;

    // =========================
    // STORAGE DIRECTORY
    // =========================

    const uploadDirectory = path.join(
      process.cwd(),
      "public",
      "uploads",
      "audio",
    );

    await mkdir(uploadDirectory, {
      recursive: true,
    });

    const absoluteFilePath = path.join(uploadDirectory, fileName);

    await writeFile(absoluteFilePath, buffer);

    // Public-facing storage key
    const storageKey = `/uploads/audio/${fileName}`;

    // =========================
    // AUDIO DB RECORD
    // =========================

    const audioResult = await db.query(
      `
      INSERT INTO audio_recordings (
        consultation_id,
        storage_key,
        original_file_name,
        mime_type,
        file_size,
        duration_seconds,
        status
      )

      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        'uploaded'
      )

      RETURNING
        id,
        consultation_id,
        storage_key,
        original_file_name,
        mime_type,
        file_size,
        duration_seconds,
        status,
        error_message,
        created_at,
        updated_at
      `,
      [
        consultationId,
        storageKey,
        audio.name || fileName,
        mimeType,
        buffer.length,
        durationSeconds || null,
      ],
    );

    const recording = audioResult.rows[0];

    // =========================
    // CONSULTATION STATUS
    // =========================

    await db.query(
      `
      UPDATE consultations

      SET
        status = 'recorded',
        updated_at = CURRENT_TIMESTAMP

      WHERE id = $1
      `,
      [consultationId],
    );

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
        "UPLOAD_CONSULTATION_AUDIO",
        "audio_recording",
        recording.id,

        JSON.stringify({
          consultation_id: consultationId,

          appointment_id: consultation.appointment_id,

          patient_id: consultation.patient_id,

          storage_key: storageKey,

          duration_seconds: durationSeconds || null,

          file_size: buffer.length,
        }),
      ],
    );

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json(
      {
        success: true,
        message: "Audio uploaded successfully.",
        audio_recording: recording,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("UPLOAD CONSULTATION AUDIO ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to upload consultation audio.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
