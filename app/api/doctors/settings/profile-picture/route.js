// import { NextResponse } from "next/server";

// import { mkdir, unlink, writeFile } from "fs/promises";

// import path from "path";
// import crypto from "crypto";

// import { db } from "@/lib/db";
// import { getSession } from "@/lib/auth";

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// const MAX_FILE_SIZE = 2 * 1024 * 1024;

// const ALLOWED_TYPES = {
//   "image/jpeg": "jpg",
//   "image/png": "png",
//   "image/webp": "webp",
// };

// // ======================================================
// // IMAGE SIGNATURE
// // ======================================================

// function isValidImageSignature(buffer, mimeType) {
//   if (mimeType === "image/jpeg") {
//     return (
//       buffer.length >= 3 &&
//       buffer[0] === 0xff &&
//       buffer[1] === 0xd8 &&
//       buffer[2] === 0xff
//     );
//   }

//   if (mimeType === "image/png") {
//     return (
//       buffer.length >= 8 &&
//       buffer[0] === 0x89 &&
//       buffer[1] === 0x50 &&
//       buffer[2] === 0x4e &&
//       buffer[3] === 0x47 &&
//       buffer[4] === 0x0d &&
//       buffer[5] === 0x0a &&
//       buffer[6] === 0x1a &&
//       buffer[7] === 0x0a
//     );
//   }

//   if (mimeType === "image/webp") {
//     if (buffer.length < 12) {
//       return false;
//     }

//     const riff = buffer.subarray(0, 4).toString("ascii");

//     const webp = buffer.subarray(8, 12).toString("ascii");

//     return riff === "RIFF" && webp === "WEBP";
//   }

//   return false;
// }

// // ======================================================
// // DELETE LOCAL FILE
// // ======================================================

// async function deleteLocalProfilePicture(profilePicture) {
//   if (!profilePicture) {
//     return;
//   }

//   if (!profilePicture.startsWith("/uploads/profiles/")) {
//     return;
//   }

//   try {
//     const relativePath = profilePicture.replace(/^\/+/, "");

//     const absolutePath = path.join(process.cwd(), "public", relativePath);

//     await unlink(absolutePath);
//   } catch (error) {
//     if (error.code !== "ENOENT") {
//       console.error("DELETE PROFILE PICTURE FILE ERROR:", error);
//     }
//   }
// }

// // ======================================================
// // GET CURRENT DOCTOR
// // ======================================================

// async function getDoctor(userId) {
//   const result = await db.query(
//     `
//       SELECT
//         id,
//         name,
//         email,
//         phone,
//         profile_picture,
//         role,
//         is_active,
//         last_login_at,
//         created_at,
//         updated_at

//       FROM users

//       WHERE id = $1
//         AND role = 'doctor'

//       LIMIT 1
//       `,
//     [userId],
//   );

//   return result.rows[0] || null;
// }

// // ======================================================
// // POST PROFILE PICTURE
// // ======================================================

// export async function POST(request) {
//   let newSavedFilePath = null;

//   try {
//     const session = await getSession();

//     if (!session) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Unauthorized. Please login.",
//         },
//         { status: 401 },
//       );
//     }

//     if (session.role !== "doctor") {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Only doctors can update their profile picture.",
//         },
//         { status: 403 },
//       );
//     }

//     const doctor = await getDoctor(session.userId);

//     if (!doctor) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Doctor account not found.",
//         },
//         { status: 404 },
//       );
//     }

//     if (!doctor.is_active) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Doctor account is inactive.",
//         },
//         { status: 403 },
//       );
//     }

//     const formData = await request.formData();

//     const file = formData.get("profile_picture");

//     if (!file || typeof file === "string") {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Please select a profile picture.",
//         },
//         { status: 400 },
//       );
//     }

//     if (file.size <= 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "The selected image is empty.",
//         },
//         { status: 400 },
//       );
//     }

//     if (file.size > MAX_FILE_SIZE) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Profile picture must be 2 MB or smaller.",
//         },
//         { status: 400 },
//       );
//     }

