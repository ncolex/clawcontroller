"""
soul_router.py
FastAPI router for the SOUL Builder module.
Mount with: app.include_router(soul_router, prefix="/api")
"""

from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, HTTPException, WebSocket
from pydantic import BaseModel

from soul_engine    import generate_soul_draft
from soul_validator import validate_soul
from soul_score     import score_soul

# ── Optional: import your DB session and Agent model if you want DB persistence
# from database import get_db
# from models import Agent
# from sqlalchemy.orm import Session

soul_router = APIRouter(tags=["soul-builder"])

# ─── Pydantic Schemas ────────────────────────────────────────────────────────

class GenerateRequest(BaseModel):
    type:             str              # "agent" | "subagent"
    name:             str
    base_idea:        str
    hierarchy_parent: Optional[str] = None
    existing_agents:  list[str]    = []


class ValidateRequest(BaseModel):
    structured: dict
    ecosystem:  list[dict] = []   # [{"name": str, "structured": dict}]


class ScoreRequest(BaseModel):
    structured: dict


class SaveSoulRequest(BaseModel):
    agent_id:      int
    soul_markdown: str
    structured:    dict


# ─── Endpoints ───────────────────────────────────────────────────────────────

@soul_router.post("/soul/generate")
async def api_generate_soul(req: GenerateRequest):
    """
    Generate a SOUL.md draft via LLM given a base idea and agent type.
    """
    try:
        result = await generate_soul_draft(req.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Soul generation failed: {str(e)}")


@soul_router.post("/soul/validate")
async def api_validate_soul(req: ValidateRequest):
    """
    Validate a structured SOUL against quality rules and ecosystem conflicts.
    """
    try:
        result = validate_soul(req.structured, req.ecosystem)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Soul validation failed: {str(e)}")


@soul_router.post("/soul/score")
async def api_score_soul(req: ScoreRequest):
    """
    Score a SOUL structured document across identity dimensions.
    """
    try:
        result = score_soul(req.structured)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Soul scoring failed: {str(e)}")


@soul_router.post("/soul/save/{agent_id}")
async def api_save_soul(agent_id: int, req: SaveSoulRequest):
    """
    Persist SOUL markdown + score to agent record.
    Broadcasts WebSocket event 'agent_soul_updated'.

    NOTE: Wire up your DB session / websocket broadcast here.
    """
    scores = score_soul(req.structured)

    # ── DB persistence (uncomment and adapt to your session pattern) ──────────
    # db: Session = next(get_db())
    # agent = db.query(Agent).filter(Agent.id == agent_id).first()
    # if not agent:
    #     raise HTTPException(status_code=404, detail="Agent not found")
    # agent.soul_markdown = req.soul_markdown
    # agent.soul_version  = (agent.soul_version or 0) + 1
    # agent.soul_score    = scores["identity_strength"]
    # db.commit()

    # ── WebSocket broadcast (adapt to your WS manager) ───────────────────────
    # await ws_manager.broadcast(json.dumps({
    #     "event": "agent_soul_updated",
    #     "agent_id": agent_id,
    #     "score": scores["identity_strength"]
    # }))

    return {
        "status":  "saved",
        "agent_id": agent_id,
        "scores":  scores,
        "message": "Soul persisted. Wire DB + WS broadcast in soul_router.py."
    }


# ─── DB Migration Helper ─────────────────────────────────────────────────────
# Add these columns to your Agent SQLAlchemy model:
#
# soul_markdown = Column(Text,    nullable=True)
# soul_version  = Column(Integer, nullable=True, default=0)
# soul_score    = Column(Integer, nullable=True, default=0)
#
# For SQLite migration (safe, additive):
# ALTER TABLE agents ADD COLUMN soul_markdown TEXT;
# ALTER TABLE agents ADD COLUMN soul_version  INTEGER DEFAULT 0;
# ALTER TABLE agents ADD COLUMN soul_score    INTEGER DEFAULT 0;
