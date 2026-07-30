# Trackly

A Learning Management and Progress Tracking System for schools running the **GLOW Pathways**
program. Built with Next.js 14 (App Router), TypeScript, Tailwind, shadcn/ui, Prisma, and
PostgreSQL.

> **Status: Phase 1 of the incremental build** (database → **auth** → **backend APIs (partial)**
> → **frontend (partial)** → testing → deployment). See "What's included" below for exactly what's
> implemented so far, and "Roadmap" for what's next.

## What's included in this phase

- ✅ Full Prisma schema covering every entity in the spec (Users, Student/Teacher profiles,
  Classes, Enrollments, Pathways, Progress, Assignments, Materials, Submissions,
  SubmissionFiles, Grades, Announcements, Notifications, Achievements, Sessions, ActivityLogs,
  Settings)
- ✅ Authentication: register (student/teacher), login, forgot password, JWT sessions via
  Auth.js/NextAuth, bcrypt hashing, rate limiting on auth endpoints
- ✅ Role-based route protection via middleware (`/student/*`, `/teacher/*`)
- ✅ Landing page (hero, features, how it works, benefits, testimonials, FAQ)
- ✅ Student dashboard: overall progress ring, GLOW pathway cards, upcoming assignments,
  announcements — all pulling real data via Prisma
- ✅ Teacher dashboard: stat cards, pathway completion chart (Recharts), late submissions
- ✅ Example API routes with RBAC + Zod validation: `classes`, `assignments`
- ✅ Seed script matching the spec's sample data (5 pathways, 10 classes, 5 teachers, 200
  students, 50 assignments, 100 submissions, announcements, notifications)
- ✅ Design system: Tailwind tokens matching the spec (primary `#2563EB`, background `#F8FAFC`,
  16px radius, dark mode variables)

## Phase 2 additions

- ✅ Classes management: roster view, create-class dialog, CSV bulk student import
- ✅ Assignment creation form (draft/publish), assignment detail page with role-aware views
- ✅ Student submission flow (save draft / submit / resubmit, late detection)
- ✅ Grading UI (score + feedback, release grade, notifies the student)
- ✅ Announcements: create/pin (teacher), mark-as-read (student)
- ✅ Notifications center with mark-as-read
- ✅ Calendar: monthly grid with due dates + announcements
- ✅ Analytics dashboard: overview stats, pathway completion chart, top/behind-schedule students,
  CSV/Excel/PDF export
- ✅ Profile page (bio, dark mode, notification preference), 404/500 pages

## Phase 3 additions

- ✅ Rich text editor (Tiptap) for assignment instructions, with a minimal bold/italic/list toolbar
- ✅ Drag-and-drop file uploads wired end-to-end: `/api/upload` validates type/size and stores to
  Supabase Storage; teachers attach materials to assignments, students attach files to their
  submission (a draft submission is auto-created on first upload)
- ✅ Achievements auto-awarding (`src/lib/achievements.ts`): recomputes pathway progress and grants
  First Submission, Perfect Score, First/Two/All-Five Pathway badges whenever a grade is released
- ✅ Badges surfaced on the student profile page

## Phase 4 additions

- ✅ Global search (`/api/search`) across assignments, classes, students, and announcements —
  role-scoped, with a debounced search bar in the shared Topbar
- ✅ Transactional email via Resend (`src/lib/email.ts`): verification, password reset, new
  assignment, deadline-reminder, and grade-released emails — falls back to console logging if
  `RESEND_API_KEY` isn't set, so local dev works without it
- ✅ `/verify-email` and `/reset-password` pages + API routes (previously just linked from emails
  but not yet built)
- ✅ Submission comments: students and teachers can leave threaded comments on a submission,
  with an in-app notification back to the teacher

## Phase 5 additions

- ✅ `Dockerfile` for the app itself (standalone Next.js output, multi-stage build). Local
  development uses `docker-compose.yml` for the database only, running alongside `npm run dev`;
  `docker-compose.full.yml` optionally runs the whole app in Docker too, for self-hosting
- ✅ Vitest unit tests for password strength, pathway status tiers, formatting utils, and the
  registration schema (`npm run test`)
- ✅ Playwright e2e tests for auth (register/login/invalid login), class creation, and assignment
  drafting (`npm run test:e2e`)
- ✅ GitHub Actions CI (`.github/workflows/ci.yml`): lint, type-check, `prisma validate`,
  migrations against a throwaway Postgres service, unit tests, and a production build
- ✅ Audit log viewer page (teacher) reading from the `ActivityLog` table
- ✅ File deletion for assignment materials and submission files (submission files lock once
  graded)
- ✅ Deadline-reminder cron endpoint (`/api/cron/deadline-reminders`, protected by `CRON_SECRET`)
  + a `vercel.json` Cron config wired to run it daily

## Phase 6 additions

- ✅ Assignments: Edit, Duplicate, Archive/Restore, Delete — all behind owner checks, delete asks
  for confirmation first
