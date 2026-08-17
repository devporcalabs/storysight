import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request) {
  try {
    // Authorization
    const token = request.cookies.get("session")?.value;
    const user = token ? await verifyToken(token) : null;
    if (!user || (user.role !== "SUPERADMIN" && user.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courses = await prisma.course.findMany({
      include: {
        _count: {
          select: {
            orders: {
              where: { paymentStatus: "PAID" }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("GET Admin Courses Error:", error);
    return NextResponse.json({ error: "Gagal memuat kelas." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
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

    if (!title || !slug || !shortDescription || !description || !mentorName || price === undefined || !startDate || !endDate || !duration || quota === undefined || !whatsappGroupUrl) {
      return NextResponse.json({ error: "Kolom bertanda bintang (*) wajib diisi." }, { status: 400 });
    }

    // Check slug uniqueness
    const existing = await prisma.course.findUnique({
      where: { slug }
    });
    if (existing) {
      return NextResponse.json({ error: "Slug sudah digunakan. Silakan gunakan slug yang unik." }, { status: 400 });
    }

    // Create course with nested learningOutcomes and benefits
    const newCourse = await prisma.course.create({
      data: {
        title,
        slug,
        thumbnailUrl: thumbnailUrl || "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600",
        shortDescription,
        description,
        mentorName,
        mentorPhotoUrl: mentorPhotoUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
        mentorBio: mentorBio || "",
        price: Number(price),
        discountPrice: discountPrice !== "" && discountPrice !== null && discountPrice !== undefined ? Number(discountPrice) : null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        duration,
        quota: Number(quota),
        whatsappGroupUrl,
        status: status || "DRAFT",
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

    return NextResponse.json(newCourse);
  } catch (error) {
    console.error("POST Admin Course Error:", error);
    return NextResponse.json({ error: "Gagal membuat kelas baru." }, { status: 500 });
  }
}
