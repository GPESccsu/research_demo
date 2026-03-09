# SciFlow Frontend

SciFlow 前端基于 **React + Vite**，提供研究工作流界面（选题、知识库、实验设计、写作助手、自查清单等）。

## 目录说明

- `src/App.jsx`：应用壳层与路由式模块切换
- `src/pages/`：已拆分页面（如 `SettingsPage`、`WritingPage`）
- `src/components/writing/`：写作子模块组件
- `src/services/`：AI 请求与 API 客户端
- `src/prompts/`：前端提示词资源

> 后端说明见：`backend/README.md`

## 启动前端

```bash
cd my-app
npm install
npm run dev
```

默认地址：`http://localhost:5173`

## 构建

```bash
npm run build
npm run preview
```

## 与后端联动

前端默认通过 `src/services/apiClient.js` 请求后端 `http://127.0.0.1:8000`。
请先启动后端（见 `backend/README.md`），再启动前端。

## 一键启动（Windows）

在 `my-app` 目录执行：

```bat
start_all.bat
```

该脚本会并行启动后端与前端开发服务。
