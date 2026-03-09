from typing import Any, Callable, Dict

from app.tasks.text_tasks import clean_text, normalize_whitespace

TaskFunc = Callable[[Any], Any]

TASK_REGISTRY: Dict[str, TaskFunc] = {
    "clean_text": clean_text,
    "normalize_whitespace": normalize_whitespace,
}


def get_task(task_name: str) -> TaskFunc:
    task = TASK_REGISTRY.get(task_name)
    if task is None:
        raise KeyError(f"Unsupported task: {task_name}")
    return task
