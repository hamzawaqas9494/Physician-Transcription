// import { NextResponse } from "next/server";

// import { readFile } from "fs/promises";
// import path from "path";

// import { db } from "@/lib/db";
// import { getSession } from "@/lib/auth";

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// // ======================================================
// // POST /api/doctor/consultations/transcribe
// // AUDIO -> TEXT
// // ======================================================

// export async function POST(request) {
//   let transcriptionJobId = null;
//   let audioRecordingId = null;
//   let consultationId = null;

//   try {
//     // =========================
//     // SESSION
//     // =========================

//     const session = await getSession();

//     if (!session) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Unauthorized. Please login.",
//         },
//         { status: 401 },
//       );
//     }

//     // =========================
//     // ROLE
//     // =========================

//     if (session.role !== "doctor") {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Only doctors can generate transcripts.",
//         },
//         { status: 403 },
//       );
//     }

//     // =========================
//     // OPENAI KEY
//     // =========================

//     if (!process.env.OPENAI_API_KEY) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Transcription service is not configured. OPENAI_API_KEY is missing.",
//         },
//         { status: 500 },
//       );
//     }

//     // =========================
//     // REQUEST BODY
//     // =========================

//     const body = await request.json();

//     consultationId = Number(body.consultation_id);

//     audioRecordingId = Number(body.audio_recording_id);

//     if (!Number.isInteger(consultationId) || consultationId <= 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Valid consultation ID is required.",
//         },
//         { status: 400 },
//       );
//     }

//     if (!Number.isInteger(audioRecordingId) || audioRecordingId <= 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Valid audio recording ID is required.",
//         },
//         { status: 400 },
//       );
//     }

//     // =========================
//     // CONSULTATION + AUDIO
//     // =========================

//     const recordingResult = await db.query(
//       `
//       SELECT
//         ar.id AS audio_recording_id,
//         ar.consultation_id,
//         ar.storage_key,
//         ar.original_file_name,
//         ar.mime_type,
//         ar.file_size,
//         ar.duration_seconds,
//         ar.status AS audio_status,

//         c.appointment_id,
//         c.patient_id,
//         c.doctor_id,
//         c.status AS consultation_status

//       FROM audio_recordings ar

//       INNER JOIN consultations c
//         ON c.id = ar.consultation_id

//       WHERE ar.id = $1
//         AND ar.consultation_id = $2

//       LIMIT 1
//       `,
//       [audioRecordingId, consultationId],
//     );

//     if (recordingResult.rows.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Audio recording not found.",
//         },
//         { status: 404 },
//       );
//     }

//     const recording = recordingResult.rows[0];

//     // =========================
//     // DOCTOR OWNERSHIP
//     // =========================

//     if (Number(recording.doctor_id) !== Number(session.userId)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "This consultation does not belong to you.",
//         },
//         { status: 403 },
//       );
//     }

//     // =========================
//     // CONSULTATION STATUS
//     // =========================

//     if (recording.consultation_status === "completed") {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Completed consultation cannot be transcribed again.",
//         },
//         { status: 400 },
//       );
//     }

//     // =========================
//     // EXISTING READY TRANSCRIPT
//     // =========================

//     const existingTranscriptResult = await db.query(
//       `
//         SELECT
//           id,
//           consultation_id,
//           transcription_job_id,
//           status,
//           language,
//           full_text,
//           edited_text,
//           word_count,
//           confidence,
//           reviewed_by,
//           reviewed_at,
//           created_at,
//           updated_at

//         FROM transcripts

//         WHERE consultation_id = $1

//         LIMIT 1
//         `,
//       [consultationId],
//     );

//     if (
//       existingTranscriptResult.rows.length > 0 &&
//       ["ready", "reviewed"].includes(existingTranscriptResult.rows[0].status)
//     ) {
//       return NextResponse.json(
//         {
//           success: true,
//           message: "Transcript already exists.",
//           transcript: existingTranscriptResult.rows[0],
//         },
//         { status: 200 },
//       );
//     }

//     // =========================
//     // PREVENT DUPLICATE RUNNING JOB
//     // =========================

//     const runningJobResult = await db.query(
//       `
//       SELECT
//         id,
//         status

//       FROM transcription_jobs

//       WHERE audio_recording_id = $1
//         AND status IN (
//           'queued',
//           'processing'
//         )

//       ORDER BY created_at DESC

//       LIMIT 1
//       `,
//       [audioRecordingId],
//     );

//     if (runningJobResult.rows.length > 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Transcription is already being processed.",
//           job: runningJobResult.rows[0],
//         },
//         { status: 409 },
//       );
//     }

//     // =========================
//     // CREATE JOB
//     // =========================

//     const jobResult = await db.query(
//       `
//       INSERT INTO transcription_jobs (
//         audio_recording_id,
//         status,
//         provider,
//         model,
//         started_at
//       )

//       VALUES (
//         $1,
//         'processing',
//         'openai',
//         'gpt-transcribe',
//         CURRENT_TIMESTAMP
//       )

//       RETURNING
//         id,
//         audio_recording_id,
//         status,
//         provider,
//         model,
//         language,
//         started_at,
//         completed_at,
//         error_message,
//         retry_count,
//         created_at,
//         updated_at
//       `,
//       [audioRecordingId],
//     );

//     const job = jobResult.rows[0];

//     transcriptionJobId = job.id;

//     // =========================
//     // UPDATE AUDIO
//     // =========================

//     await db.query(
//       `
//       UPDATE audio_recordings

//       SET
//         status = 'processing',
//         error_message = NULL,
//         updated_at = CURRENT_TIMESTAMP

//       WHERE id = $1
//       `,
//       [audioRecordingId],
//     );

//     // =========================
//     // UPDATE CONSULTATION
//     // =========================

//     await db.query(
//       `
//       UPDATE consultations

//       SET
//         status = 'processing',
//         updated_at = CURRENT_TIMESTAMP

//       WHERE id = $1
//       `,
//       [consultationId],
//     );

//     // =========================
//     // RESOLVE AUDIO FILE
//     // =========================

//     if (!recording.storage_key) {
//       throw new Error("Audio storage key is missing.");
//     }

//     // Expected:
//     // /uploads/audio/file.webm

//     const relativeStoragePath = recording.storage_key.replace(/^\/+/, "");

//     const publicDirectory = path.resolve(process.cwd(), "public");

//     const absoluteAudioPath = path.resolve(
//       publicDirectory,
//       relativeStoragePath,
//     );

//     // Prevent path traversal
//     if (!absoluteAudioPath.startsWith(publicDirectory + path.sep)) {
//       throw new Error("Invalid audio storage path.");
//     }

//     // =========================
//     // READ AUDIO
//     // =========================

//     const audioBuffer = await readFile(absoluteAudioPath);

//     // =========================
//     // FILE NAME
//     // =========================

//     let fileName =
//       recording.original_file_name || path.basename(recording.storage_key);

//     if (!path.extname(fileName)) {
//       fileName += ".webm";
//     }

//     const mimeType = recording.mime_type || "audio/webm";

//     // =========================
//     // OPENAI FORM DATA
//     // =========================

//     const openAIForm = new FormData();

//     const audioFile = new File([audioBuffer], fileName, {
//       type: mimeType,
//     });

//     openAIForm.append("file", audioFile);

//     openAIForm.append("model", "gpt-transcribe");

//     // Do not force a language here.
//     // Medical consultations may contain
//     // English / Urdu / mixed language.

//     // =========================
//     // OPENAI TRANSCRIPTION
//     // =========================

//     const openAIResponse = await fetch(
//       "https://api.openai.com/v1/audio/transcriptions",
//       {
//         method: "POST",

//         headers: {
//           Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//         },

//         body: openAIForm,
//       },
//     );

//     // =========================
//     // OPENAI RESPONSE
//     // =========================

//     const rawResponse = await openAIResponse.text();

//     let transcriptionData;

//     try {
//       transcriptionData = JSON.parse(rawResponse);
//     } catch {
//       transcriptionData = {
//         text: rawResponse,
//       };
//     }

//     if (!openAIResponse.ok) {
//       const apiMessage =
//         transcriptionData?.error?.message || "OpenAI transcription failed.";

//       throw new Error(apiMessage);
//     }

//     const transcriptText = transcriptionData?.text?.trim();

//     if (!transcriptText) {
//       throw new Error("Transcription service returned empty text.");
//     }

//     // =========================
//     // WORD COUNT
//     // =========================

//     const wordCount = transcriptText.split(/\s+/).filter(Boolean).length;

//     // =========================
//     // CREATE / UPDATE TRANSCRIPT
//     // =========================

//     let transcriptResult;

//     if (existingTranscriptResult.rows.length > 0) {
//       transcriptResult = await db.query(
//         `
//         UPDATE transcripts

//         SET
//           transcription_job_id = $1,
//           status = 'ready',
//           full_text = $2,
//           edited_text = NULL,
//           word_count = $3,
//           reviewed_by = NULL,
//           reviewed_at = NULL,
//           updated_at = CURRENT_TIMESTAMP

//         WHERE consultation_id = $4

//         RETURNING
//           id,
//           consultation_id,
//           transcription_job_id,
//           status,
//           language,
//           full_text,
//           edited_text,
//           word_count,
//           confidence,
//           reviewed_by,
//           reviewed_at,
//           created_at,
//           updated_at
//         `,
//         [transcriptionJobId, transcriptText, wordCount, consultationId],
//       );
//     } else {
//       transcriptResult = await db.query(
//         `
//         INSERT INTO transcripts (
//           consultation_id,
//           transcription_job_id,
//           status,
//           full_text,
//           word_count
//         )

//         VALUES (
//           $1,
//           $2,
//           'ready',
//           $3,
//           $4
//         )

//         RETURNING
//           id,
//           consultation_id,
//           transcription_job_id,
//           status,
//           language,
//           full_text,
//           edited_text,
//           word_count,
//           confidence,
//           reviewed_by,
//           reviewed_at,
//           created_at,
//           updated_at
//         `,
//         [consultationId, transcriptionJobId, transcriptText, wordCount],
//       );
//     }

//     const transcript = transcriptResult.rows[0];

