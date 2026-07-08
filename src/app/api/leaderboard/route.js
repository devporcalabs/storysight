import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
      },
      select: {
        id: true,
        name: true,
        school: true,
        class: true,
        attempts: {
          select: {
            score: true,
          },
        },
      },
    });

    const leaderboard = students
      .map((student) => {
        const attemptsCount = student.attempts.length;
        const totalScore = student.attempts.reduce((sum, att) => sum + att.score, 0);
        const averageScore = attemptsCount > 0 ? Math.round(totalScore / attemptsCount) : 0;

        return {
          id: student.id,
          name: student.name,
          school: student.school || "Umum",
          class: student.class || "",
          averageScore,
          attemptsCount,
        };
      })
      .filter((student) => student.attemptsCount > 0) // Only include students with quiz attempts
      .sort((a, b) => b.averageScore - a.averageScore || b.attemptsCount - a.attemptsCount)
      .slice(0, 10); // Limit to top 10

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("GET Leaderboard Error:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
