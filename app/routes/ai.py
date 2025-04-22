from fastapi import APIRouter, Request
from pydantic import BaseModel
import openai
import os
import httpx

router = APIRouter()

class AIQuery(BaseModel):
    model: str  # "gpt" или "claude"
    question: str

openai.api_key = os.getenv("OPENAI_API_KEY")
CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY")

@router.post("/ai/ask")
async def ask_ai(query: AIQuery):
    if query.model == "gpt":
        response = openai.ChatCompletion.create(
            model="gpt-4-turbo",
            messages=[{"role": "user", "content": query.question}],
        )
        return {"answer": response.choices[0].message.content}

    elif query.model == "claude":
        async with httpx.AsyncClient() as client:
            headers = {
                "x-api-key": CLAUDE_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            }
            body = {
                "model": "claude-3-opus-20240229",
                "max_tokens": 1024,
                "messages": [{"role": "user", "content": query.question}]
            }
            res = await client.post("https://api.anthropic.com/v1/messages", headers=headers, json=body)
            data = res.json()
            return {"answer": data["content"][0]["text"]}

    return {"answer": "❌ Неизвестная модель"}
