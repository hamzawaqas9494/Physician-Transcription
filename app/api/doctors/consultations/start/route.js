// // // import { NextResponse } from "next/server";

// // // import { db } from "@/lib/db";
// // // import { getSession } from "@/lib/auth";

// // // export const dynamic = "force-dynamic";

// // // // ======================================================
// // // // GET /api/doctor/consultations/start?appointment=7
// // // // LOAD START CONSULTATION PAGE DATA
// // // // ======================================================

// // // export async function GET(request) {
// // //   try {
// // //     // =========================
// // //     // SESSION
// // //     // =========================

// // //     const session = await getSession();

// // //     if (!session) {
// // //       return NextResponse.json(
// // //         {
// // //           success: false,
// // //           message: "Unauthorized. Please login.",
// // //         },
// // //         { status: 401 },
// // //       );
// // //     }

// // //     // =========================
// // //     // ROLE
// // //     // =========================

// // //     if (session.role !== "doctor") {
// // //       return NextResponse.json(
// // //         {
// // //           success: false,
// // //           message: "Only doctors can access consultations.",
// // //         },
// // //         { status: 403 },
// // //       );
// // //     }

// // //     // =========================
// // //     // APPOINTMENT ID
// // //     // =========================

// // //     const { searchParams } = new URL(request.url);

// // //     const appointmentId = Number(searchParams.get("appointment"));

// // //     if (!appointmentId || Number.isNaN(appointmentId)) {
// // //       return NextResponse.json(
// // //         {
// // //           success: false,
// // //           message: "Valid appointment ID is required.",
// // //         },
// // //         { status: 400 },
// // //       );
// // //     }

// // //     // =========================
// // //     // APPOINTMENT + PATIENT
// // //     // =========================

// // //     const appointmentResult = await db.query(
// // //       `
// // //       SELECT
// // //         a.id,
// // //         a.patient_id,
// // //         a.doctor_id,
// // //         a.appointment_date,
// // //         a.appointment_time,
// // //         a.token_number,
// // //         a.status,
// // //         a.notes,
// // //         a.created_at,
// // //         a.updated_at,

// // //         p.patient_code,
// // //         p.name AS patient_name,
// // //         p.date_of_birth,
// // //         p.gender,
// // //         p.phone,
// // //         p.address,
// // //         p.emergency_contact_name,
// // //         p.emergency_contact_phone

// // //       FROM appointments a

// // //       INNER JOIN patients p
// // //         ON p.id = a.patient_id

// // //       WHERE a.id = $1

// // //       LIMIT 1
// // //       `,
// // //       [appointmentId],
// // //     );

// // //     if (appointmentResult.rows.length === 0) {
// // //       return NextResponse.json(
// // //         {
// // //           success: false,
// // //           message: "Appointment not found.",
// // //         },
// // //         { status: 404 },
// // //       );
// // //     }

// // //     const appointment = appointmentResult.rows[0];

// // //     // =========================
// // //     // DOCTOR OWNERSHIP
// // //     // =========================

// // //     if (Number(appointment.doctor_id) !== Number(session.userId)) {
// // //       return NextResponse.json(
// // //         {
// // //           success: false,
// // //           message: "This appointment does not belong to you.",
// // //         },
// // //         { status: 403 },
// // //       );
// // //     }

// // //     // =========================
// // //     // STATUS CHECK
// // //     // =========================

// // //     const allowedStatuses = ["waiting", "in_consultation"];

// // //     if (!allowedStatuses.includes(appointment.status)) {
// // //       return NextResponse.json(
// // //         {
// // //           success: false,
// // //           message: "This appointment is not ready for consultation.",
// // //         },
// // //         { status: 400 },
// // //       );
// // //     }

// // //     // =========================
// // //     // MEDICAL HISTORY
// // //     // =========================

// // //     const historyResult = await db.query(
// // //       `
// // //       SELECT
// // //         mh.id,
// // //         mh.patient_id,
// // //         mh.previous_diseases,
// // //         mh.allergies,
// // //         mh.current_medications,
// // //         mh.previous_surgeries,
// // //         mh.family_history,
// // //         mh.additional_notes,
// // //         mh.created_by,
// // //         mh.created_at,
// // //         mh.updated_at,

// // //         u.name AS created_by_name

// // //       FROM medical_history mh

// // //       LEFT JOIN users u
// // //         ON u.id = mh.created_by

// // //       WHERE mh.patient_id = $1

// // //       ORDER BY mh.created_at DESC
// // //       `,
// // //       [appointment.patient_id],
// // //     );

// // //     // =========================
// // //     // EXISTING CONSULTATION
// // //     // =========================

// // //     const consultationResult = await db.query(
// // //       `
// // //       SELECT
// // //         id,
// // //         appointment_id,
// // //         patient_id,
// // //         doctor_id,
// // //         started_at,
// // //         ended_at,
// // //         status,
// // //         clinical_notes,
// // //         diagnosis,
// // //         created_at,
// // //         updated_at

// // //       FROM consultations

// // //       WHERE appointment_id = $1

// // //       LIMIT 1
// // //       `,
// // //       [appointmentId],
// // //     );

// // //     // =========================
// // //     // RESPONSE
// // //     // =========================

// // //     return NextResponse.json(
// // //       {
// // //         success: true,

// // //         appointment: {
// // //           id: appointment.id,
// // //           patient_id: appointment.patient_id,
// // //           doctor_id: appointment.doctor_id,
// // //           appointment_date: appointment.appointment_date,
// // //           appointment_time: appointment.appointment_time,
// // //           token_number: appointment.token_number,
// // //           status: appointment.status,
// // //           notes: appointment.notes,
// // //         },

// // //         patient: {
// // //           id: appointment.patient_id,
// // //           patient_code: appointment.patient_code,
// // //           name: appointment.patient_name,
// // //           date_of_birth: appointment.date_of_birth,
// // //           gender: appointment.gender,
// // //           phone: appointment.phone,
// // //           address: appointment.address,
// // //           emergency_contact_name: appointment.emergency_contact_name,
// // //           emergency_contact_phone: appointment.emergency_contact_phone,
// // //         },

// // //         medical_history: historyResult.rows,

// // //         consultation: consultationResult.rows[0] || null,
// // //       },
// // //       { status: 200 },
// // //     );
// // //   } catch (error) {
// // //     console.error("LOAD START CONSULTATION ERROR:", error);

// // //     return NextResponse.json(
// // //       {
// // //         success: false,
// // //         message: "Unable to load consultation.",
// // //         error: error.message,
// // //       },
// // //       { status: 500 },
// // //     );
// // //   }
// // // }

// // // // ======================================================
// // // // POST /api/doctor/consultations/start
// // // // START CONSULTATION
// // // // ======================================================

// // // export async function POST(request) {
// // //   const client = await db.connect();

// // //   try {
// // //     // =========================
// // //     // SESSION
// // //     // =========================

// // //     const session = await getSession();

// // //     if (!session) {
// // //       return NextResponse.json(
// // //         {
// // //           success: false,
// // //           message: "Unauthorized. Please login.",
// // //         },
// // //         { status: 401 },
// // //       );
// // //     }

// // //     // =========================
// // //     // ROLE
// // //     // =========================

// // //     if (session.role !== "doctor") {
// // //       return NextResponse.json(
// // //         {
// // //           success: false,
// // //           message: "Only doctors can start consultations.",
// // //         },
// // //         { status: 403 },
// // //       );
// // //     }

// // //     // =========================
// // //     // BODY
// // //     // =========================

// // //     const body = await request.json();

// // //     const appointmentId = Number(body.appointment_id);

// // //     if (!appointmentId || Number.isNaN(appointmentId)) {
// // //       return NextResponse.json(
// // //         {
// // //           success: false,
// // //           message: "Valid appointment ID is required.",
// // //         },
// // //         { status: 400 },
// // //       );
// // //     }

// // //     // =========================
// // //     // TRANSACTION
// // //     // =========================

// // //     await client.query("BEGIN");

// // //     // =========================
// // //     // LOCK APPOINTMENT
// // //     // =========================

// // //     const appointmentResult = await client.query(
// // //       `
// // //       SELECT
// // //         id,
// // //         patient_id,
// // //         doctor_id,
// // //         appointment_date,
// // //         appointment_time,
// // //         token_number,
// // //         status

// // //       FROM appointments

// // //       WHERE id = $1

// // //       FOR UPDATE
// // //       `,
// // //       [appointmentId],
// // //     );

// // //     if (appointmentResult.rows.length === 0) {
// // //       await client.query("ROLLBACK");

// // //       return NextResponse.json(
// // //         {
// // //           success: false,
// // //           message: "Appointment not found.",
// // //         },
// // //         { status: 404 },
// // //       );
// // //     }

// // //     const appointment = appointmentResult.rows[0];

// // //     // =========================
// // //     // DOCTOR OWNERSHIP
// // //     // =========================

// // //     if (Number(appointment.doctor_id) !== Number(session.userId)) {
// // //       await client.query("ROLLBACK");

// // //       return NextResponse.json(
// // //         {
// // //           success: false,
// // //           message: "This appointment does not belong to you.",
// // //         },
// // //         { status: 403 },
// // //       );
// // //     }

// // //     // =========================
// // //     // EXISTING CONSULTATION
// // //     // =========================

// // //     const existingConsultationResult = await client.query(
// // //       `
// // //         SELECT
// // //           id,
// // //           appointment_id,
// // //           patient_id,
// // //           doctor_id,
// // //           started_at,
// // //           ended_at,
// // //           status,
// // //           clinical_notes,
// // //           diagnosis,
// // //           created_at,
// // //           updated_at

// // //         FROM consultations

// // //         WHERE appointment_id = $1

// // //         LIMIT 1
// // //         `,
// // //       [appointmentId],
// // //     );

// // //     // =========================
// // //     // EXISTING CONSULTATION
// // //     // RETURN IT
// // //     // =========================

// // //     if (existingConsultationResult.rows.length > 0) {
// // //       const existingConsultation = existingConsultationResult.rows[0];

// // //       // Appointment status repair if needed
// // //       if (
// // //         appointment.status !== "in_consultation" &&
// // //         existingConsultation.status !== "completed"
// // //       ) {
// // //         await client.query(
// // //           `
// // //           UPDATE appointments

