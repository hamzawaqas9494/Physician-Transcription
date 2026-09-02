import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// ======================================================
// GET COMPOUNDER SETTINGS
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

    if (session.role !== "compounder") {
      return NextResponse.json(
        {
          success: false,
          message: "Only compounders can access these settings.",
        },
        { status: 403 },
      );
    }

    // =========================
    // GET COMPOUNDER
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
        AND role = 'compounder'

      LIMIT 1
      `,
      [session.userId],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Compounder account not found.",
        },
        { status: 404 },
      );
    }

    const compounder = result.rows[0];

    // =========================
    // ACCOUNT STATUS
    // =========================

    if (!compounder.is_active) {
      return NextResponse.json(
        {
          success: false,
          message: "Compounder account is inactive.",
        },
        { status: 403 },
      );
    }

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json(
      {
        success: true,
        compounder,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET COMPOUNDER SETTINGS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load compounder settings.",

        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

// ======================================================
// PATCH COMPOUNDER PROFILE
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

    if (session.role !== "compounder") {
      return NextResponse.json(
        {
          success: false,
          message: "Only compounders can update these settings.",
        },
        { status: 403 },
      );
    }

    // =========================
    // REQUEST BODY
    // =========================

    const body = await request.json();

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
    // CURRENT COMPOUNDER
    // =========================

    const existingResult = await db.query(
      `
      SELECT
        id,
        phone,
        is_active

      FROM users

      WHERE id = $1
        AND role = 'compounder'

      LIMIT 1
      `,
      [session.userId],
    );

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Compounder account not found.",
        },
        { status: 404 },
      );
    }

    const existingCompounder = existingResult.rows[0];

    if (!existingCompounder.is_active) {
      return NextResponse.json(
        {
          success: false,
          message: "Compounder account is inactive.",
        },
        { status: 403 },
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
        updated_at = CURRENT_TIMESTAMP

      WHERE id = $2
        AND role = 'compounder'

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
          message: "Compounder account not found.",
        },
        { status: 404 },
      );
    }

    const compounder = result.rows[0];

    // =========================
    // AUDIT LOG
    // =========================

    if (existingCompounder.phone !== compounder.phone) {
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
            "UPDATE_COMPOUNDER_PROFILE",
            "user",
            session.userId,

            JSON.stringify({
              old_phone: existingCompounder.phone,
              new_phone: compounder.phone,
              updated_fields: ["phone"],
            }),
          ],
        );
      } catch (auditError) {
        console.error("COMPOUNDER SETTINGS AUDIT ERROR:", auditError);
      }
    }

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully.",
        compounder,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("UPDATE COMPOUNDER SETTINGS ERROR:", error);

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
