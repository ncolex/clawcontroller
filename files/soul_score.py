"""
soul_score.py
Scores SOUL.md identity documents across multiple dimensions.
"""

from __future__ import annotations

VAGUE_WORDS = {
    "things", "stuff", "various", "general", "some", "many",
    "different", "multiple", "related", "relevant", "appropriate",
    "handle", "manage", "deal with", "work", "do", "perform",
}

CONSTRAINT_KEYWORDS = {
    "never", "must not", "prohibited", "forbidden", "only",
    "exclusively", "restrict", "limit", "cannot", "shall not",
    "not allowed", "blocked",
}


def _word_count(text: str) -> int:
    return len(text.split()) if text else 0


def _vague_ratio(text: str) -> float:
    words = text.lower().split()
    if not words:
        return 1.0
    vague = sum(1 for w in words if w.strip(".,;:") in VAGUE_WORDS)
    return vague / len(words)


def _constraint_strength(restrictions: list[str]) -> float:
    """Score based on presence of explicit constraint keywords."""
    if not restrictions:
        return 0.0
    all_text = " ".join(restrictions).lower()
    hits = sum(1 for kw in CONSTRAINT_KEYWORDS if kw in all_text)
    return min(hits / max(len(restrictions), 1), 1.0)


def score_soul(structured: dict) -> dict:
    """
    Score a SOUL structured document.

    Returns:
        {
            "identity_strength": 0-100,
            "clarity":           0-100,
            "constraint_quality": 0-100,
            "specialization":    0-100
        }
    """
    role         = structured.get("role", "")
    mission      = structured.get("mission", "")
    competencies = structured.get("competencies", [])
    behavior     = structured.get("behavior", [])
    restrictions = structured.get("restrictions", [])
    tone         = structured.get("tone", "")
    hierarchy    = structured.get("hierarchy_notes", "")

    # ── Clarity score ────────────────────────────────────────────────────────
    combined_text = " ".join([role, mission, tone, hierarchy])
    vague_r = _vague_ratio(combined_text)
    word_density = min(_word_count(combined_text) / 80, 1.0)  # 80 words = full density
    clarity = int((1 - vague_r) * 60 + word_density * 40)
    clarity = max(0, min(clarity, 100))

    # ── Constraint quality ───────────────────────────────────────────────────
    cstrength = _constraint_strength(restrictions)
    count_bonus = min(len(restrictions) / 5, 1.0)  # up to 5 restrictions = full
    constraint_quality = int(cstrength * 70 + count_bonus * 30)
    constraint_quality = max(0, min(constraint_quality, 100))

    # ── Specialization score ─────────────────────────────────────────────────
    comp_count  = len(competencies)
    behav_count = len(behavior)
    has_tone    = 1 if len(tone.split()) >= 2 else 0
    specialization = int(
        min(comp_count / 5, 1.0) * 40 +
        min(behav_count / 4, 1.0) * 35 +
        has_tone * 25
    )
    specialization = max(0, min(specialization, 100))

    # ── Identity strength: weighted average ──────────────────────────────────
    identity_strength = int(
        clarity            * 0.35 +
        constraint_quality * 0.30 +
        specialization     * 0.35
    )
    identity_strength = max(0, min(identity_strength, 100))

    return {
        "identity_strength":  identity_strength,
        "clarity":            clarity,
        "constraint_quality": constraint_quality,
        "specialization":     specialization,
    }
