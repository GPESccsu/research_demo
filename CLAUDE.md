# CLAUDE.md — SciFlow Research Assistant

This file documents the codebase structure, conventions, and development workflows for AI assistants working in this repository.

---

## Project Overview

**SciFlow** is a browser-based AI-powered research assistant with 7 integrated workflow modules:

1. **Topic Discovery** — AI-assisted keyword expansion and literature search
2. **Knowledge Base** — Paper management, tagging, and full-text search
3. **Reading** — PDF viewer, quick clip extraction, clip library with folders
4. **Experiment Design** — AI-assisted experiment planning and diagnosis
5. **Writing** — Structured writing with AI panel and sentence comparison
6. **Checklist** — Research task tracking
7. **Lab Log** — Timestamped notes and experiment records

The app runs entirely in the browser (React + IndexedDB) with an optional local FastAPI backend that proxies AI calls (required for providers with CORS restrictions).

---

## Repository Layout

```
research_demo/
├── CLAUDE.md                          # This file
├── my-app/                            # Main application (primary work location)
│   ├── src/                           # React frontend source
│   │   ├── App.jsx                    # Main app shell, state, navigation (1329 lines)
│   │   ├── main.jsx                   # React entry point
│   │   ├── db.js                      # IndexedDB + localStorage abstraction
│   │   ├── App.css & index.css        # Global styles
│   │   ├── components/
│   │   │   ├── ReadingPageNew.jsx     # Reading & clip management UI
│   │   │   └── writing/
│   │   │       ├── WritingOutline.jsx
│   │   │       ├── WritingEditor.jsx
│   │   │       ├── WritingAIPanel.jsx
│   │   │       └── SentenceCompareAssistant.jsx
│   │   ├── pages/
│   │   │   ├── WritingPage.jsx        # Writing module (migrated from App.jsx)
│   │   │   └── SettingsPage.jsx       # AI provider config UI
│   │   ├── services/
│   │   │   ├── aiService.js           # Unified AI call interface (callAI, callAIJSON, callAIChat)
│   │   │   ├── promptService.js       # Provider definitions + DEFAULT_CONFIG
│   │   │   ├── apiClient.js           # Thin fetch() wrapper
│   │   │   └── ollamaService.js       # Ollama model discovery
│   │   ├── prompts/
│   │   │   ├── index.js               # Prompt registry (imports .md files via Vite ?raw)
│   │   │   ├── keyword_expander.md
│   │   │   ├── writing_assistant.md
│   │   │   ├── paper_summary.md
│   │   │   ├── sentence_compare.md
│   │   │   ├── experiment_diagnosis.md
│   │   │   ├── chat_assistant.md
│   │   │   ├── writing_qa.md
│   │   │   └── test_connection.md
│   │   └── api/
│   │       └── clips-api-doc.md       # Reading API contract docs
│   ├── backend/                       # Python FastAPI backend (optional)
│   │   ├── app.py                     # FastAPI app, routes, provider abstraction
│   │   ├── requirements.txt
│   │   ├── start_backend.bat          # Windows launcher
│   │   └── app/
│   │       ├── services/
│   │       │   └── prompt_loader.py   # Prompt file loader with LRU cache
│   │       └── prompts/               # Mirror of frontend prompts/ (markdown files)
│   ├── docs/
│   │   ├── architecture.md
│   │   ├── refactor_plan.md           # Ongoing modularization status
│   │   ├── global-search-guide.md
│   │   └── reading-materials-guide.md
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── start_all.bat                  # One-click Windows launcher (frontend + backend)
│   └── README.md
├── research-methodology-toolkit.jsx   # Legacy standalone component (do not edit)
├── research-toolkit.jsx               # Legacy standalone toolkit (do not edit)
├── 仓库全面分析总结.md                # Chinese analysis summary
└── my-app.zip                         # Archived snapshot (do not modify)
```

> **Working directory for all active development**: `my-app/`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 19 |
| Build tool | Vite 7 |
| Language | JavaScript (no TypeScript) |
| Browser storage | IndexedDB (`sciflow_db`, v3) + localStorage |
| HTTP client | Browser Fetch API via `apiClient.js` |
| Backend framework | FastAPI (Python, async) |
| Backend HTTP client | httpx (async) |
| Styling | CSS-in-JS (template literals in App.jsx) + CSS files |
| Linting | ESLint 9 (flat config) |

