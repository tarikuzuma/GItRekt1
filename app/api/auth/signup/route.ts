import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, validatePasswordStrength, PASSWORD_ERRORS } from "@/lib/password";
import { serializeList } from "@/lib/json-list";

export async function POST(request: Request) {
  try {
    const { email, password, name, university, course } = await request.json();

    // --- Basic field validation ---
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // --- Server-side password strength validation ---
    const strengthCheck = validatePasswordStrength(password);
    if (!strengthCheck.isValid) {
      return NextResponse.json(
        { error: strengthCheck.errors.join(', ') },
        { status: 400 }
      );
    }

    // --- Duplicate email check ---
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: PASSWORD_ERRORS.ACCOUNT_EXISTS },
        { status: 409 }
      );
    }

    // --- Hash password with bcrypt ---
    const hashedPassword = await hashPassword(password);

    // --- Create the user ---
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name.trim(),
        password: hashedPassword,
        university: university?.trim() || null,
        course: course?.trim() || null,
        skills: serializeList([]),
        interests: serializeList([]),
      },
    });

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        university: user.university,
        course: user.course,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
