import { prisma } from "@/lib/prisma";

async function grant(studentId: string, key: string) {
  const achievement = await prisma.achievement.findUnique({ where: { key } });
  if (!achievement) return;
  await prisma.studentAchievement.upsert({
    where: { studentId_achievementId: { studentId, achievementId: achievement.id } },
    create: { studentId, achievementId: achievement.id },
    update: {},
  });
}

/**
 * Recomputes pathway progress for a student and grants any achievements
 * they've newly earned. Called after a grade is released, passing the
 * score/maxScore that was just graded so a perfect score can be detected
 * without an extra aggregate query.
 */
export async function recomputeProgressAndAchievements(
  studentId: string,
  pathwayId: string,
  justGraded: { score: number; maxScore: number }
) {
  const classIds = (await prisma.enrollment.findMany({ where: { studentId }, select: { classId: true } })).map(
    (e) => e.classId
  );
  if (classIds.length === 0) return;

  const [total, completed, gradedSubmissionsCount] = await Promise.all([
    prisma.lessonPathway.count({
      where: {
        pathwayId,
        lesson: { status: "PUBLISHED", assignments: { some: { classId: { in: classIds } } } },
      },
    }),
    prisma.submission.count({
      where: { studentId, status: { in: ["GRADED", "REVIEWED"] }, lessonPathway: { pathwayId } },
    }),
    prisma.submission.count({ where: { studentId, status: "GRADED" } }),
  ]);

  const completionPercentage = total > 0 ? Math.min(100, (completed / total) * 100) : 0;

  await prisma.progress.upsert({
    where: { studentId_pathwayId: { studentId, pathwayId } },
    create: { studentId, pathwayId, activitiesTotal: total, activitiesCompleted: completed, completionPercentage },
    update: { activitiesTotal: total, activitiesCompleted: completed, completionPercentage },
  });

  if (gradedSubmissionsCount >= 1) await grant(studentId, "FIRST_SUBMISSION");
  if (justGraded.score >= justGraded.maxScore) await grant(studentId, "PERFECT_SCORE");

  const allProgress = await prisma.progress.findMany({ where: { studentId } });
  const completedPathways = allProgress.filter((p) => p.completionPercentage >= 100).length;

  if (completedPathways >= 1) await grant(studentId, "FIRST_PATHWAY");
  if (completedPathways >= 2) await grant(studentId, "TWO_PATHWAYS");
  if (completedPathways >= 5) await grant(studentId, "ALL_FIVE");
}
