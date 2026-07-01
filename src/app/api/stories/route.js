import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get("level");
    const genre = searchParams.get("genre");
    const search = searchParams.get("search");

    const token = request.cookies.get("session")?.value;
    const user = token ? await verifyToken(token) : null;
    const isAdmin = user?.role === "SUPERADMIN";

    const where = {};

    // Guests and standard users can only see Published stories.
    // Admins can see drafts in the CMS.
    if (!isAdmin) {
      where.status = "Published";
    }

    if (level) {
      where.level = level;
    }

    if (genre) {
      where.genre = genre;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const stories = await prisma.story.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // If user is authenticated, load their learning progress
    if (user) {
      const userProgress = await prisma.userStoryProgress.findMany({
        where: { userId: user.id },
      });

      const progressMap = {};
      userProgress.forEach((p) => {
        progressMap[p.storyId] = p;
      });

      const storiesWithProgress = stories.map((s) => ({
        ...s,
        progress: progressMap[s.id] || {
          isPdfRead: false,
          isVideoWatched: false,
          isQuizCompleted: false,
          progressStatus: "NOT_STARTED",
        },
      }));

      return NextResponse.json(storiesWithProgress);
    }

    return NextResponse.json(stories);
  } catch (error) {
    console.error("GET Stories Error:", error);
    return NextResponse.json({ error: "Failed to fetch stories" }, { status: 500 });
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
    const { title, description, learningObjectives, level, genre, thumbnailUrl, pdfUrl, videoUrl, duration, status, questions } = body;

    if (!title || !description || !level || !genre || !thumbnailUrl || !pdfUrl || !videoUrl || !duration) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate unique slug
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    
    const existing = await prisma.story.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    const result = await prisma.$transaction(async (tx) => {
      const story = await tx.story.create({
        data: {
          title,
          slug,
          description,
          learningObjectives: learningObjectives || null,
          level,
          genre,
          thumbnailUrl,
          pdfUrl,
          videoUrl,
          duration: parseInt(duration),
          status: status || "Draft",
          createdBy: user.id,
        },
      });

      const quiz = await tx.quiz.create({
        data: {
          storyId: story.id,
          title: `${title} - Comprehension Quiz`,
          passingScore: 70,
        },
      });

      if (Array.isArray(questions) && questions.length > 0) {
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          const createdQuestion = await tx.quizQuestion.create({
            data: {
              quizId: quiz.id,
              type: q.type,
              questionText: q.questionText,
              orderNumber: i + 1,
              points: 10,
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

    return NextResponse.json({ message: "Story created successfully", story: result }, { status: 201 });
  } catch (error) {
    console.error("POST Story Error:", error);
    return NextResponse.json({ error: "Failed to create story" }, { status: 500 });
  }
}
