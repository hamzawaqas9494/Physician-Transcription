// // import { NextResponse } from "next/server";

// // import { mkdir, writeFile } from "fs/promises";
// // import path from "path";

// // import { db } from "@/lib/db";
// // import { getSession } from "@/lib/auth";

// // export const runtime = "nodejs";

// // // ======================================================
// // // POST /api/doctor/consultations/audio
// // // UPLOAD CONSULTATION AUDIO
// // // ======================================================

// // export async function POST(request) {
// //   try {
// //     // =========================
// //     // SESSION
// //     // =========================

// //     const session = await getSession();

// //     if (!session) {
// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "Unauthorized. Please login.",
// //         },
// //         { status: 401 },
// //       );
// //     }

// //     if (session.role !== "doctor") {
// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "Only doctors can upload consultation audio.",
// //         },
// //         { status: 403 },
// //       );
// //     }

// //     // =========================
// //     // FORM DATA
// //     // =========================

// //     const formData = await request.formData();

// //     const audio = formData.get("audio");

// //     const consultationId = Number(formData.get("consultation_id"));

// //     const durationSeconds = Number(formData.get("duration_seconds") || 0);

// //     // =========================
// //     // VALIDATION
// //     // =========================

// //     if (!consultationId || Number.isNaN(consultationId)) {
// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "Valid consultation ID is required.",
// //         },
// //         { status: 400 },
// //       );
// //     }

// //     if (!audio || typeof audio === "string") {
// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "Audio file is required.",
// //         },
// //         { status: 400 },
// //       );
// //     }

// //     // =========================
// //     // CONSULTATION CHECK
// //     // =========================

// //     const consultationResult = await db.query(
// //       `
// //       SELECT
// //         id,
// //         appointment_id,
// //         patient_id,
// //         doctor_id,
// //         status

// //       FROM consultations

// //       WHERE id = $1

// //       LIMIT 1
// //       `,
// //       [consultationId],
// //     );

// //     if (consultationResult.rows.length === 0) {
// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "Consultation not found.",
// //         },
// //         { status: 404 },
// //       );
// //     }

// //     const consultation = consultationResult.rows[0];

// //     if (Number(consultation.doctor_id) !== Number(session.userId)) {
// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "This consultation does not belong to you.",
// //         },
// //         { status: 403 },
// //       );
// //     }

// //     if (consultation.status === "completed") {
// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "Audio cannot be uploaded to a completed consultation.",
// //         },
// //         { status: 400 },
// //       );
// //     }

// //     // =========================
// //     // FILE INFORMATION
// //     // =========================

// //     const bytes = await audio.arrayBuffer();

// //     const buffer = Buffer.from(bytes);

// //     const mimeType = audio.type || "audio/webm";

// //     let extension = "webm";

// //     if (mimeType.includes("ogg")) {
// //       extension = "ogg";
// //     } else if (mimeType.includes("mp4")) {
// //       extension = "mp4";
// //     } else if (mimeType.includes("mpeg")) {
// //       extension = "mp3";
// //     } else if (mimeType.includes("wav")) {
// //       extension = "wav";
// //     }

// //     const fileName = `consultation-${consultationId}-${Date.now()}.${extension}`;

// //     // =========================
// //     // STORAGE DIRECTORY
// //     // =========================

// //     const uploadDirectory = path.join(
// //       process.cwd(),
// //       "public",
// //       "uploads",
// //       "audio",
// //     );

// //     await mkdir(uploadDirectory, {
// //       recursive: true,
// //     });

// //     const absoluteFilePath = path.join(uploadDirectory, fileName);

// //     await writeFile(absoluteFilePath, buffer);

// //     // Public-facing storage key
// //     const storageKey = `/uploads/audio/${fileName}`;

// //     // =========================
// //     // AUDIO DB RECORD
// //     // =========================

// //     const audioResult = await db.query(
// //       `
// //       INSERT INTO audio_recordings (
// //         consultation_id,
// //         storage_key,
// //         original_file_name,
// //         mime_type,
// //         file_size,
// //         duration_seconds,
// //         status
// //       )