//     // =========================
//     // COMPLETE JOB
//     // =========================

//     await db.query(
//       `
//       UPDATE transcription_jobs

//       SET
//         status = 'completed',
//         completed_at = CURRENT_TIMESTAMP,
//         error_message = NULL,
//         updated_at = CURRENT_TIMESTAMP

//       WHERE id = $1
//       `,
//       [transcriptionJobId],
//     );

//     // =========================
//     // AUDIO COMPLETED
//     // =========================

//     await db.query(
//       `
//       UPDATE audio_recordings

//       SET
//         status = 'completed',
//         error_message = NULL,
//         updated_at = CURRENT_TIMESTAMP

//       WHERE id = $1
//       `,
//       [audioRecordingId],
//     );

//     // =========================
//     // CONSULTATION TRANSCRIBED
//     // =========================

//     await db.query(
//       `
//       UPDATE consultations

//       SET
//         status = 'transcribed',
//         updated_at = CURRENT_TIMESTAMP

//       WHERE id = $1
//       `,
//       [consultationId],
//     );

//     // =========================
//     // AUDIT LOG
//     // =========================

//     await db.query(
//       `
//       INSERT INTO audit_logs (
//         user_id,
//         action,
//         entity_type,
//         entity_id,
//         details
//       )

//       VALUES (
//         $1,
//         $2,
//         $3,
//         $4,
//         $5
//       )
//       `,
//       [
//         session.userId,
//         "GENERATE_TRANSCRIPT",
//         "transcript",
//         transcript.id,

//         JSON.stringify({
//           consultation_id: consultationId,

//           audio_recording_id: audioRecordingId,

//           transcription_job_id: transcriptionJobId,

//           provider: "openai",

//           model: "gpt-transcribe",

//           word_count: wordCount,
//         }),
//       ],
//     );

//     // =========================
//     // RESPONSE
//     // =========================

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Transcript generated successfully.",

//         transcription_job: {
//           ...job,
//           status: "completed",
//         },

//         transcript,
//       },
//       { status: 201 },
//     );
//   } catch (error) {
//     console.error("TRANSCRIPTION ERROR:", error);

//     // =========================
//     // JOB FAILED
//     // =========================

//     if (transcriptionJobId) {
//       try {
//         await db.query(
//           `
//           UPDATE transcription_jobs

//           SET
//             status = 'failed',
//             completed_at = CURRENT_TIMESTAMP,
//             error_message = $1,
//             retry_count = retry_count + 1,
//             updated_at = CURRENT_TIMESTAMP

//           WHERE id = $2
//           `,
//           [error.message, transcriptionJobId],
//         );
//       } catch (jobError) {
//         console.error("UPDATE TRANSCRIPTION JOB ERROR:", jobError);
//       }
//     }

//     // =========================
//     // AUDIO FAILED
//     // =========================

//     if (audioRecordingId) {
//       try {
//         await db.query(
//           `
//           UPDATE audio_recordings

//           SET
//             status = 'failed',
//             error_message = $1,
//             updated_at = CURRENT_TIMESTAMP

//           WHERE id = $2
//           `,
//           [error.message, audioRecordingId],
//         );
//       } catch (audioError) {
//         console.error("UPDATE AUDIO ERROR:", audioError);
//       }
//     }

//     // =========================
//     // CONSULTATION FAILED
//     // =========================

//     if (consultationId) {
//       try {
//         await db.query(
//           `
//           UPDATE consultations

//           SET
//             status = 'failed',
//             updated_at = CURRENT_TIMESTAMP

//           WHERE id = $1
//           `,
//           [consultationId],
//         );
//       } catch (consultationError) {
//         console.error("UPDATE CONSULTATION ERROR:", consultationError);
//       }
//     }

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Unable to generate transcript.",
//         error: error.message,
//       },
//       { status: 500 },
//     );
//   }
// }

// import { NextResponse } from "next/server";

// import { db } from "@/lib/db";
// import { getSession } from "@/lib/auth";

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// // ======================================================
// // CONFIG
// // ======================================================

// const MAX_TRANSCRIPT_LENGTH = 500000;

// const ALLOWED_PROVIDERS = ["puter"];

// const ALLOWED_MODELS = [
//   "gpt-4o-transcribe",
//   "gpt-4o-mini-transcribe",
//   "whisper-1",
// ];

// // ======================================================
// // POST
// // /api/doctors/consultations/transcribe
// //
// // IMPORTANT:
// //
// // Audio transcription itself happens in browser using
// // Puter.js.
// //
// // This backend route:
// // 1. Validates doctor
// // 2. Validates consultation
// // 3. Validates audio recording
// // 4. Receives transcript_text
// // 5. Creates transcription job
// // 6. Saves transcript
// // 7. Updates statuses
// // ======================================================

// export async function POST(request) {
//   let transcriptionJobId = null;

//   try {
//     // ======================================================
//     // SESSION
//     // ======================================================

//     const session = await getSession();

//     if (!session) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Unauthorized. Please login.",
//         },
//         { status: 401 },
//       );
//     }

//     // ======================================================
//     // ROLE
//     // ======================================================

//     if (session.role !== "doctor") {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Only doctors can save consultation transcripts.",
//         },
//         { status: 403 },
//       );
//     }

//     // ======================================================
//     // REQUEST BODY
//     // ======================================================

//     let body;

//     try {
//       body = await request.json();
//     } catch {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid request body.",
//         },
//         { status: 400 },
//       );
//     }

//     const consultationId = Number(body.consultation_id);

//     const audioRecordingId = Number(body.audio_recording_id);

//     const transcriptText =
//       typeof body.transcript_text === "string"
//         ? body.transcript_text.trim()
//         : "";

//     const provider =
//       typeof body.provider === "string"
//         ? body.provider.trim().toLowerCase()
//         : "puter";

//     const model =
//       typeof body.model === "string" ? body.model.trim() : "gpt-4o-transcribe";

//     // ======================================================
//     // CONSULTATION ID
//     // ======================================================

//     if (!Number.isInteger(consultationId) || consultationId <= 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Valid consultation ID is required.",
//         },
//         { status: 400 },
//       );
//     }

//     // ======================================================
//     // AUDIO RECORDING ID
//     // ======================================================

//     if (!Number.isInteger(audioRecordingId) || audioRecordingId <= 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Valid audio recording ID is required.",
//         },
//         { status: 400 },
//       );
//     }

//     // ======================================================
//     // TRANSCRIPT
//     // ======================================================

//     if (!transcriptText) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Transcript text is required.",
//         },
//         { status: 400 },
//       );
//     }

//     if (transcriptText.length > MAX_TRANSCRIPT_LENGTH) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Transcript text is too large.",
//         },
//         { status: 400 },
//       );
//     }

//     // ======================================================
//     // PROVIDER
//     // ======================================================

//     if (!ALLOWED_PROVIDERS.includes(provider)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Unsupported transcription provider.",
//         },
//         { status: 400 },
//       );
//     }

//     // ======================================================
//     // MODEL
//     // ======================================================

//     if (!ALLOWED_MODELS.includes(model)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Unsupported transcription model.",
//         },
//         { status: 400 },
//       );
//     }

//     // ======================================================
//     // DOCTOR ACCOUNT
//     // ======================================================

//     const doctorResult = await db.query(
//       `
//       SELECT
//         id,
//         role,
//         is_active

//       FROM users

//       WHERE id = $1
//         AND role = 'doctor'

//       LIMIT 1
//       `,
//       [session.userId],
//     );

//     if (doctorResult.rows.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Doctor account not found.",
//         },
//         { status: 404 },
//       );
//     }

//     const doctor = doctorResult.rows[0];

//     if (!doctor.is_active) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Doctor account is inactive.",
//         },
//         { status: 403 },
//       );
//     }

//     // ======================================================
//     // CONSULTATION + AUDIO RECORDING
//     //
//     // This verifies:
//     //
//     // audio_recording_id
//     // belongs to
//     // consultation_id
//     //
//     // and consultation belongs to logged-in doctor.
//     // ======================================================

//     const recordingResult = await db.query(
//       `
//       SELECT
//         ar.id AS audio_recording_id,
//         ar.consultation_id,
//         ar.storage_key,
//         ar.original_file_name,
//         ar.mime_type,
//         ar.file_size,
//         ar.duration_seconds,
//         ar.status AS audio_status,

//         c.appointment_id,
//         c.patient_id,
//         c.doctor_id,
//         c.status AS consultation_status

//       FROM audio_recordings ar

//       INNER JOIN consultations c
//         ON c.id = ar.consultation_id

//       WHERE ar.id = $1
//         AND ar.consultation_id = $2

//       LIMIT 1
//       `,
//       [audioRecordingId, consultationId],
//     );

//     if (recordingResult.rows.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Audio recording was not found for this consultation.",
//         },
//         { status: 404 },
//       );
//     }

//     const recording = recordingResult.rows[0];

//     // ======================================================
//     // OWNERSHIP
//     // ======================================================

//     if (String(recording.doctor_id) !== String(session.userId)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "This consultation does not belong to you.",
//         },
//         { status: 403 },
//       );
//     }

//     // ======================================================
//     // COMPLETED CONSULTATION
//     // ======================================================

//     if (recording.consultation_status === "completed") {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "A completed consultation cannot be transcribed again.",
//         },
//         { status: 400 },
//       );
//     }

//     // ======================================================
//     // AUDIO STORAGE CHECK
//     // ======================================================

//     if (!recording.storage_key) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Audio storage information is missing.",
//         },
//         { status: 400 },
//       );
//     }

//     // ======================================================
//     // EXISTING TRANSCRIPT
//     // ======================================================

//     const existingTranscriptResult = await db.query(
//       `
//         SELECT
//           id,
//           consultation_id,
//           transcription_job_id,
//           status,
//           language,
//           full_text,
//           edited_text,
//           word_count,
//           confidence,
//           reviewed_by,
//           reviewed_at,
//           created_at,
//           updated_at

//         FROM transcripts

//         WHERE consultation_id = $1

//         LIMIT 1
//         `,
//       [consultationId],
//     );

//     const existingTranscript = existingTranscriptResult.rows[0] || null;

