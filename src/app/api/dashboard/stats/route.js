import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request) {
  try {
    const token = request.cookies.get("session")?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Progress list with stories
    const progressList = await prisma.userStoryProgress.findMany({
      where: { 
        userId: user.id,
        story: {
          status: "Published"
        }
      },
      include: {
        story: true
      }
    });

    const completed = progressList.filter(p => p.progressStatus === "COMPLETED");
    const inProgress = progressList.filter(p => p.progressStatus === "IN_PROGRESS");

    // Quiz attempts
    const attempts = await prisma.quizAttempt.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    });

    const totalAttempts = attempts.length;
    const passedCount = attempts.filter(a => a.passed).length;
    const averageScore = totalAttempts > 0 
      ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts) 
      : 0;

    // Get latest attempt per story
    const latestAttempts = {};
    attempts.forEach(att => {
      if (!latestAttempts[att.storyId]) {
        latestAttempts[att.storyId] = att;
      }
    });

    // Format In Progress
    const inProgressStories = inProgress.map(p => {
      let steps = 0;
      if (p.isPdfRead) steps++;
      if (p.isVideoWatched) steps++;
      if (p.isQuizCompleted) steps++;
      const progressPercentage = Math.round((steps / 3) * 100);

      return {
        id: p.story.id,
        title: p.story.title,
        slug: p.story.slug,
        description: p.story.description,
        thumbnailUrl: p.story.thumbnailUrl,
        level: p.story.level,
        genre: p.story.genre,
        duration: p.story.duration,
        progressPercentage,
        lastAccessedAt: p.lastAccessedAt
      };
    });

    // Format Completed
    const completedStories = completed.map(p => {
      const attempt = latestAttempts[p.storyId];
      return {
        id: p.story.id,
        title: p.story.title,
        slug: p.story.slug,
        level: p.story.level,
        genre: p.story.genre,
        score: attempt ? attempt.score : null,
        passed: attempt ? attempt.passed : null,
        completedAt: p.updatedAt
      };
    });

    return NextResponse.json({
      totalStarted: progressList.length,
      totalCompleted: completed.length,
      averageScore,
      passedCount,
      inProgressStories,
      completedStories
    });
  } catch (error) {
    console.error("Dashboard Stats Fetch Error:", error);
    return NextResponse.json({ error: "Failed to generate dashboard data" }, { status: 500 });
  }
}
