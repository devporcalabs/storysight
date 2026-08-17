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

    const paymentMethods = await prisma.paymentMethod.findMany({
      orderBy: { sortOrder: "asc" }
    });

    return NextResponse.json(paymentMethods);
  } catch (error) {
    console.error("GET Admin Payment Methods Error:", error);
    return NextResponse.json({ error: "Gagal memuat metode pembayaran." }, { status: 500 });
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
      type,
      bankName,
      accountNumber,
      accountHolder,
      qrisImageUrl,
      merchantName,
      isActive,
      sortOrder
    } = body;

    if (!type) {
      return NextResponse.json({ error: "Tipe metode pembayaran wajib diisi." }, { status: 400 });
    }

    if (type === "BANK_TRANSFER" && (!bankName || !accountNumber || !accountHolder)) {
      return NextResponse.json({ error: "Untuk transfer bank, kolom Nama Bank, Nomor Rekening, dan Pemilik Rekening wajib diisi." }, { status: 400 });
    }

    if (type === "QRIS" && (!qrisImageUrl || !merchantName)) {
      return NextResponse.json({ error: "Untuk QRIS, kolom Gambar QRIS dan Nama Merchant wajib diisi." }, { status: 400 });
    }

    const count = await prisma.paymentMethod.count();

    const pm = await prisma.paymentMethod.create({
      data: {
        type,
        bankName: type === "BANK_TRANSFER" ? bankName : null,
        accountNumber: type === "BANK_TRANSFER" ? accountNumber : null,
        accountHolder: type === "BANK_TRANSFER" ? accountHolder : null,
        qrisImageUrl: type === "QRIS" ? qrisImageUrl : null,
        merchantName: type === "QRIS" ? merchantName : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : count + 1
      }
    });

    return NextResponse.json(pm);
  } catch (error) {
    console.error("POST Admin Payment Method Error:", error);
    return NextResponse.json({ error: "Gagal menambahkan metode pembayaran." }, { status: 500 });
  }
}
