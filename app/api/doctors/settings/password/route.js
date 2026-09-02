import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// ======================================================
// PATCH DOCTOR PASSWORD
// ======================================================

export async function PATCH(request) {
  try {
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
          message: "Only doctors can change this password.",
        },
        { status: 403 },
      );
    }

    const body = await request.json();

    const currentPassword = body.current_password || "";
    const newPassword = body.new_password || "";
    const confirmPassword = body.confirm_password || "";

    // =========================
    // VALIDATION
    // =========================

    if (!currentPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Current password is required.",
        },
        { status: 400 },
      );
    }

    if (!newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "New password is required.",
        },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "New password must be at least 8 characters long.",
        },
        { status: 400 },
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "New passwords do not match.",
        },
        { status: 400 },
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "New password must be different from current password.",
        },
        { status: 400 },
      );
    }

    // =========================
    // GET PASSWORD HASH
    // =========================

    const userResult = await db.query(
      `
      SELECT
        id,
        password_hash

      FROM users

      WHERE id = $1
        AND role = 'doctor'

      LIMIT 1
      `,
      [session.userId],
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor account not found.",
        },
        { status: 404 },
      );
    }

    const user = userResult.rows[0];

    // =========================
    // VERIFY CURRENT PASSWORD
    // =========================

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password_hash,
    );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          success: false,
          message: "Current password is incorrect.",
        },
        { status: 400 },
      );
    }

    // =========================
    // HASH NEW PASSWORD
    // =========================

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // =========================
    // UPDATE
    // =========================

    await db.query(
      `
      UPDATE users

      SET
        password_hash = $1,
        updated_at = CURRENT_TIMESTAMP

      WHERE id = $2
      `,
      [newPasswordHash, session.userId],
    );

    // =========================
    // AUDIT
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
          "CHANGE_PASSWORD",
          "user",
          session.userId,
          JSON.stringify({
            changed_at: new Date().toISOString(),
          }),
        ],
      );
    } catch (auditError) {
      console.error("CHANGE PASSWORD AUDIT ERROR:", auditError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Password changed successfully.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("CHANGE DOCTOR PASSWORD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to change password.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
