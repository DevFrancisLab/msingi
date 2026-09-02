# Msingi — Teacher Dashboard

The teacher-facing UI for Msingi: an AI teaching co-pilot for Grade 10
teachers. React + TypeScript + Vite + Tailwind CSS. See `../SPEC.md` for the
full product spec and `../docs/RUNNING.md` for the backend.

## Workflow the UI supports

```
Select Grade → Select Subject → Select Topic → Ask Msingi → Understand → Prepare → Teach
```

The main surface is a chat workspace, not an LMS: no student accounts, no
analytics, no attendance. Grade/Subject/Topic set the teaching context sent
with each chat request; the conversation itself is the product.

## Run it

```bash
npm install
npm run dev
```

Runs on `http://localhost:5173`. API calls to `/api/*` are proxied to the
FastAPI backend at `http://localhost:8000` (see `vite.config.ts`) — start the
backend per `../docs/RUNNING.md` for a live connection. Without a running
backend, the UI still renders fully: the connection pill shows **Offline**
and the sidebar/context selectors fall back to placeholder data.

Other scripts:

```bash
npm run build     # type-check + production build
npm run lint       # oxlint
npm run preview    # preview the production build
```

## Layout

```
src/
  components/
    ui/            small generic primitives (Select)
    dashboard/      Header, Sidebar, ContextBar, ChatWorkspace, ChatArea,
                    EmptyState, MessageList, UserMessage, AssistantMessage,
                    SourceList, Composer, SuggestedActions,
                    ConnectionStatus, VoiceButton, Logo, Dashboard
  context/
    AppContext.tsx  teaching context, active conversation, connection state
  hooks/
    useChat.ts             message send/retry lifecycle for one conversation
    useConversations.ts    sidebar conversation list (+ demo fallback)
    useReferenceData.ts    grade/subject/topic lists (+ demo fallback)
    useConnectionStatus.ts polls /api/health
  lib/
    api.ts          typed client for the FastAPI backend
    demoData.ts      placeholder data used only when the backend has
                     nothing yet, or is unreachable
    utils.ts        cn(), relative-time and source-label formatting
  types/            shared domain types (camelCase; api.ts maps to/from
                    the backend's snake_case schemas)
```

## Notes

- Voice input is UI-only (disabled mic buttons with a "coming soon" label) —
  no fake transcription. See SPEC.md Phase 2.
- Curriculum sources shown under an answer always come from the API
  response (`ChatResponse.sources`); the UI never invents them.
- State is plain React context + hooks — no Redux/Zustand; the app doesn't
  need it yet.
