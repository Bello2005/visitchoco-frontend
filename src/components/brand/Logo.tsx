import { cn } from "../../lib/cn";

interface LogoProps {
  className?: string;
  textOnly?: boolean;
  markOnly?: boolean;
}

export function Logo({ className, textOnly, markOnly }: LogoProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 leading-none whitespace-nowrap",
        className,
      )}
      role="img"
      aria-label="VisitChocó"
    >
      {!textOnly && (
        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.25" opacity="0.4" />
          <circle cx="12" cy="12" r="6"  fill="none" stroke="currentColor" strokeWidth="1.5"  opacity="0.7" />
          <circle cx="12" cy="12" r="2.2" fill="currentColor" />
        </svg>
      )}
      {!markOnly && (
        <span className="flex items-baseline gap-[0.18em]">
          <span className="font-sans text-[0.95em] font-medium tracking-tight opacity-70">
            Visit
          </span>
          <span className="font-display text-[1.05em] font-semibold tracking-tight">
            Chocó
          </span>
        </span>
      )}
    </span>
  );
}
