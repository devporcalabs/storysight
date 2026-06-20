import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const { storyId } = await params; // storyId represents slug or id

    const token = request.cookies.get("session")?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const story = await prisma.story.findFirst({
      where: {
        OR: [
          { id: storyId },
          { slug: storyId }
        ]
      },
      include: {
        quizzes: true
      }
    });

    if (!story || !story.quizzes || story.quizzes.length === 0) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const quiz = story.quizzes[0];

    const attempt = await prisma.quizAttempt.findFirst({
      where: {
        userId: user.id,
        quizId: quiz.id,
      },
      orderBy: {
        createdAt: "desc"
      },
      include: {
        answers: true
      }
    });

    if (!attempt) {
      return NextResponse.json({ error: "No attempts found" }, { status: 404 });
    }

    // Retrieve questions to map review items
    const questions = await prisma.quizQuestion.findMany({
      where: { quizId: quiz.id },
      include: {
        options: true,
        answers: true
      }
    });

    const userAnswersMap = {};
    attempt.answers.forEach((ans) => {
      userAnswersMap[ans.questionId] = ans;
    });

    const review = questions.map((q) => {
      const uAns = userAnswersMap[q.id];
      return {
        id: q.id,
        type: q.type,
        questionText: q.questionText,
        userAnswer: uAns ? uAns.userAnswer : "",
        isCorrect: uAns ? uAns.isCorrect : false,
        options: q.options,
        answers: q.answers,
      };
    });

    // Find next published story by creation order
    const nextStory = await prisma.story.findFirst({
      where: {
        status: "Published",
        createdAt: {
          gt: story.createdAt
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        score: attempt.score,
        correctCount: attempt.correctCount,
        wrongCount: attempt.wrongCount,
        totalQuestions: attempt.totalQuestions,
        passed: attempt.passed,
        createdAt: attempt.createdAt
      },
      review,
      story: {
        title: story.title,
        slug: story.slug
      },
      nextStorySlug: nextStory ? nextStory.slug : null
    });
  } catch (error) {
    console.error("GET Quiz Result Error:", error);
    return NextResponse.json({ error: "Failed to generate quiz results review" }, { status: 500 });
  }
}