//     // ======================================================
//     // REVIEWED TRANSCRIPT
//     //
//     // Once doctor has reviewed a transcript, don't silently
//     // overwrite it with another AI transcription.
//     // ======================================================

//     if (existingTranscript?.status === "reviewed") {
//       return NextResponse.json(
//         {
//           success: true,
//           message: "This consultation already has a reviewed transcript.",
//           transcript: existingTranscript,
//         },
//         { status: 200 },
//       );
//     }

//     // ======================================================
//     // EXISTING READY TRANSCRIPT
//     //
//     // Avoid creating duplicates if user clicks twice.
//     // ======================================================

//     if (existingTranscript?.status === "ready") {
//       return NextResponse.json(
//         {
//           success: true,
//           message: "Transcript already exists.",
//           transcript: existingTranscript,
//         },
//         { status: 200 },
//       );
//     }

//     // ======================================================
//     // PREVENT DUPLICATE PROCESSING JOB
//     // ======================================================

//     const runningJobResult = await db.query(
//       `
//       SELECT
//         id,
//         audio_recording_id,
//         status,
//         provider,
//         model,
//         created_at

//       FROM transcription_jobs

//       WHERE audio_recording_id = $1

//         AND status IN (
//           'queued',
//           'processing'
//         )

//       ORDER BY created_at DESC

//       LIMIT 1
//       `,
//       [audioRecordingId],
//     );

//     if (runningJobResult.rows.length > 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Transcription is already being processed.",
//           job: runningJobResult.rows[0],
//         },
//         { status: 409 },
//       );
//     }

//     // ======================================================
//     // WORD COUNT
//     // ======================================================

//     const wordCount = transcriptText.split(/\s+/).filter(Boolean).length;

//     // ======================================================
//     // DATABASE TRANSACTION
//     // ======================================================

//     const client = await db.connect();

//     let job;
//     let transcript;

//     try {
//       await client.query("BEGIN");

//       // ====================================================
//       // CREATE TRANSCRIPTION JOB
//       //
//       // Puter already completed transcription in browser,
//       // but we create our own application job record for
//       // tracking/auditing.
//       // ====================================================

//       const jobResult = await client.query(
//         `
//         INSERT INTO transcription_jobs (
//           audio_recording_id,
//           status,
//           provider,
//           model,
//           started_at
//         )

//         VALUES (
//           $1,
//           'processing',
//           $2,
//           $3,
//           CURRENT_TIMESTAMP
//         )

//         RETURNING
//           id,
//           audio_recording_id,
//           status,
//           provider,
//           model,
//           language,
//           started_at,
//           completed_at,
//           error_message,
//           retry_count,
//           created_at,
//           updated_at
//         `,
//         [audioRecordingId, provider, model],
//       );

//       job = jobResult.rows[0];

//       transcriptionJobId = job.id;

//       // ====================================================
//       // AUDIO PROCESSING
//       // ====================================================

//       await client.query(
//         `
//         UPDATE audio_recordings

//         SET
//           status = 'processing',
//           error_message = NULL,
//           updated_at = CURRENT_TIMESTAMP

//         WHERE id = $1
//         `,
//         [audioRecordingId],
//       );

//       // ====================================================
//       // CONSULTATION PROCESSING
//       // ====================================================

//       await client.query(
//         `
//         UPDATE consultations

//         SET
//           status = 'processing',
//           updated_at = CURRENT_TIMESTAMP

//         WHERE id = $1
//           AND doctor_id = $2
//         `,
//         [consultationId, session.userId],
//       );

//       // ====================================================
//       // CREATE / UPDATE TRANSCRIPT
//       // ====================================================

//       let transcriptResult;

//       if (existingTranscript) {
//         transcriptResult = await client.query(
//           `
//             UPDATE transcripts

//             SET
//               transcription_job_id = $1,
//               status = 'ready',
//               full_text = $2,
//               edited_text = NULL,
//               word_count = $3,
//               reviewed_by = NULL,
//               reviewed_at = NULL,
//               updated_at = CURRENT_TIMESTAMP

//             WHERE consultation_id = $4

//             RETURNING
//               id,
//               consultation_id,
//               transcription_job_id,
//               status,
//               language,
//               full_text,
//               edited_text,
//               word_count,
//               confidence,
//               reviewed_by,
//               reviewed_at,
//               created_at,
//               updated_at
//             `,
//           [transcriptionJobId, transcriptText, wordCount, consultationId],
//         );
//       } else {
//         transcriptResult = await client.query(
//           `
//             INSERT INTO transcripts (
//               consultation_id,
//               transcription_job_id,
//               status,
//               full_text,
//               word_count
//             )

//             VALUES (
//               $1,
//               $2,
//               'ready',
//               $3,
//               $4
//             )

//             RETURNING
//               id,
//               consultation_id,
//               transcription_job_id,
//               status,
//               language,
//               full_text,
//               edited_text,
//               word_count,
//               confidence,
//               reviewed_by,
//               reviewed_at,
//               created_at,
//               updated_at
//             `,
//           [consultationId, transcriptionJobId, transcriptText, wordCount],
//         );
//       }

//       transcript = transcriptResult.rows[0];

//       // ====================================================
//       // COMPLETE TRANSCRIPTION JOB
//       // ====================================================

//       const completedJobResult = await client.query(
//         `
//           UPDATE transcription_jobs

//           SET
//             status = 'completed',
//             completed_at = CURRENT_TIMESTAMP,
//             error_message = NULL,
//             updated_at = CURRENT_TIMESTAMP

//           WHERE id = $1

//           RETURNING
//             id,
//             audio_recording_id,
//             status,
//             provider,
//             model,
//             language,
//             started_at,
//             completed_at,
//             error_message,
//             retry_count,
//             created_at,
//             updated_at
//           `,
//         [transcriptionJobId],
//       );

//       job = completedJobResult.rows[0];

//       // ====================================================
//       // AUDIO COMPLETED
//       // ====================================================

//       await client.query(
//         `
//         UPDATE audio_recordings

//         SET
//           status = 'completed',
//           error_message = NULL,
//           updated_at = CURRENT_TIMESTAMP

//         WHERE id = $1
//         `,
//         [audioRecordingId],
//       );

//       // ====================================================
//       // CONSULTATION TRANSCRIBED
//       // ====================================================

//       await client.query(
//         `
//         UPDATE consultations

//         SET
//           status = 'transcribed',
//           updated_at = CURRENT_TIMESTAMP

//         WHERE id = $1
//           AND doctor_id = $2
//         `,
//         [consultationId, session.userId],
//       );

//       // ====================================================
//       // AUDIT LOG
//       // ====================================================

//       try {
//         await client.query(
//           `
//           INSERT INTO audit_logs (
//             user_id,
//             action,
//             entity_type,
//             entity_id,
//             details
//           )

//           VALUES (
//             $1,
//             $2,
//             $3,
//             $4,
//             $5
//           )
//           `,
//           [
//             session.userId,

//             "GENERATE_TRANSCRIPT",

//             "transcript",

//             transcript.id,

//             JSON.stringify({
//               consultation_id: consultationId,

//               appointment_id: recording.appointment_id,

//               patient_id: recording.patient_id,

//               doctor_id: session.userId,

//               audio_recording_id: audioRecordingId,

//               transcription_job_id: transcriptionJobId,

//               provider,

//               model,

//               word_count: wordCount,

//               source: "browser_puter_speech_to_text",
//             }),
//           ],
//         );
//       } catch (auditError) {
//         // Audit failure should not break transcript creation.
//         console.error("TRANSCRIPT AUDIT ERROR:", auditError);
//       }

//       await client.query("COMMIT");
//     } catch (databaseError) {
//       try {
//         await client.query("ROLLBACK");
//       } catch {}

//       throw databaseError;
//     } finally {
//       client.release();
//     }

//     // ======================================================
//     // RESPONSE
//     // ======================================================

//     return NextResponse.json(
//       {
//         success: true,

//         message: "Transcript generated and saved successfully.",

//         transcription_job: job,

//         transcript,
//       },
//       {
//         status: 201,

//         headers: {
//           "Cache-Control": "no-store, no-cache, must-revalidate",
//         },
//       },
//     );
//   } catch (error) {
//     console.error("SAVE TRANSCRIPT ERROR:", error);

//     // ======================================================
//     // JOB FAILURE
//     //
//     // Normally transaction rollback means job doesn't exist.
//     // This block also protects us if failure happens after
//     // a job was committed in a future implementation.
//     // ======================================================

//     if (transcriptionJobId) {
//       try {
//         await db.query(
//           `
//           UPDATE transcription_jobs

//           SET
//             status = 'failed',
//             completed_at = CURRENT_TIMESTAMP,
//             error_message = $1,
//             retry_count = retry_count + 1,
//             updated_at = CURRENT_TIMESTAMP

//           WHERE id = $2
//             AND status <> 'completed'
//           `,
//           [error.message, transcriptionJobId],
//         );
//       } catch (jobError) {
//         console.error("UPDATE TRANSCRIPTION JOB ERROR:", jobError);
//       }
//     }

//     /*
//      * IMPORTANT:
//      *
//      * We intentionally DO NOT mark the audio recording
//      * or consultation as "failed" here.
//      *
//      * Reason:
//      * Puter already produced the transcript on frontend.
//      * A database/save problem does NOT mean that the
//      * uploaded S3 audio itself failed.
//      *
//      * Doctor can retry saving/generating transcript.
//      */

//     return NextResponse.json(
//       {
//         success: false,

//         message: "Transcript could not be saved.",

//         error:
//           process.env.NODE_ENV === "development" ? error.message : undefined,
//       },
//       {
//         status: 500,

//         headers: {
//           "Cache-Control": "no-store",
//         },
//       },
//     );
//   }
// }

// import { NextResponse } from "next/server";

// import { db } from "@/lib/db";
// import { getSession } from "@/lib/auth";

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// // ======================================================
// // CONFIG
// // ======================================================

// const MAX_TRANSCRIPT_LENGTH = 500000;

// const ALLOWED_PROVIDERS = ["puter"];