// // //           SET
// // //             status = 'in_consultation',
// // //             updated_at = CURRENT_TIMESTAMP

// // //           WHERE id = $1
// // //           `,
// // //           [appointmentId],
// // //         );
// // //       }

// // //       await client.query("COMMIT");

// // //       return NextResponse.json(
// // //         {
// // //           success: true,
// // //           message: "Consultation already started.",
// // //           consultation: existingConsultation,
// // //         },
// // //         { status: 200 },
// // //       );
// // //     }

// // //     // =========================
// // //     // APPOINTMENT STATUS
// // //     // =========================

// // //     if (appointment.status !== "waiting") {
// // //       await client.query("ROLLBACK");

// // //       return NextResponse.json(
// // //         {
// // //           success: false,
// // //           message:
// // //             "Patient must be in waiting status before consultation can start.",
// // //         },
// // //         { status: 400 },
// // //       );
// // //     }

// // //     // =========================
// // //     // CREATE CONSULTATION
// // //     // =========================

// // //     const consultationResult = await client.query(
// // //       `
// // //       INSERT INTO consultations (
// // //         appointment_id,
// // //         patient_id,
// // //         doctor_id,
// // //         started_at,
// // //         status
// // //       )

// // //       VALUES (
// // //         $1,
// // //         $2,
// // //         $3,
// // //         CURRENT_TIMESTAMP,
// // //         'draft'
// // //       )

// // //       RETURNING
// // //         id,
// // //         appointment_id,
// // //         patient_id,
// // //         doctor_id,
// // //         started_at,
// // //         ended_at,
// // //         status,
// // //         clinical_notes,
// // //         diagnosis,
// // //         created_at,
// // //         updated_at
// // //       `,
// // //       [appointment.id, appointment.patient_id, appointment.doctor_id],
// // //     );

// // //     const consultation = consultationResult.rows[0];

// // //     // =========================
// // //     // APPOINTMENT
// // //     // waiting → in_consultation
// // //     // =========================

// // //     await client.query(
// // //       `
// // //       UPDATE appointments

// // //       SET
// // //         status = 'in_consultation',
// // //         updated_at = CURRENT_TIMESTAMP

// // //       WHERE id = $1
// // //       `,
// // //       [appointmentId],
// // //     );

// // //     // =========================
// // //     // AUDIT LOG
// // //     // =========================

// // //     await client.query(
// // //       `
// // //       INSERT INTO audit_logs (
// // //         user_id,
// // //         action,
// // //         entity_type,
// // //         entity_id,
// // //         details
// // //       )

// // //       VALUES (
// // //         $1,
// // //         $2,
// // //         $3,
// // //         $4,
// // //         $5
// // //       )
// // //       `,
// // //       [
// // //         session.userId,
// // //         "START_CONSULTATION",
// // //         "consultation",
// // //         consultation.id,

// // //         JSON.stringify({
// // //           consultation_id: consultation.id,
// // //           appointment_id: appointment.id,
// // //           patient_id: appointment.patient_id,
// // //           doctor_id: appointment.doctor_id,
// // //           previous_appointment_status: "waiting",
// // //           new_appointment_status: "in_consultation",
// // //         }),
// // //       ],
// // //     );

// // //     // =========================
// // //     // COMMIT
// // //     // =========================

// // //     await client.query("COMMIT");

// // //     // =========================
// // //     // RESPONSE
// // //     // =========================

// // //     return NextResponse.json(
// // //       {
// // //         success: true,
// // //         message: "Consultation started successfully.",
// // //         consultation,
// // //       },
// // //       { status: 201 },
// // //     );
// // //   } catch (error) {
// // //     try {
// // //       await client.query("ROLLBACK");
// // //     } catch (rollbackError) {
// // //       console.error("CONSULTATION ROLLBACK ERROR:", rollbackError);
// // //     }

// // //     console.error("START CONSULTATION ERROR:", error);

// // //     // =========================
// // //     // DUPLICATE APPOINTMENT
// // //     // =========================

// // //     if (error.code === "23505") {
// // //       return NextResponse.json(
// // //         {
// // //           success: false,
// // //           message: "A consultation already exists for this appointment.",
// // //         },
// // //         { status: 409 },
// // //       );
// // //     }

// // //     return NextResponse.json(
// // //       {
// // //         success: false,
// // //         message: "Unable to start consultation.",
// // //         error: error.message,
// // //       },
// // //       { status: 500 },
// // //     );
// // //   } finally {
// // //     client.release();
// // //   }
// // // }

// // import { NextResponse } from "next/server";

// // import { db } from "@/lib/db";
// // import { getSession } from "@/lib/auth";
// // import { getPrivateFileUrl } from "@/lib/s3";

// // export const runtime = "nodejs";
// // export const dynamic = "force-dynamic";

// // // ======================================================
// // // HEADERS
// // // ======================================================

// // function noStoreHeaders() {
// //   return {
// //     "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
// //   };
// // }

// // // ======================================================
// // // GET LATEST AUDIO RECORDING
// // // ======================================================

// // async function getLatestAudioRecording(consultationId) {
// //   if (!consultationId) {
// //     return null;
// //   }

// //   const result = await db.query(
// //     `
// //     SELECT
// //       id,
// //       consultation_id,
// //       storage_key,
// //       original_file_name,
// //       mime_type,
// //       file_size,
// //       duration_seconds,
// //       status,
// //       error_message,
// //       created_at,
// //       updated_at

// //     FROM audio_recordings

// //     WHERE consultation_id = $1

// //     ORDER BY
// //       created_at DESC,
// //       id DESC

// //     LIMIT 1
// //     `,
// //     [consultationId],
// //   );

// //   if (result.rows.length === 0) {
// //     return null;
// //   }

// //   const recording = result.rows[0];

// //   let audioUrl = null;

// //   if (recording.storage_key) {
// //     try {
// //       audioUrl = await getPrivateFileUrl(recording.storage_key, 60 * 60);
// //     } catch (error) {
// //       console.error("GENERATE CONSULTATION AUDIO URL ERROR:", error);
// //     }
// //   }

// //   return {
// //     ...recording,
// //     audio_url: audioUrl,
// //   };
// // }

// // // ======================================================
// // // GET TRANSCRIPT
// // // ======================================================

// // async function getTranscript(consultationId) {
// //   if (!consultationId) {
// //     return null;
// //   }

// //   const result = await db.query(
// //     `
// //     SELECT
// //       id,
// //       consultation_id,
// //       transcription_job_id,
// //       status,
// //       language,
// //       full_text,
// //       edited_text,
// //       word_count,
// //       confidence,
// //       reviewed_by,
// //       reviewed_at,
// //       created_at,
// //       updated_at

// //     FROM transcripts

// //     WHERE consultation_id = $1

// //     ORDER BY
// //       created_at DESC,
// //       id DESC

// //     LIMIT 1
// //     `,
// //     [consultationId],
// //   );

// //   return result.rows[0] || null;
// // }

// // // ======================================================
// // // GET
// // // /api/doctors/consultations/start?appointment=6
// // // ======================================================

// // export async function GET(request) {
// //   try {
// //     // ======================================================
// //     // SESSION
// //     // ======================================================

// //     const session = await getSession();

// //     if (!session) {
// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "Unauthorized. Please login.",
// //         },
// //         {
// //           status: 401,
// //           headers: noStoreHeaders(),
// //         },
// //       );
// //     }

// //     // ======================================================
// //     // ROLE
// //     // ======================================================

// //     if (session.role !== "doctor") {
// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "Only doctors can access consultations.",
// //         },
// //         {
// //           status: 403,
// //           headers: noStoreHeaders(),
// //         },
// //       );
// //     }

// //     // ======================================================
// //     // ACTIVE DOCTOR
// //     // ======================================================

// //     const doctorResult = await db.query(
// //       `
// //       SELECT
// //         id,
// //         is_active

// //       FROM users

// //       WHERE id = $1
// //         AND role = 'doctor'

// //       LIMIT 1
// //       `,
// //       [session.userId],
// //     );

// //     if (doctorResult.rows.length === 0) {
// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "Doctor account not found.",
// //         },
// //         {
// //           status: 404,
// //           headers: noStoreHeaders(),
// //         },
// //       );
// //     }

// //     if (!doctorResult.rows[0].is_active) {
// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "Doctor account is inactive.",
// //         },
// //         {
// //           status: 403,
// //           headers: noStoreHeaders(),
// //         },
// //       );
// //     }

// //     // ======================================================
// //     // APPOINTMENT ID
// //     // ======================================================

// //     const { searchParams } = new URL(request.url);

// //     const appointmentId = Number(searchParams.get("appointment"));

// //     if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "Valid appointment ID is required.",
// //         },
// //         {
// //           status: 400,
// //           headers: noStoreHeaders(),
// //         },
// //       );
// //     }

// //     // ======================================================
// //     // APPOINTMENT + PATIENT
// //     // ======================================================

// //     const appointmentResult = await db.query(
// //       `
// //       SELECT
// //         a.id,
// //         a.patient_id,
// //         a.doctor_id,

// //         a.appointment_date::TEXT
// //           AS appointment_date,

// //         a.appointment_time::TEXT
// //           AS appointment_time,

// //         a.token_number,
// //         a.status,
// //         a.notes,
// //         a.created_at,
// //         a.updated_at,

// //         p.patient_code,
// //         p.name AS patient_name,
// //         p.date_of_birth,
// //         p.gender,
// //         p.phone,
// //         p.address,
// //         p.emergency_contact_name,
// //         p.emergency_contact_phone

// //       FROM appointments a

// //       INNER JOIN patients p
// //         ON p.id = a.patient_id

// //       WHERE a.id = $1

// //       LIMIT 1
// //       `,
// //       [appointmentId],
// //     );

// //     if (appointmentResult.rows.length === 0) {
// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "Appointment not found.",
// //         },
// //         {
// //           status: 404,
// //           headers: noStoreHeaders(),
// //         },
// //       );
// //     }

// //     const appointment = appointmentResult.rows[0];

