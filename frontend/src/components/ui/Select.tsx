import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Compact variant used in the header; default is the context-bar style. */
  variant?: "default" | "compact";
}

/**
 * A native <select> styled to look like a small dropdown chip. Native
 * selects keep keyboard and screen-reader behaviour correct for free, which
 * matters more here than custom listbox styling.
 */
export function Select({
  label,
  value,
  options,
  onChange,
  placeholder,
  disabled,
  className,
  variant = "default",
}: SelectProps) {
  const hasValue = value !== "";

  return (
    <div className={cn("relative inline-flex", className)}>
      <select
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "appearance-none rounded-md border border-border bg-surface font-medium text-ink",
          "pr-7 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand",
          "disabled:cursor-not-allowed disabled:opacity-60",
          variant === "compact" ? "py-1 pl-2.5 text-sm" : "py-1.5 pl-3 text-sm",
          !hasValue && "text-ink-faint",
        )}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint"
      />
    </div>
  );
}
