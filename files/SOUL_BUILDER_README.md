# SOUL Builder — Integration Guide

## File Tree

```
backend/
  soul_engine.py       ← LLM-powered SOUL.md generator
  soul_validator.py    ← Quality + ecosystem conflict detection
  soul_score.py        ← Identity strength scoring (0-100)
  soul_router.py       ← FastAPI endpoints (mount in main.py)

frontend/
  components/
    SoulBuilder.jsx    ← 3-step wizard + AI assistant panel
```

---

## 1. Mount the Router in main.py

```python
from soul_router import soul_router
app.include_router(soul_router, prefix="/api")
```

---

## 2. Environment Variables

```bash
LLM_API_URL=http://localhost:11434/v1/chat/completions  # Ollama default
LLM_API_KEY=ollama
LLM_MODEL=llama3
```

Swap for OpenAI:
```bash
LLM_API_URL=https://api.openai.com/v1/chat/completions
LLM_API_KEY=sk-...
LLM_MODEL=gpt-4o
```

---

## 3. Database Migration (SQLite — safe, additive)

```sql
ALTER TABLE agents ADD COLUMN soul_markdown TEXT;
ALTER TABLE agents ADD COLUMN soul_version  INTEGER DEFAULT 0;
ALTER TABLE agents ADD COLUMN soul_score    INTEGER DEFAULT 0;
```

Or in SQLAlchemy model:
```python
soul_markdown = Column(Text,    nullable=True)
soul_version  = Column(Integer, nullable=True, default=0)
soul_score    = Column(Integer, nullable=True, default=0)
```

---

## 4. Wire DB + WebSocket in soul_router.py

In `api_save_soul()`, uncomment and adapt:
```python
# DB persistence
db: Session = next(get_db())
agent = db.query(Agent).filter(Agent.id == agent_id).first()
agent.soul_markdown = req.soul_markdown
agent.soul_version  = (agent.soul_version or 0) + 1
agent.soul_score    = scores["identity_strength"]
db.commit()

# WebSocket broadcast
await ws_manager.broadcast(json.dumps({
    "event": "agent_soul_updated",
    "agent_id": agent_id,
    "score": scores["identity_strength"]
}))
```

---

## 5. Use the React Component

```jsx
import SoulBuilder from "./components/SoulBuilder";

// In your Agent creation / edit panel:
<SoulBuilder
  agentId={agent.id}           // null if creating new
  onSaved={(draft) => {
    console.log("SOUL saved:", draft.markdown);
    // refresh agent list, close modal, etc.
  }}
/>
```

---

## 6. API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/soul/generate | Generate SOUL draft via LLM |
| POST | /api/soul/validate | Validate structure + detect conflicts |
| POST | /api/soul/score | Score identity (0-100 per dimension) |
| POST | /api/soul/save/{agent_id} | Persist to DB + broadcast WS event |

---

## 7. Overlap Guard

If ecosystem overlap > 70%, the Save button is disabled.
User must either:
- Specialize the agent further
- Use "Strengthen Identity" to regenerate
- Acknowledge via a future override flag (add to form if needed)

---

## 8. Install Dependencies

```bash
pip install httpx fastapi pydantic
```

No new frontend dependencies required (uses React + fetch).
