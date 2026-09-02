# MSINGI — MASTER PRODUCT & TECHNICAL SPECIFICATION

**Version:** 1.0
**Status:** Hackathon Build
**Product:** Msingi
**Primary User:** Grade 10 Teacher
**Development Team:** 5 Developers

---

# 1. Executive Summary

## What is Msingi?

**Msingi is an AI teaching co-pilot for teachers.**

It helps a teacher who is unfamiliar with a Grade 10 topic quickly:

* understand the topic
* prepare how to teach it
* create simple explanations
* generate examples
* generate classroom questions
* identify common misconceptions

The system is designed for environments where internet access and teaching resources may be unreliable.

The development strategy is:

```text
PHASE 1
Local Text AI
        ↓
PHASE 2
Local Voice
        ↓
PHASE 3
Fully Offline
```

The first version uses:

```text
Frontend
   ↓
FastAPI
   ↓
LangChain
   ↓
Ollama
   ↓
Local LLM
```

When internet connectivity is available, Claude can be used as an alternative model provider.

The final vision is for the entire system to run inside a school on a local server, allowing teachers to use Msingi even when the school has no internet.

---

# 2. The Problem

## The real problem

Kenya has a teacher-capacity problem.

A teacher may be assigned a topic they are not comfortable teaching.

This becomes worse when the school has:

* few teachers
* limited subject specialists
* no textbook
* limited preparation materials
* unreliable internet
* no reliable way to search for resources during preparation

The teacher still has to walk into the classroom and teach.

The problem is therefore not simply:

> "There aren't enough teachers."

It is also:

> **"The teachers we have need more support to teach effectively across the curriculum."**

---

# 3. The Specific Pain Point

We are NOT trying to solve every education problem.

Our initial pain point is:

> **A teacher has to teach an unfamiliar Grade 10 topic and needs to become prepared quickly.**

This is the problem the MVP must solve.

---

# 4. The User

## Primary user

A Grade 10 teacher.

The teacher is the only person who needs an account or interaction with Msingi in the MVP.

## Students

Students do not log into Msingi.

The system does not need:

* student accounts
* student names
* student profiles
* student submissions
* student performance records

Msingi is a **teacher tool**, not a student learning platform.

---

# 5. Product Promise

Msingi should help a teacher move from:

> "I don't know this well enough to teach it."

to:

> **"I understand it and I know how I can teach it."**

---

# 6. What Msingi Does

Msingi provides four core capabilities.

## 6.1 Explain

The teacher can ask:

> "Explain this topic to me."

Msingi provides a clear explanation.

---

## 6.2 Prepare

The teacher can ask:

> "Help me prepare this lesson."

Msingi can provide:

* lesson objectives
* introduction
* teaching sequence
* explanations
* examples
* activities
* checks for understanding

---

## 6.3 Generate Examples

The teacher can ask:

> "Give me a simple example I can use in class."

Msingi provides an appropriate example.

---

## 6.4 Generate Questions

The teacher can ask:

> "Give me questions I can ask my class."

Msingi generates classroom questions.

---

# 7. What Msingi Does NOT Do

This is extremely important.

Msingi is NOT:

* a student LMS
* a student chatbot
* an attendance system
* a grading system
* a school management system
* a marketplace
* a payment platform
* a teacher replacement
* a general-purpose ChatGPT clone

Do not build these during the hackathon.

---

# 8. The User Journey

The entire product can be understood through one teacher story.

## Step 1 — The teacher gets an unfamiliar topic

For example:

> "You need to teach photosynthesis tomorrow."

The teacher does not feel fully prepared.

---

## Step 2 — Teacher opens Msingi

The teacher sees a simple interface.

They select:

```text
Grade: 10
Subject: Biology
Topic: Photosynthesis
```

---

## Step 3 — Msingi establishes context

Msingi now knows:

```text
Grade = 10
Subject = Biology
Topic = Photosynthesis
```

This context is attached to the conversation.

---

## Step 4 — Teacher asks for help

Teacher:

> "Explain photosynthesis to me."

Msingi responds.

---

## Step 5 — Teacher asks a follow-up

Teacher:

> "How should I introduce this to my class?"

Msingi understands that "this" refers to photosynthesis.

It provides a suggested introduction.

---

## Step 6 — Teacher asks for an example

Teacher:

> "Give me a simple example."

Msingi provides an example appropriate for Grade 10.

---

## Step 7 — Teacher asks for questions

Teacher:

