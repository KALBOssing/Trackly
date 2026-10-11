"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/brand/logo";

const PATHWAYS = [
  { name: "Spark", color: "#22C55E", line: "Getting started" },
  { name: "Shine", color: "#F59E0B", line: "Leading peers" },
  { name: "Glow", color: "#EC4899", line: "Community service" },
  { name: "Radiate", color: "#06B6D4", line: "Wellbeing" },
  { name: "Extension", color: "#8B5CF6", line: "Academic excellence" },
];

export function AuthBrandPanel() {
  return (
    <aside className="relative isolate hidden overflow-hidden bg-[#0A1020] text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 top-0 h-96 w-96 animate-float-slow rounded-full bg-emerald-500/25 blur-[110px]" />
        <div className="absolute -right-24 top-1/3 h-[26rem] w-[26rem] animate-float-rev rounded-full bg-violet-500/30 blur-[120px]" />
        <div className="absolute -bottom-16 left-1/4 h-80 w-80 animate-float-slow rounded-full bg-fuchsia-500/25 blur-[110px]" />
        <div className="absolute bottom-1/4 right-10 h-60 w-60 animate-float-rev rounded-full bg-cyan-400/20 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse at center, black 25%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 25%, transparent 75%)",
          }}
        />
      </div>

      <Link href="/" aria-label="Trackly home" className="w-fit">
        <Logo textClassName="text-white" />
      </Link>

      <div>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-md text-4xl font-semibold leading-tight tracking-tight xl:text-5xl"
        >
          Progress you can <span className="glow-text">see</span>.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="mt-4 max-w-md text-white/60"
        >
          Lessons, grading, and all five GLOW pathways in one place.
        </motion.p>

        <motion.ul
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.3 } } }}
          className="mt-10 space-y-3"
        >
          {PATHWAYS.map((p) => (
            <motion.li
              key={p.name}
              variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } }}
              className="flex max-w-sm items-center gap-4 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 backdrop-blur"
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color, boxShadow: `0 0 14px ${p.color}` }} />
              <span className="font-medium">{p.name}</span>
              <span className="ml-auto text-sm text-white/45">{p.line}</span>
            </motion.li>
          ))}
        </motion.ul>
      </div>

      <p className="text-sm text-white/40">© {new Date().getFullYear()} Trackly</p>
    </aside>
  );
}
