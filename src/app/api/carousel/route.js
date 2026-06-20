import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request) {
  try {
    const banners = await prisma.carouselBanner.findMany({
      include: {
        story: true,
      },
      orderBy: {
        order: "asc",
      },
    });
    return NextResponse.json(banners);
  } catch (error) {
    console.error("GET Carousel Banners Error:", error);
    return NextResponse.json({ error: "Failed to fetch carousel banners" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = request.cookies.get("session")?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user || user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { imageUrl, storyId } = body;

    if (!imageUrl || !storyId) {
      return NextResponse.json({ error: "Missing imageUrl or storyId" }, { status: 400 });
    }

    // Verify story exists
    const story = await prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    // Get count of existing banners to assign the order
    const count = await prisma.carouselBanner.count();

    const banner = await prisma.carouselBanner.create({
      data: {
        imageUrl,
        storyId,
        order: count,
      },
      include: {
        story: true,
      },
    });

    return NextResponse.json({ message: "Carousel banner created successfully", banner }, { status: 201 });
  } catch (error) {
    console.error("POST Carousel Banner Error:", error);
    return NextResponse.json({ error: "Failed to create carousel banner" }, { status: 500 });
  }
}
