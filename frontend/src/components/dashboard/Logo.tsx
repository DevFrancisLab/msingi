import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  markOnly?: boolean;
}

/**
 * MSINGI wordmark. "Msingi" is Swahili for "foundation" — the mark is a
 * simple stacked base, not a decorative illustration.
 */
export function Logo({ className, markOnly = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect x="2" y="16" width="20" height="4" rx="1" fill="var(--color-brand)" />
        <rect x="5" y="10" width="14" height="4" rx="1" fill="var(--color-brand)" opacity="0.75" />
        <rect x="8" y="4" width="8" height="4" rx="1" fill="var(--color-brand)" opacity="0.5" />
      </svg>
      {!markOnly && (
        <span className="text-[15px] font-semibold tracking-wide text-ink">MSINGI</span>
      )}
    </div>
  );
}
