import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    if (!slug) {
      return NextResponse.json({ error: "Slug wajib diisi." }, { status: 400 });
    }

    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        learningOutcomes: {
          orderBy: { sortOrder: "asc" }
        },
        benefits: {
          orderBy: { sortOrder: "asc" }
        }
      }
    });

    if (!course || course.status === "DRAFT") {
      return NextResponse.json({ error: "Kelas tidak ditemukan." }, { status: 404 });
    }

    // Remove WhatsApp Group URL for public detail security
    const { whatsappGroupUrl, ...sanitizedCourse } = course;

    // Get count of PAID participants to calculate quota remaining
    const paidCount = await prisma.courseOrder.count({
      where: {
        courseId: course.id,
        paymentStatus: "PAID"
      }
    });

    return NextResponse.json({
      ...sanitizedCourse,
      paidParticipantsCount: paidCount,
      isFull: paidCount >= course.quota
    });
  } catch (error) {
    console.error("GET Course Detail Error:", error);
    return NextResponse.json({ error: "Gagal memuat detail kelas." }, { status: 500 });
  }
}
