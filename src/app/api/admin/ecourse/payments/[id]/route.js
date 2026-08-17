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
    const {
      type,
      bankName,
      accountNumber,
      accountHolder,
      qrisImageUrl,
      merchantName,
      isActive,
      sortOrder
    } = body;

    const pm = await prisma.paymentMethod.findUnique({ where: { id } });
    if (!pm) {
      return NextResponse.json({ error: "Metode pembayaran tidak ditemukan." }, { status: 404 });
    }

    const updated = await prisma.paymentMethod.update({
      where: { id },
      data: {
        type: type || pm.type,
        bankName: type === "BANK_TRANSFER" ? bankName : (pm.type === "BANK_TRANSFER" ? bankName : null),
        accountNumber: type === "BANK_TRANSFER" ? accountNumber : (pm.type === "BANK_TRANSFER" ? accountNumber : null),
        accountHolder: type === "BANK_TRANSFER" ? accountHolder : (pm.type === "BANK_TRANSFER" ? accountHolder : null),
        qrisImageUrl: type === "QRIS" ? qrisImageUrl : (pm.type === "QRIS" ? qrisImageUrl : null),
        merchantName: type === "QRIS" ? merchantName : (pm.type === "QRIS" ? merchantName : null),
        isActive: isActive !== undefined ? Boolean(isActive) : pm.isActive,
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : pm.sortOrder
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT Admin Payment Method Error:", error);
    return NextResponse.json({ error: "Gagal memperbarui metode pembayaran." }, { status: 500 });
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

    const pm = await prisma.paymentMethod.findUnique({ where: { id } });
    if (!pm) {
      return NextResponse.json({ error: "Metode pembayaran tidak ditemukan." }, { status: 404 });
    }

    await prisma.paymentMethod.delete({ where: { id } });

    return NextResponse.json({ message: "Metode pembayaran berhasil dihapus." });
  } catch (error) {
    console.error("DELETE Admin Payment Method Error:", error);
    return NextResponse.json({ error: "Gagal menghapus metode pembayaran." }, { status: 500 });
  }
}
