# SciFlow（前后端联调版）

SciFlow 是一个面向科研写作与实验分析的本地工具，前端基于 **React + Vite**，后端基于 **FastAPI**，支持云端模型与本地 Ollama 模型。

---

## 1. 项目结构

- `src/`：前端页面、组件、AI 调用服务
- `backend/`：后端 API、提示词模板、任务路由
- `backend/app/services/prompt_loader.py`：后端提示词 key -> 文件映射
- `backend/app/prompts/`：后端实际生效的提示词模板（前端只传 key）

> 重要：前端 `src/prompts/` 中的 markdown 主要用于前端资源管理；**真正用于 AI 请求的系统提示词由后端 `backend/app/prompts/` 加载**。

---

## 2. 快速启动

### 2.1 启动后端（先启动）

```bash
cd my-app/backend
pip install -r requirements.txt
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

后端健康检查：

```bash
curl http://127.0.0.1:8000/api/health
```

### 2.2 启动前端

```bash
cd my-app
npm install
npm run dev
```

默认前端地址：`http://localhost:5173`

如需显式指定后端地址，可在 `my-app/.env` 设置：

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
```

---

## 3. 前后端连接说明（已修订）

### 3.1 AI 调用链路

1. 前端通过 `src/services/aiService.js` 调用：
   - `POST /api/ai/call`
   - `POST /api/ai/chat`
2. 后端在 `backend/app.py` 中：
   - 按 `promptKey` 加载提示词
   - 根据 provider 路由到 OpenAI / Anthropic / Ollama

### 3.2 Prompt 连接规则

- 前端传入 key（例如 `paper_summary`、`experiment_diagnosis`）
- 后端 `prompt_loader.py` 负责把 key 映射到 `backend/app/prompts/*.md`
- 若 key 不存在，后端返回 400，前端现在会显示明确错误（不再静默失败）

### 3.3 本地 Ollama 连接（重点）

- 现在前端的模型列表获取改为走后端代理接口：`GET /api/ollama/models`
  - 避免浏览器直连 Ollama 的跨域问题
- 后端调用 Ollama 时：
  - 优先使用 `/v1/chat/completions`
  - 若返回 404，自动降级到 `/api/chat`（兼容不同 Ollama 版本）

---

## 4. 常见问题排查

### 4.1 “Prompts 没连上 / Unknown prompt key”

检查：

- 前端传入的 key 是否在 `src/prompts/index.js` 中定义
- 后端 `backend/app/services/prompt_loader.py` 的 `FILE_PROMPTS` 或 `INLINE_PROMPTS` 是否存在对应项
- 对应的 `backend/app/prompts/*.md` 文件是否存在

### 4.2 “本地模型调用失败”

依次检查：

1. Ollama 是否运行：
   ```bash
   ollama list
   ```
2. 设置页中的 Ollama URL 是否正确（默认 `http://localhost:11434`）
3. 模型是否已下载（如 `qwen2.5:7b`）：
   ```bash
   ollama pull qwen2.5:7b
   ```
4. 后端日志是否有 404/连接错误（现在会自动尝试 `/api/chat` 兜底）

### 4.3 “测试连接失败但没报错细节”

已修复：前端 API 客户端会读取后端 `detail` 字段并抛出可读错误，便于定位配置问题。

---

## 5. 一键启动（Windows）

在 `my-app` 目录执行：

```bat
start_all.bat
```

该脚本会并行启动后端与前端开发服务。
