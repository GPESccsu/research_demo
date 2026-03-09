# SciFlow Backend

SciFlow 后端基于 **FastAPI**，负责统一 AI 任务入口、提示词加载与任务调度。

## 目录说明

- `app.py`：FastAPI 入口
- `app/api/routes/tasks.py`：任务路由
- `app/services/task_runner.py`：任务执行器
- `app/services/prompt_loader.py`：提示词加载
- `app/tasks/`：任务实现
- `app/prompts/`：后端提示词模板

## 环境准备

```bash
cd my-app/backend
pip install -r requirements.txt
```

## 本地运行

```bash
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

## Windows 启动脚本

```bat
start_backend.bat [conda_env_name]
```

不传参数时默认使用 `pytorch_gpu` 环境。
