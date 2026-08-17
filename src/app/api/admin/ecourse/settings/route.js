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

    let settings = await prisma.eCourseSetting.findUnique({
      where: { id: "default-settings" }
    });

    if (!settings) {
      settings = await prisma.eCourseSetting.create({
        data: {
          id: "default-settings",
          whatsappAdmin: "62895809372277",
          whatsappTemplate: "Halo Admin StorySight,\n\nSaya ingin melakukan konfirmasi pembayaran E-Course.\n\nOrder ID: {orderCode}\nNama: {fullName}\nCourse: {courseTitle}\nTotal: {totalAmount}\n\nSaya akan mengirimkan bukti pembayaran melalui WhatsApp ini.\n\nTerima kasih."
        }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET Admin Settings Error:", error);
    return NextResponse.json({ error: "Gagal memuat pengaturan WhatsApp." }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    // Authorization
    const token = request.cookies.get("session")?.value;
    const user = token ? await verifyToken(token) : null;
    if (!user || (user.role !== "SUPERADMIN" && user.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { whatsappAdmin, whatsappTemplate } = body;

    if (!whatsappAdmin || !whatsappTemplate) {
      return NextResponse.json({ error: "Nomor WhatsApp Admin dan Template wajib diisi." }, { status: 400 });
    }

    // Normalize WA number
    let cleanWA = whatsappAdmin.replace(/\D/g, ""); // remove non-digits
    if (cleanWA.startsWith("0")) {
      cleanWA = "62" + cleanWA.slice(1);
    } else if (cleanWA.startsWith("8")) {
      cleanWA = "62" + cleanWA;
    }

    const settings = await prisma.eCourseSetting.upsert({
      where: { id: "default-settings" },
      update: {
        whatsappAdmin: cleanWA,
        whatsappTemplate
      },
      create: {
        id: "default-settings",
        whatsappAdmin: cleanWA,
        whatsappTemplate
      }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("PUT Admin Settings Error:", error);
    return NextResponse.json({ error: "Gagal menyimpan pengaturan WhatsApp." }, { status: 500 });
  }
}
