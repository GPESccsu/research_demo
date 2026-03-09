from functools import lru_cache
from pathlib import Path

PROMPT_DIR = Path(__file__).resolve().parent.parent / "prompts"

FILE_PROMPTS = {
    "keyword_expander": "keyword_expander.md",
    "paper_summary": "paper_summary.md",
    "writing_assistant": "writing_assistant.md",
    "sentence_compare": "sentence_compare.md",
    "experiment_diagnosis": "experiment_diagnosis.md",
}

INLINE_PROMPTS = {
    "test_system": "You are a test assistant.",
    "writing_qa": "锌空气电池论文写作助手。中文≤150字。",
    "chat_assistant": "你是SciFlow AI科研助手。专长：材料科学、电化学、论文写作。中文≤200字。",
}


@lru_cache(maxsize=32)
def load_prompt(prompt_key: str) -> str:
    if prompt_key in INLINE_PROMPTS:
        return INLINE_PROMPTS[prompt_key]

    filename = FILE_PROMPTS.get(prompt_key)
    if not filename:
        raise KeyError(f"Unknown prompt key: {prompt_key}")

    prompt_path = PROMPT_DIR / filename
    return prompt_path.read_text(encoding="utf-8").strip()
