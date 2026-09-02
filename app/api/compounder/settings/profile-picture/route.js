import { NextResponse } from "next/server";

import { mkdir, unlink, writeFile } from "fs/promises";

import path from "path";
import crypto from "crypto";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ======================================================
// CONFIG
// ======================================================

const MAX_FILE_SIZE = 2 * 1024 * 1024;

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// ======================================================
// CHECK REAL IMAGE SIGNATURE
// ======================================================

function isValidImageSignature(buffer, mimeType) {
  // JPEG
  if (mimeType === "image/jpeg") {
    return (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }

  // PNG
  if (mimeType === "image/png") {
    return (
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );
  }

  // WEBP
  if (mimeType === "image/webp") {
    if (buffer.length < 12) {
      return false;
    }

    const riff = buffer.subarray(0, 4).toString("ascii");

    const webp = buffer.subarray(8, 12).toString("ascii");

    return riff === "RIFF" && webp === "WEBP";
  }

  return false;
}

// ======================================================
// DELETE LOCAL PROFILE PICTURE
// ======================================================

async function deleteLocalProfilePicture(profilePicture) {
  if (!profilePicture) {
    return;
  }

  // Only allow deleting files from our profile directory
  if (!profilePicture.startsWith("/uploads/profiles/")) {
    return;
  }

  try {
    const relativePath = profilePicture.replace(/^\/+/, "");

    const fullPath = path.join(process.cwd(), "public", relativePath);

    await unlink(fullPath);
  } catch (error) {
    // File already missing = no problem
    if (error.code !== "ENOENT") {
      console.error("DELETE COMPOUNDER PROFILE PICTURE FILE ERROR:", error);
    }
  }
}

// ======================================================
// GET CURRENT COMPOUNDER
// ======================================================

async function getCompounder(userId) {
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
    [userId],
  );

  return result.rows[0] || null;
}

// ======================================================
// POST
// UPLOAD / CHANGE PROFILE PICTURE
// ======================================================

