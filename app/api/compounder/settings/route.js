// import { NextResponse } from "next/server";

// import { db } from "@/lib/db";
// import { getSession } from "@/lib/auth";

// export const dynamic = "force-dynamic";

// // ======================================================
// // GET COMPOUNDER SETTINGS
// // ======================================================

// export async function GET() {
//   try {
//     // =========================
//     // SESSION
//     // =========================

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

//     // =========================
//     // ROLE
//     // =========================

//     if (session.role !== "compounder") {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Only compounders can access these settings.",
//         },
//         { status: 403 },
//       );
//     }

//     // =========================
//     // GET COMPOUNDER
//     // =========================

//     const result = await db.query(
//       `
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
//         AND role = 'compounder'

//       LIMIT 1
//       `,
//       [session.userId],
//     );

//     if (result.rows.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Compounder account not found.",
//         },
//         { status: 404 },
//       );
//     }

//     const compounder = result.rows[0];

//     // =========================
//     // ACCOUNT STATUS
//     // =========================

//     if (!compounder.is_active) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Compounder account is inactive.",
//         },
//         { status: 403 },
//       );
//     }

//     // =========================
//     // RESPONSE
//     // =========================

//     return NextResponse.json(
//       {
//         success: true,
//         compounder,
//       },
//       { status: 200 },
//     );
//   } catch (error) {
//     console.error("GET COMPOUNDER SETTINGS ERROR:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Unable to load compounder settings.",

//         error:
//           process.env.NODE_ENV === "development" ? error.message : undefined,
//       },
//       { status: 500 },
//     );
//   }
// }

// // ======================================================
// // PATCH COMPOUNDER PROFILE
// // ======================================================

// export async function PATCH(request) {
//   try {
//     // =========================
//     // SESSION
//     // =========================

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

//     // =========================
//     // ROLE
//     // =========================

//     if (session.role !== "compounder") {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Only compounders can update these settings.",
//         },
//         { status: 403 },
//       );
//     }

//     // =========================
//     // REQUEST BODY
//     // =========================

//     const body = await request.json();

//     const phone =
//       typeof body.phone === "string" ? body.phone.trim() || null : null;

//     // =========================
//     // PHONE VALIDATION
//     // =========================

//     if (phone && phone.length > 30) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Phone number is too long.",
//         },
//         { status: 400 },
//       );
//     }

//     if (phone && !/^[0-9+\-\s()]+$/.test(phone)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Please enter a valid phone number.",
//         },
//         { status: 400 },
//       );
//     }

//     // =========================
//     // CURRENT COMPOUNDER
//     // =========================

//     const existingResult = await db.query(
//       `
//       SELECT
//         id,
//         phone,
//         is_active

//       FROM users

//       WHERE id = $1
//         AND role = 'compounder'

//       LIMIT 1
//       `,
//       [session.userId],
//     );

//     if (existingResult.rows.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Compounder account not found.",
//         },
//         { status: 404 },
//       );
//     }

//     const existingCompounder = existingResult.rows[0];

//     if (!existingCompounder.is_active) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Compounder account is inactive.",
//         },
//         { status: 403 },
//       );
//     }

//     // =========================
//     // UPDATE
//     // =========================

//     const result = await db.query(
//       `
//       UPDATE users

//       SET
//         phone = $1,
//         updated_at = CURRENT_TIMESTAMP

//       WHERE id = $2
//         AND role = 'compounder'

//       RETURNING
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
//       `,
//       [phone, session.userId],
//     );

//     if (result.rows.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Compounder account not found.",
//         },
//         { status: 404 },
//       );
//     }

//     const compounder = result.rows[0];

//     // =========================
//     // AUDIT LOG
//     // =========================

//     if (existingCompounder.phone !== compounder.phone) {
//       try {
//         await db.query(
//           `
//           INSERT INTO audit_logs (
//             user_id,
//             action,
//             entity_type,
//             entity_id,
//             details
//           )

//           VALUES (
//             $1,
//             $2,
//             $3,
//             $4,
//             $5
//           )
//           `,
//           [
//             session.userId,
//             "UPDATE_COMPOUNDER_PROFILE",
//             "user",
//             session.userId,

//             JSON.stringify({
//               old_phone: existingCompounder.phone,
//               new_phone: compounder.phone,
//               updated_fields: ["phone"],
//             }),
//           ],
//         );
//       } catch (auditError) {
//         console.error("COMPOUNDER SETTINGS AUDIT ERROR:", auditError);
//       }
//     }

//     // =========================
//     // RESPONSE
//     // =========================

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Profile updated successfully.",
//         compounder,
//       },
//       { status: 200 },
//     );
//   } catch (error) {
//     console.error("UPDATE COMPOUNDER SETTINGS ERROR:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Unable to update profile.",

//         error:
//           process.env.NODE_ENV === "development" ? error.message : undefined,
//       },
//       { status: 500 },
//     );
//   }
// }

import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getPrivateFileUrl } from "@/lib/s3";

export const dynamic = "force-dynamic";

// ======================================================
// CHECK S3 PROFILE KEY
// ======================================================

function isCompounderS3ProfileKey(value) {
  if (!value || typeof value !== "string") {
    return false;
  }

  return value.startsWith("profiles/compounders/");
}

// ======================================================
// PREPARE COMPOUNDER RESPONSE
//
// DATABASE:
// profile_picture = permanent S3 key
//
// FRONTEND:
// profile_picture = temporary signed URL
// profile_picture_key = permanent S3 key
// ======================================================

