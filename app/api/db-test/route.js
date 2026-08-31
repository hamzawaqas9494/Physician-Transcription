import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

export async function GET() {
  try {
    const result = await db.query("SELECT NOW() AS current_time");

    return NextResponse.json({
      success: true,
      message: "PostgreSQL database connected successfully.",
      database: "medtranscript",
      time: result.rows[0].current_time,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "PostgreSQL database connection failed.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
