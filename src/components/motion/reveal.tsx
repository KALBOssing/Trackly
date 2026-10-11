"use client";

import { motion, type HTMLMotionProps, type Variants } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Fades and lifts its content into place the first time it scrolls into view. */
export function Reveal({
  children,
  delay = 0,
  y = 20,
  className,
  ...rest
}: { delay?: number; y?: number } & Omit<HTMLMotionProps<"div">, "initial" | "animate" | "whileInView">) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: EASE, delay }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

const container = (stagger: number, delayChildren: number): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
});

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

/**
 * Children wrapped in <StaggerItem> animate in one after another.
 * `onMount` plays on page load (for dashboards); otherwise it plays on scroll.
 */
export function Stagger({
  children,
  className,
  stagger = 0.07,
  delay = 0,
  onMount = false,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  onMount?: boolean;
}) {
  const common = { variants: container(stagger, delay), initial: "hidden", className } as const;
  return onMount ? (
    <motion.div {...common} animate="show">
      {children}
    </motion.div>
  ) : (
    <motion.div {...common} whileInView="show" viewport={{ once: true, margin: "-60px" }}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={item} className={className}>
      {children}
    </motion.div>
  );
}
