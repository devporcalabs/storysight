import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function POST(request) {
  try {
    const token = request.cookies.get("session")?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { storyId, isPdfRead, isVideoWatched } = body;

    if (!storyId) {
      return NextResponse.json({ error: "Story ID is required" }, { status: 400 });
    }

    let progress = await prisma.userStoryProgress.findUnique({
      where: {
        userId_storyId: {
          userId: user.id,
          storyId,
        }
      }
    });

    const updateData = {};
    if (isPdfRead !== undefined) updateData.isPdfRead = isPdfRead;
    if (isVideoWatched !== undefined) updateData.isVideoWatched = isVideoWatched;

    if (!progress) {
      const isCompleted = (isPdfRead === true) && (isVideoWatched === true);
      progress = await prisma.userStoryProgress.create({
        data: {
          userId: user.id,
          storyId,
          isPdfRead: isPdfRead || false,
          isVideoWatched: isVideoWatched || false,
          isQuizCompleted: false,
          progressStatus: isCompleted ? "COMPLETED" : "IN_PROGRESS",
          lastAccessedAt: new Date(),
        }
      });
    } else {
      const currentPdfRead = isPdfRead !== undefined ? isPdfRead : progress.isPdfRead;
      const currentVideoWatched = isVideoWatched !== undefined ? isVideoWatched : progress.isVideoWatched;
      const currentQuizCompleted = progress.isQuizCompleted;

      const isCompleted = currentPdfRead && currentVideoWatched && currentQuizCompleted;

      progress = await prisma.userStoryProgress.update({
        where: { id: progress.id },
        data: {
          ...updateData,
          progressStatus: isCompleted ? "COMPLETED" : "IN_PROGRESS",
          lastAccessedAt: new Date(),
        }
      });
    }

    return NextResponse.json({ message: "Progress updated successfully", progress });
  } catch (error) {
    console.error("Progress Update Error:", error);
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
}
