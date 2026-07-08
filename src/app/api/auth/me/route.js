import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { comparePassword, hashPassword, signToken, verifyToken } from "@/lib/auth";
import { normalizeClassName } from "@/lib/utils";

export async function GET(request) {
  try {
    const token = request.cookies.get("session")?.value;
    const userPayload = token ? await verifyToken(token) : null;

    if (!userPayload) {
      return NextResponse.json({ authenticated: false });
    }

    // Verify user dynamically against database to check for account expiration
    const user = await prisma.user.findUnique({
      where: { id: userPayload.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        school: true,
        class: true,
        expiresAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    if (user.expiresAt && new Date() > new Date(user.expiresAt)) {
      return NextResponse.json({ authenticated: false, error: "Expired" });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        school: user.school,
        class: user.class,
      },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}

export async function PUT(request) {
  try {
    const token = request.cookies.get("session")?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, school, class: userClass, oldPassword, newPassword } = body;

    const userDb = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!userDb) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (school !== undefined) updateData.school = school ? school.trim() : null;
    if (userClass !== undefined) updateData.class = userClass ? normalizeClassName(userClass) : null;

    // Handle password update
    if (oldPassword && newPassword) {
      const isMatch = await comparePassword(oldPassword, userDb.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: "Password lama salah" }, { status: 400 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ error: "Password baru minimal 6 karakter" }, { status: 400 });
      }
      updateData.passwordHash = await hashPassword(newPassword);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    // Generate new JWT
    const newToken = await signToken({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      school: updatedUser.school,
      class: updatedUser.class,
    });

    const response = NextResponse.json({
      message: "Profil berhasil diperbarui",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        school: updatedUser.school,
        class: updatedUser.class,
      },
    });

    // Reset cookie with new token
    response.cookies.set("session", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 86400, // 24 hours
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("PUT Profile Error:", error);
    return NextResponse.json({ error: "Gagal memperbarui profil" }, { status: 500 });
  }
}
