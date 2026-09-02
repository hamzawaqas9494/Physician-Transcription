// import { NextResponse } from "next/server";

// import { db } from "@/lib/db";
// import { getSession } from "@/lib/auth";

// export const dynamic = "force-dynamic";

// // ======================================================
// // GET DOCTOR DASHBOARD
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
//     // ROLE CHECK
//     // =========================

//     if (session.role !== "doctor") {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Only doctor can access this dashboard.",
//         },
//         { status: 403 },
//       );
//     }

//     // =========================
//     // DOCTOR DATA
//     // =========================

//     const doctorResult = await db.query(
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
//         AND role = 'doctor'

//       LIMIT 1
//       `,
//       [session.userId],
//     );

//     if (doctorResult.rows.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Doctor account not found.",
//         },
//         { status: 404 },
//       );
//     }

//     const doctor = doctorResult.rows[0];

//     // =========================
//     // ACTIVE CHECK
//     // =========================

//     if (!doctor.is_active) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Doctor account is inactive.",
//         },
//         { status: 403 },
//       );
//     }

//     // =========================
//     // TODAY STATS
//     // =========================

//     const statsResult = await db.query(
//       `
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

//       WHERE doctor_id = $1
//         AND appointment_date = CURRENT_DATE
//       `,
//       [doctor.id],
//     );

//     const stats = statsResult.rows[0];

//     // =========================
//     // TODAY APPOINTMENTS
//     // =========================

//     const appointmentsResult = await db.query(
//       `
//       SELECT
//         appointments.id,
//         appointments.patient_id,
//         appointments.doctor_id,
//         appointments.appointment_date,
//         appointments.appointment_time,
//         appointments.token_number,
//         appointments.status,
//         appointments.notes,
//         appointments.created_at,

//         patients.name AS patient_name,
//         patients.patient_code,
//         patients.gender,
//         patients.date_of_birth,
//         patients.phone AS patient_phone

//       FROM appointments

//       INNER JOIN patients
//         ON patients.id = appointments.patient_id

//       WHERE appointments.doctor_id = $1
//         AND appointments.appointment_date = CURRENT_DATE

//       ORDER BY

//         CASE appointments.status

//           WHEN 'in_consultation' THEN 1

//           WHEN 'waiting' THEN 2

//           WHEN 'checked_in' THEN 3

//           WHEN 'scheduled' THEN 4

//           WHEN 'completed' THEN 5

//           WHEN 'cancelled' THEN 6

//           WHEN 'no_show' THEN 7

//           ELSE 8

//         END,

//         appointments.appointment_time ASC
//       `,
//       [doctor.id],
//     );

//     // =========================
//     // RESPONSE
//     // =========================

//     return NextResponse.json(
//       {
//         success: true,

//         doctor,

//         stats: {
//           total: stats?.total || 0,
//           scheduled: stats?.scheduled || 0,
//           checked_in: stats?.checked_in || 0,
//           waiting: stats?.waiting || 0,
//           in_consultation: stats?.in_consultation || 0,
//           completed: stats?.completed || 0,
//           cancelled: stats?.cancelled || 0,
//           no_show: stats?.no_show || 0,
//         },

//         appointments: appointmentsResult.rows,
//       },
//       { status: 200 },
//     );
//   } catch (error) {
//     console.error("DOCTOR DASHBOARD ERROR:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Unable to load doctor dashboard.",

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

export const dynamic = "force-dynamic";

// ======================================================
// DOCTOR DASHBOARD
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
        { status: 401 },
      );
    }

    // ======================================================
    // ROLE
    // ======================================================

    if (session.role !== "doctor") {
      return NextResponse.json(
        {
          success: false,
          message: "Only doctors can access this dashboard.",
        },
        { status: 403 },
      );
    }

    // ======================================================
    // DOCTOR
    // ======================================================

    const doctorResult = await db.query(
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

    if (doctorResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor account not found.",
        },
        { status: 404 },
      );
    }

    const doctor = doctorResult.rows[0];

    if (!doctor.is_active) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor account is inactive.",
        },
        { status: 403 },
      );
    }

    // ======================================================
    // CLINIC DATE
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
    // ACTIVE STATS
    // TODAY + FUTURE
    // ======================================================

    const activeStatsResult = await db.query(
      `
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

      WHERE doctor_id = $1

        AND appointment_date >=
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
      `,
      [doctor.id],
    );

    const activeStats = activeStatsResult.rows[0] || {};

    // ======================================================
    // TODAY STATS
    // ======================================================

    const todayStatsResult = await db.query(
      `
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

      WHERE doctor_id = $1

        AND appointment_date =
          (
            CURRENT_TIMESTAMP
            AT TIME ZONE 'Asia/Karachi'
          )::DATE
      `,
      [doctor.id],
    );

    const todayStats = todayStatsResult.rows[0] || {};

    // ======================================================
    // UPCOMING COUNT
    // ======================================================

    const upcomingCountResult = await db.query(
      `
      SELECT
        COUNT(*)::INTEGER AS total

      FROM appointments

      WHERE doctor_id = $1

        AND appointment_date >
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
      `,
      [doctor.id],
    );

    const upcomingCount = upcomingCountResult.rows[0]?.total || 0;

    // ======================================================
    // ACTIVE APPOINTMENTS
    // TODAY + FUTURE
    // ======================================================

    const appointmentsResult = await db.query(
      `
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

        p.name AS patient_name,
        p.patient_code,
        p.gender,
        p.date_of_birth,
        p.phone AS patient_phone,

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

      WHERE a.doctor_id = $1

        AND a.appointment_date >=
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

        a.appointment_time ASC
      `,
      [doctor.id],
    );

    // ======================================================
    // UPCOMING APPOINTMENTS
    // FUTURE ONLY
    // ======================================================

    const upcomingResult = await db.query(
      `
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

        p.name AS patient_name,
        p.patient_code,
        p.gender,
        p.date_of_birth,
        p.phone AS patient_phone

      FROM appointments a

      INNER JOIN patients p
        ON p.id = a.patient_id

      WHERE a.doctor_id = $1

        AND a.appointment_date >
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
        a.appointment_time ASC
      `,
      [doctor.id],
    );

    // ======================================================
    // RESPONSE
    // ======================================================

    return NextResponse.json(
      {
        success: true,

        clinic_date: clinicDate,

        doctor,

        stats: {
          active_appointments: activeStats.total || 0,

          scheduled: activeStats.scheduled || 0,

          checked_in: activeStats.checked_in || 0,

          waiting: activeStats.waiting || 0,

          in_consultation: activeStats.in_consultation || 0,

          total_queue: activeStats.total || 0,

          today_appointments: todayStats.total || 0,

          today_scheduled: todayStats.scheduled || 0,

          today_checked_in: todayStats.checked_in || 0,

          today_waiting: todayStats.waiting || 0,

          today_in_consultation: todayStats.in_consultation || 0,

          completed: todayStats.completed || 0,

          cancelled: todayStats.cancelled || 0,

          no_show: todayStats.no_show || 0,

          upcoming_appointments: upcomingCount,
        },

        appointments: appointmentsResult.rows,

        upcoming_appointments: upcomingResult.rows,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      },
    );
  } catch (error) {
    console.error("DOCTOR DASHBOARD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load doctor dashboard.",

        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
