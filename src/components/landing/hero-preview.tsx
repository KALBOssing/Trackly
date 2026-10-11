"use client";

import { motion } from "framer-motion";
import { CalendarClock, Trophy } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { AnimatedBar } from "@/components/motion/progress";
import { CountUp } from "@/components/motion/count-up";

const PATHWAYS = [
  { name: "Spark", color: "#22C55E", value: 92 },
  { name: "Shine", color: "#F59E0B", value: 78 },
  { name: "Glow", color: "#EC4899", value: 64 },
  { name: "Radiate", color: "#06B6D4", value: 51 },
  { name: "Extension", color: "#8B5CF6", value: 35 },
];

const OVERALL = Math.round(PATHWAYS.reduce((s, p) => s + p.value, 0) / PATHWAYS.length);

// An illustrative dashboard preview for the landing page. The numbers are sample data.
export function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
      className="relative mx-auto w-full max-w-md"
      aria-hidden="true"
    >
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-emerald-400/20 via-fuchsia-500/20 to-violet-500/20 blur-2xl" />

      <div className="relative rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-7 w-7" />
            <div>
              <p className="text-sm font-semibold text-white">Student dashboard</p>
              <p className="text-xs text-white/50">Sample data</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
            On track
          </span>
        </div>

        <div className="mt-6">
          <div className="flex items-end justify-between">
            <p className="text-xs uppercase tracking-wide text-white/50">Overall progress</p>
            <p className="font-display text-3xl font-semibold text-white">
              <CountUp value={OVERALL} suffix="%" />
            </p>
          </div>
          <AnimatedBar value={OVERALL} className="glow-gradient" trackClassName="mt-2 h-2.5 bg-white/10" delay={0.5} />
        </div>

        <ul className="mt-6 space-y-4">
          {PATHWAYS.map((p, i) => (
            <li key={p.name}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-white/90">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                  {p.name}
                </span>
                <span className="tabular-nums text-white/50">{p.value}%</span>
              </div>
              <AnimatedBar value={p.value} color={p.color} trackClassName="h-1.5 bg-white/10" delay={0.6 + i * 0.12} />
            </li>
          ))}
        </ul>
      </div>

      <motion.div
        animate={{ y: [0, -9, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-3 -top-6 sm:-right-8"
      >
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#121a2e]/90 px-4 py-3 shadow-xl backdrop-blur">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400/15 text-amber-300">
            <Trophy className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold text-white">Achievement unlocked</p>
            <p className="text-[11px] text-white/50">Completed two pathways</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        className="absolute -bottom-6 -left-3 sm:-left-8"
      >
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#121a2e]/90 px-4 py-3 shadow-xl backdrop-blur">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/15 text-cyan-300">
            <CalendarClock className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold text-white">Due Friday</p>
            <p className="text-[11px] text-white/50">Reflection journal</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