export async function POST(request) {
  let newSavedFilePath = null;

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
          message: "Only compounders can update their profile picture.",
        },
        { status: 403 },
      );
    }

    // =========================
    // CURRENT COMPOUNDER
    // =========================

    const compounder = await getCompounder(session.userId);

    if (!compounder) {
      return NextResponse.json(
        {
          success: false,
          message: "Compounder account not found.",
        },
        { status: 404 },
      );
    }

    // =========================
    // ACTIVE ACCOUNT
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
    // FORM DATA
    // =========================

    const formData = await request.formData();

    const file = formData.get("profile_picture");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Please select a profile picture.",
        },
        { status: 400 },
      );
    }

    // =========================
    // FILE SIZE
    // =========================

    if (file.size <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "The selected image is empty.",
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "Profile picture must be 2 MB or smaller.",
        },
        { status: 400 },
      );
    }

    // =========================
    // MIME TYPE
    // =========================

    const extension = ALLOWED_TYPES[file.type];

    if (!extension) {
      return NextResponse.json(
        {
          success: false,
          message: "Only JPG, PNG and WebP profile pictures are allowed.",
        },
        { status: 400 },
      );
    }

    // =========================
    // BUFFER
    // =========================

    const arrayBuffer = await file.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    // =========================
    // REAL IMAGE CHECK
    // =========================

    if (!isValidImageSignature(buffer, file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "The selected file is not a valid image.",
        },
        { status: 400 },
      );
    }

    // =========================
    // UPLOAD DIRECTORY
    // =========================

    const uploadDirectory = path.join(
      process.cwd(),
      "public",
      "uploads",
      "profiles",
    );

    await mkdir(uploadDirectory, {
      recursive: true,
    });

    // =========================
    // UNIQUE FILE NAME
    // =========================

    const fileName =
      `compounder-${session.userId}-` + `${crypto.randomUUID()}.${extension}`;

    const absolutePath = path.join(uploadDirectory, fileName);

    const publicPath = `/uploads/profiles/${fileName}`;

    // =========================
    // SAVE NEW FILE
    // =========================

    await writeFile(absolutePath, buffer);

    newSavedFilePath = absolutePath;

    // =========================
    // UPDATE DATABASE
    // =========================

    let result;

    try {
      result = await db.query(
        `
        UPDATE users

        SET
          profile_picture = $1,
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
        [publicPath, session.userId],
      );
    } catch (databaseError) {
      // DB update failed, remove newly created file
      try {
        await unlink(absolutePath);
      } catch {}

      newSavedFilePath = null;

      throw databaseError;
    }

    if (result.rows.length === 0) {
      try {
        await unlink(absolutePath);
      } catch {}

      newSavedFilePath = null;

      return NextResponse.json(
        {
          success: false,
          message: "Compounder account not found.",
        },
        { status: 404 },
      );
    }

    const updatedCompounder = result.rows[0];

    // =========================
    // DELETE OLD IMAGE
    // =========================

    if (
      compounder.profile_picture &&
      compounder.profile_picture !== publicPath
    ) {
      await deleteLocalProfilePicture(compounder.profile_picture);
    }

    // New file is now valid/current
    newSavedFilePath = null;

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
          compounder.profile_picture
            ? "CHANGE_PROFILE_PICTURE"
            : "UPLOAD_PROFILE_PICTURE",
          "user",
          session.userId,

          JSON.stringify({
            role: "compounder",

            old_profile_picture: compounder.profile_picture,

            new_profile_picture: publicPath,
          }),
        ],
      );
    } catch (auditError) {
      console.error("COMPOUNDER PROFILE PICTURE AUDIT ERROR:", auditError);
    }

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json(
      {
        success: true,

        message: compounder.profile_picture
          ? "Profile picture changed successfully."
          : "Profile picture uploaded successfully.",

        compounder: updatedCompounder,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("UPLOAD COMPOUNDER PROFILE PICTURE ERROR:", error);

    // =========================
    // CLEANUP NEW FILE
    // =========================

    if (newSavedFilePath) {
      try {
        await unlink(newSavedFilePath);
      } catch {}
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update profile picture.",

        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

// ======================================================
// DELETE
// REMOVE PROFILE PICTURE
// ======================================================

export async function DELETE() {
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
          message: "Only compounders can remove their profile picture.",
        },
        { status: 403 },
      );
    }

    // =========================
    // CURRENT COMPOUNDER
    // =========================

    const compounder = await getCompounder(session.userId);

    if (!compounder) {
      return NextResponse.json(
        {
          success: false,
          message: "Compounder account not found.",
        },
        { status: 404 },
      );
    }

    // =========================
    // ACTIVE ACCOUNT
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
    // NO PROFILE PICTURE
    // =========================

    if (!compounder.profile_picture) {
      return NextResponse.json(
        {
          success: false,
          message: "No profile picture is currently uploaded.",
        },
        { status: 400 },
      );
    }

    const oldPicture = compounder.profile_picture;

    // =========================
    // REMOVE FROM DATABASE
    // =========================

    const result = await db.query(
      `
      UPDATE users

      SET
        profile_picture = NULL,
        updated_at = CURRENT_TIMESTAMP

      WHERE id = $1
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

    const updatedCompounder = result.rows[0];

    // =========================
    // DELETE PHYSICAL FILE
    // =========================

    await deleteLocalProfilePicture(oldPicture);

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
          "REMOVE_PROFILE_PICTURE",
          "user",
          session.userId,

          JSON.stringify({
            role: "compounder",
            removed_profile_picture: oldPicture,
          }),
        ],
      );
    } catch (auditError) {
      console.error(
        "REMOVE COMPOUNDER PROFILE PICTURE AUDIT ERROR:",
        auditError,
      );
    }

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json(
      {
        success: true,

        message: "Profile picture removed successfully.",

        compounder: updatedCompounder,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("REMOVE COMPOUNDER PROFILE PICTURE ERROR:", error);

    return NextResponse.json(
      {
        success: false,

        message: "Unable to remove profile picture.",

        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
