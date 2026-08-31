import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { getSession } from "../../../../lib/auth";

// Clinic slot configuration
const SLOT_START_HOUR = 9; // 09:00 AM
const SLOT_END_HOUR = 17; // 05:00 PM
const SLOT_INTERVAL_MINUTES = 30;

// =========================
// TIME HELPERS
// =========================

function pad(value) {
  return String(value).padStart(2, "0");
}

function generateSlots() {
  const slots = [];

  const startMinutes = SLOT_START_HOUR * 60;
  const endMinutes = SLOT_END_HOUR * 60;

  for (
    let totalMinutes = startMinutes;
    totalMinutes < endMinutes;
    totalMinutes += SLOT_INTERVAL_MINUTES
  ) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    slots.push(`${pad(hours)}:${pad(minutes)}:00`);
  }

  return slots;
}

// ======================================================
// GET /api/appointments/slots
// Example:
// /api/appointments/slots?doctor_id=1&date=2026-08-29
// ======================================================

export async function GET(request) {
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
        { status: 401 }
      );
    }

    // =========================
    // ROLE CHECK
    // =========================

    if (!["doctor", "compounder"].includes(session.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not allowed to access appointment slots.",
        },
        { status: 403 }
      );
    }

    // =========================
    // QUERY PARAMS
    // =========================

    const { searchParams } = new URL(request.url);

    const doctorId = Number(
      searchParams.get("doctor_id")
    );

    const date =
      searchParams.get("date")?.trim();

    // =========================
    // VALIDATION
    // =========================

    if (!doctorId || Number.isNaN(doctorId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid doctor_id is required.",
        },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        {
          success: false,
          message: "Appointment date is required.",
        },
        { status: 400 }
      );
    }

    // YYYY-MM-DD validation
    const datePattern =
      /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(date)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD.",
        },
        { status: 400 }
      );
    }

    // =========================
    // CHECK DOCTOR
    // =========================

    const doctorResult = await db.query(
      `
      SELECT
        id,
        name,
        is_active
      FROM users
      WHERE id = $1
        AND role = 'doctor'
      LIMIT 1
      `,
      [doctorId]
    );

    if (doctorResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor not found.",
        },
        { status: 404 }
      );
    }

    const doctor = doctorResult.rows[0];

    if (!doctor.is_active) {
      return NextResponse.json(
        {
          success: false,
          message: "This doctor is currently inactive.",
        },
        { status: 400 }
      );
    }

    // =========================
    // GET BOOKED SLOTS
    // =========================

    const bookedResult = await db.query(
      `
      SELECT
        appointment_time,
        status
      FROM appointments
      WHERE doctor_id = $1
        AND appointment_date = $2
        AND status NOT IN (
          'cancelled',
          'no_show'
        )
      `,
      [
        doctorId,
        date,
      ]
    );

    const bookedTimes = new Set(
      bookedResult.rows.map((row) => {
        const time = String(
          row.appointment_time
        );

        return time.length === 5
          ? `${time}:00`
          : time;
      })
    );

    // =========================
    // GENERATE ALL SLOTS
    // =========================

    const allSlots = generateSlots();

    const today =
      new Date().toISOString().split("T")[0];

    const now = new Date();

    const slots = allSlots.map((time) => {
      let available =
        !bookedTimes.has(time);

      // If selected date is today,
      // block past slots
      if (date === today) {
        const [hours, minutes] =
          time.split(":");

        const slotDate = new Date();

        slotDate.setHours(
          Number(hours),
          Number(minutes),
          0,
          0
        );

        if (slotDate <= now) {
          available = false;
        }
      }

      return {
        time,
        available,
        status: available
          ? "available"
          : bookedTimes.has(time)
            ? "booked"
            : "unavailable",
      };
    });

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json(
      {
        success: true,

        doctor: {
          id: doctor.id,
          name: doctor.name,
        },

        date,

        slot_interval_minutes:
          SLOT_INTERVAL_MINUTES,

        slots,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "GET APPOINTMENT SLOTS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load appointment slots.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}