// //     // ======================================================
// //     // OWNERSHIP
// //     // ======================================================

// //     if (Number(appointment.doctor_id) !== Number(session.userId)) {
// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "This appointment does not belong to you.",
// //         },
// //         {
// //           status: 403,
// //           headers: noStoreHeaders(),
// //         },
// //       );
// //     }

// //     // ======================================================
// //     // BLOCK CANCELLED / NO SHOW
// //     // ======================================================

// //     if (["cancelled", "no_show"].includes(appointment.status)) {
// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "This appointment cannot be opened for consultation.",
// //         },
// //         {
// //           status: 400,
// //           headers: noStoreHeaders(),
// //         },
// //       );
// //     }

// //     // ======================================================
// //     // HISTORY
// //     // ======================================================

// //     const historyResult = await db.query(
// //       `
// //       SELECT
// //         mh.id,
// //         mh.patient_id,
// //         mh.previous_diseases,
// //         mh.allergies,
// //         mh.current_medications,
// //         mh.previous_surgeries,
// //         mh.family_history,
// //         mh.additional_notes,
// //         mh.created_by,
// //         mh.created_at,
// //         mh.updated_at,

// //         u.name AS created_by_name

// //       FROM medical_history mh

// //       LEFT JOIN users u
// //         ON u.id = mh.created_by

// //       WHERE mh.patient_id = $1

// //       ORDER BY
// //         mh.created_at DESC,
// //         mh.id DESC
// //       `,
// //       [appointment.patient_id],
// //     );

// //     // ======================================================
// //     // EXISTING CONSULTATION
// //     // ======================================================

// //     const consultationResult = await db.query(
// //       `
// //       SELECT
// //         id,
// //         appointment_id,
// //         patient_id,
// //         doctor_id,
// //         started_at,
// //         ended_at,
// //         status,
// //         clinical_notes,
// //         diagnosis,
// //         created_at,
// //         updated_at

// //       FROM consultations

// //       WHERE appointment_id = $1
// //         AND doctor_id = $2

// //       ORDER BY id DESC

// //       LIMIT 1
// //       `,
// //       [appointmentId, session.userId],
// //     );

// //     const consultation = consultationResult.rows[0] || null;

// //     // ======================================================
// //     // AUDIO + TRANSCRIPT
// //     // ======================================================

// //     let audioRecording = null;
// //     let transcript = null;

// //     if (consultation?.id) {
// //       [audioRecording, transcript] = await Promise.all([
// //         getLatestAudioRecording(consultation.id),
// //         getTranscript(consultation.id),
// //       ]);
// //     }

// //     // ======================================================
// //     // RESPONSE
// //     // ======================================================

// //     return NextResponse.json(
// //       {
// //         success: true,

// //         appointment: {
// //           id: appointment.id,
// //           patient_id: appointment.patient_id,
// //           doctor_id: appointment.doctor_id,
// //           appointment_date: appointment.appointment_date,
// //           appointment_time: appointment.appointment_time,
// //           token_number: appointment.token_number,
// //           status: appointment.status,
// //           notes: appointment.notes,
// //         },

// //         patient: {
// //           id: appointment.patient_id,
// //           patient_code: appointment.patient_code,
// //           name: appointment.patient_name,
// //           date_of_birth: appointment.date_of_birth,
// //           gender: appointment.gender,
// //           phone: appointment.phone,
// //           address: appointment.address,
// //           emergency_contact_name: appointment.emergency_contact_name,
// //           emergency_contact_phone: appointment.emergency_contact_phone,
// //         },

// //         medical_history: historyResult.rows,

// //         consultation,

// //         audio_recording: audioRecording,

// //         transcript,
// //       },
// //       {
// //         status: 200,
// //         headers: noStoreHeaders(),
// //       },
// //     );
// //   } catch (error) {
// //     console.error("LOAD START CONSULTATION ERROR:", error);

// //     return NextResponse.json(
// //       {
// //         success: false,
// //         message: "Unable to load consultation.",
// //         error:
// //           process.env.NODE_ENV === "development" ? error.message : undefined,
// //       },
// //       {
// //         status: 500,
// //         headers: noStoreHeaders(),
// //       },
// //     );
// //   }
// // }

// // // ======================================================
// // // POST
// // // /api/doctors/consultations/start
// // // ======================================================

// // export async function POST(request) {
// //   let client = null;

// //   try {
// //     // ======================================================
// //     // SESSION
// //     // ======================================================

// //     const session = await getSession();

// //     if (!session) {
// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "Unauthorized. Please login.",
// //         },
// //         {
// //           status: 401,
// //           headers: noStoreHeaders(),
// //         },
// //       );
// //     }

// //     // ======================================================
// //     // ROLE
// //     // ======================================================

// //     if (session.role !== "doctor") {
// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "Only doctors can start consultations.",
// //         },
// //         {
// //           status: 403,
// //           headers: noStoreHeaders(),
// //         },
// //       );
// //     }

// //     // ======================================================
// //     // ACTIVE DOCTOR
// //     // ======================================================

// //     const doctorResult = await db.query(
// //       `
// //       SELECT
// //         id,
// //         is_active

// //       FROM users

// //       WHERE id = $1
// //         AND role = 'doctor'

// //       LIMIT 1
// //       `,
// //       [session.userId],
// //     );

// //     if (doctorResult.rows.length === 0) {
// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "Doctor account not found.",
// //         },
// //         {
// //           status: 404,
// //           headers: noStoreHeaders(),
// //         },
// //       );
// //     }

// //     if (!doctorResult.rows[0].is_active) {
// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "Doctor account is inactive.",
// //         },
// //         {
// //           status: 403,
// //           headers: noStoreHeaders(),
// //         },
// //       );
// //     }

// //     // ======================================================
// //     // BODY
// //     // ======================================================

// //     let body;

// //     try {
// //       body = await request.json();
// //     } catch {
// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "Invalid request body.",
// //         },
// //         {
// //           status: 400,
// //           headers: noStoreHeaders(),
// //         },
// //       );
// //     }

// //     const appointmentId = Number(body.appointment_id);

// //     if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "Valid appointment ID is required.",
// //         },
// //         {
// //           status: 400,
// //           headers: noStoreHeaders(),
// //         },
// //       );
// //     }

// //     // ======================================================
// //     // TRANSACTION
// //     // ======================================================

// //     client = await db.connect();

// //     await client.query("BEGIN");

// //     // ======================================================
// //     // LOCK APPOINTMENT
// //     // ======================================================

// //     const appointmentResult = await client.query(
// //       `
// //       SELECT
// //         id,
// //         patient_id,
// //         doctor_id,

// //         appointment_date::TEXT
// //           AS appointment_date,

// //         appointment_time::TEXT
// //           AS appointment_time,

// //         token_number,
// //         status,
// //         notes,
// //         created_at,
// //         updated_at

// //       FROM appointments

// //       WHERE id = $1

// //       FOR UPDATE
// //       `,
// //       [appointmentId],
// //     );

// //     if (appointmentResult.rows.length === 0) {
// //       await client.query("ROLLBACK");

// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "Appointment not found.",
// //         },
// //         {
// //           status: 404,
// //           headers: noStoreHeaders(),
// //         },
// //       );
// //     }

// //     const appointment = appointmentResult.rows[0];

// //     // ======================================================
// //     // OWNERSHIP
// //     // ======================================================

// //     if (Number(appointment.doctor_id) !== Number(session.userId)) {
// //       await client.query("ROLLBACK");

// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "This appointment does not belong to you.",
// //         },
// //         {
// //           status: 403,
// //           headers: noStoreHeaders(),
// //         },
// //       );
// //     }

// //     // ======================================================
// //     // BLOCK CANCELLED / NO SHOW
// //     // ======================================================

// //     if (["cancelled", "no_show"].includes(appointment.status)) {
// //       await client.query("ROLLBACK");

// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "This appointment cannot be started.",
// //         },
// //         {
// //           status: 400,
// //           headers: noStoreHeaders(),
// //         },
// //       );
// //     }

// //     // ======================================================
// //     // FIND EXISTING CONSULTATION
// //     // ======================================================

// //     const existingConsultationResult = await client.query(
// //       `
// //         SELECT
// //           id,
// //           appointment_id,
// //           patient_id,
// //           doctor_id,
// //           started_at,
// //           ended_at,
// //           status,
// //           clinical_notes,
// //           diagnosis,
// //           created_at,
// //           updated_at

// //         FROM consultations

// //         WHERE appointment_id = $1
// //           AND doctor_id = $2

// //         ORDER BY id DESC

// //         LIMIT 1
// //         `,
// //       [appointmentId, session.userId],
// //     );

// //     // ======================================================
// //     // EXISTING CONSULTATION
// //     // ======================================================

// //     if (existingConsultationResult.rows.length > 0) {
// //       const existingConsultation = existingConsultationResult.rows[0];

// //       // ----------------------------------------------------
// //       // COMPLETED
// //       // ----------------------------------------------------

// //       if (existingConsultation.status === "completed") {
// //         await client.query("COMMIT");

// //         return NextResponse.json(
// //           {
// //             success: true,

// //             message: "Consultation is already completed.",

// //             appointment,

// //             consultation: existingConsultation,
// //           },
// //           {
// //             status: 200,
// //             headers: noStoreHeaders(),
// //           },
// //         );
// //       }

// //       // ----------------------------------------------------
// //       // REPAIR APPOINTMENT STATUS
// //       // ----------------------------------------------------

// //       let updatedAppointment = appointment;

// //       if (
// //         appointment.status !== "in_consultation" &&
// //         appointment.status !== "completed"
// //       ) {
// //         const updateResult = await client.query(
// //           `
// //             UPDATE appointments

// //             SET
// //               status = 'in_consultation',
// //               updated_at =
// //                 CURRENT_TIMESTAMP

// //             WHERE id = $1

// //             RETURNING
// //               id,
// //               patient_id,
// //               doctor_id,

// //               appointment_date::TEXT
// //                 AS appointment_date,

// //               appointment_time::TEXT
// //                 AS appointment_time,

// //               token_number,
// //               status,
// //               notes,
// //               created_at,
// //               updated_at
// //             `,
// //           [appointmentId],
// //         );