// const ALLOWED_MODELS = [
//   "gpt-4o-transcribe",
//   "gpt-4o-mini-transcribe",
//   "whisper-1",
// ];

// // ======================================================
// // POST
// // /api/doctors/consultations/transcribe
// //
// // IMPORTANT:
// //
// // Actual speech-to-text happens in browser using Puter.js.
// //
// // This route only:
// // 1. validates logged-in doctor
// // 2. validates consultation ownership
// // 3. validates audio recording ownership
// // 4. receives transcript_text
// // 5. creates transcription job
// // 6. inserts / updates transcript
// // 7. updates statuses
// // ======================================================

// export async function POST(request) {
//   let transcriptionJobId = null;

//   try {
//     // ======================================================
//     // SESSION
//     // ======================================================

//     const session = await getSession();

//     if (!session) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Unauthorized. Please login.",
//         },
//         { status: 401 },
//       );
//     }

//     // ======================================================
//     // ROLE
//     // ======================================================

//     if (session.role !== "doctor") {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Only doctors can save consultation transcripts.",
//         },
//         { status: 403 },
//       );
//     }

//     // ======================================================
//     // BODY
//     // ======================================================

//     let body;

//     try {
//       body = await request.json();
//     } catch {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid request body.",
//         },
//         { status: 400 },
//       );
//     }

//     const consultationId = Number(body.consultation_id);

//     const audioRecordingId = Number(
//       body.audio_recording_id,
//     );

//     const transcriptText =
//       typeof body.transcript_text === "string"
//         ? body.transcript_text.trim()
//         : "";

//     const provider =
//       typeof body.provider === "string"
//         ? body.provider.trim().toLowerCase()
//         : "puter";

//     const model =
//       typeof body.model === "string"
//         ? body.model.trim()
//         : "gpt-4o-transcribe";

//     // ======================================================
//     // CONSULTATION ID VALIDATION
//     // ======================================================

//     if (
//       !Number.isInteger(consultationId) ||
//       consultationId <= 0
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Valid consultation ID is required.",
//         },
//         { status: 400 },
//       );
//     }

//     // ======================================================
//     // AUDIO RECORDING ID VALIDATION
//     // ======================================================

//     if (
//       !Number.isInteger(audioRecordingId) ||
//       audioRecordingId <= 0
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Valid audio recording ID is required.",
//         },
//         { status: 400 },
//       );
//     }

//     // ======================================================
//     // TRANSCRIPT VALIDATION
//     // ======================================================

//     if (!transcriptText) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Transcript text is required.",
//         },
//         { status: 400 },
//       );
//     }

//     if (
//       transcriptText.length >
//       MAX_TRANSCRIPT_LENGTH
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Transcript text is too large.",
//         },
//         { status: 400 },
//       );
//     }

//     // ======================================================
//     // PROVIDER
//     // ======================================================

//     if (
//       !ALLOWED_PROVIDERS.includes(
//         provider,
//       )
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Unsupported transcription provider.",
//         },
//         { status: 400 },
//       );
//     }

//     // ======================================================
//     // MODEL
//     // ======================================================

//     if (!ALLOWED_MODELS.includes(model)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Unsupported transcription model.",
//         },
//         { status: 400 },
//       );
//     }

//     // ======================================================
//     // DOCTOR ACCOUNT
//     // ======================================================

//     const doctorResult = await db.query(
//       `
//       SELECT
//         id,
//         role,
//         is_active

//       FROM users

//       WHERE id = $1
//         AND role = 'doctor'

//       LIMIT 1
//       `,
//       [session.userId],
//     );

//     if (
//       doctorResult.rows.length === 0
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Doctor account not found.",
//         },
//         { status: 404 },
//       );
//     }

//     const doctor =
//       doctorResult.rows[0];

//     if (!doctor.is_active) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Doctor account is inactive.",
//         },
//         { status: 403 },
//       );
//     }

//     // ======================================================
//     // CONSULTATION + AUDIO RECORDING
//     // ======================================================

//     const recordingResult = await db.query(
//       `
//       SELECT
//         ar.id AS audio_recording_id,
//         ar.consultation_id,
//         ar.storage_key,
//         ar.original_file_name,
//         ar.mime_type,
//         ar.file_size,
//         ar.duration_seconds,
//         ar.status AS audio_status,

//         c.appointment_id,
//         c.patient_id,
//         c.doctor_id,
//         c.status AS consultation_status

//       FROM audio_recordings ar

//       INNER JOIN consultations c
//         ON c.id = ar.consultation_id

//       WHERE ar.id = $1
//         AND ar.consultation_id = $2

//       LIMIT 1
//       `,
//       [
//         audioRecordingId,
//         consultationId,
//       ],
//     );

//     if (
//       recordingResult.rows.length === 0
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Audio recording was not found for this consultation.",
//         },
//         { status: 404 },
//       );
//     }

//     const recording =
//       recordingResult.rows[0];

//     // ======================================================
//     // OWNERSHIP
//     // ======================================================

//     if (
//       String(recording.doctor_id) !==
//       String(session.userId)
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "This consultation does not belong to you.",
//         },
//         { status: 403 },
//       );
//     }

//     // ======================================================
//     // COMPLETED CONSULTATION
//     // ======================================================

//     if (
//       recording.consultation_status ===
//       "completed"
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "A completed consultation cannot be transcribed again.",
//         },
//         { status: 400 },
//       );
//     }

//     // ======================================================
//     // STORAGE KEY CHECK
//     // ======================================================

//     if (!recording.storage_key) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Audio storage information is missing.",
//         },
//         { status: 400 },
//       );
//     }

//     // ======================================================
//     // EXISTING TRANSCRIPT
//     // ======================================================

//     const existingTranscriptResult =
//       await db.query(
//         `
//         SELECT
//           id,
//           consultation_id,
//           transcription_job_id,
//           status,
//           language,
//           full_text,
//           edited_text,
//           word_count,
//           confidence,
//           reviewed_by,
//           reviewed_at,
//           created_at,
//           updated_at

//         FROM transcripts

//         WHERE consultation_id = $1

//         LIMIT 1
//         `,
//         [consultationId],
//       );

//     const existingTranscript =
//       existingTranscriptResult.rows[0] ||
//       null;

//     // ======================================================
//     // IMPORTANT:
//     //
//     // Reviewed transcript must NOT be overwritten.
//     // ======================================================

//     if (
//       existingTranscript?.status ===
//       "reviewed"
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "This transcript has already been reviewed and cannot be overwritten.",
//           transcript:
//             existingTranscript,
//         },
//         { status: 409 },
//       );
//     }

//     // ======================================================
//     // IMPORTANT:
//     //
//     // DO NOT return early when status === ready.
//     //
//     // This allows new transcription to overwrite old bad
//     // transcript like "Thank you".
//     // ======================================================

//     // ======================================================
//     // RUNNING JOB CHECK
//     // ======================================================

//     const runningJobResult =
//       await db.query(
//         `
//         SELECT
//           id,
//           audio_recording_id,
//           status,
//           provider,
//           model,
//           created_at

//         FROM transcription_jobs

//         WHERE audio_recording_id = $1

//           AND status IN (
//             'queued',
//             'processing'
//           )

//         ORDER BY created_at DESC

//         LIMIT 1
//         `,
//         [audioRecordingId],
//       );

//     if (
//       runningJobResult.rows.length > 0
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Transcription is already being processed.",
//           job:
//             runningJobResult.rows[0],
//         },
//         { status: 409 },
//       );
//     }

//     // ======================================================
//     // WORD COUNT
//     // ======================================================

//     const wordCount =
//       transcriptText
//         .split(/\s+/)
//         .filter(Boolean).length;

//     // ======================================================
//     // DATABASE TRANSACTION
//     // ======================================================

//     const client =
//       await db.connect();

//     let job = null;
//     let transcript = null;

//     try {
//       await client.query("BEGIN");

//       // ====================================================
//       // CREATE JOB
//       // ====================================================

//       const jobResult =
//         await client.query(
//           `
//           INSERT INTO transcription_jobs (
//             audio_recording_id,
//             status,
//             provider,
//             model,
//             started_at
//           )

//           VALUES (
//             $1,
//             'processing',
//             $2,
//             $3,
//             CURRENT_TIMESTAMP
//           )

//           RETURNING
//             id,
//             audio_recording_id,
//             status,
//             provider,
//             model,
//             language,
//             started_at,
//             completed_at,
//             error_message,
//             retry_count,
//             created_at,
//             updated_at
//           `,
//           [
//             audioRecordingId,
//             provider,
//             model,
//           ],
//         );

//       job = jobResult.rows[0];

//       transcriptionJobId = job.id;

//       // ====================================================
//       // AUDIO PROCESSING
//       // ====================================================

//       await client.query(
//         `
//         UPDATE audio_recordings

//         SET
//           status = 'processing',
//           error_message = NULL,
//           updated_at = CURRENT_TIMESTAMP

//         WHERE id = $1
//         `,
//         [audioRecordingId],
//       );

//       // ====================================================
//       // CONSULTATION PROCESSING
//       // ====================================================

//       await client.query(
//         `
//         UPDATE consultations

//         SET
//           status = 'processing',
//           updated_at = CURRENT_TIMESTAMP

//         WHERE id = $1
//           AND doctor_id = $2
//         `,
//         [
//           consultationId,
//           session.userId,
//         ],
//       );

//       // ====================================================
//       // UPDATE EXISTING TRANSCRIPT
//       // ====================================================

//       let transcriptResult;

//       if (existingTranscript) {
//         transcriptResult =
//           await client.query(
//             `
//             UPDATE transcripts

//             SET
//               transcription_job_id = $1,

//               status = 'ready',

//               full_text = $2,

//               edited_text = NULL,

//               word_count = $3,

//               confidence = NULL,

//               reviewed_by = NULL,

//               reviewed_at = NULL,

//               updated_at = CURRENT_TIMESTAMP

//             WHERE consultation_id = $4

//             RETURNING
//               id,
//               consultation_id,
//               transcription_job_id,
//               status,
//               language,
//               full_text,
//               edited_text,
//               word_count,
//               confidence,
//               reviewed_by,
//               reviewed_at,
//               created_at,
//               updated_at
//             `,
//             [
//               transcriptionJobId,
//               transcriptText,
//               wordCount,
//               consultationId,
//             ],
//           );
//       }

