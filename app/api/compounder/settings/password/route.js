import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// ======================================================
// PATCH COMPOUNDER PASSWORD
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
    // ROLE CHECK
    // =========================

    if (session.role !== "compounder") {
      return NextResponse.json(
        {
          success: false,
          message: "Only compounders can change this password.",
        },
        { status: 403 },
      );
    }

    // =========================
    // BODY
    // =========================

    const body = await request.json();

    const currentPassword =
      typeof body.current_password === "string" ? body.current_password : "";

    const newPassword =
      typeof body.new_password === "string" ? body.new_password : "";

    const confirmPassword =
      typeof body.confirm_password === "string" ? body.confirm_password : "";

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

    if (newPassword.length > 128) {
      return NextResponse.json(
        {
          success: false,
          message: "New password is too long.",
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
          message: "New password must be different from your current password.",
        },
        { status: 400 },
      );
    }

    // =========================
    // GET USER
    // =========================

    const userResult = await db.query(
      `
      SELECT
        id,
        name,
        email,
        password_hash,
        is_active

      FROM users

      WHERE id = $1
        AND role = 'compounder'

      LIMIT 1
      `,
      [session.userId],
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Compounder account not found.",
        },
        { status: 404 },
      );
    }

    const user = userResult.rows[0];

    // =========================
    // ACTIVE ACCOUNT CHECK
    // =========================

    if (!user.is_active) {
      return NextResponse.json(
        {
          success: false,
          message: "Your account is inactive.",
        },
        { status: 403 },
      );
    }

    // =========================
    // VERIFY CURRENT PASSWORD
    // =========================

    const currentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password_hash,
    );

    if (!currentPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Current password is incorrect.",
        },
        { status: 400 },
      );
    }

    // =========================
    // EXTRA CHECK:
    // Prevent same password even if string comparison
    // somehow wasn't enough
    // =========================

    const sameAsExistingPassword = await bcrypt.compare(
      newPassword,
      user.password_hash,
    );

    if (sameAsExistingPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "New password must be different from your current password.",
        },
        { status: 400 },
      );
    }

    // =========================
    // HASH NEW PASSWORD
    // =========================

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // =========================
    // UPDATE PASSWORD
    // =========================

    await db.query(
      `
      UPDATE users

      SET
        password_hash = $1,
        updated_at = CURRENT_TIMESTAMP

      WHERE id = $2
        AND role = 'compounder'
      `,
      [newPasswordHash, session.userId],
    );

    // =========================
    // INVALIDATE RESET TOKENS
    // =========================
    // Since you now have password_reset_tokens,
    // any unused reset links for this account
    // should no longer remain usable.

    try {
      await db.query(
        `
        UPDATE password_reset_tokens

        SET used_at = CURRENT_TIMESTAMP

        WHERE user_id = $1
          AND used_at IS NULL
        `,
        [session.userId],
      );
    } catch (tokenError) {
      console.error("INVALIDATE PASSWORD RESET TOKENS ERROR:", tokenError);
    }

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
          "CHANGE_PASSWORD",
          "user",
          session.userId,
          JSON.stringify({
            role: "compounder",
            changed_at: new Date().toISOString(),
          }),
        ],
      );
    } catch (auditError) {
      console.error("COMPOUNDER PASSWORD AUDIT ERROR:", auditError);
    }

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json(
      {
        success: true,
        message: "Password changed successfully.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("CHANGE COMPOUNDER PASSWORD ERROR:", error);

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