// //         updatedAppointment = updateResult.rows[0];
// //       }

// //       await client.query("COMMIT");

// //       // ----------------------------------------------------
// //       // AUDIO + TRANSCRIPT
// //       // ----------------------------------------------------

// //       const [audioRecording, transcript] = await Promise.all([
// //         getLatestAudioRecording(existingConsultation.id),

// //         getTranscript(existingConsultation.id),
// //       ]);

// //       return NextResponse.json(
// //         {
// //           success: true,

// //           message: "Existing consultation loaded.",

// //           appointment: updatedAppointment,

// //           consultation: existingConsultation,

// //           audio_recording: audioRecording,

// //           transcript,
// //         },
// //         {
// //           status: 200,
// //           headers: noStoreHeaders(),
// //         },
// //       );
// //     }

// //     // ======================================================
// //     // NEW CONSULTATION STATUS
// //     //
// //     // Normally waiting.
// //     //
// //     // Recovery case:
// //     // appointment already says in_consultation but
// //     // consultation row is missing.
// //     // ======================================================

// //     const canCreateConsultation = ["waiting", "in_consultation"].includes(
// //       appointment.status,
// //     );

// //     if (!canCreateConsultation) {
// //       await client.query("ROLLBACK");

// //       return NextResponse.json(
// //         {
// //           success: false,

// //           message:
// //             "Patient must be in waiting status before consultation can start.",

// //           appointment_status: appointment.status,
// //         },
// //         {
// //           status: 400,
// //           headers: noStoreHeaders(),
// //         },
// //       );
// //     }

// //     // ======================================================
// //     // CREATE CONSULTATION
// //     // ======================================================

// //     const consultationResult = await client.query(
// //       `
// //         INSERT INTO consultations (
// //           appointment_id,
// //           patient_id,
// //           doctor_id,
// //           started_at,
// //           status
// //         )

// //         VALUES (
// //           $1,
// //           $2,
// //           $3,
// //           CURRENT_TIMESTAMP,
// //           'draft'
// //         )

// //         RETURNING
// //           id,
// //           appointment_id,
// //           patient_id,
// //           doctor_id,
// //           started_at,
// //           ended_at,
// //           status,
// //           clinical_notes,
// //           diagnosis,
// //           created_at,
// //           updated_at
// //         `,
// //       [appointment.id, appointment.patient_id, appointment.doctor_id],
// //     );

// //     const consultation = consultationResult.rows[0];

// //     // ======================================================
// //     // APPOINTMENT STATUS
// //     // ======================================================

// //     let updatedAppointment = appointment;

// //     if (appointment.status !== "in_consultation") {
// //       const updatedAppointmentResult = await client.query(
// //         `
// //           UPDATE appointments

// //           SET
// //             status = 'in_consultation',
// //             updated_at =
// //               CURRENT_TIMESTAMP

// //           WHERE id = $1

// //           RETURNING
// //             id,
// //             patient_id,
// //             doctor_id,

// //             appointment_date::TEXT
// //               AS appointment_date,

// //             appointment_time::TEXT
// //               AS appointment_time,

// //             token_number,
// //             status,
// //             notes,
// //             created_at,
// //             updated_at
// //           `,
// //         [appointmentId],
// //       );

// //       updatedAppointment = updatedAppointmentResult.rows[0];
// //     }

// //     // ======================================================
// //     // AUDIT
// //     // ======================================================

// //     try {
// //       await client.query(
// //         `
// //         INSERT INTO audit_logs (
// //           user_id,
// //           action,
// //           entity_type,
// //           entity_id,
// //           details
// //         )

// //         VALUES (
// //           $1,
// //           $2,
// //           $3,
// //           $4,
// //           $5
// //         )
// //         `,
// //         [
// //           session.userId,

// //           "START_CONSULTATION",

// //           "consultation",

// //           consultation.id,

// //           JSON.stringify({
// //             consultation_id: consultation.id,

// //             appointment_id: appointment.id,

// //             patient_id: appointment.patient_id,

// //             doctor_id: appointment.doctor_id,

// //             previous_appointment_status: appointment.status,

// //             new_appointment_status: "in_consultation",

// //             repaired_missing_consultation:
// //               appointment.status === "in_consultation",
// //           }),
// //         ],
// //       );
// //     } catch (auditError) {
// //       console.error("START CONSULTATION AUDIT ERROR:", auditError);
// //     }

// //     // ======================================================
// //     // COMMIT
// //     // ======================================================

// //     await client.query("COMMIT");

// //     // ======================================================
// //     // RESPONSE
// //     // ======================================================

// //     return NextResponse.json(
// //       {
// //         success: true,

// //         message:
// //           appointment.status === "in_consultation"
// //             ? "Consultation record restored successfully."
// //             : "Consultation started successfully.",

// //         appointment: updatedAppointment,

// //         consultation,

// //         audio_recording: null,

// //         transcript: null,
// //       },
// //       {
// //         status: 201,
// //         headers: noStoreHeaders(),
// //       },
// //     );
// //   } catch (error) {
// //     // ======================================================
// //     // ROLLBACK
// //     // ======================================================

// //     if (client) {
// //       try {
// //         await client.query("ROLLBACK");
// //       } catch (rollbackError) {
// //         console.error("CONSULTATION ROLLBACK ERROR:", rollbackError);
// //       }
// //     }

// //     console.error("START CONSULTATION ERROR:", error);

// //     // ======================================================
// //     // DUPLICATE CONSULTATION
// //     // ======================================================

// //     if (error.code === "23505") {
// //       return NextResponse.json(
// //         {
// //           success: false,

// //           message:
// //             "A consultation already exists for this appointment. Reload the page to continue.",
// //         },
// //         {
// //           status: 409,
// //           headers: noStoreHeaders(),
// //         },
// //       );
// //     }

// //     // ======================================================
// //     // ERROR RESPONSE
// //     // ======================================================

// //     return NextResponse.json(
// //       {
// //         success: false,

// //         message: "Unable to start consultation.",

// //         error:
// //           process.env.NODE_ENV === "development" ? error.message : undefined,
// //       },
// //       {
// //         status: 500,
// //         headers: noStoreHeaders(),
// //       },
// //     );
// //   } finally {
// //     if (client) {
// //       client.release();
// //     }
// //   }
// // }

// import { NextResponse } from "next/server";

// import { db } from "@/lib/db";
// import { getSession } from "@/lib/auth";
// import { getPrivateFileUrl } from "@/lib/s3";

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// // ======================================================
// // HEADERS
// // ======================================================

// function noStoreHeaders() {
//   return {
//     "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
//   };
// }

// // ======================================================
// // GET LATEST AUDIO RECORDING
// // ======================================================

// async function getLatestAudioRecording(consultationId) {
//   if (!consultationId) {
//     return null;
//   }

//   const result = await db.query(
//     `
//     SELECT
//       id,
//       consultation_id,
//       storage_key,
//       original_file_name,
//       mime_type,
//       file_size,
//       duration_seconds,
//       status,
//       error_message,
//       created_at,
//       updated_at

//     FROM audio_recordings

//     WHERE consultation_id = $1

//     ORDER BY
//       created_at DESC,
//       id DESC

//     LIMIT 1
//     `,
//     [consultationId],
//   );

//   if (result.rows.length === 0) {
//     return null;
//   }

//   const recording = result.rows[0];

//   let audioUrl = null;

//   if (recording.storage_key) {
//     try {
//       audioUrl = await getPrivateFileUrl(recording.storage_key, 60 * 60);
//     } catch (error) {
//       console.error("GENERATE CONSULTATION AUDIO URL ERROR:", error);
//     }
//   }

//   return {
//     ...recording,
//     audio_url: audioUrl,
//   };
// }

// // ======================================================
// // GET TRANSCRIPT
// // ======================================================

// async function getTranscript(consultationId) {
//   if (!consultationId) {
//     return null;
//   }

//   const result = await db.query(
//     `
//     SELECT
//       id,
//       consultation_id,
//       transcription_job_id,
//       status,
//       language,
//       full_text,
//       edited_text,
//       word_count,
//       confidence,
//       reviewed_by,
//       reviewed_at,
//       created_at,
//       updated_at

//     FROM transcripts

//     WHERE consultation_id = $1

//     ORDER BY
//       created_at DESC,
//       id DESC

//     LIMIT 1
//     `,
//     [consultationId],
//   );

//   return result.rows[0] || null;
// }

// // ======================================================
// // GET TRANSCRIPT SEGMENTS
// // ======================================================

// async function getTranscriptSegments(transcriptId) {
//   if (!transcriptId) {
//     return [];
//   }

//   const result = await db.query(
//     `
//     SELECT
//       id,
//       transcript_id,
//       segment_index,
//       speaker,
//       speaker_role,
//       start_time,
//       end_time,
//       text,
//       created_at,
//       updated_at

//     FROM transcript_segments

//     WHERE transcript_id = $1

//     ORDER BY
//       segment_index ASC,
//       id ASC
//     `,
//     [transcriptId],
//   );

//   return result.rows;
// }

// // ======================================================
// // GET TRANSCRIPT + SEGMENTS
// // ======================================================

// async function getTranscriptData(consultationId) {
//   const transcript = await getTranscript(consultationId);

//   if (!transcript) {
//     return {
//       transcript: null,
//       transcriptSegments: [],
//     };
//   }

//   const transcriptSegments = await getTranscriptSegments(transcript.id);

//   return {
//     transcript,
//     transcriptSegments,
//   };
// }

// // ======================================================
// // GET
// // /api/doctors/consultations/start?appointment=6
// // ======================================================

// export async function GET(request) {
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
//           message: "Only doctors can access consultations.",
//         },
//         {
//           status: 403,
//           headers: noStoreHeaders(),
//         },
//       );
//     }

//     // ======================================================
//     // ACTIVE DOCTOR
//     // ======================================================

//     const doctorResult = await db.query(
//       `
//       SELECT
//         id,
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

//     if (!doctorResult.rows[0].is_active) {
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
//     // APPOINTMENT ID
//     // ======================================================

//     const { searchParams } = new URL(request.url);

//     const appointmentId = Number(searchParams.get("appointment"));