> "Give me five questions I can ask my class."

Msingi generates questions.

---

## Step 8 — Teacher is ready

The teacher now has:

* understanding
* an explanation
* an introduction
* examples
* questions

Msingi has not taught the class.

**The teacher has.**

---

# 9. Product Interface

The existing UI is a ChatGPT-style dashboard.

We should keep it simple.

```text
┌────────────────────────────────────────────────────┐
│ MSINGI                              Grade 10       │
├────────────────┬───────────────────────────────────┤
│                │                                   │
│ + New Chat     │       Welcome to Msingi           │
│                │                                   │
│ Recent Chats   │       What are you teaching?      │
│                │                                   │
│ Biology        │   ┌───────────────────────────┐   │
│ Mathematics    │   │ Ask Msingi...             │   │
│ Chemistry      │   └───────────────────────────┘   │
│                │                                   │
│                │  [Explain] [Prepare] [Questions] │
│                │                                   │
└────────────────┴───────────────────────────────────┘
```

---

# 10. Technology Stack

## Frontend

```text
React
TypeScript
Vite
Tailwind CSS
```

The team already has a dashboard UI.

**Reuse it.**

Do not spend hackathon time rebuilding the interface.

---

## Backend

```text
Python
FastAPI
Pydantic
Uvicorn
```

The backend is responsible for:

* API endpoints
* conversations
* AI requests
* curriculum retrieval
* model selection
* persistence

---

## AI Orchestration

```text
LangChain
```

LangChain sits between the application and the model providers.

---

## Local Model Runtime

```text
Ollama
```

Ollama runs the local LLM.

---

## Cloud Model

```text
Claude
```

Claude is an optional online model provider.

---

## Database

```text
SQLite
```

Use SQLite initially because it is simple and local.

---

# 11. High-Level Architecture

The system should look like this:

```text
                    MSINGI

                       │
                       ▼

                React Frontend
                       │
                       │ HTTP
                       ▼
                 FastAPI Backend
                       │
                       ▼
                  AI Service
                       │
                       ▼
                   LangChain
                       │
                ┌──────┴──────┐
                │             │
                ▼             ▼
             Ollama         Claude
                │             │
                ▼             ▼
           Local LLM       Cloud LLM
```

The frontend must never directly call Ollama or Claude.

---

# 12. Why LangChain?

LangChain provides the abstraction layer for the AI pipeline.

Without abstraction:

```text
Frontend → Ollama
Frontend → Claude
```

This creates tight coupling.

Instead:

```text
Frontend
   ↓
Backend
   ↓
AI Service
   ↓
LangChain
   ↓
Provider
```

This means we can change the model without rewriting the product.

---

# 13. Local vs Online

Msingi has two model providers.

## Local

```text
FastAPI
   ↓
LangChain
   ↓
Ollama
   ↓
Local LLM
```

No internet is required.

---

## Online

```text
FastAPI
   ↓
LangChain
   ↓
Claude API
```

Internet is required.

---

# 14. Important Architecture Principle

**Online and offline are not separate products.**

They are different model/deployment modes.

The application should provide the same interface regardless of model.

```text
                 MSINGI
                    │
                AI Service
                    │
                LangChain
                    │
          ┌─────────┴─────────┐
          │                   │
       LOCAL                ONLINE
          │                   │
       Ollama               Claude
          │                   │
      Local LLM           Cloud LLM
```

---

# 15. Curriculum Grounding

Msingi should not simply behave like a generic chatbot.

It should be grounded in the curriculum content provided to the system.

The intended architecture is:

```text
Curriculum Documents
        ↓
Document Processing
        ↓
Chunking
        ↓
Embeddings
        ↓
Local Vector Store
        ↓
Retriever
        ↓
LangChain
        ↓
LLM
```

Possible vector stores:

```text
Chroma
FAISS
```

For the hackathon, choose the simplest reliable option.

---

# 16. Why Curriculum Grounding Matters

If a teacher asks:

> "What should I teach for this Grade 10 topic?"

We want the answer to be based on the curriculum material we provide.

The model should not confidently invent curriculum requirements.

The system should prioritize:

1. curriculum content
2. approved resources supplied to the system
3. general model knowledge when appropriate

---

# 17. AI Response Behavior

Msingi should behave like an experienced teaching assistant.

It should:

* explain clearly
* stay relevant to the selected grade
* use practical examples
* help structure lessons
* generate classroom questions
* highlight misconceptions
* help the teacher think through the topic