// //       VALUES (
// //         $1,
// //         $2,
// //         $3,
// //         $4,
// //         $5,
// //         $6,
// //         'uploaded'
// //       )

// //       RETURNING
// //         id,
// //         consultation_id,
// //         storage_key,
// //         original_file_name,
// //         mime_type,
// //         file_size,
// //         duration_seconds,
// //         status,
// //         error_message,
// //         created_at,
// //         updated_at
// //       `,
// //       [
// //         consultationId,
// //         storageKey,
// //         audio.name || fileName,
// //         mimeType,
// //         buffer.length,
// //         durationSeconds || null,
// //       ],
// //     );

// //     const recording = audioResult.rows[0];

// //     // =========================
// //     // CONSULTATION STATUS
// //     // =========================

// //     await db.query(
// //       `
// //       UPDATE consultations

// //       SET
// //         status = 'recorded',
// //         updated_at = CURRENT_TIMESTAMP

// //       WHERE id = $1
// //       `,
// //       [consultationId],
// //     );

// //     // =========================
// //     // AUDIT LOG
// //     // =========================

// //     await db.query(
// //       `
// //       INSERT INTO audit_logs (
// //         user_id,
// //         action,
// //         entity_type,
// //         entity_id,
// //         details
// //       )

// //       VALUES (
// //         $1,
// //         $2,
// //         $3,
// //         $4,
// //         $5
// //       )
// //       `,
// //       [
// //         session.userId,
// //         "UPLOAD_CONSULTATION_AUDIO",
// //         "audio_recording",
// //         recording.id,

// //         JSON.stringify({
// //           consultation_id: consultationId,

// //           appointment_id: consultation.appointment_id,

// //           patient_id: consultation.patient_id,

// //           storage_key: storageKey,

// //           duration_seconds: durationSeconds || null,

// //           file_size: buffer.length,
// //         }),
// //       ],
// //     );

// //     // =========================
// //     // RESPONSE
// //     // =========================

// //     return NextResponse.json(
// //       {
// //         success: true,
// //         message: "Audio uploaded successfully.",
// //         audio_recording: recording,
// //       },
// //       { status: 201 },
// //     );
// //   } catch (error) {
// //     console.error("UPLOAD CONSULTATION AUDIO ERROR:", error);

// //     return NextResponse.json(
// //       {
// //         success: false,
// //         message: "Unable to upload consultation audio.",
// //         error: error.message,
// //       },
// //       { status: 500 },
// //     );
// //   }
// // }

// import { NextResponse } from "next/server";
// import crypto from "crypto";

// import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// import { db } from "@/lib/db";
// import { getSession } from "@/lib/auth";
// import { s3 } from "@/lib/s3";

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// // ======================================================
// // CONFIG
// // ======================================================

// // 100 MB
// const MAX_AUDIO_SIZE = 100 * 1024 * 1024;

// const ALLOWED_AUDIO_TYPES = {
//   "audio/webm": "webm",
//   "audio/webm;codecs=opus": "webm",
//   "audio/ogg": "ogg",
//   "audio/ogg;codecs=opus": "ogg",
//   "audio/mp4": "mp4",
//   "audio/mpeg": "mp3",
//   "audio/wav": "wav",
//   "audio/x-wav": "wav",
// };

// // ======================================================
// // ENV
// // ======================================================

// function getBucketName() {
//   const bucket = process.env.AWS_S3_BUCKET_NAME;

//   if (!bucket) {
//     throw new Error("AWS_S3_BUCKET_NAME is not configured.");
//   }

//   return bucket;
// }

// // ======================================================
// // NORMALIZE MIME TYPE
// // ======================================================

// function normalizeMimeType(mimeType) {
//   if (!mimeType) {
//     return "audio/webm";
//   }

//   return mimeType.toLowerCase().trim();
// }

// // ======================================================
// // GET FILE EXTENSION
// // ======================================================

// function getAudioExtension(mimeType) {
//   const normalized = normalizeMimeType(mimeType);

//   if (ALLOWED_AUDIO_TYPES[normalized]) {
//     return ALLOWED_AUDIO_TYPES[normalized];
//   }