//       // ====================================================
//       // CREATE NEW TRANSCRIPT
//       // ====================================================

//       else {
//         transcriptResult =
//           await client.query(
//             `
//             INSERT INTO transcripts (
//               consultation_id,
//               transcription_job_id,
//               status,
//               full_text,
//               word_count
//             )

//             VALUES (
//               $1,
//               $2,
//               'ready',
//               $3,
//               $4
//             )

//             RETURNING
//               id,
//               consultation_id,
//               transcription_job_id,
//               status,
//               language,
//               full_text,
//               edited_text,
//               word_count,
//               confidence,
//               reviewed_by,
//               reviewed_at,
//               created_at,
//               updated_at
//             `,
//             [
//               consultationId,
//               transcriptionJobId,
//               transcriptText,
//               wordCount,
//             ],
//           );
//       }

//       transcript =
//         transcriptResult.rows[0];

//       // ====================================================
//       // COMPLETE JOB
//       // ====================================================

//       const completedJobResult =
//         await client.query(
//           `
//           UPDATE transcription_jobs

//           SET
//             status = 'completed',

//             completed_at =
//               CURRENT_TIMESTAMP,

//             error_message = NULL,

//             updated_at =
//               CURRENT_TIMESTAMP

//           WHERE id = $1

//           RETURNING
//             id,
//             audio_recording_id,
//             status,
//             provider,
//             model,
//             language,
//             started_at,
//             completed_at,
//             error_message,
//             retry_count,
//             created_at,
//             updated_at
//           `,
//           [transcriptionJobId],
//         );

//       job =
//         completedJobResult.rows[0];

//       // ====================================================
//       // AUDIO COMPLETED
//       // ====================================================

//       await client.query(
//         `
//         UPDATE audio_recordings

//         SET
//           status = 'completed',
//           error_message = NULL,
//           updated_at = CURRENT_TIMESTAMP

//         WHERE id = $1
//         `,
//         [audioRecordingId],
//       );

//       // ====================================================
//       // CONSULTATION TRANSCRIBED
//       // ====================================================

//       await client.query(
//         `
//         UPDATE consultations

//         SET
//           status = 'transcribed',
//           updated_at = CURRENT_TIMESTAMP

//         WHERE id = $1
//           AND doctor_id = $2
//         `,
//         [
//           consultationId,
//           session.userId,
//         ],
//       );

//       // ====================================================
//       // AUDIT
//       // ====================================================

//       try {
//         await client.query(
//           `
//           INSERT INTO audit_logs (
//             user_id,
//             action,
//             entity_type,
//             entity_id,
//             details
//           )

//           VALUES (
//             $1,
//             $2,
//             $3,
//             $4,
//             $5
//           )
//           `,
//           [
//             session.userId,

//             existingTranscript
//               ? "REGENERATE_TRANSCRIPT"
//               : "GENERATE_TRANSCRIPT",

//             "transcript",

//             transcript.id,

//             JSON.stringify({
//               consultation_id:
//                 consultationId,

//               appointment_id:
//                 recording.appointment_id,

//               patient_id:
//                 recording.patient_id,

//               doctor_id:
//                 session.userId,

//               audio_recording_id:
//                 audioRecordingId,

//               transcription_job_id:
//                 transcriptionJobId,

//               provider,

//               model,

//               word_count:
//                 wordCount,

//               previous_transcript_id:
//                 existingTranscript?.id ||
//                 null,

//               previous_text:
//                 existingTranscript?.full_text ||
//                 null,

//               source:
//                 "browser_puter_speech_to_text",
//             }),
//           ],
//         );
//       } catch (auditError) {
//         console.error(
//           "TRANSCRIPT AUDIT ERROR:",
//           auditError,
//         );
//       }

//       // ====================================================
//       // COMMIT
//       // ====================================================

//       await client.query("COMMIT");
//     } catch (databaseError) {
//       try {
//         await client.query(
//           "ROLLBACK",
//         );
//       } catch {}

//       throw databaseError;
//     } finally {
//       client.release();
//     }

//     // ======================================================
//     // RESPONSE
//     // ======================================================

//     return NextResponse.json(
//       {
//         success: true,

//         message: existingTranscript
//           ? "Transcript regenerated and updated successfully."
//           : "Transcript generated and saved successfully.",

//         transcription_job: job,

//         transcript,
//       },
//       {
//         status: existingTranscript
//           ? 200
//           : 201,

//         headers: {
//           "Cache-Control":
//             "no-store, no-cache, must-revalidate, proxy-revalidate",
//         },
//       },
//     );
//   } catch (error) {
//     console.error(
//       "SAVE TRANSCRIPT ERROR:",
//       error,
//     );

//     // ======================================================
//     // FAILED JOB
//     // ======================================================

//     if (transcriptionJobId) {
//       try {
//         await db.query(
//           `
//           UPDATE transcription_jobs

//           SET
//             status = 'failed',

//             completed_at =
//               CURRENT_TIMESTAMP,

//             error_message = $1,

//             retry_count =
//               retry_count + 1,

//             updated_at =
//               CURRENT_TIMESTAMP

//           WHERE id = $2

//             AND status <> 'completed'
//           `,
//           [
//             error.message,
//             transcriptionJobId,
//           ],
//         );
//       } catch (jobError) {
//         console.error(
//           "UPDATE TRANSCRIPTION JOB ERROR:",
//           jobError,
//         );
//       }
//     }

//     // ======================================================
//     // IMPORTANT
//     //
//     // Audio and consultation are intentionally NOT marked
//     // failed here.
//     //
//     // Puter transcription already happened client-side.
//     // A DB error doesn't mean S3 audio failed.
//     // ======================================================

//     return NextResponse.json(
//       {
//         success: false,

//         message:
//           "Transcript could not be saved.",

//         error:
//           process.env.NODE_ENV ===
//           "development"
//             ? error.message
//             : undefined,
//       },
//       {
//         status: 500,

//         headers: {
//           "Cache-Control":
//             "no-store",
//         },
//       },
//     );
//   }
// }

// import { NextResponse } from "next/server";

// import { db } from "@/lib/db";
// import { getSession } from "@/lib/auth";

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// // ======================================================
// // CONFIG
// // ======================================================

// const MAX_TRANSCRIPT_LENGTH = 500000;

// const ALLOWED_PROVIDERS = ["puter"];

// const ALLOWED_MODELS = [
//   "gpt-4o-transcribe",
//   "gpt-4o-mini-transcribe",
//   "whisper-1",
// ];

// // ======================================================
// // SUPPORTED OUTPUT LANGUAGES
// // ======================================================

// const ALLOWED_LANGUAGES = ["auto", "en", "ur", "roman-ur", "hi", "ar", "pa"];

// // ======================================================
// // HEADERS
// // ======================================================

// function noStoreHeaders() {
//   return {
//     "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
//   };
// }

// // ======================================================
// // POST
// // /api/doctors/consultations/transcribe
// //
// // IMPORTANT:
// //
// // Actual speech-to-text happens in browser using Puter.js.
// //
// // This route:
// //
// // 1. validates doctor
// // 2. validates consultation
// // 3. validates audio recording
// // 4. validates selected output language
// // 5. receives transcript_text
// // 6. creates transcription job
// // 7. inserts / updates transcript
// // 8. updates statuses
// // ======================================================

// export async function POST(request) {
//   let transcriptionJobId = null;

//   try {
//     // ======================================================
//     // SESSION
//     // ======================================================

//     const session = await getSession();

//     if (!session) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Unauthorized. Please login.",
//         },
//         {
//           status: 401,
//           headers: noStoreHeaders(),
//         },
//       );
//     }

//     // ======================================================
//     // ROLE
//     // ======================================================

//     if (session.role !== "doctor") {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Only doctors can save consultation transcripts.",
//         },
//         {
//           status: 403,
//           headers: noStoreHeaders(),
//         },
//       );
//     }

//     // ======================================================
//     // BODY
//     // ======================================================

//     let body;

//     try {
//       body = await request.json();
//     } catch {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid request body.",
//         },
//         {
//           status: 400,
//           headers: noStoreHeaders(),
//         },
//       );
//     }

//     const consultationId = Number(body.consultation_id);

//     const audioRecordingId = Number(body.audio_recording_id);

//     const transcriptText =
//       typeof body.transcript_text === "string"
//         ? body.transcript_text.trim()
//         : "";

//     const provider =
//       typeof body.provider === "string"
//         ? body.provider.trim().toLowerCase()
//         : "puter";

//     const model =
//       typeof body.model === "string" ? body.model.trim() : "gpt-4o-transcribe";

//     const language =
//       typeof body.language === "string"
//         ? body.language.trim().toLowerCase()
//         : "auto";

//     // ======================================================
//     // CONSULTATION ID
//     // ======================================================

//     if (!Number.isInteger(consultationId) || consultationId <= 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Valid consultation ID is required.",
//         },
//         {
//           status: 400,
//           headers: noStoreHeaders(),
//         },
//       );
//     }

//     // ======================================================
//     // AUDIO RECORDING ID
//     // ======================================================

//     if (!Number.isInteger(audioRecordingId) || audioRecordingId <= 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Valid audio recording ID is required.",
//         },
//         {
//           status: 400,
//           headers: noStoreHeaders(),
//         },
//       );
//     }

//     // ======================================================
//     // TRANSCRIPT TEXT
//     // ======================================================

//     if (!transcriptText) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Transcript text is required.",
//         },
//         {
//           status: 400,
//           headers: noStoreHeaders(),
//         },
//       );
//     }

//     if (transcriptText.length > MAX_TRANSCRIPT_LENGTH) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Transcript text is too large.",
//         },
//         {
//           status: 400,
//           headers: noStoreHeaders(),
//         },
//       );
//     }

//     // ======================================================
//     // PROVIDER
//     // ======================================================

//     if (!ALLOWED_PROVIDERS.includes(provider)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Unsupported transcription provider.",
//         },
//         {
//           status: 400,
//           headers: noStoreHeaders(),
//         },
//       );
//     }

