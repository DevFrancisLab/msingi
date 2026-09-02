import { useEffect } from "react";
import { MessageSquarePlus, Settings, X } from "lucide-react";
import { useApp } from "@/context/useApp";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { ConversationSummary } from "@/types";

function ConversationItem({
  conversation,
  active,
  onSelect,
}: {
  conversation: ConversationSummary;
  active: boolean;
  onSelect: () => void;
}) {
  const label = conversation.title || conversation.topic || "New chat";

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "true" : undefined}
      className={cn(
        "w-full rounded-md px-2.5 py-2 text-left text-sm transition-colors",
        active ? "bg-brand-soft text-brand-strong" : "text-ink-muted hover:bg-surface-muted hover:text-ink",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-medium">{label}</span>
        <span className="shrink-0 text-[11px] text-ink-faint">
          {formatRelativeTime(conversation.updatedAt)}
        </span>
      </div>
      {conversation.subject && (
        <span className="mt-0.5 block truncate text-xs text-ink-faint">
          {conversation.subject}
        </span>
      )}
    </button>
  );
}

function SidebarContent() {
  const { conversations, activeConversationId, selectConversation, startNewChat } = useApp();

  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <button
          type="button"
          onClick={startNewChat}
          className="flex w-full items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-muted"
        >
          <MessageSquarePlus className="h-4 w-4 text-brand" aria-hidden="true" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-3 pb-3">
        <p className="px-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
          Recent Chats
        </p>
        <nav className="flex flex-col gap-0.5" aria-label="Recent chats">
          {conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              active={conversation.id === activeConversationId}
              onSelect={() => selectConversation(conversation.id)}
            />
          ))}
        </nav>
      </div>

      <div className="border-t border-border p-3">
        <button
          type="button"
          title="Settings — coming soon"
          disabled
          className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium text-ink-faint disabled:cursor-not-allowed"
        >
          <Settings className="h-4 w-4" aria-hidden="true" />
          Settings
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { sidebarOpen, closeSidebar } = useApp();

  // Close the mobile drawer on Escape.
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSidebar();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen, closeSidebar]);

  return (
    <>
      {/* Desktop: static column */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile / tablet: drawer */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden",
          sidebarOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!sidebarOpen}
      >
        <div
          onClick={closeSidebar}
          className={cn(
            "absolute inset-0 bg-ink/30 transition-opacity duration-200",
            sidebarOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Sidebar"
          className={cn(
            "absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-surface shadow-xl transition-transform duration-200",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
            <span className="text-sm font-semibold text-ink">Menu</span>
            <button
              type="button"
              onClick={closeSidebar}
              aria-label="Close menu"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-muted hover:bg-surface-muted"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <SidebarContent />
        </div>
      </div>
    </>
  );
}
