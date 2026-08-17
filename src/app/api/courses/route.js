import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request) {
  try {
    const courses = await prisma.course.findMany({
      where: {
        status: "PUBLISHED"
      },
      include: {
        learningOutcomes: {
          orderBy: { sortOrder: "asc" }
        },
        benefits: {
          orderBy: { sortOrder: "asc" }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Remove WhatsApp Group URL for public catalog security
    const sanitizedCourses = courses.map(c => {
      const { whatsappGroupUrl, ...rest } = c;
      return rest;
    });

    return NextResponse.json(sanitizedCourses);
  } catch (error) {
    console.error("GET Courses Error:", error);
    return NextResponse.json({ error: "Gagal memuat daftar kelas." }, { status: 500 });
  }
}