//     // ======================================================
//     // MODEL
//     // ======================================================

//     if (!ALLOWED_MODELS.includes(model)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Unsupported transcription model.",
//         },
//         {
//           status: 400,
//           headers: noStoreHeaders(),
//         },
//       );
//     }

//     // ======================================================
//     // LANGUAGE
//     // ======================================================

//     if (!ALLOWED_LANGUAGES.includes(language)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Unsupported transcript language.",
//         },
//         {
//           status: 400,
//           headers: noStoreHeaders(),
//         },
//       );
//     }

//     // ======================================================
//     // DOCTOR ACCOUNT
//     // ======================================================

//     const doctorResult = await db.query(
//       `
//       SELECT
//         id,
//         role,
//         is_active

//       FROM users

//       WHERE id = $1
//         AND role = 'doctor'

//       LIMIT 1
//       `,
//       [session.userId],
//     );

//     if (doctorResult.rows.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Doctor account not found.",
//         },
//         {
//           status: 404,
//           headers: noStoreHeaders(),
//         },
//       );
//     }

//     const doctor = doctorResult.rows[0];

//     if (!doctor.is_active) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Doctor account is inactive.",
//         },
//         {
//           status: 403,
//           headers: noStoreHeaders(),
//         },
//       );
//     }

//     // ======================================================
//     // CONSULTATION + AUDIO RECORDING
//     // ======================================================

//     const recordingResult = await db.query(
//       `
//         SELECT
//           ar.id AS audio_recording_id,
//           ar.consultation_id,
//           ar.storage_key,
//           ar.original_file_name,
//           ar.mime_type,
//           ar.file_size,
//           ar.duration_seconds,
//           ar.status AS audio_status,

//           c.appointment_id,
//           c.patient_id,
//           c.doctor_id,
//           c.status AS consultation_status

//         FROM audio_recordings ar

//         INNER JOIN consultations c
//           ON c.id = ar.consultation_id

//         WHERE ar.id = $1
//           AND ar.consultation_id = $2

//         LIMIT 1
//         `,
//       [audioRecordingId, consultationId],
//     );

//     if (recordingResult.rows.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,

//           message: "Audio recording was not found for this consultation.",
//         },
//         {
//           status: 404,
//           headers: noStoreHeaders(),
//         },
//       );
//     }

//     const recording = recordingResult.rows[0];

//     // ======================================================
//     // OWNERSHIP
//     // ======================================================

//     if (String(recording.doctor_id) !== String(session.userId)) {
//       return NextResponse.json(
//         {
//           success: false,

//           message: "This consultation does not belong to you.",
//         },
//         {
//           status: 403,
//           headers: noStoreHeaders(),
//         },
//       );
//     }

//     // ======================================================
//     // COMPLETED CONSULTATION
//     // ======================================================

//     if (recording.consultation_status === "completed") {
//       return NextResponse.json(
//         {
//           success: false,

//           message: "A completed consultation cannot be transcribed again.",
//         },
//         {
//           status: 400,
//           headers: noStoreHeaders(),
//         },
//       );
//     }

//     // ======================================================
//     // STORAGE KEY
//     // ======================================================

//     if (!recording.storage_key) {
//       return NextResponse.json(
//         {
//           success: false,

//           message: "Audio storage information is missing.",
//         },
//         {
//           status: 400,
//           headers: noStoreHeaders(),
//         },
//       );
//     }

//     // ======================================================
//     // EXISTING TRANSCRIPT
//     // ======================================================

//     const existingTranscriptResult = await db.query(
//       `
//         SELECT
//           id,
//           consultation_id,
//           transcription_job_id,
//           status,
//           language,
//           full_text,
//           edited_text,
//           word_count,
//           confidence,
//           reviewed_by,
//           reviewed_at,
//           created_at,
//           updated_at

//         FROM transcripts

//         WHERE consultation_id = $1

//         ORDER BY
//           created_at DESC,
//           id DESC

//         LIMIT 1
//         `,
//       [consultationId],
//     );

//     const existingTranscript = existingTranscriptResult.rows[0] || null;

//     // ======================================================
//     // REVIEWED TRANSCRIPT
//     // ======================================================

//     if (existingTranscript?.status === "reviewed") {
//       return NextResponse.json(
//         {
//           success: false,

//           message:
//             "This transcript has already been reviewed and cannot be overwritten.",

//           transcript: existingTranscript,
//         },
//         {
//           status: 409,
//           headers: noStoreHeaders(),
//         },
//       );
//     }

//     // ======================================================
//     // RUNNING JOB
//     // ======================================================

//     const runningJobResult = await db.query(
//       `
//         SELECT
//           id,
//           audio_recording_id,
//           status,
//           provider,
//           model,
//           language,
//           created_at

//         FROM transcription_jobs

//         WHERE audio_recording_id = $1

//           AND status IN (
//             'queued',
//             'processing'
//           )

//         ORDER BY
//           created_at DESC,
//           id DESC

//         LIMIT 1
//         `,
//       [audioRecordingId],
//     );

//     if (runningJobResult.rows.length > 0) {
//       return NextResponse.json(
//         {
//           success: false,

//           message: "Transcription is already being processed.",

//           job: runningJobResult.rows[0],
//         },
//         {
//           status: 409,
//           headers: noStoreHeaders(),
//         },
//       );
//     }

//     // ======================================================
//     // WORD COUNT
//     // ======================================================

//     const wordCount = transcriptText.split(/\s+/).filter(Boolean).length;

//     // ======================================================
//     // DATABASE TRANSACTION
//     // ======================================================

//     const client = await db.connect();

//     let job = null;
//     let transcript = null;

//     try {
//       await client.query("BEGIN");

//       // ====================================================
//       // CREATE JOB
//       // ====================================================

//       const jobResult = await client.query(
//         `
//           INSERT INTO transcription_jobs (
//             audio_recording_id,
//             status,
//             provider,
//             model,
//             language,
//             started_at
//           )

//           VALUES (
//             $1,
//             'processing',
//             $2,
//             $3,
//             $4,
//             CURRENT_TIMESTAMP
//           )

//           RETURNING
//             id,
//             audio_recording_id,
//             status,
//             provider,
//             model,
//             language,
//             started_at,
//             completed_at,
//             error_message,
//             retry_count,
//             created_at,
//             updated_at
//           `,
//         [audioRecordingId, provider, model, language],
//       );

//       job = jobResult.rows[0];

//       transcriptionJobId = job.id;

//       // ====================================================
//       // AUDIO PROCESSING
//       // ====================================================

//       await client.query(
//         `
//         UPDATE audio_recordings

//         SET
//           status = 'processing',
//           error_message = NULL,
//           updated_at =
//             CURRENT_TIMESTAMP

//         WHERE id = $1
//         `,
//         [audioRecordingId],
//       );

//       // ====================================================
//       // CONSULTATION PROCESSING
//       // ====================================================

//       await client.query(
//         `
//         UPDATE consultations

//         SET
//           status = 'processing',
//           updated_at =
//             CURRENT_TIMESTAMP

//         WHERE id = $1
//           AND doctor_id = $2
//         `,
//         [consultationId, session.userId],
//       );

//       // ====================================================
//       // TRANSCRIPT CREATE / UPDATE
//       // ====================================================

//       let transcriptResult;

//       if (existingTranscript) {
//         transcriptResult = await client.query(
//           `
//             UPDATE transcripts

//             SET
//               transcription_job_id = $1,

//               status = 'ready',

//               language = $2,

//               full_text = $3,

//               edited_text = NULL,

//               word_count = $4,

//               confidence = NULL,

//               reviewed_by = NULL,

//               reviewed_at = NULL,

//               updated_at =
//                 CURRENT_TIMESTAMP

//             WHERE consultation_id = $5

//             RETURNING
//               id,
//               consultation_id,
//               transcription_job_id,
//               status,
//               language,
//               full_text,
//               edited_text,
//               word_count,
//               confidence,
//               reviewed_by,
//               reviewed_at,
//               created_at,
//               updated_at
//             `,
//           [
//             transcriptionJobId,
//             language,
//             transcriptText,
//             wordCount,
//             consultationId,
//           ],
//         );
//       } else {
//         transcriptResult = await client.query(
//           `
//             INSERT INTO transcripts (
//               consultation_id,
//               transcription_job_id,
//               status,
//               language,
//               full_text,
//               word_count
//             )

//             VALUES (
//               $1,
//               $2,
//               'ready',
//               $3,
//               $4,
//               $5
//             )

//             RETURNING
//               id,
//               consultation_id,
//               transcription_job_id,
//               status,
//               language,
//               full_text,
//               edited_text,
//               word_count,
//               confidence,
//               reviewed_by,
//               reviewed_at,
//               created_at,
//               updated_at
//             `,
//           [
//             consultationId,
//             transcriptionJobId,
//             language,
//             transcriptText,
//             wordCount,
//           ],
//         );
//       }

//       transcript = transcriptResult.rows[0];

//       // ====================================================
//       // COMPLETE JOB
//       // ====================================================

//       const completedJobResult = await client.query(
//         `
//           UPDATE transcription_jobs

//           SET
//             status = 'completed',

//             language = $1,

//             completed_at =
//               CURRENT_TIMESTAMP,

//             error_message = NULL,

//             updated_at =
//               CURRENT_TIMESTAMP

//           WHERE id = $2

//           RETURNING
//             id,
//             audio_recording_id,
//             status,
//             provider,
//             model,
//             language,
//             started_at,
//             completed_at,
//             error_message,
//             retry_count,
//             created_at,
//             updated_at
//           `,
//         [language, transcriptionJobId],
//       );

//       job = completedJobResult.rows[0];

//       // ====================================================
//       // AUDIO COMPLETED
//       // ====================================================

//       await client.query(
//         `
//         UPDATE audio_recordings

//         SET
//           status = 'completed',
//           error_message = NULL,
//           updated_at =
//             CURRENT_TIMESTAMP

//         WHERE id = $1
//         `,
//         [audioRecordingId],
//       );

//       // ====================================================
//       // CONSULTATION TRANSCRIBED
//       // ====================================================

