// import { NextResponse } from "next/server";

// import { db } from "@/lib/db";
// import { getSession } from "@/lib/auth";

// export const dynamic = "force-dynamic";

// // ======================================================
// // COMPOUNDER DASHBOARD
// // ======================================================

// export async function GET() {
//   try {
//     // ======================================================
//     // SESSION
//     // ======================================================

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

//     // ======================================================
//     // ROLE CHECK
//     // ======================================================

//     if (session.role !== "compounder") {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Only compounders can access this dashboard.",
//         },
//         { status: 403 },
//       );
//     }

//     // ======================================================
//     // COMPOUNDER ACCOUNT
//     // ======================================================

//     const compounderResult = await db.query(
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

//     if (compounderResult.rows.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Compounder account not found.",
//         },
//         { status: 404 },
//       );
//     }

//     const compounder = compounderResult.rows[0];

//     // ======================================================
//     // ACCOUNT STATUS
//     // ======================================================

//     if (!compounder.is_active) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Compounder account is inactive.",
//         },
//         { status: 403 },
//       );
//     }

//     // ======================================================
//     // CLINIC DATE
//     // ======================================================

//     const clinicDateResult = await db.query(`
//       SELECT
//         (
//           CURRENT_TIMESTAMP
//           AT TIME ZONE 'Asia/Karachi'
//         )::DATE::TEXT AS clinic_date
//     `);

//     const clinicDate = clinicDateResult.rows[0]?.clinic_date || null;

//     // ======================================================
//     // TOTAL PATIENTS
//     // ======================================================

//     const totalPatientsResult = await db.query(`
//       SELECT
//         COUNT(*)::INTEGER AS total

//       FROM patients
//     `);

//     const totalPatients = totalPatientsResult.rows[0]?.total || 0;

//     // ======================================================
//     // ACTIVE QUEUE STATS
//     //
//     // TODAY + FUTURE
//     //
//     // These numbers correspond directly to dashboard queue.
//     // ======================================================

//     const activeStatsResult = await db.query(`
//       SELECT
//         COUNT(*)::INTEGER AS total,

//         COUNT(*) FILTER (
//           WHERE status = 'scheduled'
//         )::INTEGER AS scheduled,

//         COUNT(*) FILTER (
//           WHERE status = 'checked_in'
//         )::INTEGER AS checked_in,

//         COUNT(*) FILTER (
//           WHERE status = 'waiting'
//         )::INTEGER AS waiting,

//         COUNT(*) FILTER (
//           WHERE status = 'in_consultation'
//         )::INTEGER AS in_consultation

//       FROM appointments

//       WHERE appointment_date >=
//         (
//           CURRENT_TIMESTAMP
//           AT TIME ZONE 'Asia/Karachi'
//         )::DATE

//         AND status IN (
//           'scheduled',
//           'checked_in',
//           'waiting',
//           'in_consultation'
//         )
//     `);

//     const activeStats = activeStatsResult.rows[0] || {};

//     // ======================================================
//     // TODAY STATS
//     // ======================================================

//     const todayStatsResult = await db.query(`
//       SELECT
//         COUNT(*)::INTEGER AS total,

//         COUNT(*) FILTER (
//           WHERE status = 'scheduled'
//         )::INTEGER AS scheduled,

//         COUNT(*) FILTER (
//           WHERE status = 'checked_in'
//         )::INTEGER AS checked_in,

//         COUNT(*) FILTER (
//           WHERE status = 'waiting'
//         )::INTEGER AS waiting,

//         COUNT(*) FILTER (
//           WHERE status = 'in_consultation'
//         )::INTEGER AS in_consultation,

//         COUNT(*) FILTER (
//           WHERE status = 'completed'
//         )::INTEGER AS completed,

//         COUNT(*) FILTER (
//           WHERE status = 'cancelled'
//         )::INTEGER AS cancelled,

//         COUNT(*) FILTER (
//           WHERE status = 'no_show'
//         )::INTEGER AS no_show

//       FROM appointments

//       WHERE appointment_date =
//         (
//           CURRENT_TIMESTAMP
//           AT TIME ZONE 'Asia/Karachi'
//         )::DATE
//     `);

//     const todayStats = todayStatsResult.rows[0] || {};

