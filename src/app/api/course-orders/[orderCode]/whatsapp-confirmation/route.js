import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;
    const { orderCode } = resolvedParams;

    if (!orderCode) {
      return NextResponse.json({ error: "Order Code wajib diisi." }, { status: 400 });
    }

    const order = await prisma.courseOrder.findUnique({
      where: { orderCode }
    });

    if (!order) {
      return NextResponse.json({ error: "Order tidak ditemukan." }, { status: 404 });
    }

    // Only update to WAITING_CONFIRMATION if the current status is UNPAID
    if (order.paymentStatus === "UNPAID") {
      const updatedOrder = await prisma.courseOrder.update({
        where: { orderCode },
        data: {
          paymentStatus: "WAITING_CONFIRMATION",
          whatsappConfirmationClickedAt: new Date()
        }
      });
      return NextResponse.json({
        message: "Status pembayaran diperbarui ke Menunggu Konfirmasi.",
        order: updatedOrder
      });
    }

    return NextResponse.json({
      message: "Status tidak diubah.",
      order
    });
  } catch (error) {
    console.error("POST WhatsApp Confirmation Error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui status konfirmasi." },
      { status: 500 }
    );
  }
}