//     if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Valid appointment ID is required.",
//         },
//         {
//           status: 400,
//           headers: noStoreHeaders(),
//         },
//       );
//     }

//     // ======================================================
//     // APPOINTMENT + PATIENT
//     // ======================================================

//     const appointmentResult = await db.query(
//       `
//         SELECT
//           a.id,
//           a.patient_id,
//           a.doctor_id,

//           a.appointment_date::TEXT
//             AS appointment_date,

//           a.appointment_time::TEXT
//             AS appointment_time,

//           a.token_number,
//           a.status,
//           a.notes,
//           a.created_at,
//           a.updated_at,

//           p.patient_code,
//           p.name AS patient_name,
//           p.date_of_birth,
//           p.gender,
//           p.phone,
//           p.address,
//           p.emergency_contact_name,
//           p.emergency_contact_phone

//         FROM appointments a

//         INNER JOIN patients p
//           ON p.id = a.patient_id

//         WHERE a.id = $1

//         LIMIT 1
//         `,
//       [appointmentId],
//     );

//     if (appointmentResult.rows.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Appointment not found.",
//         },
//         {
//           status: 404,
//           headers: noStoreHeaders(),
//         },
//       );
//     }

//     const appointment = appointmentResult.rows[0];

//     // ======================================================
//     // OWNERSHIP
//     // ======================================================

//     if (Number(appointment.doctor_id) !== Number(session.userId)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "This appointment does not belong to you.",
//         },
//         {
//           status: 403,
//           headers: noStoreHeaders(),
//         },
//       );
//     }

//     // ======================================================
//     // BLOCK CANCELLED / NO SHOW
//     // ======================================================

//     if (["cancelled", "no_show"].includes(appointment.status)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "This appointment cannot be opened for consultation.",
//         },
//         {
//           status: 400,
//           headers: noStoreHeaders(),
//         },
//       );
//     }

//     // ======================================================
//     // MEDICAL HISTORY
//     // ======================================================

//     const historyResult = await db.query(
//       `
//       SELECT
//         mh.id,
//         mh.patient_id,
//         mh.previous_diseases,
//         mh.allergies,
//         mh.current_medications,
//         mh.previous_surgeries,
//         mh.family_history,
//         mh.additional_notes,
//         mh.created_by,
//         mh.created_at,
//         mh.updated_at,

//         u.name AS created_by_name

//       FROM medical_history mh

//       LEFT JOIN users u
//         ON u.id = mh.created_by

//       WHERE mh.patient_id = $1

//       ORDER BY
//         mh.created_at DESC,
//         mh.id DESC
//       `,
//       [appointment.patient_id],
//     );

//     // ======================================================
//     // EXISTING CONSULTATION
//     // ======================================================

//     const consultationResult = await db.query(
//       `
//         SELECT
//           id,
//           appointment_id,
//           patient_id,
//           doctor_id,
//           started_at,
//           ended_at,
//           status,
//           clinical_notes,
//           diagnosis,
//           created_at,
//           updated_at

//         FROM consultations

//         WHERE appointment_id = $1
//           AND doctor_id = $2

//         ORDER BY
//           id DESC

//         LIMIT 1
//         `,
//       [appointmentId, session.userId],
//     );

//     const consultation = consultationResult.rows[0] || null;

//     // ======================================================
//     // AUDIO + TRANSCRIPT + SEGMENTS
//     // ======================================================

//     let audioRecording = null;
//     let transcript = null;
//     let transcriptSegments = [];

//     if (consultation?.id) {
//       const [loadedAudioRecording, transcriptData] = await Promise.all([
//         getLatestAudioRecording(consultation.id),

//         getTranscriptData(consultation.id),
//       ]);

//       audioRecording = loadedAudioRecording;

//       transcript = transcriptData.transcript;

//       transcriptSegments = transcriptData.transcriptSegments;
//     }

//     // ======================================================
//     // RESPONSE
//     // ======================================================

//     return NextResponse.json(
//       {
//         success: true,

//         appointment: {
//           id: appointment.id,

//           patient_id: appointment.patient_id,

//           doctor_id: appointment.doctor_id,

//           appointment_date: appointment.appointment_date,

//           appointment_time: appointment.appointment_time,

//           token_number: appointment.token_number,

//           status: appointment.status,

//           notes: appointment.notes,
//         },

//         patient: {
//           id: appointment.patient_id,

//           patient_code: appointment.patient_code,

//           name: appointment.patient_name,

//           date_of_birth: appointment.date_of_birth,

//           gender: appointment.gender,

//           phone: appointment.phone,

//           address: appointment.address,

//           emergency_contact_name: appointment.emergency_contact_name,

//           emergency_contact_phone: appointment.emergency_contact_phone,
//         },

//         medical_history: historyResult.rows,

//         consultation,

//         audio_recording: audioRecording,

//         transcript,

//         transcript_segments: transcriptSegments,
//       },
//       {
//         status: 200,
//         headers: noStoreHeaders(),
//       },
//     );
//   } catch (error) {
//     console.error("LOAD START CONSULTATION ERROR:", error);

//     return NextResponse.json(
//       {
//         success: false,

//         message: "Unable to load consultation.",

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

// // ======================================================
// // POST
// // /api/doctors/consultations/start
// // ======================================================

// export async function POST(request) {
//   let client = null;

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
//           message: "Only doctors can start consultations.",
//         },
//         {
//           status: 403,
//           headers: noStoreHeaders(),
//         },
//       );
//     }

//     // ======================================================
//     // ACTIVE DOCTOR
//     // ======================================================

//     const doctorResult = await db.query(
//       `
//       SELECT
//         id,
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

//     if (!doctorResult.rows[0].is_active) {
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

//     const appointmentId = Number(body.appointment_id);

//     if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Valid appointment ID is required.",
//         },
//         {
//           status: 400,
//           headers: noStoreHeaders(),
//         },
//       );
//     }

//     // ======================================================
//     // TRANSACTION
//     // ======================================================

//     client = await db.connect();

//     await client.query("BEGIN");

//     // ======================================================
//     // LOCK APPOINTMENT
//     // ======================================================

//     const appointmentResult = await client.query(
//       `
//         SELECT
//           id,
//           patient_id,
//           doctor_id,

//           appointment_date::TEXT
//             AS appointment_date,

//           appointment_time::TEXT
//             AS appointment_time,

//           token_number,
//           status,
//           notes,
//           created_at,
//           updated_at

//         FROM appointments

//         WHERE id = $1

//         FOR UPDATE
//         `,
//       [appointmentId],
//     );

//     if (appointmentResult.rows.length === 0) {
//       await client.query("ROLLBACK");

//       return NextResponse.json(
//         {
//           success: false,
//           message: "Appointment not found.",
//         },
//         {
//           status: 404,
//           headers: noStoreHeaders(),
//         },
//       );
//     }

//     const appointment = appointmentResult.rows[0];

//     // ======================================================
//     // OWNERSHIP
//     // ======================================================

//     if (Number(appointment.doctor_id) !== Number(session.userId)) {
//       await client.query("ROLLBACK");

//       return NextResponse.json(
//         {
//           success: false,
//           message: "This appointment does not belong to you.",
//         },
//         {
//           status: 403,
//           headers: noStoreHeaders(),
//         },
//       );
//     }

//     // ======================================================
//     // BLOCK CANCELLED / NO SHOW
//     // ======================================================

//     if (["cancelled", "no_show"].includes(appointment.status)) {
//       await client.query("ROLLBACK");

//       return NextResponse.json(
//         {
//           success: false,
//           message: "This appointment cannot be started.",
//         },
//         {
//           status: 400,
//           headers: noStoreHeaders(),
//         },
//       );
//     }

//     // ======================================================
//     // FIND EXISTING CONSULTATION
//     // ======================================================

//     const existingConsultationResult = await client.query(
//       `
//         SELECT
//           id,
//           appointment_id,
//           patient_id,
//           doctor_id,
//           started_at,
//           ended_at,
//           status,
//           clinical_notes,
//           diagnosis,
//           created_at,
//           updated_at

//         FROM consultations

//         WHERE appointment_id = $1
//           AND doctor_id = $2

//         ORDER BY
//           id DESC

//         LIMIT 1
//         `,
//       [appointmentId, session.userId],
//     );

//     // ======================================================
//     // EXISTING CONSULTATION
//     // ======================================================

//     if (existingConsultationResult.rows.length > 0) {
//       const existingConsultation = existingConsultationResult.rows[0];

//       // ====================================================
//       // COMPLETED
//       // ====================================================

//       if (existingConsultation.status === "completed") {
//         await client.query("COMMIT");

//         const [audioRecording, transcriptData] = await Promise.all([
//           getLatestAudioRecording(existingConsultation.id),

//           getTranscriptData(existingConsultation.id),
//         ]);

//         return NextResponse.json(
//           {
//             success: true,

//             message: "Consultation is already completed.",

//             appointment,

//             consultation: existingConsultation,

//             audio_recording: audioRecording,

//             transcript: transcriptData.transcript,

//             transcript_segments: transcriptData.transcriptSegments,
//           },
//           {
//             status: 200,
//             headers: noStoreHeaders(),
//           },
//         );
//       }

//       // ====================================================
//       // REPAIR APPOINTMENT STATUS
//       // ====================================================

//       let updatedAppointment = appointment;

//       if (
//         appointment.status !== "in_consultation" &&
//         appointment.status !== "completed"
//       ) {
//         const updateResult = await client.query(
//           `
//             UPDATE appointments

//             SET
//               status = 'in_consultation',
//               updated_at =
//                 CURRENT_TIMESTAMP

//             WHERE id = $1

//             RETURNING
//               id,
//               patient_id,
//               doctor_id,

//               appointment_date::TEXT
//                 AS appointment_date,

//               appointment_time::TEXT
//                 AS appointment_time,

//               token_number,
//               status,
//               notes,
//               created_at,
//               updated_at
//             `,
//           [appointmentId],
//         );

//         updatedAppointment = updateResult.rows[0];
//       }

//       await client.query("COMMIT");

//       // ====================================================
//       // AUDIO + TRANSCRIPT + SEGMENTS
//       // ====================================================

