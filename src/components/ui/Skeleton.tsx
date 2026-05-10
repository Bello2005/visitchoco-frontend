import { cn } from "../../lib/cn";

interface SkeletonProps {
  className?: string;
  variant?: "rect" | "text" | "circle";
}

export function Skeleton({ className, variant = "rect" }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Cargando"
      className={cn(
        "relative overflow-hidden bg-white/[0.04]",
        variant === "rect"   && "rounded-lg",
        variant === "text"   && "rounded h-3",
        variant === "circle" && "rounded-full",
        "before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/[0.06] before:to-transparent before:animate-shimmer",
        className,
      )}
    />
  );
}