//   // Browser may return:
//   // audio/webm;codecs=opus
//   if (normalized.startsWith("audio/webm")) {
//     return "webm";
//   }

//   if (normalized.startsWith("audio/ogg")) {
//     return "ogg";
//   }

//   if (normalized.startsWith("audio/mp4")) {
//     return "mp4";
//   }

//   if (normalized.startsWith("audio/mpeg")) {
//     return "mp3";
//   }

//   if (
//     normalized.startsWith("audio/wav") ||
//     normalized.startsWith("audio/x-wav")
//   ) {
//     return "wav";
//   }

//   return null;
// }

// // ======================================================
// // CHECK ALLOWED MIME TYPE
// // ======================================================

// function isAllowedAudioType(mimeType) {
//   return Boolean(getAudioExtension(mimeType));
// }

// // ======================================================
// // DELETE S3 OBJECT
// // Used if database operation fails after S3 upload.
// // ======================================================

// async function deleteS3Object(storageKey) {
//   if (!storageKey) {
//     return;
//   }

//   try {
//     await s3.send(
//       new DeleteObjectCommand({
//         Bucket: getBucketName(),
//         Key: storageKey,
//       }),
//     );
//   } catch (error) {
//     console.error("DELETE AUDIO FROM S3 ERROR:", error);
//   }
// }

// // ======================================================
// // CREATE SIGNED AUDIO URL
// // ======================================================

// async function createSignedAudioUrl(storageKey) {
//   if (!storageKey) {
//     return null;
//   }

//   return await getSignedUrl(
//     s3,
//     new (await import("@aws-sdk/client-s3")).GetObjectCommand({
//       Bucket: getBucketName(),
//       Key: storageKey,
//     }),
//     {
//       expiresIn: 60 * 60, // 1 hour
//     },
//   );
// }

// // ======================================================
// // POST /api/doctors/consultations/audio
// // UPLOAD CONSULTATION AUDIO TO AWS S3
// // ======================================================

// export async function POST(request) {
//   let uploadedStorageKey = null;

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
//           message: "Only doctors can upload consultation audio.",
//         },
//         {
//           status: 403,
//         },
//       );
//     }

//     // ======================================================
//     // FORM DATA
//     // ======================================================

//     const formData = await request.formData();

//     const audio = formData.get("audio");

//     const consultationIdRaw = formData.get("consultation_id");

//     const durationSecondsRaw = formData.get("duration_seconds");

//     const consultationId = Number(consultationIdRaw);

//     const durationSeconds = Number(durationSecondsRaw || 0);

//     // ======================================================
//     // CONSULTATION ID VALIDATION
//     // ======================================================

//     if (!Number.isInteger(consultationId) || consultationId <= 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Valid consultation ID is required.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ======================================================
//     // AUDIO VALIDATION
//     // ======================================================

//     if (!audio || typeof audio === "string") {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Audio file is required.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ======================================================
//     // EMPTY FILE
//     // ======================================================

//     if (!audio.size || audio.size <= 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "The selected audio file is empty.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ======================================================
//     // FILE SIZE
//     // ======================================================

//     if (audio.size > MAX_AUDIO_SIZE) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Audio recording must be 100 MB or smaller.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ======================================================
//     // MIME TYPE
//     // ======================================================

//     const mimeType = normalizeMimeType(audio.type || "audio/webm");

//     if (!isAllowedAudioType(mimeType)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Unsupported audio format. WebM, OGG, MP4, MP3 and WAV are allowed.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ======================================================
//     // DURATION VALIDATION
//     // ======================================================

//     if (Number.isNaN(durationSeconds) || durationSeconds < 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid audio duration.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ======================================================
//     // DOCTOR ACCOUNT CHECK
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
//         },
//       );
//     }

//     // ======================================================
//     // CONSULTATION CHECK
//     // ======================================================

//     const consultationResult = await db.query(
//       `
//       SELECT
//         id,
//         appointment_id,
//         patient_id,
//         doctor_id,
//         status,
//         started_at,
//         completed_at,
//         created_at,
//         updated_at

//       FROM consultations

//       WHERE id = $1

//       LIMIT 1
//       `,
//       [consultationId],
//     );

