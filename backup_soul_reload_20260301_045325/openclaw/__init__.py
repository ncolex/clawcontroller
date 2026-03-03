"""
openclaw - OpenClaw Gateway SOUL Hot-Reload Module

This module provides hot-reload capability for agent SOUL.md files.
Copy this directory to your OpenClaw project.
"""

from openclaw.soul_reload import handle_soul_updated
from openclaw.session_soul_mixin import SoulReloadMixin

__all__ = ["handle_soul_updated", "SoulReloadMixin"]