//       await client.query(
//         `
//         UPDATE consultations

//         SET
//           status = 'transcribed',
//           updated_at =
//             CURRENT_TIMESTAMP

//         WHERE id = $1
//           AND doctor_id = $2
//         `,
//         [consultationId, session.userId],
//       );

//       // ====================================================
//       // AUDIT LOG
//       // ====================================================

//       try {
//         await client.query(
//           `
//           INSERT INTO audit_logs (
//             user_id,
//             action,
//             entity_type,
//             entity_id,
//             details
//           )

//           VALUES (
//             $1,
//             $2,
//             $3,
//             $4,
//             $5
//           )
//           `,
//           [
//             session.userId,

//             existingTranscript
//               ? "REGENERATE_TRANSCRIPT"
//               : "GENERATE_TRANSCRIPT",

//             "transcript",

//             transcript.id,

//             JSON.stringify({
//               consultation_id: consultationId,

//               appointment_id: recording.appointment_id,

//               patient_id: recording.patient_id,

//               doctor_id: session.userId,

//               audio_recording_id: audioRecordingId,

//               transcription_job_id: transcriptionJobId,

//               provider,

//               model,

//               language,

//               word_count: wordCount,

//               previous_transcript_id: existingTranscript?.id || null,

//               previous_language: existingTranscript?.language || null,

//               previous_text: existingTranscript?.full_text || null,

//               source: "browser_puter_speech_to_text",
//             }),
//           ],
//         );
//       } catch (auditError) {
//         console.error("TRANSCRIPT AUDIT ERROR:", auditError);
//       }

//       // ====================================================
//       // COMMIT
//       // ====================================================

//       await client.query("COMMIT");
//     } catch (databaseError) {
//       try {
//         await client.query("ROLLBACK");
//       } catch {}

//       throw databaseError;
//     } finally {
//       client.release();
//     }

//     // ======================================================
//     // RESPONSE
//     // ======================================================

//     return NextResponse.json(
//       {
//         success: true,

//         message: existingTranscript
//           ? "Transcript regenerated and updated successfully."
//           : "Transcript generated and saved successfully.",

//         selected_language: language,

//         transcription_job: job,

//         transcript,
//       },
//       {
//         status: existingTranscript ? 200 : 201,

//         headers: noStoreHeaders(),
//       },
//     );
//   } catch (error) {
//     console.error("SAVE TRANSCRIPT ERROR:", error);

//     // ======================================================
//     // FAILED JOB
//     // ======================================================

//     if (transcriptionJobId) {
//       try {
//         await db.query(
//           `
//           UPDATE transcription_jobs

//           SET
//             status = 'failed',

//             completed_at =
//               CURRENT_TIMESTAMP,

//             error_message = $1,

//             retry_count =
//               retry_count + 1,

//             updated_at =
//               CURRENT_TIMESTAMP

//           WHERE id = $2

//             AND status <> 'completed'
//           `,
//           [error.message, transcriptionJobId],
//         );
//       } catch (jobError) {
//         console.error("UPDATE TRANSCRIPTION JOB ERROR:", jobError);
//       }
//     }

//     // ======================================================
//     // IMPORTANT:
//     //
//     // Audio/consultation aren't marked failed here.
//     // Puter has already processed audio in browser.
//     // A DB error does not mean S3 audio is bad.
//     // ======================================================

//     return NextResponse.json(
//       {
//         success: false,

//         message: "Transcript could not be saved.",

//         error:
//           process.env.NODE_ENV === "development" ? error.message : undefined,
//       },
//       {
//         status: 500,

//         headers: noStoreHeaders(),
//       },
//     );
//   }
// }

import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ======================================================
// CONFIG
// ======================================================

const MAX_TRANSCRIPT_LENGTH = 500000;

const MAX_SEGMENTS = 10000;

const MAX_SEGMENT_TEXT_LENGTH = 50000;

const ALLOWED_PROVIDERS = ["puter"];

const ALLOWED_MODELS = [
  "gpt-4o-transcribe",
  "gpt-4o-mini-transcribe",
  "gpt-4o-transcribe-diarize",
  "whisper-1",
];

const ALLOWED_LANGUAGES = ["auto", "en", "ur", "roman-ur", "hi", "ar", "pa"];

const ALLOWED_SPEAKER_ROLES = ["doctor", "patient", "unknown"];

// ======================================================
// HEADERS
// ======================================================

function noStoreHeaders() {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  };
}

// ======================================================
// NORMALIZE SEGMENTS
// ======================================================

function normalizeSegments(rawSegments) {
  if (rawSegments === undefined || rawSegments === null) {
    return [];
  }

  if (!Array.isArray(rawSegments)) {
    throw new Error("Transcript segments must be an array.");
  }

  if (rawSegments.length > MAX_SEGMENTS) {
    throw new Error("Too many transcript segments were provided.");
  }

  return rawSegments.map((segment, index) => {
    if (!segment || typeof segment !== "object") {
      throw new Error(`Transcript segment ${index + 1} is invalid.`);
    }

    const segmentIndex = Number.isInteger(Number(segment.segment_index))
      ? Number(segment.segment_index)
      : index;

    const speaker =
      typeof segment.speaker === "string" && segment.speaker.trim()
        ? segment.speaker.trim().slice(0, 50)
        : `speaker_${index}`;

    let speakerRole = null;

    if (
      typeof segment.speaker_role === "string" &&
      segment.speaker_role.trim()
    ) {
      const normalizedRole = segment.speaker_role.trim().toLowerCase();

      if (!ALLOWED_SPEAKER_ROLES.includes(normalizedRole)) {
        throw new Error(`Unsupported speaker role in segment ${index + 1}.`);
      }

      speakerRole = normalizedRole === "unknown" ? null : normalizedRole;
    }

    const startTimeValue = Number(segment.start_time);

    const endTimeValue = Number(segment.end_time);

    const startTime =
      Number.isFinite(startTimeValue) && startTimeValue >= 0
        ? startTimeValue
        : 0;

    const endTime =
      Number.isFinite(endTimeValue) && endTimeValue >= 0
        ? endTimeValue
        : startTime;

    if (endTime < startTime) {
      throw new Error(
        `End time cannot be before start time in segment ${index + 1}.`,
      );
    }

    const text = typeof segment.text === "string" ? segment.text.trim() : "";

    if (!text) {
      throw new Error(`Transcript segment ${index + 1} has no text.`);
    }

    if (text.length > MAX_SEGMENT_TEXT_LENGTH) {
      throw new Error(`Transcript segment ${index + 1} is too large.`);
    }

    return {
      segment_index: segmentIndex,
      speaker,
      speaker_role: speakerRole,
      start_time: startTime,
      end_time: endTime,
      text,
    };
  });
}

// ======================================================
// POST
// /api/doctors/consultations/transcribe
//
// Speech recognition / diarization happens client-side
// through Puter.js.
//
// Backend:
// 1. validates doctor
// 2. validates consultation + recording
// 3. receives transcript text
// 4. receives diarized speaker segments
// 5. creates transcription job
// 6. creates/updates transcript
// 7. replaces transcript_segments
// 8. completes statuses
// ======================================================

