# SciFlow - AI-Powered Research Assistant

SciFlow (科研方法论工具箱) is a comprehensive, AI-powered research workflow management tool built with React + Vite. It guides researchers through the full lifecycle of academic research: from topic discovery and literature management to experiment design, academic writing, and self-review checklists.

## Features

### Research Modules

- **Topic Discovery** - AI-powered keyword expansion, synonym group building, and search query generation for Scopus/WoS/CNKI
- **Knowledge Base** - Literature management with grouping, tagging, citations tracking, and AI-powered paper analysis
- **Reading & Clips** - PDF reading interface with material extraction and categorized clip storage
- **Experiment Design** - Problem decomposition trees, AI diagnostics for experiment anomalies, and milestone tracking
- **Writing Assistant** - Structured academic writing with AI analysis for logic, evidence, and language quality
- **Self-Review Checklist** - Categorized quality checklist with progress tracking (format, logic, language, citations)
- **Lab Log** - Timeline-based experiment recording with auto-generated sample IDs

### AI Integration (Multi-Provider)

SciFlow supports **8 AI providers** out of the box:

| Provider | Type | Notes |
|----------|------|-------|
| **Anthropic Claude** | Commercial Cloud | Claude Sonnet 4, Haiku 4.5 |
| **OpenAI ChatGPT** | Commercial Cloud | GPT-4o, GPT-4o Mini, GPT-4 Turbo, GPT-3.5, o1-mini |
| **Ollama** | Local (Free) | Qwen, Llama, Mistral, DeepSeek, Gemma + custom models |
| **Groq** | Free Cloud | Ultra-fast inference, Llama 3.3 70B, Mixtral |
| **Together AI** | Free Cloud | Qwen 2.5 72B, DeepSeek R1, Llama 3.3 |
| **OpenRouter** | Free Cloud | Aggregated models, many free options |
| **SiliconFlow** | Free Cloud (China) | Qwen, GLM-4, DeepSeek - excellent for Chinese |

All providers use a unified API interface with connection testing, customizable temperature, max tokens, and system prompt prefix.

### Database & Persistence

All research data is automatically persisted in the browser:

- **IndexedDB** (large data): Papers, lab logs, reading clips, checklist progress, writing drafts, chat history, synonym groups
- **localStorage** (config): AI provider settings, API keys, model preferences

Data survives page refreshes and browser restarts. No server required.

## Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn

### Installation

```bash
cd my-app
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173/` (or next available port).

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
research_demo/
  my-app/                          # Main React application
    src/
      App.jsx                      # Main application (all modules, AI config, pages)
      db.js                        # Database layer (IndexedDB + localStorage)
      main.jsx                     # React entry point
      App.css                      # Base styles
      index.css                    # Global styles
    index.html                     # HTML entry
    package.json                   # Dependencies
    vite.config.js                 # Vite configuration
  research-methodology-toolkit.jsx # Standalone methodology toolkit component
  research-toolkit.jsx             # Full-featured research toolkit (dark academia theme)
```

## Architecture

### Database Layer (`src/db.js`)

The database module provides a clean async API:

```javascript
// Papers
await getPapers()           // Get all papers (returns null if empty)
await addPaper(paper)       // Add a new paper, returns auto-generated ID
await deletePaper(id)       // Delete by ID

// Lab Logs
await getLogs()             // Get all logs
await addLog(log)           // Add new experiment log

// Checklist
await getChecklist()        // Get checklist categories with items
await saveChecklist(data)   // Save updated checklist state

// Writing Drafts
await getDrafts()           // Get all drafts
await saveDraft(draft)      // Save/update a section draft

// Chat History
await getChatHistory()      // Get persisted chat messages
await saveChatMessage(msg)  // Append a message
await clearChatHistory()    // Clear all chat history

// AI Config
saveConfig(config)          // Save to localStorage
loadConfig(defaults)        // Load with fallback defaults
```

### AI Provider System

Each provider is defined with:
- Connection format (`anthropic` or `openai`-compatible)
- Model list with defaults
- API key requirements
- Base URL configuration

The universal `callAI()` function handles format differences transparently.

## Usage Guide

1. **Configure AI** - Go to "AI Config" in the sidebar to select your preferred AI provider and enter API key
2. **Add Literature** - Use the Knowledge Base to add papers manually or import from databases
3. **Topic Research** - Use the Topic Discovery module with AI keyword expansion
4. **Design Experiments** - Break down research questions into verifiable nodes
5. **Write Papers** - Use the Writing Assistant with AI analysis for each section
6. **Self-Review** - Run through the checklist before submission

## Tech Stack

- **React 19** - UI framework
- **Vite 7** - Build tool with HMR
- **IndexedDB** - Client-side structured storage
- **localStorage** - Configuration persistence
- **CSS-in-JS** - Embedded stylesheets with CSS variables

## License

MIT