async function prepareCompounderResponse(compounder) {
  if (!compounder) {
    return null;
  }

  const profilePictureKey = compounder.profile_picture || null;

  let profilePictureUrl = null;

  // ======================================================
  // AWS S3 PROFILE
  // ======================================================

  if (profilePictureKey && isCompounderS3ProfileKey(profilePictureKey)) {
    try {
      profilePictureUrl = await getPrivateFileUrl(profilePictureKey, 60 * 60);
    } catch (error) {
      console.error("COMPOUNDER PROFILE SIGNED URL ERROR:", error);
    }
  }

  // ======================================================
  // LEGACY LOCAL PROFILE SUPPORT
  //
  // Old DB values may still look like:
  // /uploads/profiles/compounder-2-old.jpg
  // ======================================================
  else if (profilePictureKey && profilePictureKey.startsWith("/uploads/")) {
    profilePictureUrl = profilePictureKey;
  }

  return {
    ...compounder,

    // Permanent S3 key
    profile_picture_key: profilePictureKey,

    // Frontend-ready URL
    profile_picture: profilePictureUrl,
  };
}

// ======================================================
// GET COMPOUNDER SETTINGS
// ======================================================

export async function GET() {
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

    if (session.role !== "compounder") {
      return NextResponse.json(
        {
          success: false,
          message: "Only compounders can access these settings.",
        },
        {
          status: 403,
        },
      );
    }

    // ======================================================
    // GET COMPOUNDER
    // ======================================================

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

    // ======================================================
    // NOT FOUND
    // ======================================================

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Compounder account not found.",
        },
        {
          status: 404,
        },
      );
    }

    const compounder = result.rows[0];

    // ======================================================
    // ACCOUNT STATUS
    // ======================================================

    if (!compounder.is_active) {
      return NextResponse.json(
        {
          success: false,
          message: "Compounder account is inactive.",
        },
        {
          status: 403,
        },
      );
    }

    // ======================================================
    // PREPARE SIGNED PROFILE URL
    // ======================================================

    const responseCompounder = await prepareCompounderResponse(compounder);

    // ======================================================
    // RESPONSE
    // ======================================================

    return NextResponse.json(
      {
        success: true,

        compounder: responseCompounder,
      },
      {
        status: 200,

        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
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
      {
        status: 500,
      },
    );
  }
}

// ======================================================
// PATCH COMPOUNDER PROFILE
//
// Compounder can currently update phone only.
// ======================================================

export async function PATCH(request) {
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

    if (session.role !== "compounder") {
      return NextResponse.json(
        {
          success: false,
          message: "Only compounders can update these settings.",
        },
        {
          status: 403,
        },
      );
    }

    // ======================================================
    // REQUEST BODY
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
        },
      );
    }

    const phone =
      typeof body.phone === "string" ? body.phone.trim() || null : null;

    // ======================================================
    // PHONE VALIDATION
    // ======================================================

    if (phone && phone.length > 30) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number is too long.",
        },
        {
          status: 400,
        },
      );
    }

    if (phone && !/^[0-9+\-\s()]+$/.test(phone)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid phone number.",
        },
        {
          status: 400,
        },
      );
    }

    // ======================================================
    // CURRENT COMPOUNDER
    // ======================================================

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
          AND role = 'compounder'

        LIMIT 1
        `,
      [session.userId],
    );

    // ======================================================
    // NOT FOUND
    // ======================================================

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Compounder account not found.",
        },
        {
          status: 404,
        },
      );
    }

    const existingCompounder = existingResult.rows[0];

    // ======================================================
    // ACTIVE CHECK
    // ======================================================

    if (!existingCompounder.is_active) {
      return NextResponse.json(
        {
          success: false,
          message: "Compounder account is inactive.",
        },
        {
          status: 403,
        },
      );
    }

    // ======================================================
    // NO CHANGES
    // ======================================================

    if ((existingCompounder.phone || null) === phone) {
      const responseCompounder =
        await prepareCompounderResponse(existingCompounder);

      return NextResponse.json(
        {
          success: true,

          message: "No profile changes detected.",

          compounder: responseCompounder,
        },
        {
          status: 200,

          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        },
      );
    }

    // ======================================================
    // UPDATE PHONE
    // ======================================================

    const result = await db.query(
      `
      UPDATE users

      SET
        phone = $1,
        updated_at =
          CURRENT_TIMESTAMP

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

    // ======================================================
    // NOT FOUND AFTER UPDATE
    // ======================================================

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Compounder account not found.",
        },
        {
          status: 404,
        },
      );
    }

    const compounder = result.rows[0];

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

          "UPDATE_COMPOUNDER_PROFILE",

          "user",

          session.userId,

          JSON.stringify({
            updated_fields: ["phone"],

            old_phone: existingCompounder.phone,

            new_phone: compounder.phone,
          }),
        ],
      );
    } catch (auditError) {
      console.error("COMPOUNDER SETTINGS AUDIT ERROR:", auditError);
    }

    // ======================================================
    // PREPARE SIGNED PROFILE URL
    // ======================================================

    const responseCompounder = await prepareCompounderResponse(compounder);

    // ======================================================
    // RESPONSE
    // ======================================================

    return NextResponse.json(
      {
        success: true,

        message: "Profile updated successfully.",

        compounder: responseCompounder,
      },
      {
        status: 200,

        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
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
      {
        status: 500,
      },
    );
  }
}