- ✅ Announcements: Edit, Delete for the owning teacher
- ✅ **Bug fix**: scheduled announcements were showing to students immediately instead of waiting
  for their scheduled time — fixed in all three places that queried announcements (the
  announcements page, the API route, and the student dashboard)
- ✅ Profile picture upload/remove (the database field existed since Phase 1 but had no UI)
- ✅ Grading: teachers can attach a feedback file, not just text feedback; students see a
  download link for it
- ✅ Classes: Edit (rename/re-grade/re-section), Archive/Restore, Delete (blocked with a clear
  message if students are still enrolled)
- ✅ Reusable confirmation dialog (`src/components/ui/confirm-button.tsx`) — destructive actions
  (deleting a file, assignment, announcement, or class) now ask before acting instead of firing
  immediately

## Phase 7 additions

- ✅ Class search, status filter (Active/Archived/All), and sort (by name or student count) on
  the classes list — client-side, instant, with pagination for longer lists
- ✅ Bulk assignment creation — select multiple classes when creating an assignment to post the
  same assignment to all of them at once, in one action
- ✅ **Security fix**: editing an assignment to move it to a different class now verifies you
  actually own that class first (previously nothing stopped setting an arbitrary class ID)
- ✅ Breadcrumb navigation on assignment detail/edit/new pages and class detail pages
- ✅ Pagination: assignments list (server-side, 15 per page) and the analytics student report
  table (client-side, 20 per page — exports still include every row, only the on-screen table
  is paged)
- ✅ Skeleton loading states for assignments, classes, analytics, and both dashboards, using
  Next.js's built-in `loading.tsx` convention
- ✅ Accessibility pass: added `aria-label`s to icon-only buttons that had none (actions menus,
  mark-as-read, profile picture controls, comment-post button)

## Remaining known gaps

- Students list page (a dedicated, sortable/filterable directory of every student across all of
  a teacher's classes — right now students are only browsable within a single class's roster)
- Pagination hasn't been added to the classes list's *server* query (client-side pagination
  works today; fine at current scale, but would need a server-side rewrite for a school with
  hundreds of classes) or to Notifications/Announcements lists
- A full accessibility audit (keyboard-navigation walkthrough, screen-reader testing) hasn't been
  done — only the most obvious icon-only buttons were fixed
- The registration/login e2e tests assume a real running dev server + database with the seed
  data loaded — they aren't wired into CI's Postgres service yet (CI currently runs unit tests
  only; e2e needs `npm run prisma:seed` added to the CI job first)
- Rate limiting (`src/lib/rate-limit.ts`) is in-memory and per-instance — fine for a single
  server, but swap in Redis (e.g. Upstash) before running multiple instances behind a load
  balancer
- No image optimization/resizing pipeline for profile pictures beyond what Next/Image gives you
  for free
- Email templates are plain inline HTML strings — consider React Email or MJML if you want
  richer, more maintainable templates

## Getting started

### 1. Prerequisites

- Node.js 18.18+
- Docker (for local Postgres) — or your own PostgreSQL instance
- A Supabase project (for file storage) — optional until the upload UI ships in a later phase

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in `DATABASE_URL`, `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`), and your
Supabase credentials.

### 4. Start PostgreSQL

```bash
docker compose up -d
```

### 5. Run migrations and seed data

```bash
npm run db:init
npm run prisma:seed
```

This creates 5 teachers (`teacher1@trackly.edu` … `teacher5@trackly.edu`) and 200 students
(`student1@trackly.edu` … `student200@trackly.edu`), all with password `Password!123`.

### 6. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Testing

```bash
npm run test        # Vitest unit tests
npm run test:e2e     # Playwright e2e tests
```

(Test suites will be filled in during the "testing" phase of the roadmap.)

## Deployment (Vercel)

1. Push this repo to GitHub.
2. Import it into Vercel.
3. Add the environment variables from `.env.example` in the Vercel project settings.
4. Use a managed Postgres (Vercel Postgres, Supabase, Neon, or RDS) for `DATABASE_URL`.
5. Vercel will run `npm install` → `postinstall` (`prisma generate`) → `npm run build`
   automatically.
6. Run `npm run db:deploy` against your production database (via a one-off job or
   Vercel's deploy hook).

## Project structure

```
src/
  app/                 # Next.js App Router routes
    (auth)/            # login, register, forgot-password
    api/               # API route handlers
    student/           # student-only routes (protected by middleware)
    teacher/           # teacher-only routes (protected by middleware)
  components/
    ui/                # shadcn/ui-style primitives
    layout/            # sidebar, topbar
    charts/            # Recharts wrappers
  features/            # feature-scoped logic (grows in later phases)
  hooks/               # shared React hooks
  lib/                 # prisma client, auth config, validation schemas, utils
  types/               # shared TypeScript types + NextAuth module augmentation
prisma/
  schema.prisma
  seed.ts
```
