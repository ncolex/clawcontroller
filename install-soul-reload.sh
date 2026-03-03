#!/bin/bash
# install-soul-reload.sh
# Instala SOUL hot-reload en OpenClaw automáticamente

set -e

OPENCLAW_DIR="${OPENCLAW_DIR:-/home/ncx/oc/openclaw}"
CLAWCONTROLLER_DIR="${CLAWCONTROLLER_DIR:-/home/ncx/.clawcontroller}"

echo "🔧 SOUL Hot-Reload Installer"
echo "============================"
echo ""

# Verificar directorios
if [ ! -d "$OPENCLAW_DIR" ]; then
    echo "❌ OpenClaw directory not found: $OPENCLAW_DIR"
    echo "   Set OPENCLAW_DIR env var or edit script"
    exit 1
fi

if [ ! -d "$CLAWCONTROLLER_DIR" ]; then
    echo "❌ ClawController directory not found: $CLAWCONTROLLER_DIR"
    exit 1
fi

echo "✅ OpenClaw: $OPENCLAW_DIR"
echo "✅ ClawController: $CLAWCONTROLLER_DIR"
echo ""

# Copiar archivos TypeScript
echo "📦 Copying TypeScript files..."
cp "$CLAWCONTROLLER_DIR/backend/soul_reload.ts" "$OPENCLAW_DIR/src/gateway/soul_reload.ts"
cp "$CLAWCONTROLLER_DIR/backend/session_soul_mixin.ts" "$OPENCLAW_DIR/src/gateway/session_soul_mixin.ts"
echo "✅ Copied:"
echo "   - src/gateway/soul_reload.ts"
echo "   - src/gateway/session_soul_mixin.ts"
echo ""

# Mostrar instrucciones de inserción
echo "📋 NEXT STEPS:"
echo ""
echo "1. Add mixin to AgentSession class:"
echo "   File: src/gateway/session.ts (or where AgentSession is defined)"
echo ""
echo "   import { SoulReloadMixin } from './session_soul_mixin.js';"
echo ""
echo "   class AgentSession extends SoulReloadMixin(BaseSession) {"
echo "     constructor(agent_id: string) {"
echo "       super();"
echo "       this.agent_id = agent_id;"
echo "       this.soul_markdown = '';"
echo "       this.soul_sections = {};"
echo "       this.soul_role = '';"
echo "       this.soul_restrictions = [];"
echo "       this.soul_behavior = [];"
echo "     }"
echo "   }"
echo ""
echo "2. Register event handler:"
echo "   File: src/gateway/server.ts (or where events are listened)"
echo ""
echo "   import { handle_soul_updated } from './soul_reload.js';"
echo ""
echo "   context.on('agent_soul_updated', async (event) => {"
echo "     await handle_soul_updated(event, sessionManager);"
echo "   });"
echo ""
echo "3. Restart OpenClaw:"
echo "   cd $OPENCLAW_DIR"
echo "   pnpm restart  # or your restart command"
echo ""
echo "4. Test endpoint:"
echo "   curl http://localhost:8000/api/agents/dev/soul"
echo ""
echo "5. Test WebSocket event:"
echo "   Send via WS: {\"event\":\"agent_soul_updated\",\"agent_id\":\"dev\",\"score\":100}"
echo ""
echo "📖 Full documentation: $CLAWCONTROLLER_DIR/SOUL_RELOAD_INTEGRATION.md"
echo ""
echo "✅ Installation complete!"
