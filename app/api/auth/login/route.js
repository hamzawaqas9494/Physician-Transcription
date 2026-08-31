import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "../../../../lib/db";
import { createSession } from "../../../../lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();

    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required.",
        },
        { status: 400 },
      );
    }

    const result = await db.query(
      `
      SELECT
        id,
        name,
        email,
        password_hash,
        role,
        phone,
        is_active
      FROM users
      WHERE LOWER(email) = $1
      LIMIT 1
      `,
      [email],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 },
      );
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your account is inactive. Please contact the administrator.",
        },
        { status: 403 },
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 },
      );
    }

    await db.query(
      `
      UPDATE users
      SET
        last_login_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      `,
      [user.id],
    );

    await createSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const redirectTo =
      user.role === "doctor" ? "/doctor/dashboard" : "/compounder/dashboard";

    return NextResponse.json({
      success: true,
      message: "Login successful.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      redirectTo,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong during login.",
      },
      { status: 500 },
    );
  }
}
