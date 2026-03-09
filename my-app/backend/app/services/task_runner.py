from typing import Any, Dict

from app.tasks.tasks import get_task


class TaskExecutionError(ValueError):
    """Raised when task invocation fails due to invalid task input."""


def run_task(task_name: str, payload: Dict[str, Any]) -> Any:
    task = get_task(task_name)
    if not isinstance(payload, dict):
        raise TaskExecutionError("payload must be an object")

    text = payload.get("text", "")
    return task(text)
