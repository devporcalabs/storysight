import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request) {
  try {
    const token = request.cookies.get("session")?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user || !["SUPERADMIN", "TEACHER"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isTeacher = user.role === "TEACHER";
    const studentFilter = isTeacher
      ? { role: "STUDENT", school: user.school }
      : { role: "STUDENT" };

    // 1. Total users (excluding other admins/teachers)
    const totalUsers = await prisma.user.count({
      where: studentFilter
    });

    // 2. Total stories
    const totalStories = await prisma.story.count();

    // 3. Total quiz attempts
    const totalAttempts = await prisma.quizAttempt.count({
      where: isTeacher ? { user: { school: user.school } } : {}
    });

    // 4. Average score
    const avgScoreData = await prisma.quizAttempt.aggregate({
      where: isTeacher ? { user: { school: user.school } } : {},
      _avg: {
        score: true
      }
    });
    const avgScore = avgScoreData._avg.score ? Math.round(avgScoreData._avg.score) : 0;

    // 5. Completion rate
    // Total story progress items marked COMPLETED / (total registered students * total available stories)
    const totalCompletions = await prisma.userStoryProgress.count({
      where: {
        progressStatus: "COMPLETED",
        ...(isTeacher ? { user: { school: user.school } } : {})
      }
    });
    const totalPossibleCompletions = totalUsers * totalStories;
    const completionRate = totalPossibleCompletions > 0
      ? Math.round((totalCompletions / totalPossibleCompletions) * 100)
      : 0;

    // 6. Recent stories in the catalog
    const recentStories = await prisma.story.findMany({
      orderBy: { createdAt: "desc" },
      take: 5
    });

    // 7. Active users registry
    const usersList = await prisma.user.findMany({
      where: studentFilter,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        progress: {
          select: {
            progressStatus: true,
            story: {
              select: {
                title: true
              }
            }
          }
        },
        attempts: {
          select: {
            score: true,
            passed: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const formattedUsers = usersList.map((u) => {
      const completedCount = u.progress.filter(p => p.progressStatus === "COMPLETED").length;
      const totalAttemptsCount = u.attempts.length;
      const averageScore = totalAttemptsCount > 0
        ? Math.round(u.attempts.reduce((sum, att) => sum + att.score, 0) / totalAttemptsCount)
        : 0;

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        createdAt: u.createdAt,
        completedCount,
        attemptsCount: totalAttemptsCount,
        averageScore
      };
    });

    return NextResponse.json({
      totalUsers,
      totalStories,
      totalAttempts,
      avgScore,
      completionRate,
      recentStories,
      users: formattedUsers
    });
  } catch (error) {
    console.error("Analytics Fetch Error:", error);
    return NextResponse.json({ error: "Failed to generate analytics data" }, { status: 500 });
  }
}
