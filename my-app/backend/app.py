from typing import Any, Dict, List, Optional

import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="SciFlow Local Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AI_PROVIDERS: Dict[str, Dict[str, Any]] = {
    "anthropic": {
        "format": "anthropic",
        "baseUrl": "https://api.anthropic.com/v1/messages",
    },
    "openai": {
        "format": "openai",
        "baseUrl": "https://api.openai.com/v1/chat/completions",
    },
    "ollama": {
        "format": "openai",
        "baseUrl": "http://localhost:11434/v1/chat/completions",
    },
    "groq": {
        "format": "openai",
        "baseUrl": "https://api.groq.com/openai/v1/chat/completions",
    },
    "together": {
        "format": "openai",
        "baseUrl": "https://api.together.xyz/v1/chat/completions",
    },
    "openrouter": {
        "format": "openai",
        "baseUrl": "https://openrouter.ai/api/v1/chat/completions",
    },
    "siliconflow": {
        "format": "openai",
        "baseUrl": "https://api.siliconflow.cn/v1/chat/completions",
    },
}


class AICallPayload(BaseModel):
    config: Dict[str, Any]
    systemPrompt: str
    userMessage: str
    maxTokens: Optional[int] = None


class AIChatPayload(BaseModel):
    config: Dict[str, Any]
    systemPrompt: str
    messages: List[Dict[str, Any]]


def build_prompt(config: Dict[str, Any], system_prompt: str) -> str:
    prefix = config.get("systemPromptPrefix") or ""
    return f"{prefix}\n\n{system_prompt}" if prefix else system_prompt


def get_model(config: Dict[str, Any]) -> str:
    return config.get("customModel") or config.get("model") or ""


async def call_provider(config: Dict[str, Any], system_prompt: str, messages: List[Dict[str, Any]], max_tokens: int) -> str:
    provider_id = config.get("provider")
    provider = AI_PROVIDERS.get(provider_id)
    if not provider:
        raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider_id}")

    model = get_model(config)
    if not model:
        raise HTTPException(status_code=400, detail="Model is required")

    full_system = build_prompt(config, system_prompt)
    timeout = httpx.Timeout(90.0, connect=20.0)

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            if provider["format"] == "anthropic":
                headers = {"Content-Type": "application/json", "anthropic-version": "2023-06-01"}
                if config.get("apiKey"):
                    headers["x-api-key"] = config["apiKey"]
                payload = {
                    "model": model,
                    "max_tokens": max_tokens,
                    "system": full_system,
                    "messages": messages,
                }
                resp = await client.post(provider["baseUrl"], headers=headers, json=payload)
                data = resp.json()
                if resp.status_code >= 400:
                    detail = data.get("error", {}).get("message") or data.get("error") or resp.text
                    raise HTTPException(status_code=resp.status_code, detail=str(detail))
                return "\n".join(block.get("text", "") for block in data.get("content", []))

            url = config.get("ollamaUrl", "http://localhost:11434").rstrip("/") + "/v1/chat/completions" if provider_id == "ollama" else provider["baseUrl"]
            headers = {"Content-Type": "application/json"}
            if config.get("apiKey"):
                headers["Authorization"] = f"Bearer {config['apiKey']}"
            if provider_id == "openrouter":
                headers["HTTP-Referer"] = "https://sciflow.app"
                headers["X-Title"] = "SciFlow"

            payload = {
                "model": model,
                "messages": [{"role": "system", "content": full_system}, *messages],
                "max_tokens": max_tokens,
                "temperature": config.get("temperature", 0.7),
            }
            resp = await client.post(url, headers=headers, json=payload)
            data = resp.json()
            if resp.status_code >= 400:
                detail = data.get("error", {}).get("message") if isinstance(data.get("error"), dict) else data.get("error") or resp.text
                raise HTTPException(status_code=resp.status_code, detail=str(detail))
            return data.get("choices", [{}])[0].get("message", {}).get("content", "")
    except HTTPException:
        raise
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Network error: {exc}") from exc
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=f"Invalid provider response: {exc}") from exc


@app.get("/api/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/api/ai/call")
async def ai_call(payload: AICallPayload) -> Dict[str, str]:
    tokens = payload.maxTokens or int(payload.config.get("maxTokens") or 1000)
    result = await call_provider(
        payload.config,
        payload.systemPrompt,
        [{"role": "user", "content": payload.userMessage}],
        tokens,
    )
    return {"result": result}


@app.post("/api/ai/chat")
async def ai_chat(payload: AIChatPayload) -> Dict[str, str]:
    tokens = int(payload.config.get("maxTokens") or 1000)
    result = await call_provider(payload.config, payload.systemPrompt, payload.messages, tokens)
    return {"result": result}


@app.get("/api/ollama/models")
async def ollama_models(url: str = Query("http://localhost:11434")) -> Dict[str, Any]:
    tags_url = url.rstrip("/") + "/api/tags"
    timeout = httpx.Timeout(20.0, connect=5.0)
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.get(tags_url)
            data = resp.json()
            if resp.status_code >= 400:
                raise HTTPException(status_code=resp.status_code, detail=resp.text)
            return data
    except HTTPException:
        raise
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Cannot connect to Ollama: {exc}") from exc
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=f"Invalid Ollama response: {exc}") from exc
