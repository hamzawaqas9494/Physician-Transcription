import { NextResponse } from "next/server";

import { readFile } from "fs/promises";
import path from "path";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ======================================================
// POST /api/doctor/consultations/transcribe
// AUDIO -> TEXT
// ======================================================

export async function POST(request) {
  let transcriptionJobId = null;
  let audioRecordingId = null;
  let consultationId = null;

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
          message: "Only doctors can generate transcripts.",
        },
        { status: 403 },
      );
    }

    // =========================
    // OPENAI KEY
    // =========================

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Transcription service is not configured. OPENAI_API_KEY is missing.",
        },
        { status: 500 },
      );
    }

    // =========================
    // REQUEST BODY
    // =========================

    const body = await request.json();

    consultationId = Number(body.consultation_id);

    audioRecordingId = Number(body.audio_recording_id);

    if (!Number.isInteger(consultationId) || consultationId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid consultation ID is required.",
        },
        { status: 400 },
      );
    }

    if (!Number.isInteger(audioRecordingId) || audioRecordingId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid audio recording ID is required.",
        },
        { status: 400 },
      );
    }

    // =========================
    // CONSULTATION + AUDIO
    // =========================

    const recordingResult = await db.query(
      `
      SELECT
        ar.id AS audio_recording_id,
        ar.consultation_id,
        ar.storage_key,
        ar.original_file_name,
        ar.mime_type,
        ar.file_size,
        ar.duration_seconds,
        ar.status AS audio_status,

        c.appointment_id,
        c.patient_id,
        c.doctor_id,
        c.status AS consultation_status

      FROM audio_recordings ar

      INNER JOIN consultations c
        ON c.id = ar.consultation_id

      WHERE ar.id = $1
        AND ar.consultation_id = $2

      LIMIT 1
      `,
      [audioRecordingId, consultationId],
    );

    if (recordingResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Audio recording not found.",
        },
        { status: 404 },
      );
    }

    const recording = recordingResult.rows[0];

    // =========================
    // DOCTOR OWNERSHIP
    // =========================

    if (Number(recording.doctor_id) !== Number(session.userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "This consultation does not belong to you.",
        },
        { status: 403 },
      );
    }

    // =========================
    // CONSULTATION STATUS
    // =========================

    if (recording.consultation_status === "completed") {
      return NextResponse.json(
        {
          success: false,
          message: "Completed consultation cannot be transcribed again.",
        },
        { status: 400 },
      );
    }

    // =========================
    // EXISTING READY TRANSCRIPT
    // =========================

    const existingTranscriptResult = await db.query(
      `
        SELECT
          id,
          consultation_id,
          transcription_job_id,
          status,
          language,
          full_text,
          edited_text,
          word_count,
          confidence,
          reviewed_by,
          reviewed_at,
          created_at,
          updated_at

        FROM transcripts

        WHERE consultation_id = $1

        LIMIT 1
        `,
      [consultationId],
    );

    if (
      existingTranscriptResult.rows.length > 0 &&
      ["ready", "reviewed"].includes(existingTranscriptResult.rows[0].status)
    ) {
      return NextResponse.json(
        {
          success: true,
          message: "Transcript already exists.",
          transcript: existingTranscriptResult.rows[0],
        },
        { status: 200 },
      );
    }

    // =========================
    // PREVENT DUPLICATE RUNNING JOB
    // =========================

    const runningJobResult = await db.query(
      `
      SELECT
        id,
        status

      FROM transcription_jobs

      WHERE audio_recording_id = $1
        AND status IN (
          'queued',
          'processing'
        )

      ORDER BY created_at DESC

      LIMIT 1
      `,
      [audioRecordingId],
    );

    if (runningJobResult.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Transcription is already being processed.",
          job: runningJobResult.rows[0],
        },
        { status: 409 },
      );
    }

    // =========================
    // CREATE JOB
    // =========================

    const jobResult = await db.query(
      `
      INSERT INTO transcription_jobs (
        audio_recording_id,
        status,
        provider,
        model,
        started_at
      )

      VALUES (
        $1,
        'processing',
        'openai',
        'gpt-transcribe',
        CURRENT_TIMESTAMP
      )

      RETURNING
        id,
        audio_recording_id,
        status,
        provider,
        model,
        language,
        started_at,
        completed_at,
        error_message,
        retry_count,
        created_at,
        updated_at
      `,
      [audioRecordingId],
    );

    const job = jobResult.rows[0];

    transcriptionJobId = job.id;

    // =========================
    // UPDATE AUDIO
    // =========================

    await db.query(
      `
      UPDATE audio_recordings

      SET
        status = 'processing',
        error_message = NULL,
        updated_at = CURRENT_TIMESTAMP

      WHERE id = $1
      `,
      [audioRecordingId],
    );

    // =========================
    // UPDATE CONSULTATION
    // =========================

    await db.query(
      `
      UPDATE consultations

      SET
        status = 'processing',
        updated_at = CURRENT_TIMESTAMP

      WHERE id = $1
      `,
      [consultationId],
    );

    // =========================
    // RESOLVE AUDIO FILE
    // =========================

    if (!recording.storage_key) {
      throw new Error("Audio storage key is missing.");
    }

    // Expected:
    // /uploads/audio/file.webm

    const relativeStoragePath = recording.storage_key.replace(/^\/+/, "");

    const publicDirectory = path.resolve(process.cwd(), "public");

    const absoluteAudioPath = path.resolve(
      publicDirectory,
      relativeStoragePath,
    );

    // Prevent path traversal
    if (!absoluteAudioPath.startsWith(publicDirectory + path.sep)) {
      throw new Error("Invalid audio storage path.");
    }

    // =========================
    // READ AUDIO
    // =========================

    const audioBuffer = await readFile(absoluteAudioPath);

    // =========================
    // FILE NAME
    // =========================

    let fileName =
      recording.original_file_name || path.basename(recording.storage_key);

    if (!path.extname(fileName)) {
      fileName += ".webm";
    }

    const mimeType = recording.mime_type || "audio/webm";

    // =========================
    // OPENAI FORM DATA
    // =========================

    const openAIForm = new FormData();

    const audioFile = new File([audioBuffer], fileName, {
      type: mimeType,
    });

    openAIForm.append("file", audioFile);

    openAIForm.append("model", "gpt-transcribe");

    // Do not force a language here.
    // Medical consultations may contain
    // English / Urdu / mixed language.

    // =========================
    // OPENAI TRANSCRIPTION
    // =========================

    const openAIResponse = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },

        body: openAIForm,
      },
    );

    // =========================
    // OPENAI RESPONSE
    // =========================

    const rawResponse = await openAIResponse.text();

    let transcriptionData;

    try {
      transcriptionData = JSON.parse(rawResponse);
    } catch {
      transcriptionData = {
        text: rawResponse,
      };
    }

    if (!openAIResponse.ok) {
      const apiMessage =
        transcriptionData?.error?.message || "OpenAI transcription failed.";

      throw new Error(apiMessage);
    }

    const transcriptText = transcriptionData?.text?.trim();

    if (!transcriptText) {
      throw new Error("Transcription service returned empty text.");
    }

    // =========================
    // WORD COUNT
    // =========================

    const wordCount = transcriptText.split(/\s+/).filter(Boolean).length;

    // =========================
    // CREATE / UPDATE TRANSCRIPT
    // =========================

    let transcriptResult;

    if (existingTranscriptResult.rows.length > 0) {
      transcriptResult = await db.query(
        `
        UPDATE transcripts

        SET
          transcription_job_id = $1,
          status = 'ready',
          full_text = $2,
          edited_text = NULL,
          word_count = $3,
          reviewed_by = NULL,
          reviewed_at = NULL,
          updated_at = CURRENT_TIMESTAMP

        WHERE consultation_id = $4

        RETURNING
          id,
          consultation_id,
          transcription_job_id,
          status,
          language,
          full_text,
          edited_text,
          word_count,
          confidence,
          reviewed_by,
          reviewed_at,
          created_at,
          updated_at
        `,
        [transcriptionJobId, transcriptText, wordCount, consultationId],
      );
    } else {
      transcriptResult = await db.query(
        `
        INSERT INTO transcripts (
          consultation_id,
          transcription_job_id,
          status,
          full_text,
          word_count
        )

        VALUES (
          $1,
          $2,
          'ready',
          $3,
          $4
        )

        RETURNING
          id,
          consultation_id,
          transcription_job_id,
          status,
          language,
          full_text,
          edited_text,
          word_count,
          confidence,
          reviewed_by,
          reviewed_at,
          created_at,
          updated_at
        `,
        [consultationId, transcriptionJobId, transcriptText, wordCount],
      );
    }

    const transcript = transcriptResult.rows[0];

    // =========================
    // COMPLETE JOB
    // =========================

    await db.query(
      `
      UPDATE transcription_jobs

      SET
        status = 'completed',
        completed_at = CURRENT_TIMESTAMP,
        error_message = NULL,
        updated_at = CURRENT_TIMESTAMP

      WHERE id = $1
      `,
      [transcriptionJobId],
    );

    // =========================
    // AUDIO COMPLETED
    // =========================

    await db.query(
      `
      UPDATE audio_recordings

      SET
        status = 'completed',
        error_message = NULL,
        updated_at = CURRENT_TIMESTAMP

      WHERE id = $1
      `,
      [audioRecordingId],
    );

    // =========================
    // CONSULTATION TRANSCRIBED
    // =========================

    await db.query(
      `
      UPDATE consultations

      SET
        status = 'transcribed',
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
        "GENERATE_TRANSCRIPT",
        "transcript",
        transcript.id,

        JSON.stringify({
          consultation_id: consultationId,

          audio_recording_id: audioRecordingId,

          transcription_job_id: transcriptionJobId,

          provider: "openai",

          model: "gpt-transcribe",

          word_count: wordCount,
        }),
      ],
    );

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json(
      {
        success: true,
        message: "Transcript generated successfully.",

        transcription_job: {
          ...job,
          status: "completed",
        },

        transcript,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("TRANSCRIPTION ERROR:", error);

    // =========================
    // JOB FAILED
    // =========================

    if (transcriptionJobId) {
      try {
        await db.query(
          `
          UPDATE transcription_jobs

          SET
            status = 'failed',
            completed_at = CURRENT_TIMESTAMP,
            error_message = $1,
            retry_count = retry_count + 1,
            updated_at = CURRENT_TIMESTAMP

          WHERE id = $2
          `,
          [error.message, transcriptionJobId],
        );
      } catch (jobError) {
        console.error("UPDATE TRANSCRIPTION JOB ERROR:", jobError);
      }
    }

    // =========================
    // AUDIO FAILED
    // =========================

    if (audioRecordingId) {
      try {
        await db.query(
          `
          UPDATE audio_recordings

          SET
            status = 'failed',
            error_message = $1,
            updated_at = CURRENT_TIMESTAMP

          WHERE id = $2
          `,
          [error.message, audioRecordingId],
        );
      } catch (audioError) {
        console.error("UPDATE AUDIO ERROR:", audioError);
      }
    }

    // =========================
    // CONSULTATION FAILED
    // =========================

    if (consultationId) {
      try {
        await db.query(
          `
          UPDATE consultations

          SET
            status = 'failed',
            updated_at = CURRENT_TIMESTAMP

          WHERE id = $1
          `,
          [consultationId],
        );
      } catch (consultationError) {
        console.error("UPDATE CONSULTATION ERROR:", consultationError);
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate transcript.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
