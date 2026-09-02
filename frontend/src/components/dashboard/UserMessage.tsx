import type { ChatMessageData } from "@/types";

export function UserMessage({ message }: { message: ChatMessageData }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-3 sm:px-6">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">
        Teacher
      </p>
      <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-ink">
        {message.content}
      </p>
    </div>
  );
}
