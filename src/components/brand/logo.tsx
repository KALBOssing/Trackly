import { cn } from "@/lib/utils";

/**
 * The Trackly badge lives at /public/logo.png. To swap it, replace that file
 * (or point LOGO_SRC somewhere else). Every page uses <Logo />, so nothing
 * else needs changing.
 */
const LOGO_SRC = "/logo.png";
const BRAND_NAME = "Trackly";

export function LogoMark({ className }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={LOGO_SRC} alt="" className={cn("h-8 w-8 object-contain", className)} />;
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
