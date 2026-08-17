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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const courseId = searchParams.get("courseId") || "";
    const status = searchParams.get("status") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    const where = {};

    // Filter by search string
    if (search) {
      where.OR = [
        { orderCode: { contains: search } },
        { fullName: { contains: search } },
        { email: { contains: search } },
        { whatsapp: { contains: search } }
      ];
    }

    // Filter by course
    if (courseId) {
      where.courseId = courseId;
    }

    // Filter by payment status
    if (status) {
      where.paymentStatus = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const orders = await prisma.courseOrder.findMany({
      where,
      include: {
        course: {
          select: { title: true, mentorName: true }
        },
        paymentMethod: {
          select: { bankName: true, type: true, merchantName: true }
        },
        confirmedBy: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET Admin Orders Error:", error);
    return NextResponse.json({ error: "Gagal memuat transaksi order." }, { status: 500 });
  }
}