//     if (consultationResult.rows.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Consultation not found.",
//         },
//         {
//           status: 404,
//         },
//       );
//     }

//     const consultation = consultationResult.rows[0];

//     // ======================================================
//     // CONSULTATION OWNERSHIP
//     // ======================================================

//     if (String(consultation.doctor_id) !== String(session.userId)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "This consultation does not belong to you.",
//         },
//         {
//           status: 403,
//         },
//       );
//     }

//     // ======================================================
//     // COMPLETED CONSULTATION
//     // ======================================================

//     if (consultation.status === "completed") {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Audio cannot be uploaded to a completed consultation.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ======================================================
//     // CREATE BUFFER
//     // ======================================================

//     const bytes = await audio.arrayBuffer();

//     const buffer = Buffer.from(bytes);

//     if (buffer.length <= 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "The uploaded audio file is empty.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ======================================================
//     // FILE INFORMATION
//     // ======================================================

//     const extension = getAudioExtension(mimeType);

//     const uniqueId = crypto.randomUUID();

//     const fileName = `consultation-${consultationId}-${uniqueId}.${extension}`;

//     // ======================================================
//     // S3 STORAGE KEY
//     //
//     // IMPORTANT:
//     // Database stores only this key.
//     // Do NOT save signed URL in database.
//     // ======================================================

//     const storageKey =
//       `audio/consultations/doctors/` + `${session.userId}/` + `${fileName}`;

//     // ======================================================
//     // UPLOAD TO AWS S3
//     // ======================================================

//     await s3.send(
//       new PutObjectCommand({
//         Bucket: getBucketName(),

//         Key: storageKey,

//         Body: buffer,

//         ContentType: mimeType,

//         ContentLength: buffer.length,

//         Metadata: {
//           consultation_id: String(consultationId),
//           doctor_id: String(session.userId),
//           patient_id: String(consultation.patient_id),
//         },
//       }),
//     );

//     uploadedStorageKey = storageKey;

//     // ======================================================
//     // DATABASE TRANSACTION
//     // ======================================================

//     const client = await db.connect();

//     let recording;

//     try {
//       await client.query("BEGIN");

//       // ====================================================
//       // AUDIO RECORD
//       // ====================================================

//       const audioResult = await client.query(
//         `
//         INSERT INTO audio_recordings (
//           consultation_id,
//           storage_key,
//           original_file_name,
//           mime_type,
//           file_size,
//           duration_seconds,
//           status
//         )

//         VALUES (
//           $1,
//           $2,
//           $3,
//           $4,
//           $5,
//           $6,
//           'uploaded'
//         )

//         RETURNING
//           id,
//           consultation_id,
//           storage_key,
//           original_file_name,
//           mime_type,
//           file_size,
//           duration_seconds,
//           status,
//           error_message,
//           created_at,
//           updated_at
//         `,
//         [
//           consultationId,

//           storageKey,

//           audio.name || fileName,

//           mimeType,

//           buffer.length,

//           durationSeconds > 0 ? durationSeconds : null,
//         ],
//       );

//       recording = audioResult.rows[0];

//       // ====================================================
//       // CONSULTATION STATUS
//       // ====================================================

//       await client.query(
//         `
//         UPDATE consultations

//         SET
//           status = 'recorded',
//           updated_at = CURRENT_TIMESTAMP

//         WHERE id = $1
//           AND doctor_id = $2
//         `,
//         [consultationId, session.userId],
//       );

//       // ====================================================
//       // AUDIT LOG
//       // ====================================================

//       await client.query(
//         `
//         INSERT INTO audit_logs (
//           user_id,
//           action,
//           entity_type,
//           entity_id,
//           details
//         )

//         VALUES (
//           $1,
//           $2,
//           $3,
//           $4,
//           $5
//         )
//         `,
//         [
//           session.userId,

//           "UPLOAD_CONSULTATION_AUDIO",

//           "audio_recording",

//           recording.id,

//           JSON.stringify({
//             consultation_id: consultationId,

//             appointment_id: consultation.appointment_id,

//             patient_id: consultation.patient_id,

//             doctor_id: session.userId,

//             storage_provider: "aws_s3",

//             storage_key: storageKey,