//     // ======================================================
//     // UPCOMING COUNT
//     // FUTURE ONLY
//     // ======================================================

//     const upcomingCountResult = await db.query(`
//       SELECT
//         COUNT(*)::INTEGER AS total

//       FROM appointments

//       WHERE appointment_date >
//         (
//           CURRENT_TIMESTAMP
//           AT TIME ZONE 'Asia/Karachi'
//         )::DATE

//         AND status IN (
//           'scheduled',
//           'checked_in',
//           'waiting',
//           'in_consultation'
//         )
//     `);

//     const upcomingCount = upcomingCountResult.rows[0]?.total || 0;

//     // ======================================================
//     // ACTIVE QUEUE
//     //
//     // TODAY + FUTURE
//     // ======================================================

//     const queueResult = await db.query(`
//       SELECT
//         a.id,
//         a.patient_id,
//         a.doctor_id,

//         a.appointment_date::TEXT
//           AS appointment_date,

//         a.appointment_time::TEXT
//           AS appointment_time,

//         a.token_number,
//         a.status,
//         a.notes,
//         a.created_at,
//         a.updated_at,

//         p.name
//           AS patient_name,

//         p.patient_code,

//         p.phone
//           AS patient_phone,

//         p.gender,
//         p.date_of_birth,

//         d.name
//           AS doctor_name,

//         CASE
//           WHEN a.appointment_date =
//             (
//               CURRENT_TIMESTAMP
//               AT TIME ZONE 'Asia/Karachi'
//             )::DATE
//           THEN TRUE
//           ELSE FALSE
//         END AS is_today

//       FROM appointments a

//       INNER JOIN patients p
//         ON p.id = a.patient_id

//       INNER JOIN users d
//         ON d.id = a.doctor_id
//         AND d.role = 'doctor'
//         AND d.is_active = TRUE

//       WHERE a.appointment_date >=
//         (
//           CURRENT_TIMESTAMP
//           AT TIME ZONE 'Asia/Karachi'
//         )::DATE

//         AND a.status IN (
//           'scheduled',
//           'checked_in',
//           'waiting',
//           'in_consultation'
//         )

//       ORDER BY

//         a.appointment_date ASC,

//         CASE a.status
//           WHEN 'in_consultation' THEN 1
//           WHEN 'waiting' THEN 2
//           WHEN 'checked_in' THEN 3
//           WHEN 'scheduled' THEN 4
//           ELSE 5
//         END,

//         a.appointment_time ASC
//     `);

//     // ======================================================
//     // UPCOMING APPOINTMENTS
//     //
//     // FUTURE ONLY
//     // ======================================================

//     const upcomingResult = await db.query(`
//       SELECT
//         a.id,
//         a.patient_id,
//         a.doctor_id,

//         a.appointment_date::TEXT
//           AS appointment_date,

//         a.appointment_time::TEXT
//           AS appointment_time,

//         a.token_number,
//         a.status,
//         a.notes,
//         a.created_at,
//         a.updated_at,

//         p.name
//           AS patient_name,

//         p.patient_code,

//         p.phone
//           AS patient_phone,

//         p.gender,
//         p.date_of_birth,

//         d.name
//           AS doctor_name

//       FROM appointments a

//       INNER JOIN patients p
//         ON p.id = a.patient_id

//       INNER JOIN users d
//         ON d.id = a.doctor_id
//         AND d.role = 'doctor'
//         AND d.is_active = TRUE

//       WHERE a.appointment_date >
//         (
//           CURRENT_TIMESTAMP
//           AT TIME ZONE 'Asia/Karachi'
//         )::DATE

//         AND a.status IN (
//           'scheduled',
//           'checked_in',
//           'waiting',
//           'in_consultation'
//         )

//       ORDER BY
//         a.appointment_date ASC,
//         a.appointment_time ASC
//     `);

//     // ======================================================
//     // RESPONSE
//     // ======================================================

//     return NextResponse.json(
//       {
//         success: true,

//         clinic_date: clinicDate,

//         compounder,

//         stats: {
//           // ALL PATIENTS
//           total_patients: totalPatients,

//           // ACTIVE TODAY + FUTURE
//           active_appointments: activeStats.total || 0,

