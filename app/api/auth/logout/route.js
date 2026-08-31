import { NextResponse } from "next/server";
import { destroySession } from "../../../../lib/auth";

export async function POST() {
  try {
    await destroySession();

    return NextResponse.json({
      success: true,
      message: "Logout successful.",
    });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Logout failed.",
      },
      { status: 500 },
    );
  }
}
