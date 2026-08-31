import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          user: null,
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: session,
    });
  } catch (error) {
    console.error("SESSION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        user: null,
      },
      { status: 401 },
    );
  }
}
