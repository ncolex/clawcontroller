"""
soul_reload.py
Hot-reload handler for SOUL.md updates received via WebSocket.
Called when event == "agent_soul_updated".

This module is designed for OpenClaw gateway integration.
Copy this file to: openclaw/soul_reload.py
"""
import logging
from typing import Any, Dict, Optional

import httpx

logger = logging.getLogger(__name__)

# Default ClawController API host
DEFAULT_CLAW_CONTROLLER_HOST = "localhost:8000"


async def handle_soul_updated(event: Dict[str, Any], session_manager: Any) -> None:
    """
    Handle hot-reload of agent SOUL.md when OpenClaw receives 'agent_soul_updated' event.

    This function:
    1. Extracts agent_id from the WebSocket event
    2. Finds the active session for that agent
    3. Fetches updated SOUL.md from ClawController API
    4. Applies the new SOUL to the running session without restarting

    Args:
        event: The full WebSocket message dict containing:
            - event: "agent_soul_updated"
            - agent_id: int (the agent identifier)
            - score: int (optional, for logging)
        session_manager: The OpenClaw session manager object (passed in, not imported)

    Returns:
        None

    Example event:
        {
            "event": "agent_soul_updated",
            "agent_id": 42,
            "score": 87
        }
    """
    # Extract agent_id from event
    agent_id = event.get("agent_id")
    score = event.get("score", "N/A")

    if agent_id is None:
        logger.warning("SOUL reload: Missing agent_id in agent_soul_updated event")
        return

    # Get active session for this agent
    session = session_manager.get_session(agent_id)

    if session is None:
        logger.info(
            f"No active session for agent {agent_id}, skipping SOUL reload "
            f"(score: {score})"
        )
        return

    # Get ClawController host from environment or use default
    claw_host = _get_claw_controller_host()

    # Fetch updated SOUL from ClawController API
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            url = f"http://{claw_host}/api/agents/{agent_id}/soul"
            response = await client.get(url)

            if response.status_code != 200:
                logger.error(
                    f"SOUL reload failed for agent {agent_id}: "
                    f"HTTP {response.status_code} from ClawController"
                )
                return

            data = response.json()
            soul_markdown = data.get("soul_markdown") or data.get("soul", "")

            if not soul_markdown:
                logger.error(
                    f"SOUL reload failed for agent {agent_id}: "
                    f"No soul_markdown field in response"
                )
                return

            # Apply new SOUL to running session
            session.reload_soul(soul_markdown)

            logger.info(
                f"✅ SOUL hot-reloaded for agent {agent_id} (score: {score})"
            )

        except httpx.ConnectError as e:
            logger.error(
                f"SOUL reload failed for agent {agent_id}: "
                f"Cannot connect to ClawController at {claw_host} - {e}"
            )
        except httpx.TimeoutException as e:
            logger.error(
                f"SOUL reload timeout for agent {agent_id}: "
                f"ClawController at {claw_host} did not respond - {e}"
            )
        except Exception as e:
            logger.error(
                f"SOUL reload error for agent {agent_id}: {type(e).__name__} - {e}"
            )


def _get_claw_controller_host() -> str:
    """
    Get ClawController API host from environment variable.

    Returns:
        Host string (e.g., "localhost:8000" or "api.clawcontroller.com")

    Environment:
        CLAW_CONTROLLER_HOST: Override default host (default: "localhost:8000")
    """
    import os
    return os.environ.get("CLAW_CONTROLLER_HOST", DEFAULT_CLAW_CONTROLLER_HOST)
