"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

/** Horizontal progress bar that grows to its value when scrolled into view. */
export function AnimatedBar({
  value,
  color,
  className,
  trackClassName,
  delay = 0,
}: {
  value: number;
  color?: string;
  className?: string;
  trackClassName?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-secondary", trackClassName)}
    >
      <motion.div
        className={cn("h-full origin-left rounded-full bg-primary", className)}
        style={{ width: `${pct}%`, backgroundColor: color }}
        initial={reduce ? false : { scaleX: 0 }}
        animate={inView || reduce ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay }}
      />
    </div>
  );
}

/** Circular progress ring that sweeps to its value, with the number counted up in the middle. */
export function RingProgress({
  value,
  size = 160,
  stroke = 12,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const pct = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div ref={ref} className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-secondary" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke="hsl(var(--primary))"
          strokeDasharray={c}
          initial={reduce ? false : { strokeDashoffset: c }}
          animate={{ strokeDashoffset: inView || reduce ? c * (1 - pct / 100) : c }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