export async function POST(request) {
  let transcriptionJobId = null;

  try {
    // ======================================================
    // SESSION
    // ======================================================

    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please login.",
        },
        {
          status: 401,
          headers: noStoreHeaders(),
        },
      );
    }

    // ======================================================
    // ROLE
    // ======================================================

    if (session.role !== "doctor") {
      return NextResponse.json(
        {
          success: false,
          message: "Only doctors can save consultation transcripts.",
        },
        {
          status: 403,
          headers: noStoreHeaders(),
        },
      );
    }

    // ======================================================
    // REQUEST BODY
    // ======================================================

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        {
          status: 400,
          headers: noStoreHeaders(),
        },
      );
    }

    const consultationId = Number(body.consultation_id);

    const audioRecordingId = Number(body.audio_recording_id);

    const transcriptText =
      typeof body.transcript_text === "string"
        ? body.transcript_text.trim()
        : "";

    const provider =
      typeof body.provider === "string"
        ? body.provider.trim().toLowerCase()
        : "puter";

    const model =
      typeof body.model === "string"
        ? body.model.trim()
        : "gpt-4o-transcribe-diarize";

    const language =
      typeof body.language === "string"
        ? body.language.trim().toLowerCase()
        : "auto";

    // ======================================================
    // IDs
    // ======================================================

    if (!Number.isInteger(consultationId) || consultationId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid consultation ID is required.",
        },
        {
          status: 400,
          headers: noStoreHeaders(),
        },
      );
    }

    if (!Number.isInteger(audioRecordingId) || audioRecordingId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid audio recording ID is required.",
        },
        {
          status: 400,
          headers: noStoreHeaders(),
        },
      );
    }

    // ======================================================
    // TRANSCRIPT TEXT
    // ======================================================

    if (!transcriptText) {
      return NextResponse.json(
        {
          success: false,
          message: "Transcript text is required.",
        },
        {
          status: 400,
          headers: noStoreHeaders(),
        },
      );
    }

    if (transcriptText.length > MAX_TRANSCRIPT_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          message: "Transcript text is too large.",
        },
        {
          status: 400,
          headers: noStoreHeaders(),
        },
      );
    }

    // ======================================================
    // PROVIDER
    // ======================================================

    if (!ALLOWED_PROVIDERS.includes(provider)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unsupported transcription provider.",
        },
        {
          status: 400,
          headers: noStoreHeaders(),
        },
      );
    }

    // ======================================================
    // MODEL
    // ======================================================

    if (!ALLOWED_MODELS.includes(model)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unsupported transcription model.",
        },
        {
          status: 400,
          headers: noStoreHeaders(),
        },
      );
    }

    // ======================================================
    // LANGUAGE
    // ======================================================

    if (!ALLOWED_LANGUAGES.includes(language)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unsupported transcript language.",
        },
        {
          status: 400,
          headers: noStoreHeaders(),
        },
      );
    }

    // ======================================================
    // SEGMENTS
    // ======================================================

    let segments;

    try {
      segments = normalizeSegments(body.segments);
    } catch (segmentError) {
      return NextResponse.json(
        {
          success: false,
          message: segmentError.message,
        },
        {
          status: 400,
          headers: noStoreHeaders(),
        },
      );
    }

    // Diarization model must return segments.
    if (model === "gpt-4o-transcribe-diarize" && segments.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Speaker-separated transcript segments are required for diarized transcription.",
        },
        {
          status: 400,
          headers: noStoreHeaders(),
        },
      );
    }

    // ======================================================
    // DOCTOR ACCOUNT
    // ======================================================

    const doctorResult = await db.query(
      `
      SELECT
        id,
        role,
        is_active

      FROM users

      WHERE id = $1
        AND role = 'doctor'

      LIMIT 1
      `,
      [session.userId],
    );

    if (doctorResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor account not found.",
        },
        {
          status: 404,
          headers: noStoreHeaders(),
        },
      );
    }

    const doctor = doctorResult.rows[0];

    if (!doctor.is_active) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor account is inactive.",
        },
        {
          status: 403,
          headers: noStoreHeaders(),
        },
      );
    }

    // ======================================================
    // CONSULTATION + AUDIO
    // ======================================================

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
          message: "Audio recording was not found for this consultation.",
        },
        {
          status: 404,
          headers: noStoreHeaders(),
        },
      );
    }

    const recording = recordingResult.rows[0];

    // ======================================================
    // OWNERSHIP
    // ======================================================

    if (String(recording.doctor_id) !== String(session.userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "This consultation does not belong to you.",
        },
        {
          status: 403,
          headers: noStoreHeaders(),
        },
      );
    }

    // ======================================================
    // COMPLETED CONSULTATION
    // ======================================================

    if (recording.consultation_status === "completed") {
      return NextResponse.json(
        {
          success: false,
          message: "A completed consultation cannot be transcribed again.",
        },
        {
          status: 400,
          headers: noStoreHeaders(),
        },
      );
    }

    // ======================================================
    // STORAGE
    // ======================================================

    if (!recording.storage_key) {
      return NextResponse.json(
        {
          success: false,
          message: "Audio storage information is missing.",
        },
        {
          status: 400,
          headers: noStoreHeaders(),
        },
      );
    }

    // ======================================================
    // EXISTING TRANSCRIPT
    // ======================================================

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

        ORDER BY
          created_at DESC,
          id DESC

        LIMIT 1
        `,
      [consultationId],
    );

    const existingTranscript = existingTranscriptResult.rows[0] || null;

    // ======================================================
    // REVIEWED TRANSCRIPT
    // ======================================================

    if (existingTranscript?.status === "reviewed") {
      return NextResponse.json(
        {
          success: false,

          message:
            "This transcript has already been reviewed and cannot be overwritten.",

          transcript: existingTranscript,
        },
        {
          status: 409,
          headers: noStoreHeaders(),
        },
      );
    }

    // ======================================================
    // RUNNING JOB
    // ======================================================

    const runningJobResult = await db.query(
      `
      SELECT
        id,
        audio_recording_id,
        status,
        provider,
        model,
        language,
        created_at

      FROM transcription_jobs

      WHERE audio_recording_id = $1

        AND status IN (
          'queued',
          'processing'
        )

      ORDER BY
        created_at DESC,
        id DESC

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
        {
          status: 409,
          headers: noStoreHeaders(),
        },
      );
    }

    // ======================================================
    // WORD COUNT
    // ======================================================

    const wordCount = transcriptText.split(/\s+/).filter(Boolean).length;

    // ======================================================
    // TRANSACTION
    // ======================================================

    const client = await db.connect();

    let job = null;
    let transcript = null;
    let savedSegments = [];

    try {
      await client.query("BEGIN");

      // ====================================================
      // JOB
      // ====================================================

      const jobResult = await client.query(
        `
        INSERT INTO transcription_jobs (
          audio_recording_id,
          status,
          provider,
          model,
          language,
          started_at
        )

        VALUES (
          $1,
          'processing',
          $2,
          $3,
          $4,
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
        [audioRecordingId, provider, model, language],
      );

      job = jobResult.rows[0];

      transcriptionJobId = job.id;

      // ====================================================
      // AUDIO PROCESSING
      // ====================================================

      await client.query(
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

      // ====================================================
      // CONSULTATION PROCESSING
      // ====================================================

      await client.query(
        `
        UPDATE consultations

        SET
          status = 'processing',
          updated_at = CURRENT_TIMESTAMP

        WHERE id = $1
          AND doctor_id = $2
        `,
        [consultationId, session.userId],
      );

      // ====================================================
      // CREATE / UPDATE TRANSCRIPT
      // ====================================================

      let transcriptResult;

      if (existingTranscript) {
        transcriptResult = await client.query(
          `
          UPDATE transcripts

          SET
            transcription_job_id = $1,
            status = 'ready',
            language = $2,
            full_text = $3,
            edited_text = NULL,
            word_count = $4,
            confidence = NULL,
            reviewed_by = NULL,
            reviewed_at = NULL,
            updated_at = CURRENT_TIMESTAMP

          WHERE consultation_id = $5

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
          [
            transcriptionJobId,
            language,
            transcriptText,
            wordCount,
            consultationId,
          ],
        );
      } else {
        transcriptResult = await client.query(
          `
          INSERT INTO transcripts (
            consultation_id,
            transcription_job_id,
            status,
            language,
            full_text,
            word_count
          )

          VALUES (
            $1,
            $2,
            'ready',
            $3,
            $4,
            $5
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
          [
            consultationId,
            transcriptionJobId,
            language,
            transcriptText,
            wordCount,
          ],
        );
      }

      transcript = transcriptResult.rows[0];

      // ====================================================
      // REMOVE OLD SEGMENTS
      //
      // Regeneration completely replaces previous
      // diarization data.
      // ====================================================

      await client.query(
        `
        DELETE FROM transcript_segments

        WHERE transcript_id = $1
        `,
        [transcript.id],
      );

      // ====================================================
      // INSERT NEW SEGMENTS
      // ====================================================

      for (const segment of segments) {
        const segmentResult = await client.query(
          `
          INSERT INTO transcript_segments (
            transcript_id,
            segment_index,
            speaker,
            speaker_role,
            start_time,
            end_time,
            text
          )

          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7
          )

          RETURNING
            id,
            transcript_id,
            segment_index,
            speaker,
            speaker_role,
            start_time,
            end_time,
            text,
            created_at,
            updated_at
          `,
          [
            transcript.id,
            segment.segment_index,
            segment.speaker,
            segment.speaker_role,
            segment.start_time,
            segment.end_time,
            segment.text,
          ],
        );

        savedSegments.push(segmentResult.rows[0]);
      }

      // ====================================================
      // COMPLETE JOB
      // ====================================================

      const completedJobResult = await client.query(
        `
          UPDATE transcription_jobs

          SET
            status = 'completed',
            language = $1,
            completed_at = CURRENT_TIMESTAMP,
            error_message = NULL,
            updated_at = CURRENT_TIMESTAMP

          WHERE id = $2

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
        [language, transcriptionJobId],
      );

      job = completedJobResult.rows[0];

      // ====================================================
      // AUDIO COMPLETE
      // ====================================================

      await client.query(
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

      // ====================================================
      // CONSULTATION TRANSCRIBED
      // ====================================================

      await client.query(
        `
        UPDATE consultations

        SET
          status = 'transcribed',
          updated_at = CURRENT_TIMESTAMP

        WHERE id = $1
          AND doctor_id = $2
        `,
        [consultationId, session.userId],
      );

      // ====================================================
      // AUDIT LOG
      // ====================================================

      try {
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

            existingTranscript
              ? "REGENERATE_TRANSCRIPT"
              : "GENERATE_TRANSCRIPT",

            "transcript",

            transcript.id,

            JSON.stringify({
              consultation_id: consultationId,

              appointment_id: recording.appointment_id,

              patient_id: recording.patient_id,

              doctor_id: session.userId,

              audio_recording_id: audioRecordingId,

              transcription_job_id: transcriptionJobId,

              provider,

              model,

              language,

              word_count: wordCount,

              segment_count: savedSegments.length,

              diarization: model === "gpt-4o-transcribe-diarize",

              previous_transcript_id: existingTranscript?.id || null,

              previous_language: existingTranscript?.language || null,

              previous_text: existingTranscript?.full_text || null,

              source: "browser_puter_speech_to_text",
            }),
          ],
        );
      } catch (auditError) {
        console.error("TRANSCRIPT AUDIT ERROR:", auditError);
      }

      // ====================================================
      // COMMIT
      // ====================================================

      await client.query("COMMIT");
    } catch (databaseError) {
      try {
        await client.query("ROLLBACK");
      } catch {}

      throw databaseError;
    } finally {
      client.release();
    }

    // ======================================================
    // RESPONSE
    // ======================================================

    return NextResponse.json(
      {
        success: true,

        message: existingTranscript
          ? "Transcript regenerated and updated successfully."
          : "Transcript generated and saved successfully.",

        selected_language: language,

        transcription_job: job,

        transcript,

        transcript_segments: savedSegments,

        speaker_summary: {
          total_segments: savedSegments.length,

          doctor_segments: savedSegments.filter(
            (segment) => segment.speaker_role === "doctor",
          ).length,

          patient_segments: savedSegments.filter(
            (segment) => segment.speaker_role === "patient",
          ).length,

          unidentified_segments: savedSegments.filter(
            (segment) => !segment.speaker_role,
          ).length,
        },
      },
      {
        status: existingTranscript ? 200 : 201,

        headers: noStoreHeaders(),
      },
    );
  } catch (error) {
    console.error("SAVE TRANSCRIPT ERROR:", error);

    // ======================================================
    // FAILED JOB
    // ======================================================

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
            AND status <> 'completed'
          `,
          [error.message, transcriptionJobId],
        );
      } catch (jobError) {
        console.error("UPDATE TRANSCRIPTION JOB ERROR:", jobError);
      }
    }

    return NextResponse.json(
      {
        success: false,

        message: "Transcript could not be saved.",

        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      {
        status: 500,

        headers: noStoreHeaders(),
      },
    );
  }
}
