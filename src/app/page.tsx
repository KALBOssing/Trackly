import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  ClipboardCheck,
  Download,
  Sparkles,
  Trophy,
  Users,
  Activity,
  BookOpen,
  Flag,
  HeartHandshake,
  Sprout,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";
import { AnimatedBar } from "@/components/motion/progress";
import { HeroPreview } from "@/components/landing/hero-preview";
import { Faq } from "@/components/landing/faq";

const pathways: { name: string; desc: string; color: string; icon: LucideIcon }[] = [
  { name: "Spark", desc: "Getting started: orientation and foundational milestones.", color: "#22C55E", icon: Sprout },
  { name: "Shine", desc: "Leading peers and projects.", color: "#F59E0B", icon: Flag },
  { name: "Glow", desc: "Community service and outreach.", color: "#EC4899", icon: HeartHandshake },
  { name: "Radiate", desc: "Physical and mental wellbeing.", color: "#06B6D4", icon: Activity },
  { name: "Extension", desc: "Academic excellence and research.", color: "#8B5CF6", icon: BookOpen },
];

const stats = [
  { value: 5, suffix: "", label: "GLOW pathways tracked" },
  { value: 100, suffix: " MB", label: "Per-file upload limit" },
  { value: 3, suffix: "", label: "Export formats: CSV, Excel, PDF" },
  { value: 2, suffix: "", label: "Role-based dashboards" },
];

const features: { icon: LucideIcon; title: string; desc: string }[] = [
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
    a: "Yes, analytics can be exported to CSV, Excel, or PDF from the Analytics dashboard.",
  },
];

