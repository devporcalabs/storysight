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

    // KPI Counts
    const totalCourses = await prisma.course.count();
    const activeCourses = await prisma.course.count({
      where: { status: "PUBLISHED" }
    });

    const totalOrders = await prisma.courseOrder.count();
    const unpaidOrders = await prisma.courseOrder.count({
      where: { paymentStatus: "UNPAID" }
    });
    const waitingConfirmation = await prisma.courseOrder.count({
      where: { paymentStatus: "WAITING_CONFIRMATION" }
    });
    const paidOrders = await prisma.courseOrder.count({
      where: { paymentStatus: "PAID" }
    });
    const cancelledOrders = await prisma.courseOrder.count({
      where: { paymentStatus: "CANCELLED" }
    });

    // Total Revenue (only from PAID orders)
    const revenueSum = await prisma.courseOrder.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { totalAmount: true }
    });
    const totalRevenue = revenueSum._sum.totalAmount || 0;

    // Total unique participants count (represented by paid orders count since one order code is one registration)
    const totalParticipants = paidOrders;

    // Recent Orders (Top 10)
    const recentOrders = await prisma.courseOrder.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        course: {
          select: { title: true }
        }
      }
    });

    // Popular Courses (Count of PAID orders per course)
    const courses = await prisma.course.findMany({
      include: {
        orders: {
          where: { paymentStatus: "PAID" }
        }
      }
    });

    const popularCourses = courses
      .map(c => ({
        id: c.id,
        title: c.title,
        price: c.price,
        discountPrice: c.discountPrice,
        status: c.status,
        quota: c.quota,
        participantsCount: c.orders.length
      }))
      .sort((a, b) => b.participantsCount - a.participantsCount)
      .slice(0, 5);

    return NextResponse.json({
      totalCourses,
      activeCourses,
      totalOrders,
      unpaidOrders,
      waitingConfirmation,
      paidOrders,
      cancelledOrders,
      totalRevenue,
      totalParticipants,
      recentOrders,
      popularCourses
    });
  } catch (error) {
    console.error("GET Admin Stats Error:", error);
    return NextResponse.json(
      { error: "Gagal memuat statistik admin." },
      { status: 500 }
    );
  }
}
