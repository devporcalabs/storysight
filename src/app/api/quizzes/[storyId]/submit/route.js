import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function POST(request, { params }) {
  try {
    const { storyId } = await params;

    const token = request.cookies.get("session")?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { answers } = body; // Array of { questionId, userAnswer }

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Answers are required and must be an array" }, { status: 400 });
    }

    // Fetch quiz including its questions
    const quiz = await prisma.quiz.findUnique({
      where: { storyId },
      include: {
        questions: {
          include: {
            options: true,
            answers: true,
          }
        }
      }
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    let correctCount = 0;
    let wrongCount = 0;
    const answeredResults = [];

    // Map answers by questionId for fast access
    const userAnswersMap = {};
    answers.forEach((ans) => {
      userAnswersMap[ans.questionId] = ans.userAnswer;
    });

    // Check each question
    for (const question of quiz.questions) {
      const uAns = userAnswersMap[question.id];
      let isCorrect = false;

      if (uAns !== undefined && uAns !== null) {
        if (question.type === "MULTIPLE_CHOICE") {
          // Find option flagged as correct
          const correctOption = question.options.find((o) => o.isCorrect);
          if (correctOption && (uAns === correctOption.optionText || uAns === correctOption.id)) {
            isCorrect = true;
          }
        } else if (question.type === "FILL_IN_THE_BLANK") {
          // Case-insensitive exact match
          const correctAnswerObj = question.answers[0];
          if (correctAnswerObj && uAns.toString().trim().toLowerCase() === correctAnswerObj.correctAnswer.trim().toLowerCase()) {
            isCorrect = true;
          }
        } else if (question.type === "MATCHING") {
          // uAns is expected to be an object maps of English to Indonesian translation
          // e.g. { "brave": "berani", "forest": "hutan" }
          let allMatch = true;
          let matchCount = 0;

          question.options.forEach((opt) => {
            if (opt.matchKey && opt.matchValue) {
              matchCount++;
              const userVal = uAns[opt.matchKey];
              if (!userVal || userVal.trim().toLowerCase() !== opt.matchValue.trim().toLowerCase()) {
                allMatch = false;
              }
            }
          });

          if (matchCount > 0 && allMatch) {
            isCorrect = true;
          }
        } else if (question.type === "FLASHCARD") {
          // User rates themselves: "know" vs "don't know"
          // We mark as correct if user specifies "know"
          if (uAns.toString().toLowerCase().includes("know") && !uAns.toString().toLowerCase().includes("don")) {
            isCorrect = true;
          }
        }
      }

      if (isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }

      answeredResults.push({
        questionId: question.id,
        userAnswer: uAns !== undefined ? (typeof uAns === "object" ? JSON.stringify(uAns) : String(uAns)) : "",
        isCorrect,
      });
    }

    const totalQuestions = quiz.questions.length;
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = score >= quiz.passingScore;

    // Write attempts in database transaction
    const attempt = await prisma.$transaction(async (tx) => {
      // 1. Log quiz attempt
      const newAttempt = await tx.quizAttempt.create({
        data: {
          userId: user.id,
          quizId: quiz.id,
          storyId,
          score,
          correctCount,
          wrongCount,
          totalQuestions,
          passed,
          answers: {
            create: answeredResults.map((ar) => ({
              questionId: ar.questionId,
              userAnswer: ar.userAnswer,
              isCorrect: ar.isCorrect,
            }))
          }
        }
      });

      // 2. Fetch/Update progress status
      let progress = await tx.userStoryProgress.findUnique({
        where: {
          userId_storyId: {
            userId: user.id,
            storyId,
          }
        }
      });

      if (!progress) {
        await tx.userStoryProgress.create({
          data: {
            userId: user.id,
            storyId,
            isPdfRead: false,
            isVideoWatched: false,
            isQuizCompleted: true,
            progressStatus: "IN_PROGRESS",
            lastAccessedAt: new Date(),
          }
        });
      } else {
        const isCompleted = progress.isPdfRead && progress.isVideoWatched && true;
        await tx.userStoryProgress.update({
          where: { id: progress.id },
          data: {
            isQuizCompleted: true,
            progressStatus: isCompleted ? "COMPLETED" : "IN_PROGRESS",
            lastAccessedAt: new Date(),
          }
        });
      }

      return newAttempt;
    });

    return NextResponse.json({
      message: "Quiz submitted successfully",
      attempt: {
        id: attempt.id,
        score,
        correctCount,
        wrongCount,
        totalQuestions,
        passed,
        createdAt: attempt.createdAt,
      },
      results: answeredResults,
    });
  } catch (error) {
    console.error("Quiz Submission Error:", error);
    return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 });
  }
}