//             original_file_name: audio.name || fileName,

//             mime_type: mimeType,

//             duration_seconds: durationSeconds > 0 ? durationSeconds : null,

//             file_size: buffer.length,
//           }),
//         ],
//       );

//       await client.query("COMMIT");
//     } catch (databaseError) {
//       await client.query("ROLLBACK");

//       // DB failed after S3 upload.
//       // Remove orphan file from bucket.
//       await deleteS3Object(storageKey);

//       uploadedStorageKey = null;

//       throw databaseError;
//     } finally {
//       client.release();
//     }

//     // ======================================================
//     // DATABASE + S3 SUCCESS
//     // ======================================================

//     uploadedStorageKey = null;

//     // ======================================================
//     // CREATE TEMPORARY SIGNED URL
//     //
//     // URL is returned to frontend but NOT stored in DB.
//     // ======================================================

//     let audioUrl = null;

//     try {
//       audioUrl = await createSignedAudioUrl(recording.storage_key);
//     } catch (signedUrlError) {
//       console.error("CREATE AUDIO SIGNED URL ERROR:", signedUrlError);
//     }

//     // ======================================================
//     // RESPONSE
//     // ======================================================

//     return NextResponse.json(
//       {
//         success: true,

//         message: "Audio uploaded successfully.",

//         audio_recording: {
//           ...recording,

//           audio_url: audioUrl,
//         },
//       },
//       {
//         status: 201,

//         headers: {
//           "Cache-Control":
//             "no-store, no-cache, must-revalidate, proxy-revalidate",
//         },
//       },
//     );
//   } catch (error) {
//     console.error("UPLOAD CONSULTATION AUDIO ERROR:", error);

//     // ======================================================
//     // CLEANUP ORPHAN S3 FILE
//     // ======================================================

//     if (uploadedStorageKey) {
//       await deleteS3Object(uploadedStorageKey);
//     }

//     // ======================================================
//     // ERROR RESPONSE
//     // ======================================================

//     return NextResponse.json(
//       {
//         success: false,

//         message: "Unable to upload consultation audio.",

//         error:
//           process.env.NODE_ENV === "development" ? error.message : undefined,
//       },
//       {
//         status: 500,
//       },
//     );
//   }
// }

import { NextResponse } from "next/server";
import crypto from "crypto";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

import { uploadFileToS3, deleteFileFromS3, getPrivateFileUrl } from "@/lib/s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ======================================================
// CONFIG
// ======================================================

const MAX_AUDIO_SIZE = 100 * 1024 * 1024; // 100 MB

const ALLOWED_AUDIO_TYPES = {
  "audio/webm": "webm",
  "audio/webm;codecs=opus": "webm",

  "audio/ogg": "ogg",
  "audio/ogg;codecs=opus": "ogg",

  "audio/mp4": "mp4",
  "audio/m4a": "m4a",
  "audio/x-m4a": "m4a",

  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",

  "audio/wav": "wav",
  "audio/x-wav": "wav",
};

// ======================================================
// NORMALIZE MIME TYPE
// ======================================================

function normalizeMimeType(mimeType) {
  if (!mimeType || typeof mimeType !== "string") {
    return "audio/webm";
  }

  return mimeType.toLowerCase().trim();
}

// ======================================================
// GET EXTENSION
// ======================================================

function getAudioExtension(mimeType) {
  const normalized = normalizeMimeType(mimeType);

  // Exact match
  if (ALLOWED_AUDIO_TYPES[normalized]) {
    return ALLOWED_AUDIO_TYPES[normalized];
  }

  // Browser can return:
  // audio/webm;codecs=opus
  if (normalized.startsWith("audio/webm")) {
    return "webm";
  }

  if (normalized.startsWith("audio/ogg")) {
    return "ogg";
  }

  if (normalized.startsWith("audio/mp4")) {
    return "mp4";
  }

  if (normalized.startsWith("audio/mpeg")) {
    return "mp3";
  }

  if (normalized.startsWith("audio/wav")) {
    return "wav";
  }

  if (normalized.startsWith("audio/x-wav")) {
    return "wav";
  }

  if (normalized.startsWith("audio/m4a")) {
    return "m4a";
  }

  if (normalized.startsWith("audio/x-m4a")) {
    return "m4a";
  }

  return null;
}

