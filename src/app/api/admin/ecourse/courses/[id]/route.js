import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Authorization
    const token = request.cookies.get("session")?.value;
    const user = token ? await verifyToken(token) : null;
    if (!user || (user.role !== "SUPERADMIN" && user.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        learningOutcomes: { orderBy: { sortOrder: "asc" } },
        benefits: { orderBy: { sortOrder: "asc" } }
      }
    });

    if (!course) {
      return NextResponse.json({ error: "Kelas tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("GET Admin Course Detail Error:", error);
    return NextResponse.json({ error: "Gagal memuat detail kelas." }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Authorization
    const token = request.cookies.get("session")?.value;
    const user = token ? await verifyToken(token) : null;
    if (!user || (user.role !== "SUPERADMIN" && user.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      thumbnailUrl,
      shortDescription,
      description,
      mentorName,
      mentorPhotoUrl,
      mentorBio,
      price,
      discountPrice,
      startDate,
      endDate,
      duration,
      quota,
      whatsappGroupUrl,
      status,
      isFeatured,
      learningOutcomes, // Array of strings
      benefits // Array of strings
    } = body;

    // Check if course exists
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return NextResponse.json({ error: "Kelas tidak ditemukan." }, { status: 404 });
    }

    // Check slug uniqueness
    if (slug !== course.slug) {
      const existingSlug = await prisma.course.findUnique({ where: { slug } });
      if (existingSlug) {
        return NextResponse.json({ error: "Slug sudah digunakan kelas lain." }, { status: 400 });
      }
    }

    // Transaction to update details and recreate outcomes/benefits
    const updatedCourse = await prisma.$transaction(async (tx) => {
      // 1. Delete old outcomes & benefits
      await tx.courseLearningOutcome.deleteMany({ where: { courseId: id } });
      await tx.courseBenefit.deleteMany({ where: { courseId: id } });

      // 2. Update course info
      return await tx.course.update({
        where: { id },
        data: {
          title,
          slug,
          thumbnailUrl,
          shortDescription,
          description,
          mentorName,
          mentorPhotoUrl,
          mentorBio,
          price: Number(price),
          discountPrice: discountPrice !== "" && discountPrice !== null && discountPrice !== undefined ? Number(discountPrice) : null,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          duration,
          quota: Number(quota),
          whatsappGroupUrl,
          status,
          isFeatured: Boolean(isFeatured),
          learningOutcomes: {
            create: (learningOutcomes || []).map((title, index) => ({
              title,
              sortOrder: index + 1
            }))
          },
          benefits: {
            create: (benefits || []).map((title, index) => ({
              title,
              sortOrder: index + 1
            }))
          }
        }
      });
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("PUT Admin Course Error:", error);
    return NextResponse.json({ error: "Gagal memperbarui data kelas." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Authorization
    const token = request.cookies.get("session")?.value;
    const user = token ? await verifyToken(token) : null;
    if (!user || (user.role !== "SUPERADMIN" && user.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return NextResponse.json({ error: "Kelas tidak ditemukan." }, { status: 404 });
    }

    // Cascade delete is handled by schema constraints (onDelete: Cascade)
    await prisma.course.delete({ where: { id } });

    return NextResponse.json({ message: "Kelas berhasil dihapus." });
  } catch (error) {
    console.error("DELETE Admin Course Error:", error);
    return NextResponse.json({ error: "Gagal menghapus kelas." }, { status: 500 });
  }
}