//     const extension = ALLOWED_TYPES[file.type];

//     if (!extension) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Only JPG, PNG and WebP profile pictures are allowed.",
//         },
//         { status: 400 },
//       );
//     }

//     const arrayBuffer = await file.arrayBuffer();

//     const buffer = Buffer.from(arrayBuffer);

//     if (!isValidImageSignature(buffer, file.type)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "The selected file is not a valid image.",
//         },
//         { status: 400 },
//       );
//     }

//     const uploadDirectory = path.join(
//       process.cwd(),
//       "public",
//       "uploads",
//       "profiles",
//     );

//     await mkdir(uploadDirectory, {
//       recursive: true,
//     });

//     const fileName = `doctor-${session.userId}-${crypto.randomUUID()}.${extension}`;

//     const absolutePath = path.join(uploadDirectory, fileName);

//     const publicPath = `/uploads/profiles/${fileName}`;

//     await writeFile(absolutePath, buffer);

//     newSavedFilePath = absolutePath;

//     let result;

//     try {
//       result = await db.query(
//         `
//           UPDATE users

//           SET
//             profile_picture = $1,
//             updated_at = CURRENT_TIMESTAMP

//           WHERE id = $2
//             AND role = 'doctor'

//           RETURNING
//             id,
//             name,
//             email,
//             phone,
//             profile_picture,
//             role,
//             is_active,
//             last_login_at,
//             created_at,
//             updated_at
//           `,
//         [publicPath, session.userId],
//       );
//     } catch (databaseError) {
//       try {
//         await unlink(absolutePath);
//       } catch {}

//       newSavedFilePath = null;

//       throw databaseError;
//     }

//     const updatedDoctor = result.rows[0];

//     if (doctor.profile_picture && doctor.profile_picture !== publicPath) {
//       await deleteLocalProfilePicture(doctor.profile_picture);
//     }

//     newSavedFilePath = null;

//     try {
//       await db.query(
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
//           "UPDATE_PROFILE_PICTURE",
//           "user",
//           session.userId,
//           JSON.stringify({
//             role: "doctor",
//             old_profile_picture: doctor.profile_picture,
//             new_profile_picture: publicPath,
//           }),
//         ],
//       );
//     } catch (auditError) {
//       console.error("DOCTOR PROFILE PICTURE AUDIT ERROR:", auditError);
//     }

//     return NextResponse.json(
//       {
//         success: true,
//         message: doctor.profile_picture
//           ? "Profile picture changed successfully."
//           : "Profile picture uploaded successfully.",
//         doctor: updatedDoctor,
//       },
//       { status: 200 },
//     );
//   } catch (error) {
//     console.error("UPLOAD DOCTOR PROFILE PICTURE ERROR:", error);

//     if (newSavedFilePath) {
//       try {
//         await unlink(newSavedFilePath);
//       } catch {}
//     }

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Unable to update profile picture.",
//         error:
//           process.env.NODE_ENV === "development" ? error.message : undefined,
//       },
//       { status: 500 },
//     );
//   }
// }

// // ======================================================
// // DELETE PROFILE PICTURE
// // ======================================================

// export async function DELETE() {
//   try {
//     const session = await getSession();

//     if (!session) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Unauthorized. Please login.",
//         },
//         { status: 401 },
//       );
//     }

//     if (session.role !== "doctor") {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Only doctors can remove their profile picture.",
//         },
//         { status: 403 },
//       );
//     }

//     const doctor = await getDoctor(session.userId);

//     if (!doctor) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Doctor account not found.",
//         },
//         { status: 404 },
//       );
//     }

//     if (!doctor.profile_picture) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "No profile picture is currently uploaded.",
//         },
//         { status: 400 },
//       );
//     }

//     const oldPicture = doctor.profile_picture;

//     const result = await db.query(
//       `
//         UPDATE users

//         SET
//           profile_picture = NULL,
//           updated_at = CURRENT_TIMESTAMP

//         WHERE id = $1
//           AND role = 'doctor'

