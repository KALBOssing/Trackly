import { cn } from "@/lib/utils";

/**
 * PLACEHOLDER LOGO: this is the single place to swap in your real logo.
 *
 * To use your own logo:
 *   1. Put the file in the /public folder (for example /public/logo.svg or /public/logo.png).
 *   2. Set LOGO_SRC below to its path, for example "/logo.svg".
 *
 * Until then a generated mark (five rays in the GLOW pathway colours) is drawn.
 * Every page uses <Logo />, so nothing else needs changing.
 */
const LOGO_SRC: string | null = null;
const BRAND_NAME = "Trackly";

const RAYS = ["#22C55E", "#F59E0B", "#EC4899", "#06B6D4", "#8B5CF6"];

export function LogoMark({ className }: { className?: string }) {
  if (LOGO_SRC) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={LOGO_SRC} alt="" className={cn("h-8 w-8 object-contain", className)} />;
  }
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("h-8 w-8", className)}>
      <rect width="32" height="32" rx="9" fill="hsl(var(--primary))" />
      {RAYS.map((color, i) => {
        // Five rays fanned across the top half of the tile.
        const angle = (-150 + i * 30) * (Math.PI / 180);
        const x1 = 16 + Math.cos(angle) * 5;
        const y1 = 20 + Math.sin(angle) * 5;
        const x2 = 16 + Math.cos(angle) * 12;
        const y2 = 20 + Math.sin(angle) * 12;
        return (
          <line
            key={color}
            x1={x1.toFixed(2)}
            y1={y1.toFixed(2)}
            x2={x2.toFixed(2)}
            y2={y2.toFixed(2)}
            stroke={color}
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        );
      })}
      <circle cx="16" cy="20" r="3.2" fill="#fff" />
    </svg>
  );
}

export function Logo({
  className,
  markClassName,
  textClassName,
  showName = true,
}: {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  showName?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={markClassName} />
      {showName && (
        <span className={cn("font-display text-lg font-semibold tracking-tight", textClassName)}>{BRAND_NAME}</span>
      )}
    </span>
  );
}
