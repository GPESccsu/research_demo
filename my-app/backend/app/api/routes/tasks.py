from typing import Any, Dict

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.task_runner import TaskExecutionError, run_task

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


class TaskRunPayload(BaseModel):
    task_name: str = Field(min_length=1)
    payload: Dict[str, Any] = Field(default_factory=dict)


@router.post("/run")
def run_task_api(body: TaskRunPayload) -> Dict[str, Any]:
    try:
        result = run_task(body.task_name, body.payload)
        return {"result": result}
    except KeyError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except TaskExecutionError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
