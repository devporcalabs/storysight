import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken, hashPassword } from "@/lib/auth";

export async function GET(request) {
  try {
    const token = request.cookies.get("session")?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user || !["SUPERADMIN", "TEACHER"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let whereClause = {};

    if (user.role === "TEACHER") {
      // Teachers can only see students in their school
      whereClause = {
        role: "STUDENT",
        school: user.school,
      };
    } else {
      // Superadmins can filter by role/school if needed
      const roleFilter = searchParams.get("role");
      const schoolFilter = searchParams.get("school");

      if (roleFilter) whereClause.role = roleFilter;
      if (schoolFilter) whereClause.school = schoolFilter;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { school: { contains: search } },
      ];
    }

    const usersList = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        school: true,
        createdAt: true,
        progress: {
          select: {
            progressStatus: true,
            story: {
              select: {
                title: true,
              },
            },
          },
        },
        attempts: {
          select: {
            score: true,
            passed: true,
            createdAt: true,
            story: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedUsers = usersList.map((u) => {
      const completedCount = u.progress.filter(p => p.progressStatus === "COMPLETED").length;
      const totalAttemptsCount = u.attempts.length;
      const averageScore = totalAttemptsCount > 0
        ? Math.round(u.attempts.reduce((sum, att) => sum + att.score, 0) / totalAttemptsCount)
        : 0;

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        school: u.school,
        createdAt: u.createdAt,
        completedCount,
        attemptsCount: totalAttemptsCount,
        averageScore,
        progress: u.progress,
        attempts: u.attempts,
      };
    });

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("GET Admin Users Error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = request.cookies.get("session")?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user || !["SUPERADMIN", "TEACHER"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, role, school } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
    }

    const emailLower = email.toLowerCase();

    // Check email uniqueness
    const existing = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (existing) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
    }

    // Role-based restrictions on creation
    let targetRole = role || "STUDENT";
    let targetSchool = school;

    if (user.role === "TEACHER") {
      // Teachers can only create students in their own school
      targetRole = "STUDENT";
      targetSchool = user.school;
    } else {
      // Superadmin can create any role
      if (!["STUDENT", "TEACHER", "SUPERADMIN"].includes(targetRole)) {
        return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
      }
      
      // If role is Student or Teacher, validate school
      if (["STUDENT", "TEACHER"].includes(targetRole) && (!targetSchool || targetSchool.trim() === "")) {
        return NextResponse.json({ error: "School name is required for student/teacher" }, { status: 400 });
      }
    }

    const passwordHash = await hashPassword(password);
    const createdUser = await prisma.user.create({
      data: {
        name,
        email: emailLower,
        passwordHash,
        role: targetRole,
        school: targetSchool ? targetSchool.trim() : null,
      },
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: createdUser.id,
          name: createdUser.name,
          email: createdUser.email,
          role: createdUser.role,
          school: createdUser.school,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Admin Create User Error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
