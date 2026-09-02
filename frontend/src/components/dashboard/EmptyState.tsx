import { Logo } from "@/components/dashboard/Logo";
import { SuggestedActions } from "@/components/dashboard/SuggestedActions";
import { useApp } from "@/context/useApp";

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

/** Shown before the first message of a conversation; replaced by MessageList once one exists. */
export function EmptyState({ onSelectPrompt }: EmptyStateProps) {
  const { grade, subject, topic } = useApp();
  const breadcrumb = [grade, subject, topic].filter(Boolean).join(" → ");

  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-10 text-center">
      <Logo markOnly className="mb-4 scale-125" />
      <h1 className="text-xl font-semibold text-ink">How can I help you teach?</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
        Choose a topic and I&rsquo;ll help you understand, prepare, and teach it confidently.
      </p>
      {breadcrumb && (
        <p className="mt-3 text-xs font-medium text-ink-faint">{breadcrumb}</p>
      )}
      <div className="mt-6">
        <SuggestedActions onSelect={onSelectPrompt} />
      </div>
    </div>
  );
}
