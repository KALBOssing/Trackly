import { PrismaClient, LessonStatus, SubmissionStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PATHWAYS = [
  { name: "Spark", description: "Getting started — orientation and foundational milestones.", icon: "sprout", color: "#22C55E" },
  { name: "Shine", description: "Leading peers and projects.", icon: "flag", color: "#F59E0B" },
  { name: "Glow", description: "Community service and outreach.", icon: "heart-handshake", color: "#EC4899" },
  { name: "Radiate", description: "Physical and mental wellbeing.", icon: "activity", color: "#06B6D4" },
  { name: "Extension", description: "Academic excellence and research.", icon: "book-open", color: "#8B5CF6" },
];

const ACHIEVEMENTS = [
  { key: "FIRST_SUBMISSION", name: "First Submission", description: "Submitted your first pathway activity.", icon: "rocket" },
  { key: "FIRST_PATHWAY", name: "Completed First Pathway", description: "Completed your first GLOW pathway.", icon: "star" },
  { key: "TWO_PATHWAYS", name: "Completed Two Pathways", description: "Met the base GLOW requirement.", icon: "medal" },
  { key: "ALL_FIVE", name: "Completed All Five", description: "Completed every GLOW pathway.", icon: "trophy" },
  { key: "PERFECT_SCORE", name: "Perfect Score", description: "Scored 100% on a pathway activity.", icon: "sparkles" },
  { key: "EXCELLENT_STUDENT", name: "Excellent Student", description: "Maintained an outstanding average.", icon: "award" },
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log("Seeding Trackly database...");
  const passwordHash = await bcrypt.hash("Password!123", 12);

  // Pathways
  const pathways = [];
  for (let i = 0; i < PATHWAYS.length; i++) {
    pathways.push(
      await prisma.pathway.create({ data: { ...PATHWAYS[i], order: i } })
    );
  }

  // Achievements
  for (const a of ACHIEVEMENTS) {
    await prisma.achievement.create({ data: a });
  }

  // Teachers (5)
  const teachers = [];
  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.create({
      data: {
        email: `teacher${i}@trackly.edu`,
        passwordHash,
        role: "TEACHER",
        firstName: `Teacher${i}`,
        lastName: "Demo",
        teacherProfile: { create: {} },
      },
      include: { teacherProfile: true },
    });
    teachers.push(user.teacherProfile!);
  }

  // Classes (10, spread across teachers)
  const gradeLevels = ["Grade 11", "Grade 12"];
  const sections = ["STEM A", "STEM B", "ABM A", "HUMSS A", "TVL A"];
  const classes = [];
  for (let i = 0; i < 10; i++) {
    const gradeLevel = gradeLevels[i % gradeLevels.length];
    const section = sections[i % sections.length];
    classes.push(
      await prisma.class.create({
        data: {
          name: `${gradeLevel} ${section}`,
          gradeLevel,
          section,
          teacherId: teachers[i % teachers.length].id,
        },
      })
    );
  }

  // Students (200, distributed across classes)
  const students = [];
  for (let i = 1; i <= 200; i++) {
    const targetClass = classes[i % classes.length];
    const user = await prisma.user.create({
      data: {
        email: `student${i}@trackly.edu`,
        passwordHash,
        role: "STUDENT",
        firstName: `Student${i}`,
        lastName: "Demo",
        studentProfile: {
          create: {
            studentId: `S${String(i).padStart(5, "0")}`,
            gradeLevel: targetClass.gradeLevel,
            section: targetClass.section,
            classId: targetClass.id,
          },
        },
      },
      include: { studentProfile: true },
    });
    students.push(user.studentProfile!);
    await prisma.enrollment.create({
      data: { studentId: user.studentProfile!.id, classId: targetClass.id },
    });
  }

  // Lessons (50), each wrapping a single GLOW Pathway as its activity
  const lessons: { id: string; teacherId: string; dueDate: Date | null; status: LessonStatus }[] = [];
  const lessonPathways: { id: string; lessonId: string; pathwayId: string; points: number; classId: string }[] = [];
  for (let i = 1; i <= 50; i++) {
    const cls = rand(classes);
    const pathway = rand(pathways);
    const teacherId = cls.teacherId;
    const status = i % 6 === 0 ? LessonStatus.DRAFT : LessonStatus.PUBLISHED;
    const dueDate = new Date(Date.now() + randInt(-10, 20) * 24 * 60 * 60 * 1000);

    const lesson = await prisma.lesson.create({
      data: {
        title: `${pathway.name} Lesson ${i}`,
        description: `Sample lesson ${i} for the ${pathway.name} pathway.`,
        teacherId,
        dueDate,
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        assignments: { create: [{ classId: cls.id }] },
        pathways: {
          create: [
            {
              pathwayId: pathway.id,
              title: `${pathway.name} Activity`,
              instructions: `<p>Complete the attached materials and submit your work for <strong>${pathway.name}</strong>.</p>`,
              points: 100,
              order: 0,
            },
          ],
        },
      },
      include: { pathways: true },
    });
    lessons.push({ id: lesson.id, teacherId, dueDate, status });
    lessonPathways.push({
      id: lesson.pathways[0].id,
      lessonId: lesson.id,
      pathwayId: pathway.id,
      points: 100,
      classId: cls.id,
    });
  }

  // Submissions (100)
  const publishedLessonPathways = lessonPathways.filter((lp) =>
    lessons.find((l) => l.id === lp.lessonId)?.status === "PUBLISHED"
  );
  for (let i = 0; i < 100; i++) {
    const lessonPathway = rand(publishedLessonPathways);
    const classStudents = students.filter((s) => s.classId === lessonPathway.classId);
    if (classStudents.length === 0) continue;
    const student = rand(classStudents);

    const existing = await prisma.submission.findUnique({
      where: { lessonPathwayId_studentId: { lessonPathwayId: lessonPathway.id, studentId: student.id } },
    });
    if (existing) continue;

    const status = rand([
      SubmissionStatus.SUBMITTED,
      SubmissionStatus.GRADED,
      SubmissionStatus.LATE,
      SubmissionStatus.REVIEWED,
    ]);

    const submission = await prisma.submission.create({
      data: {
        lessonPathwayId: lessonPathway.id,
        studentId: student.id,
        status,
        submittedAt: new Date(),
        isLate: status === "LATE",
      },
    });

    if (status === "GRADED") {
      const parentLesson = lessons.find((l) => l.id === lessonPathway.lessonId)!;
      await prisma.grade.create({
        data: {
          submissionId: submission.id,
          score: randInt(65, 100),
          feedback: "Nice work — keep it up!",
          gradedById: parentLesson.teacherId,
          released: true,
        },
      });
    }
  }

  // Progress rollups (simple approximation for seed data)
  for (const student of students) {
    for (const pathway of pathways) {
      const total = await prisma.lessonPathway.count({
        where: {
          pathwayId: pathway.id,
          lesson: { status: "PUBLISHED", assignments: { some: { classId: student.classId! } } },
        },
      });
      const completed = await prisma.submission.count({
        where: {
          studentId: student.id,
          status: { in: ["GRADED", "REVIEWED"] },
          lessonPathway: { pathwayId: pathway.id },
        },
      });
      await prisma.progress.create({
        data: {
          studentId: student.id,
          pathwayId: pathway.id,
          activitiesTotal: total,
          activitiesCompleted: completed,
          completionPercentage: total > 0 ? Math.min(100, (completed / total) * 100) : 0,
        },
      });
    }
  }

  // Announcements
  for (const cls of classes.slice(0, 6)) {
    await prisma.announcement.create({
      data: {
        title: `Welcome to ${cls.name}`,
        body: "Please review the syllabus and check your upcoming lessons.",
        classId: cls.id,
        teacherId: cls.teacherId,
        pinned: true,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
  }

  // A few notifications per student
  for (const student of students.slice(0, 20)) {
    const user = await prisma.studentProfile.findUnique({ where: { id: student.id }, include: { user: true } });
    if (!user) continue;
    await prisma.notification.create({
      data: {
        userId: user.userId,
        type: "NEW_LESSON",
        title: "New lesson posted",
        body: "A new lesson has been published in your class.",
      },
    });
  }

  console.log("Seed complete.");
  console.log("Demo login (any teacher/student): password is Password!123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
