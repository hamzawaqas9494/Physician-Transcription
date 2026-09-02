import { NextResponse } from "next/server";

import { db } from "@/lib/db";

import { getSession } from "@/lib/auth";

import { getPrivateFileUrl } from "@/lib/s3";

export const dynamic = "force-dynamic";

// ======================================================
// PREPARE DOCTOR RESPONSE
// ======================================================

async function prepareDoctorResponse(doctor) {
  if (!doctor) {
    return null;
  }

  let profilePictureUrl = null;

  if (doctor.profile_picture) {
    try {
      profilePictureUrl = await getPrivateFileUrl(doctor.profile_picture, 3600);
    } catch (error) {
      console.error("DOCTOR PROFILE SIGNED URL ERROR:", error);
    }
  }

  return {
    ...doctor,

    // Permanent S3 key stored in database
    profile_picture_key: doctor.profile_picture || null,

    // Temporary URL for frontend
    profile_picture: profilePictureUrl,
  };
}

// ======================================================
// GET DOCTOR SETTINGS
// ======================================================

export async function GET() {
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
          message: "Only doctors can access doctor settings.",
        },
        { status: 403 },
      );
    }

    // =========================
    // DOCTOR
    // =========================

    const result = await db.query(
      `
      SELECT
        id,
        name,
        email,
        phone,
        profile_picture,
        role,
        is_active,
        last_login_at,
        created_at,
        updated_at

      FROM users

      WHERE id = $1
        AND role = 'doctor'

      LIMIT 1
      `,
      [session.userId],
    );

    // =========================
    // NOT FOUND
    // =========================

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor account not found.",
        },
        { status: 404 },
      );
    }

    const doctor = result.rows[0];

    // =========================
    // ACTIVE CHECK
    // =========================

    if (!doctor.is_active) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor account is inactive.",
        },
        { status: 403 },
      );
    }

    // =========================
    // PREPARE PROFILE IMAGE
    // =========================

    const responseDoctor = await prepareDoctorResponse(doctor);

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json(
      {
        success: true,

        doctor: responseDoctor,
      },
      {
        status: 200,

        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  } catch (error) {
    console.error("GET DOCTOR SETTINGS ERROR:", error);

    return NextResponse.json(
      {
        success: false,

        message: "Unable to load doctor settings.",

        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

// ======================================================
// PATCH DOCTOR PROFILE
//
// Doctor can currently update phone only.
// ======================================================

export async function PATCH(request) {
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
          message: "Only doctors can update doctor settings.",
        },
        { status: 403 },
      );
    }

    // =========================
    // BODY
    // =========================

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 },
      );
    }

    const phone =
      typeof body.phone === "string" ? body.phone.trim() || null : null;

    // =========================
    // PHONE VALIDATION
    // =========================

    if (phone && phone.length > 30) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number is too long.",
        },
        { status: 400 },
      );
    }

    if (phone && !/^[0-9+\-\s()]+$/.test(phone)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid phone number.",
        },
        { status: 400 },
      );
    }

    // =========================
    // CURRENT DOCTOR
    // =========================

    const existingResult = await db.query(
      `
        SELECT
          id,
          name,
          email,
          phone,
          profile_picture,
          role,
          is_active,
          last_login_at,
          created_at,
          updated_at

        FROM users

        WHERE id = $1
          AND role = 'doctor'

        LIMIT 1
        `,
      [session.userId],
    );

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor account not found.",
        },
        { status: 404 },
      );
    }

    const existingDoctor = existingResult.rows[0];

    // =========================
    // ACTIVE CHECK
    // =========================

    if (!existingDoctor.is_active) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor account is inactive.",
        },
        { status: 403 },
      );
    }

    // =========================
    // NO CHANGES
    // =========================

    if ((existingDoctor.phone || null) === phone) {
      const responseDoctor = await prepareDoctorResponse(existingDoctor);

      return NextResponse.json(
        {
          success: true,

          message: "No profile changes detected.",

          doctor: responseDoctor,
        },
        { status: 200 },
      );
    }

    // =========================
    // UPDATE
    // =========================

    const result = await db.query(
      `
      UPDATE users

      SET
        phone = $1,
        updated_at =
          CURRENT_TIMESTAMP

      WHERE id = $2
        AND role = 'doctor'

      RETURNING
        id,
        name,
        email,
        phone,
        profile_picture,
        role,
        is_active,
        last_login_at,
        created_at,
        updated_at
      `,
      [phone, session.userId],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor account not found.",
        },
        { status: 404 },
      );
    }

    const doctor = result.rows[0];

    // =========================
    // AUDIT LOG
    // =========================

    try {
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

          "UPDATE_DOCTOR_PROFILE",

          "user",

          session.userId,

          JSON.stringify({
            updated_fields: ["phone"],

            old_phone: existingDoctor.phone,

            new_phone: doctor.phone,
          }),
        ],
      );
    } catch (auditError) {
      console.error("DOCTOR SETTINGS AUDIT ERROR:", auditError);
    }

    // =========================
    // SIGNED PROFILE URL
    // =========================

    const responseDoctor = await prepareDoctorResponse(doctor);

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json(
      {
        success: true,

        message: "Profile updated successfully.",

        doctor: responseDoctor,
      },
      {
        status: 200,

        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  } catch (error) {
    console.error("UPDATE DOCTOR SETTINGS ERROR:", error);

    return NextResponse.json(
      {
        success: false,

        message: "Unable to update profile.",

        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