const benefits = [
  "Automatic pathway progress calculation",
  "Role-based dashboards for students and teachers",
  "CSV bulk import for rosters",
  "Exportable analytics reports",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0A1020]/80 text-white backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" aria-label="Trackly home">
            <Logo />
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-8 text-sm text-white/70 md:flex">
            <a href="#pathways" className="transition-colors hover:text-white">Pathways</a>
            <a href="#features" className="transition-colors hover:text-white">Features</a>
            <a href="#how-it-works" className="transition-colors hover:text-white">How it works</a>
            <a href="#faq" className="transition-colors hover:text-white">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main id="main">
        {/* Hero */}
        <section className="relative isolate overflow-hidden bg-[#0A1020] text-white">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -left-24 top-10 h-96 w-96 animate-float-slow rounded-full bg-emerald-500/25 blur-[110px]" />
            <div className="absolute left-1/3 -top-20 h-80 w-80 animate-float-rev rounded-full bg-amber-400/15 blur-[110px]" />
            <div className="absolute -right-20 top-24 h-[28rem] w-[28rem] animate-float-slow rounded-full bg-violet-500/30 blur-[120px]" />
            <div className="absolute bottom-0 left-1/4 h-80 w-80 animate-float-rev rounded-full bg-fuchsia-500/20 blur-[110px]" />
            <div className="absolute bottom-10 right-1/3 h-72 w-72 animate-float-slow rounded-full bg-cyan-400/20 blur-[110px]" />
            <div
              className="absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
                backgroundSize: "56px 56px",
                maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
                WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
              }}
            />
          </div>

          <div className="container grid items-center gap-16 py-20 lg:grid-cols-[1.05fr_1fr] lg:py-28">
            <div>
              <span
                className="inline-flex animate-page-in items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/80 backdrop-blur"
              >
                <span className="glow-gradient h-1.5 w-1.5 rounded-full" /> Built for GLOW Pathways schools
              </span>
              <h1
                className="mt-6 animate-page-in text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
                style={{ animationDelay: "80ms" }}
              >
                Every pathway.
                <br />
                Every student.
                <br />
                <span className="glow-text">One clear view.</span>
              </h1>
              <p
                className="mt-6 max-w-xl animate-page-in text-lg leading-relaxed text-white/65"
                style={{ animationDelay: "160ms" }}
              >
                Trackly helps teachers manage classes and lessons while students watch their GLOW Pathways
                progress in real time. Clear, fast, and built for daily use.
              </p>
              <div className="mt-10 flex animate-page-in flex-wrap items-center gap-4" style={{ animationDelay: "240ms" }}>
                <Button size="lg" className="group h-12 px-7 text-base shadow-lg shadow-primary/30" asChild>
                  <Link href="/register">
                    Create free account
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 border-white/20 bg-white/5 px-7 text-base text-white backdrop-blur hover:bg-white/10 hover:text-white"
                  asChild
                >
                  <Link href="#how-it-works">See how it works</Link>
                </Button>
              </div>
              <ul
                className="mt-10 flex animate-page-in flex-wrap gap-x-6 gap-y-2 text-sm text-white/55"
                style={{ animationDelay: "320ms" }}
              >
                {["Free to start", "Student & teacher dashboards", "Works on any device"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" /> {t}
                  </li>
                ))}
              </ul>
            </div>

            <HeroPreview />
          </div>
        </section>

        {/* Stats */}
        <section aria-label="Trackly at a glance" className="border-b border-border bg-card">
          <div className="container grid grid-cols-2 gap-y-8 py-12 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display text-4xl font-semibold tracking-tight">
                  <CountUp value={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pathways */}
        <section id="pathways" className="container scroll-mt-20 py-24">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">The framework</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Five pathways, tracked as one</h2>
            <p className="mt-4 text-muted-foreground">
              Each pathway has its own colour, its own progress, and its own milestones, so growth is
              visible at a glance.
            </p>
          </Reveal>
          <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {pathways.map((p) => (
              <StaggerItem key={p.name}>
                <div className="card-interactive group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-6 card-shadow">
                  <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: p.color }} />
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${p.color}1f`, color: p.color }}
                  >
                    <p.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold">{p.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20 bg-secondary/50 py-24">
          <div className="container">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Features</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Everything a GLOW classroom needs
              </h2>
              <p className="mt-4 text-muted-foreground">
                One place for lessons, grading, pathways, and progress. No spreadsheets required.
              </p>
            </Reveal>
            <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <StaggerItem key={f.title}>
                  <div className="card-interactive group h-full rounded-2xl border border-border bg-card p-7 card-shadow">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                      <f.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className="mt-5 font-display text-lg font-semibold">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="container scroll-mt-20 py-24">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">How it works</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">From setup to insight in four steps</h2>
          </Reveal>
          <Stagger className="relative mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4" stagger={0.12}>
            <div
              aria-hidden="true"
              className="glow-gradient absolute left-[12%] right-[12%] top-6 hidden h-0.5 opacity-40 lg:block"
            />
            {steps.map((s, i) => (
              <StaggerItem key={s.title} className="relative text-center">
                <div className="relative mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-display text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/30 ring-8 ring-background">
                  {i + 1}
                </div>
                <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* Benefits */}
        <section className="bg-secondary/50 py-24">
          <div className="container grid items-center gap-14 lg:grid-cols-2">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Why Trackly</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Built for clarity, not clutter</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Trackly keeps the interface focused and spacious so teachers and students can concentrate on
                the work, not the tool. Dark mode, keyboard navigation, and responsive layouts come standard.
              </p>
              <ul className="mt-8 space-y-4">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
                <Download className="h-4 w-4" aria-hidden="true" /> Export to CSV, Excel, or PDF from Analytics.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="rounded-2xl border border-border bg-card p-8 card-shadow">
                <div className="flex items-center justify-between">
                  <p className="font-display font-semibold">Pathway completion</p>
                  <span className="text-xs text-muted-foreground">Sample data</span>
                </div>
                <ul className="mt-6 space-y-5">
                  {pathways.map((p, i) => {
                    const value = [92, 78, 64, 51, 35][i];
                    return (
                      <li key={p.name}>
                        <div className="mb-2 flex items-center justify-between text-sm font-medium">
                          <span>{p.name}</span>
                          <span className="tabular-nums text-muted-foreground">{value}%</span>
                        </div>
                        <AnimatedBar value={value} color={p.color} delay={i * 0.1} />
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="container scroll-mt-20 py-24">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">FAQ</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Frequently asked questions</h2>
          </Reveal>
          <Reveal className="mx-auto mt-12 max-w-2xl" delay={0.1}>
            <Faq items={faqs} />
          </Reveal>
        </section>

        {/* Final CTA */}
        <section className="container pb-24">
          <Reveal>
            <div className="relative isolate overflow-hidden rounded-3xl bg-[#0A1020] px-8 py-16 text-center text-white sm:px-16">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -left-10 top-0 h-64 w-64 animate-float-slow rounded-full bg-emerald-500/25 blur-[90px]" />
                <div className="absolute right-0 top-10 h-72 w-72 animate-float-rev rounded-full bg-violet-500/30 blur-[100px]" />
                <div className="absolute bottom-0 left-1/2 h-60 w-60 animate-float-slow rounded-full bg-fuchsia-500/20 blur-[90px]" />
              </div>
              <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
                Ready to light up your pathways?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-white/65">
                Create your account in a minute and start tracking progress today.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Button size="lg" className="group h-12 px-7 text-base" asChild>
                  <Link href="/register">
                    Get started
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 border-white/20 bg-white/5 px-7 text-base text-white hover:bg-white/10 hover:text-white"
                  asChild
                >
                  <Link href="/login">I already have an account</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container flex flex-col items-center justify-between gap-6 py-10 text-sm text-muted-foreground sm:flex-row">
          <Logo textClassName="text-foreground" />
          <p>© {new Date().getFullYear()} Trackly. All rights reserved.</p>
          <nav aria-label="Footer" className="flex gap-6">
            <Link href="/login" className="transition-colors hover:text-foreground">Login</Link>
            <Link href="/register" className="transition-colors hover:text-foreground">Register</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
