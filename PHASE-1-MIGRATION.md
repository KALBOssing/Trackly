# Phase 1 — Data Model Migration (Lesson-centric architecture)

This phase touches `prisma/schema.prisma` only. Nothing else in the repo has
been changed yet — the app **will not compile or run** until Phase 2 updates
the files listed below. This is expected; Phase 1 is the foundation the rest
builds on.

## What changed in the schema

- **`Lesson`** is now the top-level model (replaces `Assignment` as the
  container teachers create). Holds title, description, objectives, subject,
  status (`DRAFT / SCHEDULED / PUBLISHED / CLOSED / ARCHIVED`), and
  scheduling fields (`availableAt`, `dueDate`, `publishAt`, `closeAt`,
  `publishedAt`, `timezone`).
- **`LessonPathway`** replaces the old 1:1 `Assignment ↔ Pathway` link.
  A lesson can now hold any combination of the 5 GLOW Pathways, each with
  its own instructions, requirements, rubric, points, due-date override,
  resubmission toggle, and required/optional flag. This is the "activity"
  a student actually completes.
- **`LessonResource`** replaces `Material` — files attached to the lesson
  itself (not a specific pathway), with description and manual ordering
  for the Resources section.
- **`LessonAssignment`** is new — targets a lesson at a whole class
  (`classId` set) or an individual student (`studentId` set, `classId`
  null), supporting the "entire class / specific students / multiple
  classes" assignment requirement.
- **`Submission`** and **`Grade`** now hang off `LessonPathway` instead of
  `Assignment` (`Submission.lessonPathwayId` replaces
  `Submission.assignmentId`). A student can submit once per pathway per
  lesson, same uniqueness guarantee as before.
- **`Announcement`** gained `priority` (Normal/Important/Urgent), `status`
  (Draft/Scheduled/Published/Expired), `expiresAt`, individual-student
  targeting (`studentId`), plus two new child tables:
  `AnnouncementImage` (gallery) and `AnnouncementAttachment` (files).
  `AnnouncementRead` is unchanged and continues to serve as the read-receipt
  table for both requirements.
- **`NotificationType`** gained `NEW_LESSON` / `LESSON_PUBLISHED` in place
  of `NEW_ASSIGNMENT`.

## A deliberate deviation from the prompt's table list

The prompt's spec lists a standalone `LessonSchedule` table. I folded that
into fields directly on `Lesson` (`publishAt`, `closeAt`, `timezone`)
instead of a separate join table — a lesson has exactly one schedule, so a
1:1 side table would just add a join for no benefit. Flag it if you'd
rather keep them separate (e.g. to preserve a history of reschedules).

## Next: run the migration

Once you're ready (needs a real Postgres connection, which I don't have
here):

```bash
npx prisma migrate dev --name lesson_centric_architecture
npx prisma generate
```

Expect Prisma to ask about data loss on the `assignments`/`materials`
tables being dropped — this is a breaking schema change, so plan a real
data-migration script if you have production data to carry over (map each
existing `Assignment` → one `Lesson` + one `LessonPathway` using its
current `pathwayId`, `Material` rows → `LessonResource`, existing
`Submission.assignmentId` → the new `LessonPathway.id`).

## Phase 2 checklist — files that reference the old model and need updating

These currently reference `Assignment`/`Material`/`assignmentId` and will
break until rewritten against `Lesson`/`LessonPathway`/`LessonResource`:

- `src/lib/validations/academic.ts` — `assignmentSchema`, `bulkAssignmentSchema`
- `src/app/(app)/assignments/page.tsx`
- `src/app/(app)/assignments/new/page.tsx`
- `src/app/(app)/assignments/[id]/page.tsx`
- `src/app/(app)/assignments/[id]/edit/page.tsx`
- `src/app/api/assignments/route.ts`
- `src/app/api/assignments/[id]/route.ts`
- `src/app/api/assignments/[id]/materials/route.ts`
- `src/app/api/assignments/[id]/submission-files/route.ts`
- `src/app/api/submissions/route.ts`
- `src/app/api/search/route.ts`
- `src/features/assignments/assignment-form.tsx`
- `src/features/assignments/assignment-actions-menu.tsx`
- `src/features/assignments/submit-assignment-button.tsx`
- `src/features/assignments/materials-uploader.tsx`
- `prisma/seed.ts`

This is exactly the work of Phase 2 (teacher lesson builder) — say the
word and I'll start on it.