It should avoid:

* unnecessarily complicated explanations
* unsupported curriculum claims
* pretending to know something it does not know
* replacing the teacher's judgment

---

# 18. Response Format

Where appropriate, responses should use a structure such as:

```text
### Simple Explanation

...

### How to Teach It

1. ...
2. ...
3. ...

### Example

...

### Check Understanding

1. ...
2. ...
3. ...
```

The goal is **practical usefulness**, not maximum response length.

---

# 19. Conversation Context

Msingi needs basic conversation memory.

Example:

Teacher:

> Explain photosynthesis.

Then:

> Give me a simpler example.

Then:

> How should I introduce it?

Msingi must understand that "it" refers to photosynthesis.

Conversation context should be maintained for the current conversation.

---

# 20. Initial API

The backend should expose:

```text
GET  /api/health

GET  /api/grades

GET  /api/subjects

GET  /api/topics

POST /api/chat

POST /api/conversations

GET  /api/conversations

GET  /api/conversations/{id}

DELETE /api/conversations/{id}
```

---

# 21. Chat Request

Example:

```json
{
  "conversation_id": "abc123",
  "message": "How should I teach this topic?",
  "grade": "Grade 10",
  "subject": "Biology",
  "topic": "Photosynthesis"
}
```

---

# 22. Chat Response

Example:

```json
{
  "conversation_id": "abc123",
  "message": {
    "role": "assistant",
    "content": "..."
  },
  "sources": []
}
```

The `sources` field should eventually contain curriculum references.

---

# 23. Database

Initial entities:

```text
Conversation
Message
CurriculumDocument
CurriculumChunk
```

Potential relationship:

```text
Conversation
    │
    └── Messages

CurriculumDocument
    │
    └── CurriculumChunks
```

Do NOT create:

```text
Student
Learner
Attendance
Grades
Payments
```

unless the product scope changes later.

---

# 24. Phase 1 — Local Text

This is the first milestone.

## Goal

A teacher can use Msingi through text while the AI runs locally.

Architecture:

```text
React
  ↓
FastAPI
  ↓
LangChain
  ↓
Ollama
  ↓
Local LLM
```

## Definition of Done

A teacher can:

* open Msingi
* select Grade 10
* select a subject
* select a topic
* ask a question
* receive a local AI response
* ask follow-up questions
* maintain conversation context

---

# 25. Phase 2 — Local Voice

After Phase 1 works, add voice.

Architecture:

```text
Teacher
   ↓
Microphone
   ↓
Local STT
   ↓
Text
   ↓
LangChain
   ↓
Ollama
   ↓
Text
   ↓
Local TTS
   ↓
Speaker
```

The existing text AI pipeline does not change.

Voice is simply another input/output layer.

---

# 26. Phase 3 — Fully Offline

The final system should run without internet.

Architecture:

```text
                 SCHOOL NETWORK

Teacher Browser
       │
       ▼
┌─────────────────────────────┐
│       MSINGI SERVER         │
│                             │
│ Frontend                    │
│ Backend                     │
│ LangChain                   │
│ Ollama                      │
│ Local LLM                   │
│ Curriculum                  │
│ SQLite                      │
│ Local STT                   │
│ Local TTS                   │
└─────────────────────────────┘
```

The teacher only needs a browser.

---

# 27. School Server Model

One reasonably powerful school computer can act as the Msingi server.

For example:

```text
i7
16 GB RAM
```

The server runs:

```text
Ollama
FastAPI
Msingi
Curriculum
Database
```

Teacher computers connect over the school's local network.

They do not need to run the LLM themselves.

---

# 28. Network Model

Eventually:

```text
Teacher Laptop
       │
       │
       ▼
School Wi-Fi/LAN
       │
       ▼
Msingi Server
       │
       ▼
Local LLM
```

Internet:

```text
NOT REQUIRED
```

The school can therefore continue using Msingi even if external connectivity disappears.

---

# 29. Voice Technology

Voice is Phase 2.

We need three components:

```text
STT
Speech → Text

LLM
Text → Response

TTS
Text → Speech
```

For the final offline version:

```text
Local STT
+
Ollama
+
Local TTS
```

The exact STT/TTS model should be selected after benchmarking on the team's available hardware.

Do not commit the entire architecture to a voice technology before testing it.

---

# 30. Security

Required:

