"""
soul_engine.py
Generates structured SOUL.md drafts for AI Agents and Subagents.
"""

import json
import httpx
from typing import Optional

# ─── LLM Abstraction ────────────────────────────────────────────────────────

async def call_llm(prompt: str, system: str = "") -> str:
    """
    LLM abstraction layer. Replace with your preferred provider.
    Currently targets OpenAI-compatible endpoint.
    Configure via env vars: LLM_API_URL, LLM_API_KEY, LLM_MODEL
    """
    import os
    api_url = os.getenv("LLM_API_URL", "http://localhost:11434/v1/chat/completions")
    api_key = os.getenv("LLM_API_KEY", "ollama")
    model   = os.getenv("LLM_MODEL", "llama3")

    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            api_url,
            headers={"Authorization": f"Bearer {api_key}"},
            json={"model": model, "messages": messages, "temperature": 0.7},
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]


# ─── Core Generator ──────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are an expert cognitive architect specializing in AI agent identity design.
You create precise, operationally sound SOUL.md documents.
Always respond ONLY with valid JSON — no markdown fences, no extra text."""

SOUL_TEMPLATE = """
You must generate a SOUL.md identity document for an AI agent.

Agent details:
- Type: {type}
- Name: {name}
- Base idea: {base_idea}
- Parent agent: {parent}
- Existing agents in ecosystem: {existing_agents}

Generate a JSON object with this exact shape:
{{
  "role": "<one clear sentence describing the agent's primary function>",
  "mission": "<2-3 sentences on what this agent exists to accomplish>",
  "competencies": ["<competency 1>", "<competency 2>", "<competency 3>", "<competency 4>"],
  "behavior": ["<behavioral rule 1>", "<behavioral rule 2>", "<behavioral rule 3>"],
  "restrictions": ["<hard restriction 1>", "<hard restriction 2>", "<hard restriction 3>"],
  "tone": "<adjective adjective adjective — describe communication style>",
  "hierarchy_notes": "<describe relationship to parent/ecosystem>"
}}

Rules:
- If type=subagent, hierarchy_notes MUST mention dependency on parent.
- Restrictions must be explicit and non-vague.
- Competencies must be specific skills, not generic descriptions.
- Do NOT overlap roles already covered by existing agents unless justified.
"""


async def generate_soul_draft(input_data: dict) -> dict:
    """
    Generate a structured SOUL.md draft for an agent or subagent.

    Args:
        input_data: {
            "type": "agent" | "subagent",
            "name": str,
            "base_idea": str,
            "hierarchy_parent": str | None,
            "existing_agents": list[str]
        }

    Returns:
        {
            "markdown": str,
            "structured": { role, mission, competencies, behavior, restrictions, tone, hierarchy_notes }
        }
    """
    agent_type    = input_data.get("type", "agent")
    name          = input_data.get("name", "Unnamed Agent")
    base_idea     = input_data.get("base_idea", "")
    parent        = input_data.get("hierarchy_parent") or "None (autonomous)"
    existing      = input_data.get("existing_agents", [])

    prompt = SOUL_TEMPLATE.format(
        type=agent_type,
        name=name,
        base_idea=base_idea,
        parent=parent,
        existing_agents=", ".join(existing) if existing else "None",
    )

    raw = await call_llm(prompt, system=SYSTEM_PROMPT)

    # Strip accidental fences
    raw = raw.strip().lstrip("```json").lstrip("```").rstrip("```").strip()

    structured: dict = json.loads(raw)

    markdown = _render_markdown(name, agent_type, structured)

    return {"markdown": markdown, "structured": structured}


def _render_markdown(name: str, agent_type: str, s: dict) -> str:
    """Render structured dict into a clean SOUL.md string."""
    competencies = "\n".join(f"- {c}" for c in s.get("competencies", []))
    behavior     = "\n".join(f"- {b}" for b in s.get("behavior", []))
    restrictions = "\n".join(f"- {r}" for r in s.get("restrictions", []))

    return f"""# {name}

Based on: {s.get('role', '')}

## Role
{s.get('mission', '')}

## Core Competencies
{competencies}

## Behavior
{behavior}

## Tone
{s.get('tone', '')}

## Hierarchy & Dependencies
{s.get('hierarchy_notes', '')}

## Restrictions
{restrictions}

---
*Agent type: {agent_type}*
"""
