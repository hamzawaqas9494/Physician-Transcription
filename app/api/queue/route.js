import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// ======================================================
// GET QUEUE
// Doctor    -> own active appointments
// Compounder -> all active appointments
// Today + future appointments
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
    // ROLE CHECK
    // ======================================================

    if (!["doctor", "compounder"].includes(session.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied.",
        },
        { status: 403 },
      );
    }

    // ======================================================
    // ACTIVE USER CHECK
    // ======================================================

    const userResult = await db.query(
      `
      SELECT
        id,
        role,
        is_active

      FROM users

      WHERE id = $1
        AND role = $2

      LIMIT 1
      `,
      [session.userId, session.role],
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "User account not found.",
        },
        { status: 404 },
      );
    }

    if (!userResult.rows[0].is_active) {
      return NextResponse.json(
        {
          success: false,
          message: "Your account is inactive.",
        },
        { status: 403 },
      );
    }

    let result;

    // ======================================================
    // DOCTOR QUEUE
    // Own today + future appointments
    // ======================================================

    if (session.role === "doctor") {
      result = await db.query(
        `
        SELECT
          a.id,
          a.patient_id,
          a.doctor_id,

          a.appointment_date,
          a.appointment_time,

          a.token_number,
          a.status,
          a.notes,

          a.created_at,
          a.updated_at,

          p.name AS patient_name,
          p.patient_code,
          p.phone AS patient_phone,
          p.gender,
          p.date_of_birth,

          d.name AS doctor_name,

          CASE
            WHEN a.appointment_date =
              (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Karachi')::DATE
            THEN TRUE
            ELSE FALSE
          END AS is_today

        FROM appointments a

        INNER JOIN patients p
          ON p.id = a.patient_id

        INNER JOIN users d
          ON d.id = a.doctor_id
          AND d.role = 'doctor'

        WHERE a.doctor_id = $1

          AND a.appointment_date >=
            (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Karachi')::DATE

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
        [session.userId],
      );
    }

    // ======================================================
    // COMPOUNDER QUEUE
    // All doctors
    // Today + future appointments
    // ======================================================
    else {
      result = await db.query(
        `
        SELECT
          a.id,
          a.patient_id,
          a.doctor_id,

          a.appointment_date,
          a.appointment_time,

          a.token_number,
          a.status,
          a.notes,

          a.created_at,
          a.updated_at,

          p.name AS patient_name,
          p.patient_code,
          p.phone AS patient_phone,
          p.gender,
          p.date_of_birth,

          d.name AS doctor_name,

          CASE
            WHEN a.appointment_date =
              (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Karachi')::DATE
            THEN TRUE
            ELSE FALSE
          END AS is_today

        FROM appointments a

        INNER JOIN patients p
          ON p.id = a.patient_id

        INNER JOIN users d
          ON d.id = a.doctor_id
          AND d.role = 'doctor'

        WHERE a.appointment_date >=
          (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Karachi')::DATE

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
      );
    }

    // ======================================================
    // QUEUE
    // ======================================================

    const queue = result.rows;

    // ======================================================
    // TODAY / UPCOMING SPLIT
    // ======================================================

    const todayQueue = queue.filter((item) => item.is_today === true);

    const upcomingQueue = queue.filter((item) => item.is_today !== true);

    // ======================================================
    // COUNTS
    // All active appointments
    // ======================================================

    const counts = {
      total: queue.length,

      today: todayQueue.length,

      upcoming: upcomingQueue.length,

      scheduled: queue.filter((item) => item.status === "scheduled").length,

      checked_in: queue.filter((item) => item.status === "checked_in").length,

      waiting: queue.filter((item) => item.status === "waiting").length,

      in_consultation: queue.filter((item) => item.status === "in_consultation")
        .length,
    };

    // ======================================================
    // TODAY COUNTS
    // ======================================================

    const todayCounts = {
      total: todayQueue.length,

      scheduled: todayQueue.filter((item) => item.status === "scheduled")
        .length,

      checked_in: todayQueue.filter((item) => item.status === "checked_in")
        .length,

      waiting: todayQueue.filter((item) => item.status === "waiting").length,

      in_consultation: todayQueue.filter(
        (item) => item.status === "in_consultation",
      ).length,
    };

    // ======================================================
    // RESPONSE
    // ======================================================

    return NextResponse.json(
      {
        success: true,

        counts,

        today_counts: todayCounts,

        // Today + future
        queue,

        // Today only
        today_queue: todayQueue,

        // Future only
        upcoming_queue: upcomingQueue,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET QUEUE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load appointment queue.",

        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
