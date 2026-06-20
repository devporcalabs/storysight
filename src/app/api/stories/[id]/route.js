import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const token = request.cookies.get("session")?.value;
    const user = token ? await verifyToken(token) : null;

    // Support fetching by ID or Slug
    const story = await prisma.story.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id }
        ]
      },
      include: {
        quizzes: {
          include: {
            questions: {
              orderBy: { orderNumber: "asc" },
              include: {
                options: true,
                answers: true,
              }
            }
          }
        }
      }
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    // Only Super Admin can see draft stories
    if (story.status === "Draft") {
      if (!user || user.role !== "SUPERADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Retrieve user progress
    let progress = null;
    if (user) {
      progress = await prisma.userStoryProgress.findUnique({
        where: {
          userId_storyId: {
            userId: user.id,
            storyId: story.id,
          }
        }
      });

      // If student accesses the story details for the first time, auto-initialize progress
      if (!progress && !["SUPERADMIN", "TEACHER"].includes(user.role)) {
        progress = await prisma.userStoryProgress.create({
          data: {
            userId: user.id,
            storyId: story.id,
            progressStatus: "IN_PROGRESS",
          }
        });
      }
    }

    return NextResponse.json({
      ...story,
      progress: progress || {
        isPdfRead: false,
        isVideoWatched: false,
        isQuizCompleted: false,
        progressStatus: "NOT_STARTED",
      }
    });
  } catch (error) {
    console.error("GET Single Story Error:", error);
    return NextResponse.json({ error: "Failed to fetch story details" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const token = request.cookies.get("session")?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user || user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, level, genre, thumbnailUrl, pdfUrl, videoUrl, duration, status, questions } = body;

    const existing = await prisma.story.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id }
        ]
      }
    });

    if (!existing) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update story details
      const story = await tx.story.update({
        where: { id: existing.id },
        data: {
          title,
          description,
          level,
          genre,
          thumbnailUrl,
          pdfUrl,
          videoUrl,
          duration: duration ? parseInt(duration) : undefined,
          status,
        }
      });

      // 2. If questions are provided, update them
      if (Array.isArray(questions)) {
        // Find or create quiz
        let quiz = await tx.quiz.findUnique({
          where: { storyId: existing.id }
        });

        if (!quiz) {
          quiz = await tx.quiz.create({
            data: {
              storyId: existing.id,
              title: `${title || existing.title} - Comprehension Quiz`,
              passingScore: 70,
            }
          });
        }

        // Delete all old questions
        await tx.quizQuestion.deleteMany({
          where: { quizId: quiz.id }
        });

        // Insert new questions
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          const createdQuestion = await tx.quizQuestion.create({
            data: {
              quizId: quiz.id,
              type: q.type,
              questionText: q.questionText,
              orderNumber: i + 1,
              points: q.points || 10,
            }
          });

          if (q.type === "MULTIPLE_CHOICE" && Array.isArray(q.options)) {
            await tx.quizOption.createMany({
              data: q.options.map(opt => ({
                questionId: createdQuestion.id,
                optionText: opt.optionText || "",
                isCorrect: !!opt.isCorrect,
              }))
            });
          } else if (q.type === "FILL_IN_THE_BLANK" && q.answer) {
            await tx.quizAnswer.create({
              data: {
                questionId: createdQuestion.id,
                correctAnswer: q.answer.trim(),
              }
            });
          } else if (q.type === "MATCHING" && Array.isArray(q.pairs)) {
            await tx.quizOption.createMany({
              data: q.pairs.map(pair => ({
                questionId: createdQuestion.id,
                optionText: "",
                isCorrect: false,
                matchKey: pair.key || "",
                matchValue: pair.val || "",
              }))
            });
          } else if (q.type === "FLASHCARD" && q.word && q.meaning) {
            await tx.quizOption.create({
              data: {
                questionId: createdQuestion.id,
                optionText: "",
                isCorrect: false,
                matchKey: q.word || "",
                matchValue: q.meaning || "",
              }
            });
          }
        }
      }

      return story;
    });

    return NextResponse.json({ message: "Story updated successfully", story: updated });
  } catch (error) {
    console.error("PUT Story Error:", error);
    return NextResponse.json({ error: "Failed to update story" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const token = request.cookies.get("session")?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user || user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.story.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id }
        ]
      }
    });

    if (!existing) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    await prisma.story.delete({
      where: { id: existing.id }
    });

    return NextResponse.json({ message: "Story deleted successfully" });
  } catch (error) {
    console.error("DELETE Story Error:", error);
    return NextResponse.json({ error: "Failed to delete story" }, { status: 500 });
  }
}