//         RETURNING
//           id,
//           name,
//           email,
//           phone,
//           profile_picture,
//           role,
//           is_active,
//           last_login_at,
//           created_at,
//           updated_at
//         `,
//       [session.userId],
//     );

//     const updatedDoctor = result.rows[0];

//     await deleteLocalProfilePicture(oldPicture);

//     try {
//       await db.query(
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
//           "REMOVE_PROFILE_PICTURE",
//           "user",
//           session.userId,
//           JSON.stringify({
//             role: "doctor",
//             removed_profile_picture: oldPicture,
//           }),
//         ],
//       );
//     } catch (auditError) {
//       console.error("REMOVE DOCTOR PROFILE PICTURE AUDIT ERROR:", auditError);
//     }

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Profile picture removed successfully.",
//         doctor: updatedDoctor,
//       },
//       { status: 200 },
//     );
//   } catch (error) {
//     console.error("REMOVE DOCTOR PROFILE PICTURE ERROR:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Unable to remove profile picture.",
//         error:
//           process.env.NODE_ENV === "development" ? error.message : undefined,
//       },
//       { status: 500 },
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

const MAX_FILE_SIZE = 2 * 1024 * 1024;

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// ======================================================
// IMAGE SIGNATURE VALIDATION
// ======================================================

function isValidImageSignature(buffer, mimeType) {
  // =========================
  // JPEG
  // =========================

  if (mimeType === "image/jpeg") {
    return (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }

  // =========================
  // PNG
  // =========================

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

  // =========================
  // WEBP
  // =========================

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
// CHECK S3 PROFILE KEY
// ======================================================

function isDoctorS3ProfileKey(value) {
  if (!value || typeof value !== "string") {
    return false;
  }

  return value.startsWith("profiles/doctors/");
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
// PREPARE DOCTOR RESPONSE
//
// Database:
// profile_picture = profiles/doctors/doctor-1-xxxx.jpg
//
// Frontend:
// profile_picture = temporary signed AWS URL
// profile_picture_key = permanent S3 key
// ======================================================

async function prepareDoctorResponse(doctor) {
  if (!doctor) {
    return null;
  }

  const profilePictureKey = doctor.profile_picture || null;

  let profilePictureUrl = null;

  // ======================================================
  // AWS S3 PROFILE
  // ======================================================

  if (profilePictureKey && isDoctorS3ProfileKey(profilePictureKey)) {
    try {
      profilePictureUrl = await getPrivateFileUrl(profilePictureKey, 60 * 60);
    } catch (error) {
      console.error("DOCTOR PROFILE SIGNED URL ERROR:", error);
    }
  }

  // ======================================================
  // OLD LOCAL PROFILE SUPPORT
  //
  // Temporary support in case DB still contains:
  // /uploads/profiles/doctor-1-old.jpg
  // ======================================================
  else if (profilePictureKey && profilePictureKey.startsWith("/uploads/")) {
    profilePictureUrl = profilePictureKey;
  }

  return {
    ...doctor,

    profile_picture_key: profilePictureKey,

    profile_picture: profilePictureUrl,
  };
}

// ======================================================
// POST
// UPLOAD / CHANGE DOCTOR PROFILE PICTURE
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
        {
          status: 401,
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
          message: "Only doctors can update their profile picture.",
        },
        {
          status: 403,
        },
      );
    }

    // ======================================================
    // CURRENT DOCTOR
    // ======================================================

    const doctor = await getDoctor(session.userId);

    if (!doctor) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor account not found.",
        },
        {
          status: 404,
        },
      );
    }

    // ======================================================
    // ACTIVE ACCOUNT
    // ======================================================

    if (!doctor.is_active) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor account is inactive.",
        },
        {
          status: 403,
        },
      );
    }

    // ======================================================
    // FORM DATA
    // ======================================================

    let formData;

    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid upload request.",
        },
        {
          status: 400,
        },
      );
    }

    const file = formData.get("profile_picture");

    // ======================================================
    // FILE REQUIRED
    // ======================================================

    if (!file || typeof file === "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Please select a profile picture.",
        },
        {
          status: 400,
        },
      );
    }

    // ======================================================
    // EMPTY FILE
    // ======================================================

    if (file.size <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "The selected image is empty.",
        },
        {
          status: 400,
        },
      );
    }

    // ======================================================
    // FILE SIZE
    // ======================================================

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "Profile picture must be 2 MB or smaller.",
        },
        {
          status: 400,
        },
      );
    }

    // ======================================================
    // MIME TYPE
    // ======================================================

    const extension = ALLOWED_TYPES[file.type];

    if (!extension) {
      return NextResponse.json(
        {
          success: false,
          message: "Only JPG, PNG and WebP profile pictures are allowed.",
        },
        {
          status: 400,
        },
      );
    }

    // ======================================================
    // FILE BUFFER
    // ======================================================

    const arrayBuffer = await file.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    // ======================================================
    // REAL IMAGE VALIDATION
    // ======================================================

    if (!isValidImageSignature(buffer, file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "The selected file is not a valid image.",
        },
        {
          status: 400,
        },
      );
    }

    // ======================================================
    // GENERATE FILE NAME
    // ======================================================

    const fileName = `doctor-${session.userId}-${crypto.randomUUID()}.${extension}`;

    // ======================================================
    // S3 OBJECT KEY
    //
    // This exact value will be saved in Neon DB.
    // ======================================================

    const objectKey = `profiles/doctors/${fileName}`;

    // ======================================================
    // UPLOAD NEW IMAGE TO AWS S3
    // ======================================================

    await uploadFileToS3({
      key: objectKey,

      buffer,

      contentType: file.type,

      metadata: {
        userId: String(session.userId),

        role: "doctor",

        uploadType: "profile-picture",
      },
    });

    uploadedS3Key = objectKey;

    // ======================================================
    // UPDATE DATABASE
    // ======================================================

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
        [objectKey, session.userId],
      );
    } catch (databaseError) {
      // ==================================================
      // DB FAILED
      // Delete newly uploaded S3 file.
      // ==================================================

      try {
        await deleteFileFromS3(objectKey);
      } catch (cleanupError) {
        console.error("DOCTOR PROFILE S3 ROLLBACK ERROR:", cleanupError);
      }

      uploadedS3Key = null;

      throw databaseError;
    }

    // ======================================================
    // USER NOT FOUND AFTER UPDATE
    // ======================================================

    if (result.rows.length === 0) {
      try {
        await deleteFileFromS3(objectKey);
      } catch (cleanupError) {
        console.error("DOCTOR PROFILE S3 CLEANUP ERROR:", cleanupError);
      }

      uploadedS3Key = null;

      return NextResponse.json(
        {
          success: false,
          message: "Doctor account not found.",
        },
        {
          status: 404,
        },
      );
    }

    const updatedDoctor = result.rows[0];

    // ======================================================
    // OLD PROFILE PICTURE
    // ======================================================

    const oldProfilePicture = doctor.profile_picture || null;

    // ======================================================
    // DELETE OLD AWS S3 PROFILE
    //
    // Only delete if old value is actually an S3 key.
    // Legacy /uploads/... value will simply be replaced in DB.
    // ======================================================

    if (
      oldProfilePicture &&
      oldProfilePicture !== objectKey &&
      isDoctorS3ProfileKey(oldProfilePicture)
    ) {
      try {
        await deleteFileFromS3(oldProfilePicture);
      } catch (deleteError) {
        console.error("DELETE OLD DOCTOR PROFILE FROM S3 ERROR:", deleteError);
      }
    }

    // Upload is now successfully linked to DB.
    uploadedS3Key = null;

    // ======================================================
    // AUDIT LOG
    // ======================================================

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

          oldProfilePicture
            ? "CHANGE_DOCTOR_PROFILE_PICTURE"
            : "UPLOAD_DOCTOR_PROFILE_PICTURE",

          "user",

          session.userId,

          JSON.stringify({
            role: "doctor",

            storage: "aws_s3",

            old_profile_picture: oldProfilePicture,

            new_profile_picture: objectKey,
          }),
        ],
      );
    } catch (auditError) {
      console.error("DOCTOR PROFILE PICTURE AUDIT ERROR:", auditError);
    }

    // ======================================================
    // GENERATE SIGNED URL FOR FRONTEND
    // ======================================================

    const responseDoctor = await prepareDoctorResponse(updatedDoctor);

    // ======================================================
    // SUCCESS RESPONSE
    // ======================================================

    return NextResponse.json(
      {
        success: true,

        message: oldProfilePicture
          ? "Profile picture changed successfully."
          : "Profile picture uploaded successfully.",

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
    console.error("UPLOAD DOCTOR PROFILE PICTURE ERROR:", error);

    // ======================================================
    // EMERGENCY S3 CLEANUP
    // ======================================================

    if (uploadedS3Key) {
      try {
        await deleteFileFromS3(uploadedS3Key);
      } catch (cleanupError) {
        console.error(
          "DOCTOR PROFILE EMERGENCY S3 CLEANUP ERROR:",
          cleanupError,
        );
      }
    }

    return NextResponse.json(
      {
        success: false,

        message: "Unable to update profile picture.",

        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      {
        status: 500,
      },
    );
  }
}

// ======================================================
// DELETE
// REMOVE DOCTOR PROFILE PICTURE
// ======================================================

export async function DELETE() {
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
          message: "Only doctors can remove their profile picture.",
        },
        {
          status: 403,
        },
      );
    }

    // ======================================================
    // CURRENT DOCTOR
    // ======================================================

    const doctor = await getDoctor(session.userId);

    if (!doctor) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor account not found.",
        },
        {
          status: 404,
        },
      );
    }

    // ======================================================
    // ACTIVE ACCOUNT
    // ======================================================

    if (!doctor.is_active) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor account is inactive.",
        },
        {
          status: 403,
        },
      );
    }

    // ======================================================
    // NO PROFILE PICTURE
    // ======================================================

    if (!doctor.profile_picture) {
      return NextResponse.json(
        {
          success: false,
          message: "No profile picture is currently uploaded.",
        },
        {
          status: 400,
        },
      );
    }

    const oldProfilePicture = doctor.profile_picture;

    // ======================================================
    // REMOVE FROM DATABASE
    // ======================================================

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

    // ======================================================
    // NOT FOUND
    // ======================================================

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor account not found.",
        },
        {
          status: 404,
        },
      );
    }

    const updatedDoctor = result.rows[0];

    // ======================================================
    // DELETE AWS S3 OBJECT
    // ======================================================

    if (isDoctorS3ProfileKey(oldProfilePicture)) {
      try {
        await deleteFileFromS3(oldProfilePicture);
      } catch (deleteError) {
        /*
         * DB has already been cleared.
         *
         * We do not return the deleted key to the account
         * simply because physical cleanup failed.
         */

        console.error("DELETE DOCTOR PROFILE FROM S3 ERROR:", deleteError);
      }
    }

    // ======================================================
    // AUDIT LOG
    // ======================================================

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

          "REMOVE_DOCTOR_PROFILE_PICTURE",

          "user",

          session.userId,

          JSON.stringify({
            role: "doctor",

            storage: isDoctorS3ProfileKey(oldProfilePicture)
              ? "aws_s3"
              : "legacy_local",

            removed_profile_picture: oldProfilePicture,
          }),
        ],
      );
    } catch (auditError) {
      console.error("REMOVE DOCTOR PROFILE PICTURE AUDIT ERROR:", auditError);
    }

    // ======================================================
    // PREPARE FRONTEND RESPONSE
    // ======================================================

    const responseDoctor = await prepareDoctorResponse(updatedDoctor);

    // ======================================================
    // RESPONSE
    // ======================================================

    return NextResponse.json(
      {
        success: true,

        message: "Profile picture removed successfully.",

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
    console.error("REMOVE DOCTOR PROFILE PICTURE ERROR:", error);

    return NextResponse.json(
      {
        success: false,

        message: "Unable to remove profile picture.",

        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      {
        status: 500,
      },
    );
  }
}
