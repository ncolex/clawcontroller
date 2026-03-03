"""
soul_validator.py
Validates SOUL.md structured data against quality rules and ecosystem conflicts.
"""

from __future__ import annotations
from typing import Any

VAGUE_WORDS = {
    "things", "stuff", "various", "general", "some", "many",
    "different", "multiple", "related", "relevant", "appropriate",
    "handle", "manage", "deal with", "work with", "do",
}

MIN_ROLE_WORDS    = 8
MIN_COMPETENCIES  = 3
MIN_RESTRICTIONS  = 2
OVERLAP_THRESHOLD = 0.60


def _word_set(text: str) -> set[str]:
    """Extract lowercase meaningful words from text."""
    words = text.lower().split()
    return {w.strip(".,;:()[]") for w in words if len(w) > 3}


def _jaccard_overlap(a: set[str], b: set[str]) -> float:
    """Jaccard similarity between two word sets."""
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


def validate_soul(structured: dict, ecosystem: list[dict[str, Any]]) -> dict:
    """
    Validate a SOUL structured document against quality rules and ecosystem.

    Args:
        structured: Output from soul_engine (role, mission, competencies, etc.)
        ecosystem: List of existing agent structured SOULs
                   Each item: {"name": str, "structured": dict}

    Returns:
        {
            "warnings": list[str],
            "conflicts": list[str],
            "missing_sections": list[str],
            "overlap_score": float
        }
    """
    warnings:          list[str] = []
    conflicts:         list[str] = []
    missing_sections:  list[str] = []
    max_overlap:       float     = 0.0

    # ── Required section checks ──────────────────────────────────────────────

    required = ["role", "mission", "competencies", "behavior", "restrictions", "tone"]
    for field in required:
        val = structured.get(field)
        if not val or (isinstance(val, list) and len(val) == 0):
            missing_sections.append(field)

    # ── Role clarity ─────────────────────────────────────────────────────────

    role = structured.get("role", "")
    if isinstance(role, str) and len(role.split()) < MIN_ROLE_WORDS:
        warnings.append(f"Role is too vague ({len(role.split())} words). Aim for {MIN_ROLE_WORDS}+.")

    vague_in_role = _word_set(role) & VAGUE_WORDS
    if vague_in_role:
        warnings.append(f"Role contains vague terms: {', '.join(vague_in_role)}.")

    # ── Competencies ─────────────────────────────────────────────────────────

    competencies = structured.get("competencies", [])
    if len(competencies) < MIN_COMPETENCIES:
        warnings.append(f"Only {len(competencies)} competencies defined. Minimum is {MIN_COMPETENCIES}.")

    # ── Restrictions ─────────────────────────────────────────────────────────

    restrictions = structured.get("restrictions", [])
    if len(restrictions) < MIN_RESTRICTIONS:
        warnings.append(f"Insufficient restrictions ({len(restrictions)}). Add at least {MIN_RESTRICTIONS} explicit hard limits.")

    # ── Subagent must define hierarchy ───────────────────────────────────────

    hierarchy = structured.get("hierarchy_notes", "")
    if not hierarchy or len(hierarchy.strip()) < 10:
        warnings.append("Hierarchy notes are missing or too brief. Define dependencies clearly.")

    # ── Ecosystem overlap detection ──────────────────────────────────────────

    soul_words = _word_set(" ".join([
        structured.get("role", ""),
        structured.get("mission", ""),
        " ".join(structured.get("competencies", [])),
    ]))

    for agent in ecosystem:
        other_structured = agent.get("structured", {})
        other_words = _word_set(" ".join([
            other_structured.get("role", ""),
            other_structured.get("mission", ""),
            " ".join(other_structured.get("competencies", [])),
        ]))

        score = _jaccard_overlap(soul_words, other_words)
        if score > max_overlap:
            max_overlap = score

        if score > OVERLAP_THRESHOLD:
            conflicts.append(
                f"Role overlaps {int(score * 100)}% with agent '{agent.get('name', 'Unknown')}'. "
                f"Consider specializing or merging."
            )

    return {
        "warnings":         warnings,
        "conflicts":        conflicts,
        "missing_sections": missing_sections,
        "overlap_score":    round(max_overlap, 3),
    }
