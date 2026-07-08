const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Clear database
  await prisma.quizAttemptAnswer.deleteMany({});
  await prisma.quizAttempt.deleteMany({});
  await prisma.userStoryProgress.deleteMany({});
  await prisma.quizAnswer.deleteMany({});
  await prisma.quizOption.deleteMany({});
  await prisma.quizQuestion.deleteMany({});
  await prisma.quiz.deleteMany({});
  await prisma.story.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Database cleared.");

  // Create Users
  const superadminPasswordHash = await bcrypt.hash("admin123", 10);
  const teacherPasswordHash = await bcrypt.hash("teacher123", 10);
  const studentPasswordHash = await bcrypt.hash("student123", 10);

  const superadmin = await prisma.user.create({
    data: {
      name: "Super Admin StorySight",
      email: "superadmin@storysight.com",
      passwordHash: superadminPasswordHash,
      role: "SUPERADMIN",
    },
  });

  const teacher1 = await prisma.user.create({
    data: {
      name: "Teacher Ahmad",
      email: "teacher1@storysight.com",
      passwordHash: teacherPasswordHash,
      role: "TEACHER",
      school: "SMA Negeri 1 Jakarta",
      class: "10-A",
    },
  });

  const student1 = await prisma.user.create({
    data: {
      name: "Student Clara",
      email: "student1@storysight.com",
      passwordHash: studentPasswordHash,
      role: "STUDENT",
      school: "SMA Negeri 1 Jakarta",
      class: "10-A",
    },
  });

  console.log("Users created successfully.");

  const storiesData = [
    {
      title: "The Golden Key",
      slug: "the-golden-key",
      description: "Join Anna on her magical adventure in the Whispering Woods, where she finds a mysterious golden key that unlocks secrets of the ancient forest.",
      level: "Level 1",
      genre: "Fantasy",
      thumbnailUrl: "/uploads/thumbnails/golden-key.png",
      pdfUrl: "/uploads/pdfs/golden-key.pdf",
      videoUrl: "https://www.youtube.com/watch?v=kQD26C64188",
      duration: 15,
      status: "Published",
      questions: [
        {
          type: "MULTIPLE_CHOICE",
          questionText: "What did Anna find in the forest?",
          points: 25,
          options: [
            { optionText: "A golden key", isCorrect: true },
            { optionText: "A red book", isCorrect: false },
            { optionText: "A blue bag", isCorrect: false },
            { optionText: "A small bird", isCorrect: false },
          ]
        },
        {
          type: "FILL_IN_THE_BLANK",
          questionText: "Anna found a small _____ key. (Fill in the blank with one word from the story)",
          points: 25,
          answer: "golden"
        },
        {
          type: "MATCHING",
          questionText: "Match the English words from the story with their Indonesian translation.",
          points: 25,
          options: [
            { optionText: "brave", isCorrect: false, matchKey: "brave", matchValue: "berani" },
            { optionText: "forest", isCorrect: false, matchKey: "forest", matchValue: "hutan" },
            { optionText: "lost", isCorrect: false, matchKey: "lost", matchValue: "tersesat" },
          ]
        },
        {
          type: "FLASHCARD",
          questionText: "Practice vocabulary with these flashcards! Flip them and test your knowledge.",
          points: 25,
          options: [
            { optionText: "adventure", isCorrect: false, matchKey: "adventure", matchValue: "petualangan" },
            { optionText: "mysterious", isCorrect: false, matchKey: "mysterious", matchValue: "misterius" },
            { optionText: "golden", isCorrect: false, matchKey: "golden", matchValue: "emas" },
          ]
        }
      ]
    },
    {
      title: "Neon Dreams: Lost in Tokyo",
      slug: "neon-dreams-lost-in-tokyo",
      description: "Step into the neon-lit streets of Tokyo. Help Ken navigate a futuristic metropolis, solve word puzzles, and locate his missing robotic companion.",
      level: "Level 3",
      genre: "Mystery",
      thumbnailUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
      pdfUrl: "/uploads/pdfs/golden-key.pdf",
      videoUrl: "https://www.youtube.com/watch?v=kQD26C64188",
      duration: 120,
      status: "Published",
      questions: [
        {
          type: "MULTIPLE_CHOICE",
          questionText: "Which city is Ken currently exploring?",
          points: 50,
          options: [
            { optionText: "Tokyo", isCorrect: true },
            { optionText: "New York", isCorrect: false },
            { optionText: "London", isCorrect: false },
            { optionText: "Jakarta", isCorrect: false },
          ]
        },
        {
          type: "FILL_IN_THE_BLANK",
          questionText: "Ken is searching for his missing _____ companion. (Fill in the blank with one word)",
          points: 50,
          answer: "robotic"
        }
      ]
    },
    {
      title: "The Midnight Baker",
      slug: "the-midnight-baker",
      description: "Leo bakes delicious pastries under the stars. Learn culinary vocabulary and follow a story about spreading happiness through warm bread.",
      level: "Level 2",
      genre: "Daily Life",
      thumbnailUrl: "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?w=600&auto=format&fit=crop&q=80",
      pdfUrl: "/uploads/pdfs/golden-key.pdf",
      videoUrl: "https://www.youtube.com/watch?v=kQD26C64188",
      duration: 90,
      status: "Published",
      questions: [
        {
          type: "MULTIPLE_CHOICE",
          questionText: "What does Leo bake under the stars?",
          points: 50,
          options: [
            { optionText: "Delicious pastries", isCorrect: true },
            { optionText: "Spicy noodles", isCorrect: false },
            { optionText: "Sushi rolls", isCorrect: false },
            { optionText: "Grilled steak", isCorrect: false },
          ]
        },
        {
          type: "FILL_IN_THE_BLANK",
          questionText: "Leo bakes pastries under the _____. (Fill in the blank)",
          points: 50,
          answer: "stars"
        }
      ]
    },
    {
      title: "Whispers of the Forest",
      slug: "whispers-of-the-forest",
      description: "A dark mystery unfolds in the deep forest. Learn advanced descriptive language and unravel the mystery of the strange whispering voices.",
      level: "Level 5",
      genre: "Horror",
      thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
      pdfUrl: "/uploads/pdfs/golden-key.pdf",
      videoUrl: "https://www.youtube.com/watch?v=kQD26C64188",
      duration: 180,
      status: "Published",
      questions: [
        {
          type: "MULTIPLE_CHOICE",
          questionText: "What sound does the protagonist hear in the deep forest?",
          points: 50,
          options: [
            { optionText: "Whispering voices", isCorrect: true },
            { optionText: "Loud sirens", isCorrect: false },
            { optionText: "Heavy rain", isCorrect: false },
            { optionText: "Silence", isCorrect: false },
          ]
        },
        {
          type: "FILL_IN_THE_BLANK",
          questionText: "A dark _____ unfolds in the deep forest. (Fill in the blank)",
          points: 50,
          answer: "mystery"
        }
      ]
    },
    {
      title: "Business English Master",
      slug: "business-english-master",
      description: "Follow Sophia as she negotiates a major contract for her startup. Master corporate idioms and professional conversation.",
      level: "Level 6",
      genre: "Business",
      thumbnailUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80",
      pdfUrl: "/uploads/pdfs/golden-key.pdf",
      videoUrl: "https://www.youtube.com/watch?v=kQD26C64188",
      duration: 150,
      status: "Published",
      questions: [
        {
          type: "MULTIPLE_CHOICE",
          questionText: "What is Sophia negotiating?",
          points: 50,
          options: [
            { optionText: "A major contract", isCorrect: true },
            { optionText: "A vacation leave", isCorrect: false },
            { optionText: "A recipe book", isCorrect: false },
            { optionText: "A building lease", isCorrect: false },
          ]
        },
        {
          type: "FILL_IN_THE_BLANK",
          questionText: "Sophia is negotiating a contract for her _____. (Fill in the blank)",
          points: 50,
          answer: "startup"
        }
      ]
    },
    {
      title: "Chronicles of the Wind",
      slug: "chronicles-of-the-wind",
      description: "An emotional romance set in the floating kingdom of Zephyria. Learn expressive adjectives and emotional storytelling vocabulary.",
      level: "Level 4",
      genre: "Romance",
      thumbnailUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
      pdfUrl: "/uploads/pdfs/golden-key.pdf",
      videoUrl: "https://www.youtube.com/watch?v=kQD26C64188",
      duration: 200,
      status: "Published",
      questions: [
        {
          type: "MULTIPLE_CHOICE",
          questionText: "What is the name of the floating kingdom?",
          points: 50,
          options: [
            { optionText: "Zephyria", isCorrect: true },
            { optionText: "Atlantis", isCorrect: false },
            { optionText: "Valhalla", isCorrect: false },
            { optionText: "El Dorado", isCorrect: false },
          ]
        },
        {
          type: "FILL_IN_THE_BLANK",
          questionText: "Chronicles of the Wind is set in a _____ kingdom. (Fill in the blank)",
          points: 50,
          answer: "floating"
        }
      ]
    },
    {
      title: "School Days in Jakarta",
      slug: "school-days-in-jakarta",
      description: "Follow Gilang's daily life at a high school in Jakarta. Perfect for learning daily phrases, scheduling, and casual conversations.",
      level: "Level 1",
      genre: "School",
      thumbnailUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80",
      pdfUrl: "/uploads/pdfs/golden-key.pdf",
      videoUrl: "https://www.youtube.com/watch?v=kQD26C64188",
      duration: 100,
      status: "Published",
      questions: [
        {
          type: "MULTIPLE_CHOICE",
          questionText: "Who is the main protagonist of the school story?",
          points: 50,
          options: [
            { optionText: "Gilang", isCorrect: true },
            { optionText: "Budi", isCorrect: false },
            { optionText: "Clara", isCorrect: false },
            { optionText: "Ahmad", isCorrect: false },
          ]
        },
        {
          type: "FILL_IN_THE_BLANK",
          questionText: "Gilang goes to a high _____ in Jakarta. (Fill in the blank)",
          points: 50,
          answer: "school"
        }
      ]
    },
    {
      title: "The Secret Library",
      slug: "the-secret-library",
      description: "Behind a moving bookshelf lies a room full of forgotten legends. Explore intermediate vocabulary and unravel mystery stories.",
      level: "Level 3",
      genre: "Mystery",
      thumbnailUrl: "https://images.unsplash.com/photo-1519074069444-1ba4e6664104?w=600&auto=format&fit=crop&q=80",
      pdfUrl: "/uploads/pdfs/golden-key.pdf",
      videoUrl: "https://www.youtube.com/watch?v=kQD26C64188",
      duration: 110,
      status: "Published",
      questions: [
        {
          type: "MULTIPLE_CHOICE",
          questionText: "What hides the secret library?",
          points: 50,
          options: [
            { optionText: "A moving bookshelf", isCorrect: true },
            { optionText: "A painting", isCorrect: false },
            { optionText: "A giant mirror", isCorrect: false },
            { optionText: "A wardrobe", isCorrect: false },
          ]
        },
        {
          type: "FILL_IN_THE_BLANK",
          questionText: "Behind a moving _____ lies a room full of forgotten legends. (Fill in the blank)",
          points: 50,
          answer: "bookshelf"
        }
      ]
    },
    {
      title: "The Time Traveler's Journal",
      slug: "the-time-traveler-s-journal",
      description: "Decipher the temporal logs left by Dr. Alistair. Master complex verb tenses and explore vocabulary related to history and science.",
      level: "Level 5",
      genre: "Fantasy",
      thumbnailUrl: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&auto=format&fit=crop&q=80",
      pdfUrl: "/uploads/pdfs/golden-key.pdf",
      videoUrl: "https://www.youtube.com/watch?v=kQD26C64188",
      duration: 140,
      status: "Published",
      questions: [
        {
          type: "MULTIPLE_CHOICE",
          questionText: "What kind of logs did Dr. Alistair leave behind?",
          points: 50,
          options: [
            { optionText: "Temporal logs", isCorrect: true },
            { optionText: "Financial sheets", isCorrect: false },
            { optionText: "Cooking recipes", isCorrect: false },
            { optionText: "Garden plans", isCorrect: false },
          ]
        },
        {
          type: "FILL_IN_THE_BLANK",
          questionText: "The journal was written by Dr. _____. (Fill in the blank)",
          points: 50,
          answer: "Alistair"
        }
      ]
    },
    {
      title: "Lost and Found in Bali",
      slug: "lost-and-found-in-bali",
      description: "Sarah embarks on a soul-searching journey to Bali and forms an unexpected bond. Learn travel vocabulary and descriptive adjectives.",
      level: "Level 2",
      genre: "Daily Life",
      thumbnailUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=80",
      pdfUrl: "/uploads/pdfs/golden-key.pdf",
      videoUrl: "https://www.youtube.com/watch?v=kQD26C64188",
      duration: 115,
      status: "Published",
      questions: [
        {
          type: "MULTIPLE_CHOICE",
          questionText: "Which tropical island is Sarah visiting?",
          points: 50,
          options: [
            { optionText: "Bali", isCorrect: true },
            { optionText: "Hawaii", isCorrect: false },
            { optionText: "Ibiza", isCorrect: false },
            { optionText: "Okinawa", isCorrect: false },
          ]
        },
        {
          type: "FILL_IN_THE_BLANK",
          questionText: "Sarah embarks on a soul-searching journey to _____. (Fill in the blank)",
          points: 50,
          answer: "Bali"
        }
      ]
    }
  ];

  for (const sData of storiesData) {
    const { title, slug, description, level, genre, thumbnailUrl, pdfUrl, videoUrl, duration, status, questions } = sData;

    const story = await prisma.story.create({
      data: {
        title,
        slug,
        description,
        level,
        genre,
        thumbnailUrl,
        pdfUrl,
        videoUrl,
        duration,
        status,
        createdBy: superadmin.id,
      },
    });

    console.log("Created story:", story.title);

    const quiz = await prisma.quiz.create({
      data: {
        storyId: story.id,
        title: `${title} - Vocabulary & Comprehension Quiz`,
        passingScore: 70,
      },
    });

    for (let idx = 0; idx < questions.length; idx++) {
      const q = questions[idx];
      const createdQuestion = await prisma.quizQuestion.create({
        data: {
          quizId: quiz.id,
          type: q.type,
          questionText: q.questionText,
          orderNumber: idx + 1,
          points: q.points,
        },
      });

      if (q.type === "MULTIPLE_CHOICE" && q.options) {
        await prisma.quizOption.createMany({
          data: q.options.map((opt) => ({
            questionId: createdQuestion.id,
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
          })),
        });
      } else if (q.type === "FILL_IN_THE_BLANK" && q.answer) {
        await prisma.quizAnswer.create({
          data: {
            questionId: createdQuestion.id,
            correctAnswer: q.answer,
          },
        });
      } else if (q.type === "MATCHING" && q.options) {
        await prisma.quizOption.createMany({
          data: q.options.map((opt) => ({
            questionId: createdQuestion.id,
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
            matchKey: opt.matchKey,
            matchValue: opt.matchValue,
          })),
        });
      } else if (q.type === "FLASHCARD" && q.options) {
        await prisma.quizOption.createMany({
          data: q.options.map((opt) => ({
            questionId: createdQuestion.id,
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
            matchKey: opt.matchKey,
            matchValue: opt.matchValue,
          })),
        });
      }
    }
  }

  console.log("All stories and quizzes seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
