import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const { courseId, fullName, email, whatsapp, paymentMethodId } = body;

    // Validation
    if (!courseId || !fullName || !email || !whatsapp) {
      return NextResponse.json(
        { error: "Semua kolom biodata wajib diisi." },
        { status: 400 }
      );
    }

    // Get Course details
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return NextResponse.json({ error: "Kelas tidak ditemukan." }, { status: 404 });
    }

    if (course.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Pendaftaran untuk kelas ini sedang ditutup." },
        { status: 400 }
      );
    }

    // Check quota
    const paidCount = await prisma.courseOrder.count({
      where: {
        courseId: course.id,
        paymentStatus: "PAID"
      }
    });

    if (paidCount >= course.quota) {
      return NextResponse.json(
        { error: "Kuota kelas ini sudah penuh." },
        { status: 400 }
      );
    }

    // Determine final amounts
    const originalPrice = course.price;
    const totalAmount = course.discountPrice !== null ? course.discountPrice : course.price;
    const discountAmount = originalPrice - totalAmount;

    // Normalize WhatsApp number to International format (e.g. 628...)
    let cleanWA = whatsapp.replace(/\D/g, ""); // remove non-digits
    if (cleanWA.startsWith("0")) {
      cleanWA = "62" + cleanWA.slice(1);
    } else if (cleanWA.startsWith("8")) {
      cleanWA = "62" + cleanWA;
    }

    // Generate Order Code (EC-YYMMDD-XXXX)
    const today = new Date();
    const yy = String(today.getFullYear()).slice(-2);
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const yymmdd = `${yy}${mm}${dd}`;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const count = await prisma.courseOrder.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    let orderCode = "";
    let isUnique = false;
    let tries = 0;
    while (!isUnique && tries < 10) {
      const suffix = String(count + 1 + tries).padStart(4, "0");
      orderCode = `EC-${yymmdd}-${suffix}`;
      const existing = await prisma.courseOrder.findUnique({
        where: { orderCode }
      });
      if (!existing) {
        isUnique = true;
      } else {
        tries++;
      }
    }

    // Validate payment method if provided
    let verifiedPaymentMethodId = null;
    if (paymentMethodId) {
      const pm = await prisma.paymentMethod.findFirst({
        where: { id: paymentMethodId, isActive: true }
      });
      if (pm) {
        verifiedPaymentMethodId = pm.id;
      }
    }

    // Create the order
    const order = await prisma.courseOrder.create({
      data: {
        orderCode,
        courseId,
        fullName,
        email,
        whatsapp: cleanWA,
        originalPrice,
        discountAmount,
        totalAmount,
        paymentMethodId: verifiedPaymentMethodId,
        paymentStatus: "UNPAID"
      },
      include: {
        course: {
          select: {
            title: true,
            thumbnailUrl: true,
            mentorName: true,
            startDate: true
          }
        }
      }
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("POST Checkout Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan sistem saat checkout." },
      { status: 500 }
    );
  }
}
