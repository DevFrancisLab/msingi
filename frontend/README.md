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

Runs on `http://localhost:5173` and calls the FastAPI backend directly at
`http://localhost:8000` (see `src/api/client.ts`, `VITE_API_BASE_URL` in
`.env.example`) — start the backend per `../docs/RUNNING.md` for a live
connection. The backend allows the `:5173` origin by default via CORS
(`backend/app/core/config.py:cors_origins`, `.env`'s `CORS_ORIGINS`); add your
frontend's origin there if you serve it from somewhere else. Without a
running backend, the UI still renders fully: the connection pill shows
**Offline** and the sidebar/context selectors fall back to placeholder data.

Other scripts:

```bash
npm run build     # type-check + production build
npm run lint       # oxlint
npm run preview    # preview the production build
```

## Layout

```
src/
  api/              centralized API layer — the ONLY place fetch() is called
    client.ts       base URL + fetch wrapper + ApiError (backend-detail-safe messages)
    curriculum.ts   GET /api/health, /grades, /subjects, /topics
    chat.ts         POST /api/chat
    conversations.ts GET/POST /api/conversations, GET/DELETE /api/conversations/{id}
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
    useReferenceData.ts    grade/subject lists (+ demo fallback)
    useTopics.ts            topics for the selected subject, fetched lazily
                            (+ demo fallback)
    useConnectionStatus.ts polls /api/health
  lib/
    demoData.ts      placeholder data used only when the backend has
                     nothing yet, or is unreachable
    utils.ts        cn(), relative-time and source-label formatting
  types/            shared domain types (camelCase; api/*.ts maps to/from
                    the backend's snake_case schemas)
```

## Notes

- Voice input is UI-only (disabled mic buttons with a "coming soon" label) —
  no fake transcription. See SPEC.md Phase 2.
- Curriculum sources shown under an answer always come from the API
  response (`ChatResponse.sources`); the UI never invents them, and the
  section doesn't render at all when the array is empty.
- State is plain React context + hooks — no Redux/Zustand; the app doesn't
  need it yet.
- `api/client.ts` maps every backend error to a teacher-safe message (never
  raw Python exception text, internal URLs, or stack traces) and logs the
  real detail to the console for developers.
- Topics are genuinely scoped by subject: `GET /api/topics?subject=...`
  (backend/app/api/routes.py → reference.py → retriever.py, a Chroma
  metadata `where` filter), not a client-side fake. The Topic selector stays
  disabled until a Subject is chosen and useTopics fetches nothing before
  that. `/api/subjects` itself isn't scoped by grade — the backend only has
  one grade (Grade 10) right now, so there's nothing to scope it by yet.
- Only `VITE_*` variables belong in frontend env config, and only
  non-secret ones (e.g. `VITE_API_BASE_URL`). `ANTHROPIC_API_KEY` and Ollama
  config live in the backend's `.env` and are never sent to the browser.
