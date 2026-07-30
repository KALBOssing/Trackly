import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Trophy,
    title: "GLOW Pathways",
    desc: "Track student progress across all five GLOW pathways with automatic completion scoring.",
  },
  {
    icon: ClipboardCheck,
    title: "Lessons & Grading",
    desc: "Create lessons, attach GLOW Pathways, upload resources, and grade student submissions with rich rubrics.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    desc: "See class, section, and pathway completion at a glance, plus export-ready reports.",
  },
  {
    icon: CalendarDays,
    title: "Calendar & Reminders",
    desc: "Due dates, announcements, and events in one shared calendar with deadline reminders.",
  },
  {
    icon: Users,
    title: "Classes & Rosters",
    desc: "Organize students into classes and sections with bulk CSV import.",
  },
  {
    icon: Sparkles,
    title: "Achievements",
    desc: "Celebrate milestones with badges for first submissions, completed pathways, and top scores.",
  },
];

const steps = [
  { title: "Teachers set up classes", desc: "Create classes, add students, and organize the GLOW pathways." },
  { title: "Lessons go out", desc: "Publish lessons bundling GLOW Pathways with due dates and resources." },
  { title: "Students submit work", desc: "Students upload files, track deadlines, and receive feedback." },
  { title: "Progress adds up", desc: "Completion rolls up automatically into pathway and class analytics." },
];

const faqs = [
  {
    q: "How many pathways does a student need to complete?",
    a: "Students need at least two of the five GLOW pathways completed to meet the base requirement; completing all five earns an Outstanding Achievement badge.",
  },
  {
    q: "What file types can teachers upload?",
    a: "PDF, Word, PowerPoint, Excel, ZIP, PNG, JPG, and MP4 files up to 100MB each.",
  },
  {
    q: "Can I export reports?",
    a: "Yes — analytics can be exported to CSV, Excel, or PDF from the Analytics dashboard.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <GraduationCap className="h-6 w-6 text-primary" />
            Trackly
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how-it-works" className="hover:text-foreground">How It Works</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
            <Sparkles className="h-3.5 w-3.5" /> Built for GLOW Pathways schools
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Progress tracking that feels effortless.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Trackly helps teachers manage classes and lessons while students see their GLOW
            Pathways progress in real time — clean, modern, and built for daily use.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/register">Create Free Account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#how-it-works">See How It Works</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">Everything a GLOW classroom needs</h2>
          <p className="mt-3 text-muted-foreground">
            One place for lessons, grading, pathways, and progress — no spreadsheets required.
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title}>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-accent">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>{f.title}</CardTitle>
                <CardDescription>{f.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-secondary/40 py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold">How it works</h2>
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.title} className="text-center">
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                  {i + 1}
                </div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold">Built for clarity, not clutter</h2>
            <p className="mt-4 text-muted-foreground">
              Trackly keeps the interface minimal and spacious so teachers and students can focus on
              the work, not the tool. Dark mode, keyboard navigation, and responsive layouts come
              standard.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Automatic pathway progress calculation",
                "Role-based dashboards for students and teachers",
                "CSV bulk import for rosters",
                "Exportable analytics reports",
              ].map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <BookOpenCheck className="mt-0.5 h-4 w-4 text-primary" /> {b}
                </li>
              ))}
            </ul>
          </div>
          <Card className="p-2">
            <CardContent className="p-8">
              <div className="space-y-4">
                {["Spark", "Shine", "Glow"].map((p) => (
                  <div key={p} className="rounded-md border border-border p-4">
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span>{p} Pathway</span>
                      <span className="text-muted-foreground">72%</span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-secondary">
                      <div className="h-2 rounded-full bg-primary" style={{ width: "72%" }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-secondary/40 py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold">Trusted by teachers</h2>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {[
              { name: "M. Santos", role: "Grade 11 Adviser", quote: "Grading and tracking pathway completion finally live in one place." },
              { name: "R. Cruz", role: "STEM Coordinator", quote: "Students actually check their progress now instead of asking me." },
              { name: "A. Reyes", role: "Homeroom Teacher", quote: "The analytics export saves me hours every grading period." },
            ].map((t) => (
              <Card key={t.name}>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">"{t.quote}"</p>
                  <p className="mt-4 text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">Frequently asked questions</h2>
        </div>
        <div className="mx-auto mt-10 max-w-2xl space-y-4">
          {faqs.map((f) => (
            <Card key={f.q}>
              <CardHeader>
                <CardTitle className="text-base">{f.q}</CardTitle>
                <CardDescription>{f.a}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="container flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <GraduationCap className="h-5 w-5 text-primary" /> Trackly
          </div>
          <p>© {new Date().getFullYear()} Trackly. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
