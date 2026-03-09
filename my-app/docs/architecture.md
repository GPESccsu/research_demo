# SciFlow 架构说明

## 总览

项目采用前后端分离：

- **Frontend（React + Vite）**：交互界面、状态管理、浏览器本地存储。
- **Backend（FastAPI）**：统一 AI 任务路由、任务执行与提示词管理。

## 前端架构

### 分层

1. **App Shell (`src/App.jsx`)**
   - 负责导航、模块切换、全局布局。
2. **Pages (`src/pages`)**
   - 负责特定业务页面（如设置页、写作页）。
3. **Components (`src/components`)**
   - 负责可复用 UI/交互组件。
4. **Services (`src/services`)**
   - 对外部 API（后端/模型）进行封装。
5. **Data (`src/db.js`)**
   - 前端本地数据持久化（IndexedDB/localStorage）。

## 后端架构

### 请求流

1. `app.py` 启动 FastAPI 应用。
2. `app/api/routes/tasks.py` 接收任务请求。
3. `app/services/task_runner.py` 分发至 `app/tasks/*`。
4. `app/services/prompt_loader.py` 读取 `app/prompts/*` 模板。
5. 返回标准化结果给前端。

## 关键设计点

- **提示词前后端对齐**：前端用于交互，后端用于任务执行，便于后续统一管理。
- **模块化拆分**：从单文件页面逐步迁移到 pages/components/services。
- **可替换 AI Provider**：前端配置 provider，后端统一执行任务。

## 运行关系

- 前端开发服务：`http://localhost:5173`
- 后端服务：`http://127.0.0.1:8000`
- `start_all.bat`：在 Windows 上一键并行拉起两端服务。
