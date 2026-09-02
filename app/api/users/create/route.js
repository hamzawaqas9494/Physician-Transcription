import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";

import { mkdir, unlink, writeFile } from "fs/promises";

import path from "path";
import crypto from "crypto";

import { db } from "../../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PROFILE_SIZE = 2 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// ======================================================
// POST /api/staff/create
// ======================================================

export async function POST(request) {
  let savedProfilePath = null;

  try {
    // =========================
    // FORM DATA
    // =========================

    const formData = await request.formData();

    const name = formData.get("name")?.toString().trim() || "";

    const email = formData.get("email")?.toString().trim().toLowerCase() || "";

    const password = formData.get("password")?.toString() || "";

    const role = formData.get("role")?.toString().trim().toLowerCase() || "";

    const phone = formData.get("phone")?.toString().trim() || null;

    const profilePicture = formData.get("profile_picture");

    // =========================
    // BASIC VALIDATION
    // =========================

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email, password and role are required.",
        },
        { status: 400 },
      );
    }

    // =========================
    // ROLE
    // =========================

    if (!["doctor", "compounder"].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Role must be doctor or compounder.",
        },
        { status: 400 },
      );
    }

    // =========================
    // PASSWORD
    // =========================

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters.",
        },
        { status: 400 },
      );
    }

    // =========================
    // PHONE
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
    // PROFILE IMAGE VALIDATION
    // =========================

    let imageExtension = null;

    if (
      profilePicture &&
      typeof profilePicture !== "string" &&
      profilePicture.size > 0
    ) {
      imageExtension = ALLOWED_IMAGE_TYPES[profilePicture.type];

      if (!imageExtension) {
        return NextResponse.json(
          {
            success: false,
            message: "Only JPG, PNG and WebP profile pictures are allowed.",
          },
          { status: 400 },
        );
      }

      if (profilePicture.size > MAX_PROFILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            message: "Profile picture must be 2 MB or smaller.",
          },
          { status: 400 },
        );
      }
    }

    // =========================
    // CHECK EMAIL
    // =========================

    const existingUser = await db.query(
      `
        SELECT
          id,
          email

        FROM users

        WHERE LOWER(email) = $1

        LIMIT 1
        `,
      [email],
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "A user with this email already exists.",
        },
        { status: 409 },
      );
    }

    // =========================
    // HASH PASSWORD
    // =========================

    const passwordHash = await bcrypt.hash(password, 12);

    // =========================
    // SAVE PROFILE IMAGE
    // =========================

    let profilePicturePath = null;

    if (
      profilePicture &&
      typeof profilePicture !== "string" &&
      profilePicture.size > 0
    ) {
      const uploadDirectory = path.join(
        process.cwd(),
        "public",
        "uploads",
        "profiles",
      );

      await mkdir(uploadDirectory, {
        recursive: true,
      });

      const randomName = crypto.randomUUID();

      const fileName = `${role}-${randomName}.${imageExtension}`;

      const absolutePath = path.join(uploadDirectory, fileName);

      const arrayBuffer = await profilePicture.arrayBuffer();

      const buffer = Buffer.from(arrayBuffer);

      await writeFile(absolutePath, buffer);

      profilePicturePath = `/uploads/profiles/${fileName}`;

      savedProfilePath = absolutePath;
    }

    // =========================
    // CREATE USER
    // =========================

    let result;

    try {
      result = await db.query(
        `
        INSERT INTO users (
          name,
          email,
          password_hash,
          role,
          phone,
          profile_picture,
          is_active
        )

        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          TRUE
        )

        RETURNING
          id,
          name,
          email,
          role,
          phone,
          profile_picture,
          is_active,
          last_login_at,
          created_at,
          updated_at
        `,
        [name, email, passwordHash, role, phone, profilePicturePath],
      );
    } catch (databaseError) {
      // Delete saved image if user insert fails.

      if (savedProfilePath) {
        try {
          await unlink(savedProfilePath);
        } catch {}
      }

      throw databaseError;
    }

    const user = result.rows[0];

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json(
      {
        success: true,
        message: `${role} account created successfully.`,
        user,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("CREATE USER ERROR:", error);

    // Cleanup file if something failed after saving it.

    if (savedProfilePath) {
      try {
        await unlink(savedProfilePath);
      } catch {}
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create user.",

        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
