import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "../../../../lib/db";

export async function POST(request) {
  try {
    const body = await request.json();

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const role = body.role?.trim().toLowerCase();
    const phone = body.phone?.trim() || null;

    // Basic validation
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email, password and role are required.",
        },
        { status: 400 },
      );
    }

    // Only allowed roles
    if (!["doctor", "compounder"].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Role must be doctor or compounder.",
        },
        { status: 400 },
      );
    }

    // Password minimum length
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters.",
        },
        { status: 400 },
      );
    }

    // Check existing email
    const existingUser = await db.query(
      `
      SELECT id, email
      FROM users
      WHERE LOWER(email) = $1
      LIMIT 1
      `,
      [email],
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "A user with this email already exists.",
        },
        { status: 409 },
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const result = await db.query(
      `
      INSERT INTO users (
        name,
        email,
        password_hash,
        role,
        phone,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, TRUE)
      RETURNING
        id,
        name,
        email,
        role,
        phone,
        is_active,
        last_login_at,
        created_at,
        updated_at
      `,
      [name, email, passwordHash, role, phone],
    );

    const user = result.rows[0];

    return NextResponse.json(
      {
        success: true,
        message: `${role} account created successfully.`,
        user,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("CREATE USER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create user.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