---

## Development Workflow

### Prerequisites

- Node.js (for frontend)
- Python with conda or pip (for backend)

### Frontend

```bash
cd my-app
npm install
npm run dev          # Vite dev server on http://localhost:5173
npm run build        # Production build → dist/
npm run lint         # ESLint check
npm run preview      # Preview production build locally
```

### Backend (optional)

```bash
cd my-app/backend
pip install -r requirements.txt
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

On Windows, `start_all.bat` launches both services simultaneously.

### Port Assignments

| Service | Port |
|---|---|
| Vite dev server | 5173 |
| FastAPI backend | 8000 |
| Ollama (local) | 11434 |

---

## AI Provider System

Providers are defined in `src/services/promptService.js` as `AI_PROVIDERS`. Each entry includes:

```js
{
  id: 'anthropic',
  name: 'Claude (Anthropic)',
  baseUrl: 'https://api.anthropic.com',
  requiresKey: true,
  models: [...],
  format: 'anthropic'   // 'anthropic' | 'openai'
}
```

Supported providers: **Anthropic**, **OpenAI**, **Ollama** (local), **Groq**, **Together AI**, **OpenRouter**, **SiliconFlow**.

### Making AI Calls

Use the service layer — never call provider APIs directly from components:

```js
import { callAI, callAIJSON, callAIChat } from '../services/aiService';
import { useContext } from 'react';
import { AIConfigContext } from '../App';

const aiConfig = useContext(AIConfigContext);

// Single-turn text
const result = await callAI(aiConfig, systemPrompt, userMessage);

// Expect JSON back
const data = await callAIJSON(aiConfig, systemPrompt, userMessage);

// Multi-turn conversation
const reply = await callAIChat(aiConfig, messages);  // messages = [{role, content}]
```

`callAI` / `callAIChat` automatically route through the backend proxy (`/api/ai/call`) or directly to the provider based on config.

---

## Database Layer

`src/db.js` wraps IndexedDB with async helpers. Database name: `sciflow_db` (version 3).

### Object Stores

| Store | Description |
|---|---|
| `papers` | Research papers metadata |
| `clips` | Extracted text clips from papers |
| `logs` | Lab log entries |
| `synonymGroups` | Keyword synonym groups for search |
| `checklistData` | Research task checklists |
| `writingDrafts` | Writing drafts and outlines |
| `chatHistory` | AI conversation history |
| `uiState` | Persisted UI state |
| `searchQueries` | Saved search queries |

### CRUD API

```js
import { dbGetAll, dbGet, dbPut, dbAdd, dbDelete, dbClear, dbBulkPut } from './db';