// ======================================================
// SAFE S3 DELETE
// ======================================================

async function safeDeleteFromS3(storageKey) {
  if (!storageKey) {
    return;
  }

  try {
    await deleteFileFromS3(storageKey);
  } catch (error) {
    console.error("DELETE AUDIO FROM S3 ERROR:", error);
  }
}

// ======================================================
// POST
// /api/doctors/consultations/audio
//
// Upload consultation audio to AWS S3
// ======================================================

export async function POST(request) {
  let uploadedS3Key = null;

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
        { status: 401 },
      );
    }

    // ======================================================
    // ROLE
    // ======================================================

    if (session.role !== "doctor") {
      return NextResponse.json(
        {
          success: false,
          message: "Only doctors can upload consultation audio.",
        },
        { status: 403 },
      );
    }

    // ======================================================
    // FORM DATA
    // ======================================================

    const formData = await request.formData();

    const audio = formData.get("audio");

    const consultationId = Number(formData.get("consultation_id"));

    const durationValue = Number(formData.get("duration_seconds") || 0);

    const durationSeconds =
      Number.isFinite(durationValue) && durationValue > 0
        ? durationValue
        : null;

    // ======================================================
    // CONSULTATION ID VALIDATION
    // ======================================================

    if (!Number.isInteger(consultationId) || consultationId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid consultation ID is required.",
        },
        { status: 400 },
      );
    }

    // ======================================================
    // AUDIO VALIDATION
    // ======================================================

    if (!audio || typeof audio === "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Audio file is required.",
        },
        { status: 400 },
      );
    }

    if (audio.size <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "The selected audio file is empty.",
        },
        { status: 400 },
      );
    }

    if (audio.size > MAX_AUDIO_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "Audio file must be 100 MB or smaller.",
        },
        { status: 400 },
      );
    }

    // ======================================================
    // MIME TYPE
    // ======================================================

    const mimeType = normalizeMimeType(audio.type || "audio/webm");

    const extension = getAudioExtension(mimeType);

    if (!extension) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unsupported audio format. Please use WebM, OGG, MP4, M4A, MP3 or WAV.",
        },
        { status: 400 },
      );
    }

    // ======================================================
    // CONSULTATION CHECK
    //
    // IMPORTANT:
    // Only columns from your existing consultations table
    // are being used here.
    // ======================================================

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

    // ======================================================
    // OWNERSHIP
    // ======================================================

    if (String(consultation.doctor_id) !== String(session.userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "This consultation does not belong to you.",
        },
        { status: 403 },
      );
    }

    // ======================================================
    // COMPLETED CONSULTATION
    // ======================================================

    if (consultation.status === "completed") {
      return NextResponse.json(
        {
          success: false,
          message: "Audio cannot be uploaded to a completed consultation.",
        },
        { status: 400 },
      );
    }

    // ======================================================
    // AUDIO BUFFER
    // ======================================================

    const arrayBuffer = await audio.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "The audio file contains no data.",
        },
        { status: 400 },
      );
    }

    // ======================================================
    // ORIGINAL FILE NAME
    // ======================================================

    const originalFileName =
      typeof audio.name === "string" && audio.name.trim()
        ? audio.name.trim()
        : `consultation-${consultationId}.${extension}`;

    // ======================================================
    // S3 KEY
    //
    // Bucket:
    // physician-transcription-storage
    //
    // Structure:
    // audio/
    //   consultations/
    //     consultation-ID/
    //       doctor-ID-UUID.webm
    // ======================================================

    const uniqueId = crypto.randomUUID();

    const storageKey =
      `audio/consultations/consultation-${consultationId}/` +
      `doctor-${session.userId}-${uniqueId}.${extension}`;

    // ======================================================
    // CHECK EXISTING RECORDING
    //
    // We keep only the latest recording for this
    // consultation in this workflow.
    // ======================================================

    const existingRecordingResult = await db.query(
      `
      SELECT
        id,
        storage_key

      FROM audio_recordings

      WHERE consultation_id = $1

      ORDER BY created_at DESC

      LIMIT 1
      `,
      [consultationId],
    );

    const existingRecording = existingRecordingResult.rows[0] || null;

    // ======================================================
    // UPLOAD TO AWS S3
    // ======================================================

    await uploadFileToS3({
      key: storageKey,

      buffer,

      contentType: mimeType,

      metadata: {
        consultation_id: String(consultationId),

        doctor_id: String(session.userId),

        patient_id: String(consultation.patient_id),

        appointment_id: String(consultation.appointment_id),

        upload_type: "consultation-audio",
      },
    });

    uploadedS3Key = storageKey;

    // ======================================================
    // DATABASE TRANSACTION
    // ======================================================

    const client = await db.connect();

    let recording;

    try {
      await client.query("BEGIN");

      // ====================================================
      // INSERT AUDIO RECORD
      //
      // Existing columns:
      //
      // consultation_id
      // storage_key
      // original_file_name
      // mime_type
      // file_size
      // duration_seconds
      // status
      // ====================================================

      const audioResult = await client.query(
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
          originalFileName,
          mimeType,
          buffer.length,
          durationSeconds,
        ],
      );

      recording = audioResult.rows[0];

      // ====================================================
      // CONSULTATION STATUS
      // ====================================================

      await client.query(
        `
        UPDATE consultations

        SET
          status = 'recorded',
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

            "UPLOAD_CONSULTATION_AUDIO",

            "audio_recording",

            recording.id,

            JSON.stringify({
              consultation_id: consultationId,

              appointment_id: consultation.appointment_id,

              patient_id: consultation.patient_id,

              doctor_id: consultation.doctor_id,

              storage_key: storageKey,

              original_file_name: originalFileName,

              mime_type: mimeType,

              file_size: buffer.length,

              duration_seconds: durationSeconds,

              storage_provider: "aws_s3",

              replaced_audio_recording_id: existingRecording?.id || null,

              replaced_storage_key: existingRecording?.storage_key || null,
            }),
          ],
        );
      } catch (auditError) {
        // Audit failure should not fail actual upload
        console.error("CONSULTATION AUDIO AUDIT ERROR:", auditError);
      }

      await client.query("COMMIT");
    } catch (databaseError) {
      try {
        await client.query("ROLLBACK");
      } catch {}

      // DB failed, remove newly uploaded S3 object
      await safeDeleteFromS3(storageKey);

      uploadedS3Key = null;

      throw databaseError;
    } finally {
      client.release();
    }

    // ======================================================
    // NEW RECORD IS NOW VALID
    // ======================================================

    uploadedS3Key = null;

    // ======================================================
    // DELETE OLD RECORDING
    //
    // DB currently keeps its old record for history,
    // therefore DON'T delete its S3 file unless we also
    // remove/update that DB row.
    //
    // This prevents broken historical DB references.
    // ======================================================

    // We intentionally do NOT delete:
    //
    // existingRecording.storage_key
    //
    // because the old audio_recordings row still exists.

    // ======================================================
    // SIGNED PRIVATE AUDIO URL
    // ======================================================

    let audioUrl = null;

    try {
      audioUrl = await getPrivateFileUrl(recording.storage_key, 60 * 60);
    } catch (signedUrlError) {
      console.error("GENERATE AUDIO SIGNED URL ERROR:", signedUrlError);
    }

    // ======================================================
    // RESPONSE
    // ======================================================

    return NextResponse.json(
      {
        success: true,

        message: "Audio uploaded successfully.",

        audio_recording: {
          ...recording,

          // Temporary signed URL for <audio src="">
          audio_url: audioUrl,
        },
      },
      {
        status: 201,

        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("UPLOAD CONSULTATION AUDIO ERROR:", error);

    // ======================================================
    // EMERGENCY S3 CLEANUP
    // ======================================================

    if (uploadedS3Key) {
      await safeDeleteFromS3(uploadedS3Key);
    }

    // ======================================================
    // RESPONSE
    // ======================================================

    return NextResponse.json(
      {
        success: false,

        message: "Unable to upload consultation audio.",

        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      {
        status: 500,

        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