* API keys must stay on the backend.
* Claude credentials must never be exposed to the frontend.
* Ollama should only be accessible where intended.
* Validate API inputs.
* Do not collect learner PII.
* Minimize stored information.
* Do not expose unnecessary administration endpoints.

---

# 31. Five-Developer Team Structure

With five developers, divide the work by system boundary.

## Developer 1 — Frontend

Own:

```text
frontend/
```

Responsibilities:

* existing dashboard
* chat interface
* grade selector
* subject selector
* topic selector
* suggested prompts
* loading states
* errors
* conversation UI
* API integration

---

## Developer 2 — Backend/API

Own:

```text
backend/api/
backend/models/
```

Responsibilities:

* FastAPI
* API endpoints
* request validation
* conversation APIs
* database integration
* error handling

---

## Developer 3 — AI/LLM

Own:

```text
backend/ai/
```

Responsibilities:

* LangChain
* Ollama
* Claude integration
* AI provider abstraction
* prompts
* model configuration
* conversation context

Core interface:

```text
AIService
    ↓
LangChain
    ↓
Provider
```

---

## Developer 4 — Curriculum/RAG

Own:

```text
curriculum/
backend/retrieval/
```

Responsibilities:

* curriculum documents
* document processing
* chunking
* embeddings
* vector store
* retrieval
* source references

Keep this simple.

Do not spend the entire hackathon building sophisticated RAG.

---

## Developer 5 — Integration/Infrastructure

Own:

```text
docker/
scripts/
deployment/
tests/
```

Responsibilities:

* Ollama setup
* environment configuration
* local development setup
* Docker if useful
* integration
* testing
* demo environment
* eventual school-server deployment

Developer 5 should also act as the **integration owner**.

---

# 32. Team Workflow

Everyone works against the same API contracts.

Frontend should not wait for the AI to be finished.

Backend should not wait for the frontend.

Use mocked responses initially.

Example:

```text
Frontend
    ↓
Mock API
```

while backend is being built.

Then:

```text
Frontend
    ↓
Real API
```

---

# 33. Git Workflow

Recommended:

```text
main
  │
  ├── feature/frontend-chat
  ├── feature/backend-api
  ├── feature/ai-ollama
  ├── feature/curriculum-rag
  └── feature/infrastructure
```

Rules:

* Small commits
* Clear commit messages
* Pull requests
* Do not modify another developer's area unnecessarily
* Keep `main` working

---

# 34. Repository Structure

Recommended:

```text
msingi/
│
├── CLAUDE.md
├── README.md
├── SPEC.md
├── .env.example
├── .gitignore
│
├── docs/
│   ├── PROBLEM.md
│   ├── PRODUCT.md
│   ├── USER-JOURNEY.md
│   ├── ARCHITECTURE.md
│   ├── AI.md
│   ├── CURRICULUM.md
│   ├── VOICE.md
│   └── DEPLOYMENT.md
│
├── frontend/
│
├── backend/
│   ├── api/
│   ├── ai/
│   ├── retrieval/
│   ├── models/
│   ├── database/
│   └── main.py
│
├── curriculum/
│
├── scripts/
│
└── tests/
```

---

# 35. Environment Configuration

Example:

```text
APP_ENV=development

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=<local-model>

ANTHROPIC_API_KEY=<optional>

DATABASE_URL=sqlite:///./msingi.db
```

Important:

```text
ANTHROPIC_API_KEY
```

must be optional.

Local Msingi must work without it.

---

# 36. Hackathon Build Order

Do not build randomly.

Follow this order.

## Step 1

Get frontend running.

## Step 2

Get FastAPI running.

## Step 3

Connect frontend → FastAPI.

## Step 4

Connect FastAPI → LangChain.

## Step 5

Connect LangChain → Ollama.

## Step 6

Get basic local chat working.

## Step 7

Add Grade/Subject/Topic context.

## Step 8

Add curriculum retrieval.

## Step 9

Add conversation context.

## Step 10

Polish the demo.

## Step 11

Only then add voice.

## Step 12

Finally test offline deployment.

---

# 37. What To Do If Time Runs Out

The priority order is:

```text
1. Working local chat
2. Teacher workflow
3. Curriculum grounding
4. Conversation context
5. Voice
6. Offline network demo
7. UI polish
```

If necessary, cut:

* animations
* fancy transitions
* advanced dashboard features
* complicated RAG
* advanced voice UX
* unnecessary database features

Do NOT cut:

* local LLM
* working chat
* teacher workflow
* curriculum grounding
* the local architecture

---

