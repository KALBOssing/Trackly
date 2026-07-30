# Phase 2 — Complete

The whole codebase now compiles against the Lesson-centric schema — every
file that referenced `Assignment`/`Material` has been rewritten or removed.

## What's fully working

- **Teacher lesson builder**: `/lessons/new` — metadata, class/individual-
  student targeting, add any number of GLOW Pathways with their own
  instructions/rubric/points/due-override/required/resubmission settings,
  schedule or publish immediately.
- **Lesson detail** (`/lessons/[id]`): teacher view shows resources,
  pathway list, and per-student submissions with inline grading; student
  view shows resources plus each pathway's instructions, submission
  upload, and grade/feedback.
- **Lesson edit, duplicate, archive, delete** — `/lessons/[id]/edit` +
  `LessonActionsMenu`.
- **Resources**: upload/delete files on a lesson (`LessonResourcesUploader`,
  `/api/resources/[resourceId]`).
- **Submissions & grading**: `/api/submissions`, `/api/submissions/[id]/grade`,
  comments — all rekeyed to `lessonPathwayId`.
- **Scheduling automation**: `/api/cron/publish-scheduled-lessons` flips
  `SCHEDULED → PUBLISHED` and `PUBLISHED → CLOSED` automatically; registered
  in `vercel.json` on a 5-minute interval. Deadline reminders rewritten
  against lessons too.
- **Dashboards**: teacher dashboard now shows the lesson-status stat cards
  from your spec (Total/Published/Scheduled/Draft Lessons, Announcements,
  Pending Grading). Student dashboard shows assigned lessons with a
  progress bar per lesson plus recent announcements.
- **Calendar, analytics, audit log, classes pages, search, seed data** —
  all rewritten against the new model.

## Deliberate scope cuts (flagged, not silently dropped)

- **Editing pathways on an existing lesson**: the edit form (`/lessons/[id]/edit`)
  covers lesson metadata and scheduling only. The API endpoint to add a
  pathway to an existing lesson exists (`POST /api/lessons/[id]/pathways`)
  but there's no UI wired to it yet on the detail page — that's a small
  Phase 3 addition (an "Add Pathway" button + dialog on `/lessons/[id]`).
- **Announcement images/attachments/gallery UI**: the schema
  (`AnnouncementImage`, `AnnouncementAttachment`) and validation are in
  place from Phase 1, but the announcement pages themselves haven't been
  rebuilt yet — that's Phase 4 (scheduled announcements, priority badges,
  image gallery, per-student targeting UI).
- **Global search result labels**: now say "Lesson" instead of
  "Assignment" — no further changes needed there.

## Suggested next step: Phase 3

Rebuild the announcement pages and finish the "Add Pathway to existing
lesson" UI, then move to the remaining dashboard/calendar polish items
(notification bell, unread indicators, empty states/skeletons) from your
original spec. Say the word and I'll start.
