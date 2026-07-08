import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { normalizeClassName } from "@/lib/utils";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, role, school, class: userClass } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const assignedRole = role || "STUDENT";

    if (assignedRole === "SUPERADMIN") {
      return NextResponse.json(
        { error: "Registration as Super Admin is not allowed" },
        { status: 400 }
      );
    }

    if (!["STUDENT", "TEACHER"].includes(assignedRole)) {
      return NextResponse.json(
        { error: "Invalid role specified" },
        { status: 400 }
      );
    }

    if (!school || typeof school !== "string" || school.trim() === "") {
      return NextResponse.json(
        { error: "School name is required" },
        { status: 400 }
      );
    }

    if (!userClass || typeof userClass !== "string" || userClass.trim() === "") {
      return NextResponse.json(
        { error: "Class is required" },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 400 }
      );
    }

    // Hash password and store user
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email: emailLower,
        passwordHash,
        role: assignedRole,
        school: school.trim(),
        class: normalizeClassName(userClass),
      },
    });

    return NextResponse.json(
      {
        message: "Registration successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          school: user.school,
          class: user.class,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