//       const [audioRecording, transcriptData] = await Promise.all([
//         getLatestAudioRecording(existingConsultation.id),

//         getTranscriptData(existingConsultation.id),
//       ]);

//       return NextResponse.json(
//         {
//           success: true,

//           message: "Existing consultation loaded.",

//           appointment: updatedAppointment,

//           consultation: existingConsultation,

//           audio_recording: audioRecording,

//           transcript: transcriptData.transcript,

//           transcript_segments: transcriptData.transcriptSegments,
//         },
//         {
//           status: 200,
//           headers: noStoreHeaders(),
//         },
//       );
//     }

//     // ======================================================
//     // NEW CONSULTATION STATUS
//     //
//     // waiting:
//     // normal flow
//     //
//     // in_consultation:
//     // recovery case if appointment status changed but
//     // consultation row was missing
//     // ======================================================

//     const canCreateConsultation = ["waiting", "in_consultation"].includes(
//       appointment.status,
//     );

//     if (!canCreateConsultation) {
//       await client.query("ROLLBACK");

//       return NextResponse.json(
//         {
//           success: false,

//           message:
//             "Patient must be in waiting status before consultation can start.",

//           appointment_status: appointment.status,
//         },
//         {
//           status: 400,
//           headers: noStoreHeaders(),
//         },
//       );
//     }

//     // ======================================================
//     // CREATE CONSULTATION
//     // ======================================================

//     const consultationResult = await client.query(
//       `
//         INSERT INTO consultations (
//           appointment_id,
//           patient_id,
//           doctor_id,
//           started_at,
//           status
//         )

//         VALUES (
//           $1,
//           $2,
//           $3,
//           CURRENT_TIMESTAMP,
//           'draft'
//         )

//         RETURNING
//           id,
//           appointment_id,
//           patient_id,
//           doctor_id,
//           started_at,
//           ended_at,
//           status,
//           clinical_notes,
//           diagnosis,
//           created_at,
//           updated_at
//         `,
//       [appointment.id, appointment.patient_id, appointment.doctor_id],
//     );

//     const consultation = consultationResult.rows[0];

//     // ======================================================
//     // APPOINTMENT STATUS
//     // ======================================================

//     let updatedAppointment = appointment;

//     if (appointment.status !== "in_consultation") {
//       const updatedAppointmentResult = await client.query(
//         `
//           UPDATE appointments

//           SET
//             status = 'in_consultation',
//             updated_at =
//               CURRENT_TIMESTAMP

//           WHERE id = $1

//           RETURNING
//             id,
//             patient_id,
//             doctor_id,

//             appointment_date::TEXT
//               AS appointment_date,

//             appointment_time::TEXT
//               AS appointment_time,

//             token_number,
//             status,
//             notes,
//             created_at,
//             updated_at
//           `,
//         [appointmentId],
//       );

//       updatedAppointment = updatedAppointmentResult.rows[0];
//     }

//     // ======================================================
//     // AUDIT
//     // ======================================================

//     try {
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

//           "START_CONSULTATION",

//           "consultation",

//           consultation.id,

//           JSON.stringify({
//             consultation_id: consultation.id,

//             appointment_id: appointment.id,

//             patient_id: appointment.patient_id,

//             doctor_id: appointment.doctor_id,

//             previous_appointment_status: appointment.status,

//             new_appointment_status: "in_consultation",

//             repaired_missing_consultation:
//               appointment.status === "in_consultation",
//           }),
//         ],
//       );
//     } catch (auditError) {
//       console.error("START CONSULTATION AUDIT ERROR:", auditError);
//     }

//     // ======================================================
//     // COMMIT
//     // ======================================================

//     await client.query("COMMIT");

//     // ======================================================
//     // RESPONSE
//     // ======================================================

//     return NextResponse.json(
//       {
//         success: true,

//         message:
//           appointment.status === "in_consultation"
//             ? "Consultation record restored successfully."
//             : "Consultation started successfully.",

//         appointment: updatedAppointment,

//         consultation,

//         audio_recording: null,

//         transcript: null,

//         transcript_segments: [],
//       },
//       {
//         status: 201,
//         headers: noStoreHeaders(),
//       },
//     );
//   } catch (error) {
//     // ======================================================
//     // ROLLBACK
//     // ======================================================

//     if (client) {
//       try {
//         await client.query("ROLLBACK");
//       } catch (rollbackError) {
//         console.error("CONSULTATION ROLLBACK ERROR:", rollbackError);
//       }
//     }

//     console.error("START CONSULTATION ERROR:", error);

//     // ======================================================
//     // DUPLICATE CONSULTATION
//     // ======================================================

//     if (error.code === "23505") {
//       return NextResponse.json(
//         {
//           success: false,

//           message:
//             "A consultation already exists for this appointment. Reload the page to continue.",
//         },
//         {
//           status: 409,
//           headers: noStoreHeaders(),
//         },
//       );
//     }

//     // ======================================================
//     // ERROR RESPONSE
//     // ======================================================

//     return NextResponse.json(
//       {
//         success: false,

//         message: "Unable to start consultation.",

//         error:
//           process.env.NODE_ENV === "development" ? error.message : undefined,
//       },
//       {
//         status: 500,
//         headers: noStoreHeaders(),
//       },
//     );
//   } finally {
//     if (client) {
//       client.release();
//     }
//   }
// }

import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getPrivateFileUrl } from "@/lib/s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ======================================================
// HEADERS
// ======================================================

function noStoreHeaders() {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  };
}

// ======================================================
// GET LATEST AUDIO RECORDING
// ======================================================

