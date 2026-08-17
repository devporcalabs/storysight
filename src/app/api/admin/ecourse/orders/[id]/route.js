import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

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
    const { paymentStatus } = body;

    if (!paymentStatus) {
      return NextResponse.json({ error: "Status pembayaran wajib diisi." }, { status: 400 });
    }

    // Verify order exists
    const order = await prisma.courseOrder.findUnique({
      where: { id }
    });

    if (!order) {
      return NextResponse.json({ error: "Order tidak ditemukan." }, { status: 404 });
    }

    const updateData = { paymentStatus };

    if (paymentStatus === "PAID") {
      updateData.confirmedAt = new Date();
      updateData.confirmedById = user.id;
    } else if (paymentStatus === "CANCELLED") {
      updateData.cancelledAt = new Date();
    } else if (paymentStatus === "UNPAID") {
      updateData.confirmedAt = null;
      updateData.confirmedById = null;
      updateData.cancelledAt = null;
    }

    const updatedOrder = await prisma.courseOrder.update({
      where: { id },
      data: updateData,
      include: {
        course: {
          select: { title: true }
        },
        confirmedBy: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("PUT Admin Order Status Error:", error);
    return NextResponse.json({ error: "Gagal memperbarui status order." }, { status: 500 });
  }
}
