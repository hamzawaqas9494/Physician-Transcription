import { NextResponse } from "next/server";

import { mkdir, unlink, writeFile } from "fs/promises";

import path from "path";
import crypto from "crypto";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 2 * 1024 * 1024;

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// ======================================================
// IMAGE SIGNATURE
// ======================================================

function isValidImageSignature(buffer, mimeType) {
  if (mimeType === "image/jpeg") {
    return (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }

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
// DELETE LOCAL FILE
// ======================================================

async function deleteLocalProfilePicture(profilePicture) {
  if (!profilePicture) {
    return;
  }

  if (!profilePicture.startsWith("/uploads/profiles/")) {
    return;
  }

  try {
    const relativePath = profilePicture.replace(/^\/+/, "");

    const absolutePath = path.join(process.cwd(), "public", relativePath);

    await unlink(absolutePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("DELETE PROFILE PICTURE FILE ERROR:", error);
    }
  }
}

// ======================================================
// GET CURRENT DOCTOR
// ======================================================

async function getDoctor(userId) {
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
    [userId],
  );

  return result.rows[0] || null;
}

// ======================================================
// POST PROFILE PICTURE
// ======================================================

export async function POST(request) {
  let newSavedFilePath = null;

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
          message: "Only doctors can update their profile picture.",
        },
        { status: 403 },
      );
    }

    const doctor = await getDoctor(session.userId);

    if (!doctor) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor account not found.",
        },
        { status: 404 },
      );
    }

    if (!doctor.is_active) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor account is inactive.",
        },
        { status: 403 },
      );
    }

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

    const arrayBuffer = await file.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    if (!isValidImageSignature(buffer, file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "The selected file is not a valid image.",
        },
        { status: 400 },
      );
    }

    const uploadDirectory = path.join(
      process.cwd(),
      "public",
      "uploads",
      "profiles",
    );

    await mkdir(uploadDirectory, {
      recursive: true,
    });

    const fileName = `doctor-${session.userId}-${crypto.randomUUID()}.${extension}`;

    const absolutePath = path.join(uploadDirectory, fileName);

    const publicPath = `/uploads/profiles/${fileName}`;

    await writeFile(absolutePath, buffer);

    newSavedFilePath = absolutePath;

    let result;

    try {
      result = await db.query(
        `
          UPDATE users

          SET
            profile_picture = $1,
            updated_at = CURRENT_TIMESTAMP

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
        [publicPath, session.userId],
      );
    } catch (databaseError) {
      try {
        await unlink(absolutePath);
      } catch {}

      newSavedFilePath = null;

      throw databaseError;
    }

    const updatedDoctor = result.rows[0];

    if (doctor.profile_picture && doctor.profile_picture !== publicPath) {
      await deleteLocalProfilePicture(doctor.profile_picture);
    }

    newSavedFilePath = null;

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
          "UPDATE_PROFILE_PICTURE",
          "user",
          session.userId,
          JSON.stringify({
            role: "doctor",
            old_profile_picture: doctor.profile_picture,
            new_profile_picture: publicPath,
          }),
        ],
      );
    } catch (auditError) {
      console.error("DOCTOR PROFILE PICTURE AUDIT ERROR:", auditError);
    }

    return NextResponse.json(
      {
        success: true,
        message: doctor.profile_picture
          ? "Profile picture changed successfully."
          : "Profile picture uploaded successfully.",
        doctor: updatedDoctor,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("UPLOAD DOCTOR PROFILE PICTURE ERROR:", error);

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
// DELETE PROFILE PICTURE
// ======================================================

export async function DELETE() {
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
          message: "Only doctors can remove their profile picture.",
        },
        { status: 403 },
      );
    }

    const doctor = await getDoctor(session.userId);

    if (!doctor) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor account not found.",
        },
        { status: 404 },
      );
    }

    if (!doctor.profile_picture) {
      return NextResponse.json(
        {
          success: false,
          message: "No profile picture is currently uploaded.",
        },
        { status: 400 },
      );
    }

    const oldPicture = doctor.profile_picture;

    const result = await db.query(
      `
        UPDATE users

        SET
          profile_picture = NULL,
          updated_at = CURRENT_TIMESTAMP

        WHERE id = $1
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
      [session.userId],
    );

    const updatedDoctor = result.rows[0];

    await deleteLocalProfilePicture(oldPicture);

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
            role: "doctor",
            removed_profile_picture: oldPicture,
          }),
        ],
      );
    } catch (auditError) {
      console.error("REMOVE DOCTOR PROFILE PICTURE AUDIT ERROR:", auditError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Profile picture removed successfully.",
        doctor: updatedDoctor,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("REMOVE DOCTOR PROFILE PICTURE ERROR:", error);

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