const papers = await dbGetAll('papers');
const paper = await dbGet('papers', id);
await dbPut('papers', { id, title, ... });
await dbAdd('clips', clip);
await dbDelete('papers', id);
await dbBulkPut('papers', arrayOfPapers);
```

localStorage stores small config items (e.g., AI provider settings).

---

## Prompt System

Prompts live in `src/prompts/` as markdown files and are imported with Vite's `?raw` plugin.

### Adding a Prompt

1. Create `src/prompts/my_feature.md` with the system prompt text.
2. Register it in `src/prompts/index.js`:
   ```js
   import myFeatureRaw from './my_feature.md?raw';
   export const PROMPTS = {
     // ...existing...
     MY_FEATURE: myFeatureRaw,
   };
   ```
3. Mirror the `.md` file in `my-app/backend/app/prompts/` for backend parity.
4. Register in `my-app/backend/app/services/prompt_loader.py` under `FILE_PROMPTS`.

---

## Naming Conventions

| Construct | Convention | Example |
|---|---|---|
| React components | PascalCase | `WritingPage`, `ReadingPageNew` |
| Functions | camelCase | `callAI`, `dbGetAll`, `buildPrompt` |
| Constants | UPPER_SNAKE_CASE | `DB_NAME`, `AI_PROVIDERS`, `PROMPTS` |
| CSS classes | kebab-case | `ai-badge`, `provider-card` |
| DB store names | camelCase | `papers`, `writingDrafts` |
| Files (components) | PascalCase.jsx | `WritingEditor.jsx` |
| Files (services/utils) | camelCase.js | `aiService.js`, `db.js` |

---

## Code Architecture Conventions

### Component Responsibilities

- **`App.jsx`** — Global shell only: layout, navigation, `AIConfigContext` provider, DB init. Avoid adding new module logic here; extract to `pages/` instead.
- **`pages/`** — One file per top-level module (e.g., `WritingPage.jsx`, `SettingsPage.jsx`). Module-level state lives here.
- **`components/`** — Reusable UI pieces. Props-driven, no direct DB access.
- **`services/`** — All side effects (AI calls, HTTP, local DB). Components call services; services do not call components.

### State Management

- React local state (`useState`, `useReducer`) for component-local state.
- React Context (`AIConfigContext`) for global AI configuration.
- No Redux, Zustand, or other state library is in use.
- Persistent data goes through `db.js` helpers.

### Styling

- Global CSS variables defined in `App.jsx` (dark theme): `--bg-deep`, `--accent-amber`, etc.
- Component styles as CSS-in-JS template literals in `App.jsx` (legacy pattern).
- New components may use separate `.css` files or inline `style` props.
- Do not introduce a CSS-in-JS library (styled-components, Emotion) without discussion.

### Error Handling

- Services use `try/catch`; surface errors to components via returned `null` or thrown Error.
- Backend: raise `HTTPException` with appropriate status codes.
- Never swallow errors silently.

---

## Backend Conventions (FastAPI)

- All routes live in `app.py` (no router splitting currently).
- Request bodies validated with Pydantic models (`AICallPayload`, `AIChatPayload`).
- The `call_provider()` helper handles both Anthropic-format and OpenAI-compatible APIs.
- CORS is fully open (`allow_origins=["*"]`) — acceptable for local dev; restrict for production.
- Request timeout: 90s; connection timeout: 20s.

---

## Refactoring Status

`docs/refactor_plan.md` tracks ongoing modularization. Current state:

- [x] `WritingPage.jsx` extracted from `App.jsx`
- [x] `SettingsPage.jsx` extracted from `App.jsx`
- [ ] Remaining App.jsx modules (reading, knowledge base, checklist, lab log) still inline
- [ ] No automated tests (future priority)
- [ ] No CI/CD pipeline

When splitting modules out of `App.jsx`, follow the `WritingPage` pattern: move state and render logic into `pages/MyModule.jsx`, keep only the sidebar nav and context setup in `App.jsx`.

---

## What Not to Touch

- `research-toolkit.jsx` and `research-methodology-toolkit.jsx` — legacy standalone files, not part of the active app.
- `my-app.zip` — archived snapshot, do not modify or unzip.
- Files in `src/backup/` or with encoded names — legacy/archived code.

---

## Testing

No automated tests currently exist. When adding tests:

- **Frontend**: Vitest (compatible with Vite) is the recommended choice.
- **Backend**: pytest with `httpx.AsyncClient` for FastAPI route testing.
- Place frontend tests in `src/__tests__/` or co-located `*.test.jsx` files.
- Place backend tests in `backend/tests/`.

---

## Common Tasks

### Add a New AI Provider

1. Add entry to `AI_PROVIDERS` in `src/services/promptService.js`.
2. Add provider URL mapping in `PROVIDERS` dict in `backend/app.py`.
3. Update `SettingsPage.jsx` if any special UI is needed.

### Add a New Research Module

1. Create `src/pages/MyModulePage.jsx`.
2. Add nav entry in the sidebar section of `App.jsx`.
3. Render `<MyModulePage />` in the appropriate routing branch in `App.jsx`.
4. Use `AIConfigContext` for AI config; `db.js` helpers for persistence.

### Modify a Prompt

Edit the corresponding `.md` file in `src/prompts/` **and** `backend/app/prompts/` (keep both in sync).

---

## Git Conventions

- Branch names follow: `claude/<description>-<session-id>` for AI-assisted branches.
- Commit messages use imperative mood: `fix: ...`, `feat: ...`, `docs: ...`, `refactor: ...`.
- Push with: `git push -u origin <branch-name>`.
