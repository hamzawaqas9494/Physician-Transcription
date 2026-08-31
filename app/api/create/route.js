import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

async function createTables() {
  // USERS
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(30) NOT NULL
        CHECK (role IN ('doctor', 'compounder')),
      phone VARCHAR(30),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      last_login_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // PATIENTS
  await db.query(`
    CREATE TABLE IF NOT EXISTS patients (
      id SERIAL PRIMARY KEY,
      patient_code VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(150) NOT NULL,
      date_of_birth DATE,
      gender VARCHAR(30),
      phone VARCHAR(30),
      address TEXT,
      emergency_contact_name VARCHAR(150),
      emergency_contact_phone VARCHAR(30),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // MEDICAL HISTORY
  await db.query(`
    CREATE TABLE IF NOT EXISTS medical_history (
      id SERIAL PRIMARY KEY,
      patient_id INTEGER NOT NULL
        REFERENCES patients(id)
        ON DELETE CASCADE,
      previous_diseases TEXT,
      allergies TEXT,
      current_medications TEXT,
      previous_surgeries TEXT,
      family_history TEXT,
      additional_notes TEXT,
      created_by INTEGER
        REFERENCES users(id)
        ON DELETE SET NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // APPOINTMENTS
  await db.query(`
    CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      patient_id INTEGER NOT NULL
        REFERENCES patients(id)
        ON DELETE CASCADE,
      doctor_id INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE RESTRICT,
      appointment_date DATE NOT NULL,
      appointment_time TIME NOT NULL,
      token_number VARCHAR(30),
      status VARCHAR(30) NOT NULL DEFAULT 'scheduled'
        CHECK (
          status IN (
            'scheduled',
            'checked_in',
            'waiting',
            'in_consultation',
            'completed',
            'cancelled',
            'no_show'
          )
        ),
      notes TEXT,
      created_by INTEGER
        REFERENCES users(id)
        ON DELETE SET NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (
        doctor_id,
        appointment_date,
        appointment_time
      )
    );
  `);

  // CONSULTATIONS
  await db.query(`
    CREATE TABLE IF NOT EXISTS consultations (
      id SERIAL PRIMARY KEY,
      appointment_id INTEGER UNIQUE
        REFERENCES appointments(id)
        ON DELETE SET NULL,
      patient_id INTEGER NOT NULL
        REFERENCES patients(id)
        ON DELETE CASCADE,
      doctor_id INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE RESTRICT,
      started_at TIMESTAMP,
      ended_at TIMESTAMP,
      status VARCHAR(30) NOT NULL DEFAULT 'draft'
        CHECK (
          status IN (
            'draft',
            'recorded',
            'processing',
            'transcribed',
            'reviewed',
            'completed',
            'failed'
          )
        ),
      clinical_notes TEXT,
      diagnosis TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // AUDIO RECORDINGS
  await db.query(`
    CREATE TABLE IF NOT EXISTS audio_recordings (
      id SERIAL PRIMARY KEY,
      consultation_id INTEGER NOT NULL
        REFERENCES consultations(id)
        ON DELETE CASCADE,
      storage_key TEXT NOT NULL,
      original_file_name TEXT,
      mime_type VARCHAR(100),
      file_size BIGINT,
      duration_seconds DECIMAL(12,3),
      status VARCHAR(30) NOT NULL DEFAULT 'uploaded'
        CHECK (
          status IN (
            'uploaded',
            'queued',
            'processing',
            'completed',
            'failed'
          )
        ),
      error_message TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // TRANSCRIPTION JOBS
  await db.query(`
    CREATE TABLE IF NOT EXISTS transcription_jobs (
      id SERIAL PRIMARY KEY,
      audio_recording_id INTEGER NOT NULL
        REFERENCES audio_recordings(id)
        ON DELETE CASCADE,
      status VARCHAR(30) NOT NULL DEFAULT 'queued'
        CHECK (
          status IN (
            'queued',
            'processing',
            'completed',
            'failed',
            'cancelled'
          )
        ),
      provider VARCHAR(100),
      model VARCHAR(100),
      language VARCHAR(20),
      started_at TIMESTAMP,
      completed_at TIMESTAMP,
      error_message TEXT,
      retry_count INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // TRANSCRIPTS
  await db.query(`
    CREATE TABLE IF NOT EXISTS transcripts (
      id SERIAL PRIMARY KEY,
      consultation_id INTEGER UNIQUE NOT NULL
        REFERENCES consultations(id)
        ON DELETE CASCADE,
      transcription_job_id INTEGER
        REFERENCES transcription_jobs(id)
        ON DELETE SET NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'draft'
        CHECK (
          status IN (
            'draft',
            'processing',
            'ready',
            'reviewed',
            'failed'
          )
        ),
      language VARCHAR(20),
      full_text TEXT,
      edited_text TEXT,
      word_count INTEGER,
      confidence DECIMAL(5,2),
      reviewed_by INTEGER
        REFERENCES users(id)
        ON DELETE SET NULL,
      reviewed_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // TRANSCRIPT SEGMENTS
  await db.query(`
    CREATE TABLE IF NOT EXISTS transcript_segments (
      id SERIAL PRIMARY KEY,
      transcript_id INTEGER NOT NULL
        REFERENCES transcripts(id)
        ON DELETE CASCADE,
      speaker VARCHAR(100),
      start_seconds DECIMAL(12,3) NOT NULL,
      end_seconds DECIMAL(12,3) NOT NULL,
      text TEXT NOT NULL,
      sequence_no INTEGER NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (transcript_id, sequence_no)
    );
  `);

  // DOCUMENTS
  await db.query(`
    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      patient_id INTEGER NOT NULL
        REFERENCES patients(id)
        ON DELETE CASCADE,
      uploaded_by INTEGER
        REFERENCES users(id)
        ON DELETE SET NULL,
      storage_key TEXT NOT NULL,
      file_name TEXT NOT NULL,
      mime_type VARCHAR(100),
      file_size BIGINT,
      document_type VARCHAR(50),
      description TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // AUDIT LOGS
  await db.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER
        REFERENCES users(id)
        ON DELETE SET NULL,
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(100),
      entity_id INTEGER,
      details JSONB,
      ip_address INET,
      user_agent TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // INDEXES
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_patients_name
      ON patients(name);

    CREATE INDEX IF NOT EXISTS idx_patients_phone
      ON patients(phone);

    CREATE INDEX IF NOT EXISTS idx_medical_history_patient
      ON medical_history(patient_id);

    CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date
      ON appointments(doctor_id, appointment_date);

    CREATE INDEX IF NOT EXISTS idx_appointments_patient
      ON appointments(patient_id);

    CREATE INDEX IF NOT EXISTS idx_appointments_status
      ON appointments(status);

    CREATE INDEX IF NOT EXISTS idx_consultations_patient
      ON consultations(patient_id);

    CREATE INDEX IF NOT EXISTS idx_consultations_doctor
      ON consultations(doctor_id);

    CREATE INDEX IF NOT EXISTS idx_audio_consultation
      ON audio_recordings(consultation_id);

    CREATE INDEX IF NOT EXISTS idx_transcription_jobs_audio
      ON transcription_jobs(audio_recording_id);

    CREATE INDEX IF NOT EXISTS idx_transcription_jobs_status
      ON transcription_jobs(status);

    CREATE INDEX IF NOT EXISTS idx_transcripts_status
      ON transcripts(status);

    CREATE INDEX IF NOT EXISTS idx_transcript_segments_transcript
      ON transcript_segments(transcript_id, sequence_no);

    CREATE INDEX IF NOT EXISTS idx_documents_patient
      ON documents(patient_id);

    CREATE INDEX IF NOT EXISTS idx_audit_logs_user
      ON audit_logs(user_id);

    CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
      ON audit_logs(entity_type, entity_id);
  `);
}

export async function GET() {
  try {
    await createTables();

    return NextResponse.json({
      success: true,
      message: "All database tables created successfully.",
      tables: [
        "users",
        "patients",
        "medical_history",
        "appointments",
        "consultations",
        "audio_recordings",
        "transcription_jobs",
        "transcripts",
        "transcript_segments",
        "documents",
        "audit_logs",
      ],
    });
  } catch (error) {
    console.error("Database setup error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Database table creation failed.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    await createTables();

    return NextResponse.json({
      success: true,
      message: "All database tables created successfully.",
      tables: [
        "users",
        "patients",
        "medical_history",
        "appointments",
        "consultations",
        "audio_recordings",
        "transcription_jobs",
        "transcripts",
        "transcript_segments",
        "documents",
        "audit_logs",
      ],
    });
  } catch (error) {
    console.error("Database setup error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Database table creation failed.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