# 38. The Hackathon Demo

The demo should tell a story, not explain code.

## Opening

"Tomorrow, this teacher has to teach a topic she isn't confident about."

---

## Demo

Teacher opens Msingi.

Selects:

```text
Grade 10
Biology
Photosynthesis
```

Teacher asks:

> "Explain this topic to me."

Msingi responds.

Teacher asks:

> "How should I teach this?"

Msingi responds.

Teacher asks:

> "Give me a simple example."

Msingi responds.

Teacher asks:

> "Give me five questions for my class."

Msingi responds.

---

# 39. Voice Demo

If Phase 2 is ready:

Teacher presses microphone.

Teacher asks:

> "How can I explain this more simply?"

Msingi transcribes and responds.

---

# 40. Offline Demo

This is the strongest moment.

Show that the system is currently connected.

Then:

**Disconnect the internet.**

Ask another question.

Msingi still works.

Explain:

> "The AI is running locally on the school's own server."

This demonstrates the long-term vision.

---

# 41. The Technical Story

The judges should understand:

```text
Claude
  ↓
Online capability

Ollama
  ↓
Local capability

LangChain
  ↓
Common AI orchestration

Local curriculum
  ↓
Grounded educational responses

Local server
  ↓
School-level offline deployment
```

---

# 42. The Product Story

The judges should understand:

```text
Teacher has unfamiliar topic
            ↓
       Msingi helps
            ↓
      Teacher prepares
            ↓
       Teacher teaches
```

The technology supports this story.

It is not the story itself.

---

# 43. Core Differentiator

Do not pitch Msingi as:

> "We built an AI chatbot."

There are thousands of those.

Pitch it as:

> **"We are building teaching capacity where connectivity and specialist support are limited."**

And eventually:

> **"Msingi brings an AI teaching co-pilot into the school itself, so unreliable internet doesn't have to mean unreliable access to teaching support."**

---

# 44. Final Product Definition

## One sentence

> **Msingi is a local-first AI teaching co-pilot that helps Grade 10 teachers understand and prepare unfamiliar topics, with a path to voice and fully offline school deployment.**

## One problem

> Teachers may be expected to teach topics without enough preparation, resources, specialist support or reliable connectivity.

## One solution

> Give the teacher an AI teaching co-pilot that can eventually run locally inside the school.

## One user

> The teacher.

## One core workflow

```text
Topic
 ↓
Understand
 ↓
Prepare
 ↓
Teach
```

## One technical strategy

```text
LangChain
    ↓
Ollama → Local
Claude → Online
```

## One long-term vision

```text
AI teaching support
        ↓
available locally
        ↓
available offline
        ↓
available to every teacher
```

---

# 45. Non-Negotiable Principles

### Principle 1 — Teacher First

Build for the teacher, not for the technology.

### Principle 2 — Local First

The architecture must allow local AI from the beginning.

### Principle 3 — Offline Eventually

The final architecture must not depend on internet connectivity.

### Principle 4 — Curriculum Grounded

Educational responses should be grounded in supplied curriculum material.

### Principle 5 — No Learner Data

The MVP does not need learner identities or learner records.

### Principle 6 — Simple

Do not over-engineer a four-hour hackathon.

### Principle 7 — One Working Story

A small working product is better than ten incomplete features.

### Principle 8 — Teacher Remains in Control

Msingi assists the teacher.

It does not replace the teacher.

---

# 46. Definition of Done

Msingi's first meaningful milestone is complete when this works:

```text
Teacher
   ↓
Browser
   ↓
Msingi
   ↓
Select Grade 10
   ↓
Select Subject
   ↓
Select Topic
   ↓
Ask Question
   ↓
FastAPI
   ↓
LangChain
   ↓
Ollama
   ↓
Local LLM
   ↓
Useful Answer
   ↓
Teacher asks follow-up
   ↓
Context is maintained
```

The second milestone adds:

```text
Voice
 ↓
Local STT
 ↓
Existing AI pipeline
 ↓
Local TTS
```

The final milestone proves:

```text
INTERNET OFF

Msingi
  ↓
STILL WORKS
```

---

# 47. The Final Question We Must Answer

Every technical decision should ultimately serve this question:

> **Can a teacher who is not confident about tomorrow's topic become better prepared using Msingi—even when the school's internet is unreliable or unavailable?**

If the answer is yes, we are building the right thing.

If a feature does not help answer that question, it probably does not belong in the hackathon MVP.
