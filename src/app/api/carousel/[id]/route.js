import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const token = request.cookies.get("session")?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user || user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const banner = await prisma.carouselBanner.findUnique({
      where: { id },
    });

    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    await prisma.carouselBanner.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Carousel banner deleted successfully" });
  } catch (error) {
    console.error("DELETE Carousel Banner Error:", error);
    return NextResponse.json({ error: "Failed to delete carousel banner" }, { status: 500 });
  }
}
