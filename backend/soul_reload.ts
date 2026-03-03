/**
 * soul_reload.ts
 * Hot-reload handler for SOUL.md updates received via WebSocket.
 * Called when event == "agent_soul_updated".
 *
 * This module is designed for OpenClaw gateway integration.
 * Copy this file to: openclaw/src/gateway/soul_reload.ts
 */
import { WebSocket } from 'ws';
import { logger } from '../utils/logger';

// Default ClawController API host
const DEFAULT_CLAW_CONTROLLER_HOST = 'localhost:8000';

export interface AgentSoulUpdatedEvent {
  event: 'agent_soul_updated';
  agent_id: string | number;
  score?: number;
}

export interface SessionManager {
  getSession(agentId: string | number): any | null;
}

/**
 * Handle hot-reload of agent SOUL.md when OpenClaw receives 'agent_soul_updated' event.
 *
 * This function:
 * 1. Extracts agent_id from the WebSocket event
 * 2. Finds the active session for that agent
 * 3. Fetches updated SOUL.md from ClawController API
 * 4. Applies the new SOUL to the running session without restarting
 *
 * @param event - The full WebSocket message dict
 * @param sessionManager - The OpenClaw session manager object
 * @returns Promise<void>
 *
 * @example
 * // Event shape:
 * {
 *   "event": "agent_soul_updated",
 *   "agent_id": "dev",
 *   "score": 87
 * }
 */
export async function handle_soul_updated(
  event: AgentSoulUpdatedEvent,
  sessionManager: SessionManager
): Promise<void> {
  const { agent_id, score } = event;

  // Extract agent_id from event
  if (!agent_id) {
    logger.warn('SOUL reload: Missing agent_id in agent_soul_updated event');
    return;
  }

  // Get active session for this agent
  const session = sessionManager.getSession(agent_id);

  if (!session) {
    logger.info(
      `No active session for agent ${agent_id}, skipping SOUL reload (score: ${score ?? 'N/A'})`
    );
    return;
  }

  // Get ClawController host from environment or use default
  const clawHost = getClawControllerHost();

  // Fetch updated SOUL from ClawController API
  try {
    const url = `http://${clawHost}/api/agents/${agent_id}/soul`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      logger.error(
        `SOUL reload failed for agent ${agent_id}: HTTP ${response.status} from ClawController`
      );
      return;
    }

    const data = await response.json();
    const soulMarkdown = data.soul_markdown || data.soul || '';

    if (!soulMarkdown) {
      logger.error(
        `SOUL reload failed for agent ${agent_id}: No soul_markdown field in response`
      );
      return;
    }

    // Apply new SOUL to running session
    if (typeof session.reloadSoul === 'function') {
      session.reloadSoul(soulMarkdown);
    } else {
      logger.error(
        `SOUL reload failed for agent ${agent_id}: Session does not have reloadSoul method`
      );
      return;
    }

    logger.info(`✅ SOUL hot-reloaded for agent ${agent_id} (score: ${score ?? 'N/A'})`);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('fetch') || error.message.includes('ECONNREFUSED')) {
        logger.error(
          `SOUL reload failed for agent ${agent_id}: Cannot connect to ClawController at ${clawHost} - ${error.message}`
        );
      } else if (error.message.includes('timeout')) {
        logger.error(
          `SOUL reload timeout for agent ${agent_id}: ClawController at ${clawHost} did not respond - ${error.message}`
        );
      } else {
        logger.error(
          `SOUL reload error for agent ${agent_id}: ${error.name} - ${error.message}`
        );
      }
    } else {
      logger.error(
        `SOUL reload error for agent ${agent_id}: Unknown error - ${String(error)}`
      );
    }
  }
}

/**
 * Get ClawController API host from environment variable.
 *
 * @returns Host string (e.g., "localhost:8000")
 *
 * @env CLAW_CONTROLLER_HOST - Override default host (default: "localhost:8000")
 */
function getClawControllerHost(): string {
  return process.env.CLAW_CONTROLLER_HOST || DEFAULT_CLAW_CONTROLLER_HOST;
}
