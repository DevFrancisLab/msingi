interface SuggestedAction {
  label: string;
  prompt: string;
}

const ACTIONS: SuggestedAction[] = [
  { label: "Explain this topic", prompt: "Explain this topic so I can teach it clearly." },
  { label: "Help me prepare a lesson", prompt: "Help me prepare a lesson plan for this topic." },
  { label: "Give me a simple example", prompt: "Give me a simple, relatable example for this topic." },
  { label: "Give me questions", prompt: "Give me classroom questions to check understanding." },
  { label: "Common misconceptions", prompt: "What are common misconceptions students have about this topic?" },
];

interface SuggestedActionsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

/** Quick-start prompts shown in the empty chat state. Each just fills/sends the composer. */
export function SuggestedActions({ onSelect, disabled }: SuggestedActionsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {ACTIONS.map((action) => (
        <button
          key={action.label}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(action.prompt)}
          className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:border-brand/40 hover:bg-brand-soft hover:text-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