//           scheduled: activeStats.scheduled || 0,

//           checked_in: activeStats.checked_in || 0,

//           waiting: activeStats.waiting || 0,

//           in_consultation: activeStats.in_consultation || 0,

//           total_queue: activeStats.total || 0,

//           // TODAY ONLY
//           today_appointments: todayStats.total || 0,

//           today_scheduled: todayStats.scheduled || 0,

//           today_checked_in: todayStats.checked_in || 0,

//           today_waiting: todayStats.waiting || 0,

//           today_in_consultation: todayStats.in_consultation || 0,

//           completed: todayStats.completed || 0,

//           cancelled: todayStats.cancelled || 0,

//           no_show: todayStats.no_show || 0,

//           // FUTURE ONLY
//           upcoming_appointments: upcomingCount,
//         },

//         // TODAY + FUTURE ACTIVE
//         queue: queueResult.rows,

//         // FUTURE ONLY
//         upcoming_appointments: upcomingResult.rows,
//       },
//       {
//         status: 200,

//         headers: {
//           "Cache-Control":
//             "no-store, no-cache, must-revalidate, proxy-revalidate",
//         },
//       },
//     );
//   } catch (error) {
//     console.error("COMPOUNDER DASHBOARD ERROR:", error);

//     return NextResponse.json(
//       {
//         success: false,

//         message: "Unable to load compounder dashboard.",

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

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ======================================================
// S3 CONFIG
// ======================================================

const SIGNED_URL_EXPIRES_IN = 60 * 60; // 1 hour

// ======================================================
// PREPARE COMPOUNDER PROFILE PICTURE
//
// DATABASE:
// profile_picture = profiles/compounders/xyz.png
//
// FRONTEND:
// profile_picture = signed AWS S3 URL
// profile_picture_key = permanent S3 key
// ======================================================

async function prepareCompounderResponse(compounder) {
  if (!compounder) {
    return null;
  }

  const profilePictureKey = compounder.profile_picture || null;

  let profilePictureUrl = null;

  if (profilePictureKey) {
    try {
      // ==================================================
      // NEW AWS S3 IMAGE
      // ==================================================

      if (profilePictureKey.startsWith("profiles/compounders/")) {
        profilePictureUrl = await getPrivateFileUrl(
          profilePictureKey,
          SIGNED_URL_EXPIRES_IN,
        );
      }

      // ==================================================
      // LEGACY LOCAL IMAGE SUPPORT
      // ==================================================
      else if (profilePictureKey.startsWith("/uploads/")) {
        profilePictureUrl = profilePictureKey;
      }

      // ==================================================
      // ALREADY FULL URL
      //
      // Temporary compatibility support.
      // Ideally DB should contain only S3 key.
      // ==================================================
      else if (
        profilePictureKey.startsWith("https://") ||
        profilePictureKey.startsWith("http://")
      ) {
        profilePictureUrl = profilePictureKey;
      }
    } catch (error) {
      console.error("COMPOUNDER DASHBOARD PROFILE SIGNED URL ERROR:", error);

      profilePictureUrl = null;
    }
  }

  return {
    ...compounder,

    // Permanent DB/S3 key
    profile_picture_key: profilePictureKey,

    // Frontend-ready image URL
    profile_picture: profilePictureUrl,
  };
}