async function getLatestAudioRecording(consultationId) {
  if (!consultationId) {
    return null;
  }

  const result = await db.query(
    `
    SELECT
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

    FROM audio_recordings

    WHERE consultation_id = $1

    ORDER BY
      created_at DESC,
      id DESC

    LIMIT 1
    `,
    [consultationId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  const recording = result.rows[0];

  let audioUrl = null;

  if (recording.storage_key) {
    try {
      audioUrl = await getPrivateFileUrl(recording.storage_key, 60 * 60);
    } catch (error) {
      console.error("GENERATE CONSULTATION AUDIO URL ERROR:", error);
    }
  }

  return {
    ...recording,
    audio_url: audioUrl,
  };
}

// ======================================================
// GET TRANSCRIPT
// ======================================================

async function getTranscript(consultationId) {
  if (!consultationId) {
    return null;
  }

  const result = await db.query(
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

  return result.rows[0] || null;
}

// ======================================================
// GET TRANSCRIPT SEGMENTS
// ======================================================

async function getTranscriptSegments(transcriptId) {
  if (!transcriptId) {
    return [];
  }

  const result = await db.query(
    `
    SELECT
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

    FROM transcript_segments

    WHERE transcript_id = $1

    ORDER BY
      segment_index ASC,
      id ASC
    `,
    [transcriptId],
  );

  return result.rows;
}

// ======================================================
// GET TRANSCRIPT + SEGMENTS
// ======================================================

async function getTranscriptData(consultationId) {
  const transcript = await getTranscript(consultationId);

  if (!transcript) {
    return {
      transcript: null,
      transcriptSegments: [],
    };
  }

  const transcriptSegments = await getTranscriptSegments(transcript.id);

  return {
    transcript,
    transcriptSegments,
  };
}

// ======================================================
// GET
// /api/doctors/consultations/start?appointment=6
// ======================================================

export async function GET(request) {
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
          message: "Only doctors can access consultations.",
        },
        {
          status: 403,
          headers: noStoreHeaders(),
        },
      );
    }

    // ======================================================
    // ACTIVE DOCTOR
    // ======================================================

    const doctorResult = await db.query(
      `
        SELECT
          id,
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

    if (!doctorResult.rows[0].is_active) {
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
    // APPOINTMENT ID
    // ======================================================

    const { searchParams } = new URL(request.url);

    const appointmentId = Number(searchParams.get("appointment"));

    if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid appointment ID is required.",
        },
        {
          status: 400,
          headers: noStoreHeaders(),
        },
      );
    }

    // ======================================================
    // APPOINTMENT + PATIENT
    // ======================================================

    const appointmentResult = await db.query(
      `
        SELECT
          a.id,
          a.patient_id,
          a.doctor_id,

          a.appointment_date::TEXT
            AS appointment_date,

          a.appointment_time::TEXT
            AS appointment_time,

          a.token_number,
          a.status,
          a.notes,
          a.created_at,
          a.updated_at,

          p.patient_code,
          p.name AS patient_name,
          p.date_of_birth,
          p.gender,
          p.phone,
          p.address,
          p.emergency_contact_name,
          p.emergency_contact_phone

        FROM appointments a

        INNER JOIN patients p
          ON p.id = a.patient_id

        WHERE a.id = $1

        LIMIT 1
        `,
      [appointmentId],
    );

    if (appointmentResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Appointment not found.",
        },
        {
          status: 404,
          headers: noStoreHeaders(),
        },
      );
    }

    const appointment = appointmentResult.rows[0];

    // ======================================================
    // OWNERSHIP
    // ======================================================

    if (Number(appointment.doctor_id) !== Number(session.userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "This appointment does not belong to you.",
        },
        {
          status: 403,
          headers: noStoreHeaders(),
        },
      );
    }

    // ======================================================
    // BLOCK CANCELLED / NO SHOW
    // ======================================================

    if (["cancelled", "no_show"].includes(appointment.status)) {
      return NextResponse.json(
        {
          success: false,
          message: "This appointment cannot be opened for consultation.",
        },
        {
          status: 400,
          headers: noStoreHeaders(),
        },
      );
    }

    // ======================================================
    // MEDICAL HISTORY
    // ======================================================

    const historyResult = await db.query(
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
          mh.created_by,
          mh.created_at,
          mh.updated_at,

          u.name AS created_by_name

        FROM medical_history mh

        LEFT JOIN users u
          ON u.id = mh.created_by

        WHERE mh.patient_id = $1

        ORDER BY
          mh.created_at DESC,
          mh.id DESC
        `,
      [appointment.patient_id],
    );

    // ======================================================
    // EXISTING CONSULTATION
    // ======================================================

    const consultationResult = await db.query(
      `
        SELECT
          id,
          appointment_id,
          patient_id,
          doctor_id,
          started_at,
          ended_at,
          status,
          clinical_notes,
          diagnosis,
          created_at,
          updated_at

        FROM consultations

        WHERE appointment_id = $1
          AND doctor_id = $2

        ORDER BY
          id DESC

        LIMIT 1
        `,
      [appointmentId, session.userId],
    );

    const consultation = consultationResult.rows[0] || null;

    // ======================================================
    // AUDIO + TRANSCRIPT + SEGMENTS
    // ======================================================

    let audioRecording = null;
    let transcript = null;
    let transcriptSegments = [];

    if (consultation?.id) {
      const [loadedAudioRecording, transcriptData] = await Promise.all([
        getLatestAudioRecording(consultation.id),

        getTranscriptData(consultation.id),
      ]);

      audioRecording = loadedAudioRecording;

      transcript = transcriptData.transcript;

      transcriptSegments = transcriptData.transcriptSegments;
    }

    // ======================================================
    // RESPONSE
    // ======================================================

    return NextResponse.json(
      {
        success: true,

        appointment: {
          id: appointment.id,

          patient_id: appointment.patient_id,

          doctor_id: appointment.doctor_id,

          appointment_date: appointment.appointment_date,

          appointment_time: appointment.appointment_time,

          token_number: appointment.token_number,

          status: appointment.status,

          notes: appointment.notes,
        },

        patient: {
          id: appointment.patient_id,

          patient_code: appointment.patient_code,

          name: appointment.patient_name,

          date_of_birth: appointment.date_of_birth,

          gender: appointment.gender,

          phone: appointment.phone,

          address: appointment.address,

          emergency_contact_name: appointment.emergency_contact_name,

          emergency_contact_phone: appointment.emergency_contact_phone,
        },

        medical_history: historyResult.rows,

        consultation,

        audio_recording: audioRecording,

        transcript,

        transcript_segments: transcriptSegments,
      },
      {
        status: 200,
        headers: noStoreHeaders(),
      },
    );
  } catch (error) {
    console.error("LOAD START CONSULTATION ERROR:", error);

    return NextResponse.json(
      {
        success: false,

        message: "Unable to load consultation.",

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

// ======================================================
// POST
// /api/doctors/consultations/start
//
// START CONSULTATION
// ======================================================

export async function POST(request) {
  let client = null;

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
          message: "Only doctors can start consultations.",
        },
        {
          status: 403,
          headers: noStoreHeaders(),
        },
      );
    }

    // ======================================================
    // ACTIVE DOCTOR
    // ======================================================

    const doctorResult = await db.query(
      `
        SELECT
          id,
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

    if (!doctorResult.rows[0].is_active) {
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
    // BODY
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

    const appointmentId = Number(body.appointment_id);

    if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid appointment ID is required.",
        },
        {
          status: 400,
          headers: noStoreHeaders(),
        },
      );
    }

    // ======================================================
    // TRANSACTION
    // ======================================================

    client = await db.connect();

    await client.query("BEGIN");

    // ======================================================
    // LOCK APPOINTMENT
    // ======================================================

    const appointmentResult = await client.query(
      `
        SELECT
          id,
          patient_id,
          doctor_id,

          appointment_date::TEXT
            AS appointment_date,

          appointment_time::TEXT
            AS appointment_time,

          token_number,
          status,
          notes,
          created_at,
          updated_at

        FROM appointments

        WHERE id = $1

        FOR UPDATE
        `,
      [appointmentId],
    );

    if (appointmentResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: "Appointment not found.",
        },
        {
          status: 404,
          headers: noStoreHeaders(),
        },
      );
    }

    const appointment = appointmentResult.rows[0];

    // ======================================================
    // OWNERSHIP
    // ======================================================

    if (Number(appointment.doctor_id) !== Number(session.userId)) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: "This appointment does not belong to you.",
        },
        {
          status: 403,
          headers: noStoreHeaders(),
        },
      );
    }

    // ======================================================
    // BLOCK CANCELLED / NO SHOW
    // ======================================================

    if (["cancelled", "no_show"].includes(appointment.status)) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: "This appointment cannot be started.",
        },
        {
          status: 400,
          headers: noStoreHeaders(),
        },
      );
    }

    // ======================================================
    // FIND EXISTING CONSULTATION
    // ======================================================

    const existingConsultationResult = await client.query(
      `
        SELECT
          id,
          appointment_id,
          patient_id,
          doctor_id,
          started_at,
          ended_at,
          status,
          clinical_notes,
          diagnosis,
          created_at,
          updated_at

        FROM consultations

        WHERE appointment_id = $1
          AND doctor_id = $2

        ORDER BY
          id DESC

        LIMIT 1
        `,
      [appointmentId, session.userId],
    );

    // ======================================================
    // EXISTING CONSULTATION
    // ======================================================

    if (existingConsultationResult.rows.length > 0) {
      const existingConsultation = existingConsultationResult.rows[0];

      // ====================================================
      // COMPLETED
      // ====================================================

      if (existingConsultation.status === "completed") {
        await client.query("COMMIT");

        const [audioRecording, transcriptData] = await Promise.all([
          getLatestAudioRecording(existingConsultation.id),

          getTranscriptData(existingConsultation.id),
        ]);

        return NextResponse.json(
          {
            success: true,

            message: "Consultation is already completed.",

            appointment,

            consultation: existingConsultation,

            audio_recording: audioRecording,

            transcript: transcriptData.transcript,

            transcript_segments: transcriptData.transcriptSegments,
          },
          {
            status: 200,
            headers: noStoreHeaders(),
          },
        );
      }

      // ====================================================
      // REPAIR APPOINTMENT STATUS
      // ====================================================

      let updatedAppointment = appointment;

      if (
        appointment.status !== "in_consultation" &&
        appointment.status !== "completed"
      ) {
        const updateResult = await client.query(
          `
            UPDATE appointments

            SET
              status = 'in_consultation',
              updated_at = CURRENT_TIMESTAMP

            WHERE id = $1

            RETURNING
              id,
              patient_id,
              doctor_id,

              appointment_date::TEXT
                AS appointment_date,

              appointment_time::TEXT
                AS appointment_time,

              token_number,
              status,
              notes,
              created_at,
              updated_at
            `,
          [appointmentId],
        );

        updatedAppointment = updateResult.rows[0];
      }

      await client.query("COMMIT");

      // ====================================================
      // AUDIO + TRANSCRIPT + SEGMENTS
      // ====================================================

      const [audioRecording, transcriptData] = await Promise.all([
        getLatestAudioRecording(existingConsultation.id),

        getTranscriptData(existingConsultation.id),
      ]);

      return NextResponse.json(
        {
          success: true,

          message: "Existing consultation loaded.",

          appointment: updatedAppointment,

          consultation: existingConsultation,

          audio_recording: audioRecording,

          transcript: transcriptData.transcript,

          transcript_segments: transcriptData.transcriptSegments,
        },
        {
          status: 200,
          headers: noStoreHeaders(),
        },
      );
    }

    // ======================================================
    // NEW CONSULTATION STATUS
    // ======================================================

    const canCreateConsultation = ["waiting", "in_consultation"].includes(
      appointment.status,
    );

    if (!canCreateConsultation) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,

          message:
            "Patient must be in waiting status before consultation can start.",

          appointment_status: appointment.status,
        },
        {
          status: 400,
          headers: noStoreHeaders(),
        },
      );
    }

    // ======================================================
    // CREATE CONSULTATION
    // ======================================================

    const consultationResult = await client.query(
      `
        INSERT INTO consultations (
          appointment_id,
          patient_id,
          doctor_id,
          started_at,
          status
        )

        VALUES (
          $1,
          $2,
          $3,
          CURRENT_TIMESTAMP,
          'draft'
        )

        RETURNING
          id,
          appointment_id,
          patient_id,
          doctor_id,
          started_at,
          ended_at,
          status,
          clinical_notes,
          diagnosis,
          created_at,
          updated_at
        `,
      [appointment.id, appointment.patient_id, appointment.doctor_id],
    );

    const consultation = consultationResult.rows[0];

    // ======================================================
    // APPOINTMENT STATUS
    // ======================================================

    let updatedAppointment = appointment;

    if (appointment.status !== "in_consultation") {
      const updatedAppointmentResult = await client.query(
        `
          UPDATE appointments

          SET
            status = 'in_consultation',
            updated_at = CURRENT_TIMESTAMP

          WHERE id = $1

          RETURNING
            id,
            patient_id,
            doctor_id,

            appointment_date::TEXT
              AS appointment_date,

            appointment_time::TEXT
              AS appointment_time,

            token_number,
            status,
            notes,
            created_at,
            updated_at
          `,
        [appointmentId],
      );

      updatedAppointment = updatedAppointmentResult.rows[0];
    }

    // ======================================================
    // AUDIT
    // ======================================================

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

          "START_CONSULTATION",

          "consultation",

          consultation.id,

          JSON.stringify({
            consultation_id: consultation.id,

            appointment_id: appointment.id,

            patient_id: appointment.patient_id,

            doctor_id: appointment.doctor_id,

            previous_appointment_status: appointment.status,

            new_appointment_status: "in_consultation",

            repaired_missing_consultation:
              appointment.status === "in_consultation",
          }),
        ],
      );
    } catch (auditError) {
      console.error("START CONSULTATION AUDIT ERROR:", auditError);
    }

    // ======================================================
    // COMMIT
    // ======================================================

    await client.query("COMMIT");

    // ======================================================
    // RESPONSE
    // ======================================================

    return NextResponse.json(
      {
        success: true,

        message:
          appointment.status === "in_consultation"
            ? "Consultation record restored successfully."
            : "Consultation started successfully.",

        appointment: updatedAppointment,

        consultation,

        audio_recording: null,

        transcript: null,

        transcript_segments: [],
      },
      {
        status: 201,
        headers: noStoreHeaders(),
      },
    );
  } catch (error) {
    // ======================================================
    // ROLLBACK
    // ======================================================

    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("CONSULTATION ROLLBACK ERROR:", rollbackError);
      }
    }

    console.error("START CONSULTATION ERROR:", error);

    // ======================================================
    // DUPLICATE CONSULTATION
    // ======================================================

    if (error.code === "23505") {
      return NextResponse.json(
        {
          success: false,

          message:
            "A consultation already exists for this appointment. Reload the page to continue.",
        },
        {
          status: 409,
          headers: noStoreHeaders(),
        },
      );
    }

    return NextResponse.json(
      {
        success: false,

        message: "Unable to start consultation.",

        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      {
        status: 500,
        headers: noStoreHeaders(),
      },
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}

// ======================================================
// PATCH
// /api/doctors/consultations/start
//
// COMPLETE CONSULTATION
//
// BODY:
// {
//   consultation_id: 10,
//   action: "complete"
// }
// ======================================================

export async function PATCH(request) {
  let client = null;

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
          message: "Only doctors can update consultations.",
        },
        {
          status: 403,
          headers: noStoreHeaders(),
        },
      );
    }

    // ======================================================
    // ACTIVE DOCTOR
    // ======================================================

    const doctorResult = await db.query(
      `
        SELECT
          id,
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

    if (!doctorResult.rows[0].is_active) {
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
    // BODY
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

    const action =
      typeof body.action === "string" ? body.action.trim().toLowerCase() : "";

    // ======================================================
    // VALIDATION
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

    if (action !== "complete") {
      return NextResponse.json(
        {
          success: false,
          message: "Unsupported consultation action.",
        },
        {
          status: 400,
          headers: noStoreHeaders(),
        },
      );
    }

    // ======================================================
    // TRANSACTION
    // ======================================================

    client = await db.connect();

    await client.query("BEGIN");

    // ======================================================
    // LOCK CONSULTATION
    // ======================================================

    const consultationResult = await client.query(
      `
        SELECT
          id,
          appointment_id,
          patient_id,
          doctor_id,
          started_at,
          ended_at,
          status,
          clinical_notes,
          diagnosis,
          created_at,
          updated_at

        FROM consultations

        WHERE id = $1

        FOR UPDATE
        `,
      [consultationId],
    );

    if (consultationResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: "Consultation not found.",
        },
        {
          status: 404,
          headers: noStoreHeaders(),
        },
      );
    }

    const consultation = consultationResult.rows[0];

    // ======================================================
    // OWNERSHIP
    // ======================================================

    if (String(consultation.doctor_id) !== String(session.userId)) {
      await client.query("ROLLBACK");

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
    // ALREADY COMPLETED
    // ======================================================

    if (consultation.status === "completed") {
      // Make sure appointment is also repaired to completed.

      let appointment = null;

      if (consultation.appointment_id) {
        const appointmentResult = await client.query(
          `
            UPDATE appointments

            SET
              status = 'completed',
              updated_at = CURRENT_TIMESTAMP

            WHERE id = $1
              AND doctor_id = $2
              AND status <> 'completed'

            RETURNING
              id,
              patient_id,
              doctor_id,

              appointment_date::TEXT
                AS appointment_date,

              appointment_time::TEXT
                AS appointment_time,

              token_number,
              status,
              notes,
              created_at,
              updated_at
            `,
          [consultation.appointment_id, session.userId],
        );

        if (appointmentResult.rows.length > 0) {
          appointment = appointmentResult.rows[0];
        } else {
          const existingAppointmentResult = await client.query(
            `
              SELECT
                id,
                patient_id,
                doctor_id,

                appointment_date::TEXT
                  AS appointment_date,

                appointment_time::TEXT
                  AS appointment_time,

                token_number,
                status,
                notes,
                created_at,
                updated_at

              FROM appointments

              WHERE id = $1
                AND doctor_id = $2

              LIMIT 1
              `,
            [consultation.appointment_id, session.userId],
          );

          appointment = existingAppointmentResult.rows[0] || null;
        }
      }

      await client.query("COMMIT");

      const [audioRecording, transcriptData] = await Promise.all([
        getLatestAudioRecording(consultation.id),

        getTranscriptData(consultation.id),
      ]);

      return NextResponse.json(
        {
          success: true,

          message: "Consultation is already completed.",

          appointment,

          consultation,

          audio_recording: audioRecording,

          transcript: transcriptData.transcript,

          transcript_segments: transcriptData.transcriptSegments,
        },
        {
          status: 200,
          headers: noStoreHeaders(),
        },
      );
    }

    // ======================================================
    // BLOCK INVALID CONSULTATION STATES
    //
    // These are the states used by your current workflow:
    //
    // draft
    // recorded
    // processing
    // transcribed
    //
    // We intentionally do NOT allow completion while
    // transcription is still processing.
    // ======================================================

    const completableStatuses = ["draft", "recorded", "transcribed"];

    if (!completableStatuses.includes(consultation.status)) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,

          message:
            consultation.status === "processing"
              ? "Please wait for transcription processing to finish before completing the consultation."
              : "This consultation cannot be completed in its current status.",

          consultation_status: consultation.status,
        },
        {
          status: 400,
          headers: noStoreHeaders(),
        },
      );
    }

    // ======================================================
    // LOCK APPOINTMENT
    // ======================================================

    let appointment = null;

    if (consultation.appointment_id) {
      const appointmentResult = await client.query(
        `
          SELECT
            id,
            patient_id,
            doctor_id,

            appointment_date::TEXT
              AS appointment_date,

            appointment_time::TEXT
              AS appointment_time,

            token_number,
            status,
            notes,
            created_at,
            updated_at

          FROM appointments

          WHERE id = $1

          FOR UPDATE
          `,
        [consultation.appointment_id],
      );

      if (appointmentResult.rows.length === 0) {
        await client.query("ROLLBACK");

        return NextResponse.json(
          {
            success: false,
            message: "Related appointment was not found.",
          },
          {
            status: 404,
            headers: noStoreHeaders(),
          },
        );
      }

      appointment = appointmentResult.rows[0];

      if (String(appointment.doctor_id) !== String(session.userId)) {
        await client.query("ROLLBACK");

        return NextResponse.json(
          {
            success: false,
            message: "Related appointment does not belong to you.",
          },
          {
            status: 403,
            headers: noStoreHeaders(),
          },
        );
      }

      // Cancelled / no-show appointment should never
      // silently become completed.

      if (["cancelled", "no_show"].includes(appointment.status)) {
        await client.query("ROLLBACK");

        return NextResponse.json(
          {
            success: false,

            message:
              "A cancelled or no-show appointment cannot be completed as a consultation.",

            appointment_status: appointment.status,
          },
          {
            status: 400,
            headers: noStoreHeaders(),
          },
        );
      }
    }

    // ======================================================
    // COMPLETE CONSULTATION
    // ======================================================

    const updatedConsultationResult = await client.query(
      `
        UPDATE consultations

        SET
          status = 'completed',

          ended_at = COALESCE(
            ended_at,
            CURRENT_TIMESTAMP
          ),

          updated_at =
            CURRENT_TIMESTAMP

        WHERE id = $1
          AND doctor_id = $2

        RETURNING
          id,
          appointment_id,
          patient_id,
          doctor_id,
          started_at,
          ended_at,
          status,
          clinical_notes,
          diagnosis,
          created_at,
          updated_at
        `,
      [consultationId, session.userId],
    );

    const updatedConsultation = updatedConsultationResult.rows[0];

    // ======================================================
    // COMPLETE APPOINTMENT
    // ======================================================

    let updatedAppointment = appointment;

    if (consultation.appointment_id) {
      const updatedAppointmentResult = await client.query(
        `
          UPDATE appointments

          SET
            status = 'completed',

            updated_at =
              CURRENT_TIMESTAMP

          WHERE id = $1
            AND doctor_id = $2

          RETURNING
            id,
            patient_id,
            doctor_id,

            appointment_date::TEXT
              AS appointment_date,

            appointment_time::TEXT
              AS appointment_time,

            token_number,
            status,
            notes,
            created_at,
            updated_at
          `,
        [consultation.appointment_id, session.userId],
      );

      updatedAppointment = updatedAppointmentResult.rows[0] || appointment;
    }

    // ======================================================
    // AUDIT
    // ======================================================

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

          "COMPLETE_CONSULTATION",

          "consultation",

          updatedConsultation.id,

          JSON.stringify({
            consultation_id: updatedConsultation.id,

            appointment_id: updatedConsultation.appointment_id,

            patient_id: updatedConsultation.patient_id,

            doctor_id: updatedConsultation.doctor_id,

            previous_consultation_status: consultation.status,

            new_consultation_status: "completed",

            previous_appointment_status: appointment?.status || null,

            new_appointment_status: "completed",

            started_at: updatedConsultation.started_at,

            ended_at: updatedConsultation.ended_at,
          }),
        ],
      );
    } catch (auditError) {
      console.error("COMPLETE CONSULTATION AUDIT ERROR:", auditError);
    }

    // ======================================================
    // COMMIT
    // ======================================================

    await client.query("COMMIT");

    // ======================================================
    // AUDIO + TRANSCRIPT + SEGMENTS
    //
    // Keep all existing consultation data available after
    // completion so frontend can still play/download/read it.
    // ======================================================

    const [audioRecording, transcriptData] = await Promise.all([
      getLatestAudioRecording(updatedConsultation.id),

      getTranscriptData(updatedConsultation.id),
    ]);

    // ======================================================
    // RESPONSE
    // ======================================================

    return NextResponse.json(
      {
        success: true,

        message: "Consultation completed successfully.",

        appointment: updatedAppointment,

        consultation: updatedConsultation,

        audio_recording: audioRecording,

        transcript: transcriptData.transcript,

        transcript_segments: transcriptData.transcriptSegments,
      },
      {
        status: 200,
        headers: noStoreHeaders(),
      },
    );
  } catch (error) {
    // ======================================================
    // ROLLBACK
    // ======================================================

    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("COMPLETE CONSULTATION ROLLBACK ERROR:", rollbackError);
      }
    }

    console.error("COMPLETE CONSULTATION ERROR:", error);

    // ======================================================
    // RESPONSE
    // ======================================================

    return NextResponse.json(
      {
        success: false,

        message: "Unable to complete consultation.",

        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      {
        status: 500,
        headers: noStoreHeaders(),
      },
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}
