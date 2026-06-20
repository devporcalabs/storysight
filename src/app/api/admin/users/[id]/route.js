import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken, hashPassword } from "@/lib/auth";

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const token = request.cookies.get("session")?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user || !["SUPERADMIN", "TEACHER"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Teacher authorization check
    if (user.role === "TEACHER") {
      if (targetUser.role !== "STUDENT" || targetUser.school !== user.school) {
        return NextResponse.json({ error: "Forbidden: You can only edit students in your own school" }, { status: 403 });
      }
    }

    const body = await request.json();
    const { name, email, password, role, school } = body;

    const data = {};
    if (name) data.name = name;
    
    if (email && email.toLowerCase() !== targetUser.email) {
      const emailLower = email.toLowerCase();
      // Check uniqueness
      const existing = await prisma.user.findUnique({
        where: { email: emailLower },
      });
      if (existing) {
        return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
      }
      data.email = emailLower;
    }

    if (password && password.trim() !== "") {
      if (password.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
      }
      data.passwordHash = await hashPassword(password);
    }

    if (user.role === "SUPERADMIN") {
      if (role) {
        if (!["STUDENT", "TEACHER", "SUPERADMIN"].includes(role)) {
          return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
        }
        data.role = role;
      }
      if (school !== undefined) {
        data.school = school && school.trim() !== "" ? school.trim() : null;
      }
    } else {
      // Teachers cannot change role or school
      data.role = "STUDENT";
      data.school = user.school;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      message: "User updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        school: updatedUser.school,
      },
    });
  } catch (error) {
    console.error("PUT Admin Edit User Error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const token = request.cookies.get("session")?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user || !["SUPERADMIN", "TEACHER"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Teacher authorization check
    if (user.role === "TEACHER") {
      if (targetUser.role !== "STUDENT" || targetUser.school !== user.school) {
        return NextResponse.json({ error: "Forbidden: You can only delete students in your own school" }, { status: 403 });
      }
    }

    // Delete associated progress and attempts first (cascaded delete is handled if setup, but let's make sure by deleting or using delete cascades)
    // Note: In our schema, user relations have onDelete: Cascade (see: `attempts QuizAttempt[]`, `progress UserStoryProgress[]`)
    // Let's perform deletion
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("DELETE Admin User Error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