// ======================================================
// COMPOUNDER DASHBOARD
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
    // ROLE CHECK
    // ======================================================

    if (session.role !== "compounder") {
      return NextResponse.json(
        {
          success: false,
          message: "Only compounders can access this dashboard.",
        },
        {
          status: 403,
        },
      );
    }

    // ======================================================
    // COMPOUNDER ACCOUNT
    // ======================================================

    const compounderResult = await db.query(
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
    // COMPOUNDER NOT FOUND
    // ======================================================

    if (compounderResult.rows.length === 0) {
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

    const compounder = compounderResult.rows[0];

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
    // PREPARE COMPOUNDER
    //
    // Converts raw S3 key into signed URL.
    // ======================================================

    const responseCompounder = await prepareCompounderResponse(compounder);

    // ======================================================
    // CLINIC DATE
    // Pakistan timezone
    // ======================================================

    const clinicDateResult = await db.query(`
      SELECT
        (
          CURRENT_TIMESTAMP
          AT TIME ZONE 'Asia/Karachi'
        )::DATE::TEXT AS clinic_date
    `);

    const clinicDate = clinicDateResult.rows[0]?.clinic_date || null;

    // ======================================================
    // TOTAL PATIENTS
    // ======================================================

    const totalPatientsResult = await db.query(`
      SELECT
        COUNT(*)::INTEGER AS total

      FROM patients
    `);

    const totalPatients = Number(totalPatientsResult.rows[0]?.total || 0);

    // ======================================================
    // ACTIVE APPOINTMENT STATS
    //
    // TODAY + FUTURE
    //
    // completed / cancelled / no_show are excluded.
    // ======================================================

    const activeStatsResult = await db.query(`
      SELECT
        COUNT(*)::INTEGER AS total,

        COUNT(*) FILTER (
          WHERE status = 'scheduled'
        )::INTEGER AS scheduled,

        COUNT(*) FILTER (
          WHERE status = 'checked_in'
        )::INTEGER AS checked_in,

        COUNT(*) FILTER (
          WHERE status = 'waiting'
        )::INTEGER AS waiting,

        COUNT(*) FILTER (
          WHERE status = 'in_consultation'
        )::INTEGER AS in_consultation

      FROM appointments

      WHERE appointment_date >=
        (
          CURRENT_TIMESTAMP
          AT TIME ZONE 'Asia/Karachi'
        )::DATE

        AND status IN (
          'scheduled',
          'checked_in',
          'waiting',
          'in_consultation'
        )
    `);

    const activeStats = activeStatsResult.rows[0] || {};

    // ======================================================
    // TODAY STATS
    //
    // Includes every status for today's appointments.
    // ======================================================

    const todayStatsResult = await db.query(`
      SELECT
        COUNT(*)::INTEGER AS total,

        COUNT(*) FILTER (
          WHERE status = 'scheduled'
        )::INTEGER AS scheduled,

        COUNT(*) FILTER (
          WHERE status = 'checked_in'
        )::INTEGER AS checked_in,

        COUNT(*) FILTER (
          WHERE status = 'waiting'
        )::INTEGER AS waiting,

        COUNT(*) FILTER (
          WHERE status = 'in_consultation'
        )::INTEGER AS in_consultation,

        COUNT(*) FILTER (
          WHERE status = 'completed'
        )::INTEGER AS completed,

        COUNT(*) FILTER (
          WHERE status = 'cancelled'
        )::INTEGER AS cancelled,

        COUNT(*) FILTER (
          WHERE status = 'no_show'
        )::INTEGER AS no_show

      FROM appointments

      WHERE appointment_date =
        (
          CURRENT_TIMESTAMP
          AT TIME ZONE 'Asia/Karachi'
        )::DATE
    `);

    const todayStats = todayStatsResult.rows[0] || {};

    // ======================================================
    // UPCOMING ACTIVE APPOINTMENTS COUNT
    //
    // FUTURE ONLY
    // ======================================================

    const upcomingCountResult = await db.query(`
      SELECT
        COUNT(*)::INTEGER AS total

      FROM appointments

      WHERE appointment_date >
        (
          CURRENT_TIMESTAMP
          AT TIME ZONE 'Asia/Karachi'
        )::DATE

        AND status IN (
          'scheduled',
          'checked_in',
          'waiting',
          'in_consultation'
        )
    `);

    const upcomingCount = Number(upcomingCountResult.rows[0]?.total || 0);

    // ======================================================
    // ACTIVE QUEUE
    //
    // TODAY + FUTURE
    // ======================================================

    const queueResult = await db.query(`
      SELECT
        a.id,
        a.patient_id,
        a.doctor_id,

        a.appointment_date::TEXT
          AS appointment_date,

        a.appointment_time::TEXT
          AS appointment_time,

        a.token_number,
        a.status,
        a.notes,
        a.created_at,
        a.updated_at,

        p.name
          AS patient_name,

        p.patient_code,

        p.phone
          AS patient_phone,

        p.gender,

        p.date_of_birth,

        d.name
          AS doctor_name,

        CASE
          WHEN a.appointment_date =
            (
              CURRENT_TIMESTAMP
              AT TIME ZONE 'Asia/Karachi'
            )::DATE
          THEN TRUE
          ELSE FALSE
        END AS is_today

      FROM appointments a

      INNER JOIN patients p
        ON p.id = a.patient_id

      INNER JOIN users d
        ON d.id = a.doctor_id
        AND d.role = 'doctor'
        AND d.is_active = TRUE

      WHERE a.appointment_date >=
        (
          CURRENT_TIMESTAMP
          AT TIME ZONE 'Asia/Karachi'
        )::DATE

        AND a.status IN (
          'scheduled',
          'checked_in',
          'waiting',
          'in_consultation'
        )

      ORDER BY
        a.appointment_date ASC,

        CASE a.status
          WHEN 'in_consultation' THEN 1
          WHEN 'waiting' THEN 2
          WHEN 'checked_in' THEN 3
          WHEN 'scheduled' THEN 4
          ELSE 5
        END,

        a.appointment_time ASC,

        a.id ASC
    `);

    // ======================================================
    // UPCOMING APPOINTMENTS
    //
    // FUTURE ONLY
    // ======================================================

    const upcomingResult = await db.query(`
      SELECT
        a.id,
        a.patient_id,
        a.doctor_id,

        a.appointment_date::TEXT
          AS appointment_date,

        a.appointment_time::TEXT
          AS appointment_time,

        a.token_number,
        a.status,
        a.notes,
        a.created_at,
        a.updated_at,

        p.name
          AS patient_name,

        p.patient_code,

        p.phone
          AS patient_phone,

        p.gender,

        p.date_of_birth,

        d.name
          AS doctor_name

      FROM appointments a

      INNER JOIN patients p
        ON p.id = a.patient_id

      INNER JOIN users d
        ON d.id = a.doctor_id
        AND d.role = 'doctor'
        AND d.is_active = TRUE

      WHERE a.appointment_date >
        (
          CURRENT_TIMESTAMP
          AT TIME ZONE 'Asia/Karachi'
        )::DATE

        AND a.status IN (
          'scheduled',
          'checked_in',
          'waiting',
          'in_consultation'
        )

      ORDER BY
        a.appointment_date ASC,
        a.appointment_time ASC,
        a.id ASC
    `);

    // ======================================================
    // NORMALIZED STATS
    // ======================================================

    const stats = {
      // ==================================================
      // PATIENTS
      // ==================================================

      total_patients: totalPatients,

      // ==================================================
      // ACTIVE TODAY + FUTURE
      // ==================================================

      active_appointments: Number(activeStats.total || 0),

      scheduled: Number(activeStats.scheduled || 0),

      checked_in: Number(activeStats.checked_in || 0),

      waiting: Number(activeStats.waiting || 0),

      in_consultation: Number(activeStats.in_consultation || 0),

      total_queue: Number(activeStats.total || 0),

      // ==================================================
      // TODAY ONLY
      // ==================================================

      today_appointments: Number(todayStats.total || 0),

      today_scheduled: Number(todayStats.scheduled || 0),

      today_checked_in: Number(todayStats.checked_in || 0),

      today_waiting: Number(todayStats.waiting || 0),

      today_in_consultation: Number(todayStats.in_consultation || 0),

      completed: Number(todayStats.completed || 0),

      cancelled: Number(todayStats.cancelled || 0),

      no_show: Number(todayStats.no_show || 0),

      // ==================================================
      // FUTURE ONLY
      // ==================================================

      upcoming_appointments: upcomingCount,
    };

    // ======================================================
    // RESPONSE
    // ======================================================

    return NextResponse.json(
      {
        success: true,

        clinic_date: clinicDate,

        // IMPORTANT:
        // This contains signed S3 URL in profile_picture
        compounder: responseCompounder,

        stats,

        // TODAY + FUTURE ACTIVE
        queue: queueResult.rows,

        // FUTURE ONLY ACTIVE
        upcoming_appointments: upcomingResult.rows,
      },
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",

          Pragma: "no-cache",

          Expires: "0",
        },
      },
    );
  } catch (error) {
    console.error("COMPOUNDER DASHBOARD ERROR:", error);

    return NextResponse.json(
      {
        success: false,

        message: "Unable to load compounder dashboard.",

        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      {
        status: 500,

        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
