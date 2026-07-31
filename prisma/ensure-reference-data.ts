// Ensures reference data that the app assumes always exists — the 5 GLOW
// Pathways and the achievement catalog — is actually present. Runs
// automatically as part of `npm run build` on every deploy, so a fresh
// database is never missing this even though nobody ran `prisma:seed`
// (which also creates a lot of fake demo data this script intentionally
// does NOT create). Safe to run repeatedly — it only creates what's
// missing and never touches anything else.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PATHWAYS = [
  { name: "Spark", description: "Getting started — orientation and foundational milestones.", icon: "sprout", color: "#22C55E", order: 0 },
  { name: "Shine", description: "Leading peers and projects.", icon: "flag", color: "#F59E0B", order: 1 },
  { name: "Glow", description: "Community service and outreach.", icon: "heart-handshake", color: "#EC4899", order: 2 },
  { name: "Radiate", description: "Physical and mental wellbeing.", icon: "activity", color: "#06B6D4", order: 3 },
  { name: "Extension", description: "Academic excellence and research.", icon: "book-open", color: "#8B5CF6", order: 4 },
];

const ACHIEVEMENTS = [
  { key: "FIRST_SUBMISSION", name: "First Submission", description: "Submitted your first pathway activity.", icon: "rocket" },
  { key: "FIRST_PATHWAY", name: "Completed First Pathway", description: "Completed your first GLOW pathway.", icon: "star" },
  { key: "TWO_PATHWAYS", name: "Completed Two Pathways", description: "Met the base GLOW requirement.", icon: "medal" },
  { key: "ALL_FIVE", name: "Completed All Five", description: "Completed every GLOW pathway.", icon: "trophy" },
  { key: "PERFECT_SCORE", name: "Perfect Score", description: "Scored 100% on a pathway activity.", icon: "sparkles" },
  { key: "EXCELLENT_STUDENT", name: "Excellent Student", description: "Maintained an outstanding average.", icon: "award" },
];

async function main() {
  for (const pathway of PATHWAYS) {
    await prisma.pathway.upsert({
      where: { name: pathway.name },
      create: pathway,
      update: {},
    });
  }

  for (const achievement of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      create: achievement,
      update: {},
    });
  }

  console.log(`Ensured ${PATHWAYS.length} pathways and ${ACHIEVEMENTS.length} achievements exist.`);
}

main()
  .catch((err) => {
    console.error("ensure-reference-data failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
