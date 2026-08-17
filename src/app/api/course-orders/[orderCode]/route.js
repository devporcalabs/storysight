import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { orderCode } = resolvedParams;

    if (!orderCode) {
      return NextResponse.json({ error: "Order Code wajib diisi." }, { status: 400 });
    }

    const order = await prisma.courseOrder.findUnique({
      where: { orderCode },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
            mentorName: true,
            startDate: true,
            endDate: true,
            duration: true,
            whatsappGroupUrl: true // We will conditionally omit this below
          }
        },
        paymentMethod: true
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Order tidak ditemukan." }, { status: 404 });
    }

    // Security rule: If not PAID, do not expose the WhatsApp Group Link
    if (order.paymentStatus !== "PAID") {
      order.course.whatsappGroupUrl = "";
    }

    // Fetch E-Course WhatsApp admin details to create the message link dynamically
    const settings = await prisma.eCourseSetting.findUnique({
      where: { id: "default-settings" }
    });

    // Also get all active payment methods so the user can change payment options on the payment page if they want
    const activePaymentMethods = await prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" }
    });

    return NextResponse.json({
      order,
      whatsappAdmin: settings?.whatsappAdmin || "62895809372277",
      whatsappTemplate: settings?.whatsappTemplate || "",
      activePaymentMethods
    });
  } catch (error) {
    console.error("GET Order Detail Error:", error);
    return NextResponse.json(
      { error: "Gagal memuat detail pesanan." },
      { status: 500 }
    );
  }
}
