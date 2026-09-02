import { Menu, Settings } from "lucide-react";
import { useApp } from "@/context/useApp";
import { ConnectionStatus } from "@/components/dashboard/ConnectionStatus";
import { Logo } from "@/components/dashboard/Logo";
import { Select } from "@/components/ui/Select";
import { VoiceButton } from "@/components/dashboard/VoiceButton";

export function Header() {
  const {
    grade,
    grades,
    setGrade,
    connectionState,
    connectionDetail,
    openSidebar,
  } = useApp();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-3 sm:px-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={openSidebar}
          aria-label="Open menu"
          className="-ml-1 inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-muted hover:bg-surface-muted lg:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <Logo />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Select
          label="Grade"
          value={grade}
          options={grades}
          onChange={setGrade}
          variant="compact"
          className="hidden sm:inline-flex"
        />
        <ConnectionStatus state={connectionState} detail={connectionDetail} />
        <VoiceButton size="sm" />
        <button
          type="button"
          title="Settings — coming soon"
          aria-label="Settings (coming soon)"
          disabled
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-ink-faint disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Settings className="h-[18px] w-[18px]" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
