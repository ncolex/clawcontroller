# ClawController - Project Context

## Project Overview

**ClawController** is a task management dashboard and control center for [OpenClaw](https://openclaw.ai) AI agents. It provides visibility into agent activities, structured task assignment, and workflow tracking.

**Core Problem Solved:** Running multiple OpenClaw agents is powerful but chaotic. ClawController provides a central dashboard to:
- See all agents and their status at a glance
- Assign structured tasks with clear deliverables
- Track progress through a defined workflow (INBOX → ASSIGNED → IN_PROGRESS → REVIEW → DONE)
- Route work to the right agent automatically via tags
- Review completed work before closing tasks

**Current Version:** 1.1.3

---

## Architecture

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19 + Vite + Tailwind CSS 4 + Zustand (state) |
| **Backend** | Python 3.10+ + FastAPI + SQLite + SQLAlchemy |
| **Real-time** | WebSockets for live updates |
| **Deployment** | Vercel (frontend) + Tailscale tunnel (backend via OpenClaw Gateway) |

### Directory Structure

```
.clawcontroller/
├── backend/
│   ├── main.py              # FastAPI app + all API endpoints (~3500 lines)
│   ├── models.py            # SQLAlchemy models (Task, Agent, Comment, etc.)
│   ├── database.py          # Database connection setup
│   ├── requirements.txt     # Python dependencies
│   ├── soul_reload.py       # SOUL hot-reload handler for OpenClaw
│   ├── session_soul_mixin.py# Mixin for agent session SOUL reload
│   ├── stuck_task_monitor.py# Background monitor for stuck tasks
│   └── gateway_watchdog.py  # Gateway health monitoring
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main React component
│   │   ├── api.js           # API client (uses VITE_API_URL env var)
│   │   ├── components/      # UI components (Kanban, Header, Sidebar, etc.)
│   │   ├── store/           # Zustand state management
│   │   └── utils/           # Utility functions
│   ├── package.json         # Node dependencies
│   ├── vite.config.js       # Vite build config
│   └── tailwind.config.js   # Tailwind theme config
├── bin/                     # NPM CLI tools
│   ├── clawcontroller.js    # Main CLI entry point
│   ├── setup.js             # Setup script
│   └── postinstall.js       # Post-install hook
├── data/                    # Application data
│   ├── mission_control.db   # SQLite database
│   └── *.json               # State files for monitors
├── logs/                    # Service logs
├── start.sh                 # Start both services
├── stop.sh                  # Stop both services
└── vercel.json              # Vercel deployment config
```

---

## Building and Running

### Prerequisites

- **Node.js 18+** (for frontend)
- **Python 3.10+** (for backend)
- **OpenClaw Gateway** (for production backend)

### Quick Start

```bash
# Start both services
./start.sh

# Access dashboard
# Frontend: http://localhost:5001
# API: http://localhost:8000
```

### Manual Start

```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 - Frontend
cd frontend
npm run dev -- --port 5001 --host 0.0.0.0
```

### Stopping

```bash
./stop.sh
```

### Build Commands

```bash
# Frontend production build
cd frontend
npm run build

# Lint frontend
npm run lint
```

### Setup (First Time)

```bash
# Via NPM package
npx clawcontroller setup

# Or manually:
cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt
cd ../frontend && npm install
```

---

## Key API Endpoints

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tasks` | List all tasks |
| `POST` | `/api/tasks` | Create task |
| `GET` | `/api/tasks/{id}` | Get task details |
| `PATCH` | `/api/tasks/{id}` | Update task |
| `DELETE` | `/api/tasks/{id}` | Delete task |
| `POST` | `/api/tasks/{id}/activity` | Log activity |
| `POST` | `/api/tasks/{id}/route` | Route to agent with fresh context |
| `POST` | `/api/tasks/{id}/review` | Approve/reject task |

### Agents

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/agents` | List all agents |
| `POST` | `/api/agents` | Create agent |
| `PATCH` | `/api/agents/{id}` | Update agent |
| `DELETE` | `/api/agents/{id}` | Delete agent |
| `GET` | `/api/agents/{id}/soul` | Get agent SOUL.md (for hot-reload) |
| `PUT` | `/api/agents/{id}/soul` | Save SOUL + trigger hot-reload |

### WebSocket

Connect to `ws://localhost:8000/ws` for real-time updates.

**Events:** `task_created`, `task_updated`, `agent_status`, `chat_message`, `agent_soul_updated`

---

## Database Schema

### Core Models (`backend/models.py`)

- **Agent** - AI agent definitions (id, name, role, status, models, workspace)
- **Task** - Task management (title, description, status, priority, tags, assignee)
- **Comment** - Task comments
- **Deliverable** - Task outputs with file paths
- **ChatMessage** - Squad chat messages
- **ActivityLog** - System-wide activity log
- **TaskActivity** - Task-specific activity entries
- **RecurringTask** - Scheduled repeating tasks
- **RecurringTaskRun** - Run history for recurring tasks

### Task Workflow States

```
INBOX → ASSIGNED → IN_PROGRESS → REVIEW → DONE
```

### Agent Roles

| Role | Description |
|------|-------------|
| `LEAD` | Primary orchestrator, reviews tasks, delegates work |
| `INT` | Integration agent (developer, analyst, general worker) |
| `SPC` | Specialist (domain expert: trading, design, legal, etc.) |

### Agent Statuses

| Status | Meaning |
|--------|---------|
| `WORKING` | Currently processing a task |
| `IDLE` | Available, waiting for work |
| `STANDBY` | Configured but inactive |
| `OFFLINE` | Not configured or unreachable |

---

## Environment Variables

### Frontend (`.env.local` or Vercel)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (e.g., `http://localhost:8000` or Tailscale URL) |
| `VITE_OPENCLAW_TOKEN` | OpenClaw authentication token for agent messaging |

### Backend

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///./data/mission_control.db` | Database path |
| `OPENCLAW_CONFIG_PATH` | `~/.openclaw/config.yaml` | OpenClaw config for live status |
| `CLAW_CONTROLLER_HOST` | `localhost:8000` | API host for SOUL hot-reload |

---

## Development Conventions

### Code Style

- **Python:** PEP 8, type hints encouraged
- **JavaScript/React:** ESLint + Prettier (config in `frontend/eslint.config.js`)
- **Naming:** 
  - Python: `snake_case` for variables/functions, `PascalCase` for classes
  - JavaScript: `camelCase` for variables/functions, `PascalCase` for components

### Component Structure (Frontend)

```jsx
// Components in frontend/src/components/
// Each component is a default export
// Uses Zustand for state management
// Tailwind CSS for styling

import { useMissionStore } from '../store/useMissionStore'

function MyComponent() {
  const data = useMissionStore(state => state.data)
  const action = useMissionStore(state => state.action)
  
  return <div className="...">...</div>
}

export default MyComponent
```

### State Management (Zustand)

Store location: `frontend/src/store/useMissionStore.js`

```javascript
import { create } from 'zustand'

export const useMissionStore = create((set, get) => ({
  // State
  tasks: [],
  agents: [],
  isLoading: false,
  
  // Actions
  initialize: async () => { /* fetch data */ },
  connectWebSocket: () => { /* setup WS */ },
  refreshAgents: async () => { /* refetch agents */ },
}))
```

### API Calls (Frontend)

Use `frontend/src/api.js` which respects `VITE_API_URL` environment variable.

```javascript
import api from './api.js'

// GET request
const tasks = await api.get('/tasks')

// POST request
const task = await api.post('/tasks', { title: 'New task', assignee_id: 'dev' })
```

### Backend Patterns

- All endpoints in `backend/main.py` (monolithic FastAPI app)
- SQLAlchemy for database operations
- Pydantic models for request/response validation
- WebSocket manager for broadcasting events
- Background tasks for monitoring (stuck tasks, gateway watchdog)

---

## Key Features

### 1. Kanban Board
Drag-and-drop task management with columns: INBOX, ASSIGNED, IN_PROGRESS, REVIEW, DONE

### 2. Agent Status Monitoring
Real-time agent status from OpenClaw session activity

### 3. SOUL Hot-Reload
Update agent SOUL.md without restarting agents:
- Save via `PUT /api/agents/{id}/soul`
- Broadcasts `agent_soul_updated` WebSocket event
- OpenClaw gateway fetches new SOUL and reloads session

### 4. Stuck Task Detection
Background monitor checks every 30 minutes for tasks stuck too long:
- 24-48h for normal tasks
- 12-24h for urgent tasks
- Alerts via announcement system

### 5. Auto-Assignment Rules
Tasks auto-assigned based on tags (configured in `backend/main.py`):
```python
ASSIGNMENT_RULES = {
    "coding": "dev",
    "trading": "trader",
    "writing": "writer",
}
```

### 6. Recurring Tasks
Cron-scheduled repeating tasks with run history

### 7. Squad Chat
Real-time chat with @mention routing to OpenClaw agents

### 8. Review Gate
Agents cannot set tasks to DONE directly — must go through REVIEW first

---

## Deployment

### Vercel (Frontend)

```bash
# Deploy
vercel deploy --prod

# Set environment variables
vercel env add VITE_API_URL production
```

### Backend (Local via Tailscale)

Backend runs locally, exposed via Tailscale tunnel:
```json
{
  "gateway": {
    "port": 18789,
    "tailscale": { "mode": "serve" },
    "auth": { "allowTailscale": true }
  }
}
```

---

## Testing

```bash
# Test API health
curl http://localhost:8000/api/stats

# Test WebSocket
# Connect browser to ws://localhost:8000/ws

# Test SOUL endpoint
curl http://localhost:8000/api/agents/dev/soul
```

---

## Common Tasks

### Create First Agent

```bash
curl -X POST http://localhost:8000/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "id": "dev",
    "name": "Dev Agent",
    "role": "INT",
    "avatar": "💻",
    "status": "IDLE"
  }'
```

---

## SOUL Builder: Agent Identity Architect

The **SOUL Builder** is OpenClaw's advanced tool for defining an AI agent's "psyche" and operational boundaries. Through an AI-guided process, it transforms abstract ideas into structured, executable identity profiles (SOUL.md files).

### Creation Workflow (3 Stages)

#### Stage 1: Base Identity

Foundational definitions:
- **Agent Name**: Unique identifier in the ecosystem
- **Agent Type**: Autonomous Agent or Subagent (reports to hierarchy)
- **Base Concept**: High-level purpose description
- **Hierarchy Parent**: If subagent, dynamically select superior agent

#### Stage 2: Structure & Hierarchy

AI-generated detailed structure (using Gemini models):
- **Role**: Specific personality/function the agent adopts
- **Mission**: Primary objective the agent must achieve
- **Competencies**: Technical skills and specific knowledge areas
- **Restrictions**: Ethical and operational boundaries (e.g., "Do not modify system files")

#### Stage 3: Review & Score

- **Markdown Preview**: Live preview of final SOUL.md file
- **Save & Broadcast**: Persists identity to server + notifies ecosystem of new agent

### Identity Metrics (Real-Time Analysis)

| Metric | Description |
|--------|-------------|
| **Identity Strength** | Global score combining clarity, restrictions, and specialization |
| **Clarity** | Measures precision of Role/Mission definitions (analyzes length + technical terminology) |
| **Constraint Quality** | Evaluates operational boundary clarity (vital for safety/control) |
| **Specialization** | Compares competencies with existing agents to ensure unique value |

### AI Assistant & Insights

Sidebar providing intelligent feedback during creation:

| Feature | Purpose |
|---------|---------|
| **Conflict Detection** | Identifies critical overlaps with existing agents |
| **Recommendations** | Suggests improvements (add restrictions, be more specific) |
| **Missing Elements** | Warns about vital sections needed for proper function |
| **Strengthen Identity** | Quick-action button for AI to refine draft based on detected weaknesses |

### Technical Details

- **Dynamic Generation**: Backend uses optimized prompts to avoid generic responses
- **In-Memory Backend**: Agents stored dynamically, immediately available as hierarchy options
- **SOUL.md Format**: Standardized Markdown file serving as agent "constitution"

### SOUL.md Structure

```markdown
## Role
[Agent's specific function/personality]

## Mission
[Primary objective]

## Competencies
- [Skill 1]
- [Skill 2]
- [Knowledge area]

## Restrictions
- [Boundary 1]
- [Boundary 2]
- [Ethical constraint]

## Behavior Guidelines
[How agent should approach tasks]
```

This system transforms agent configuration from tedious "prompt engineering" into software architecture design, ensuring each AI infrastructure piece is secure, efficient, and specialized.

---

## SOLAPA (Single-Command Installation)

Quick deployment via automated installer script.

### Installation Command

```bash
curl -fsSL https://clawmetry.com/install.sh | bash
```

### What It Does

The SOLAPA installer:
1. Downloads the latest ClawController release
2. Sets up backend Python virtual environment
3. Installs frontend Node.js dependencies
4. Creates necessary directories (`data/`, `logs/`)
5. Configures environment variables
6. Optionally starts services automatically

### Installation Options

```bash
# Default installation (to ~/.clawcontroller)
curl -fsSL https://clawmetry.com/install.sh | bash

# Custom installation directory
curl -fsSL https://clawmetry.com/install.sh | bash -s -- --dir /opt/clawcontroller

# Skip auto-start
curl -fsSL https://clawmetry.com/install.sh | bash -s -- --no-start

# Verbose output
curl -fsSL https://clawmetry.com/install.sh | bash -s -- --verbose
```

### Post-Installation

After installation completes:
```bash
# Access dashboard
# Frontend: http://localhost:5001
# API: http://localhost:8000

# Manage services
./start.sh   # Start services
./stop.sh    # Stop services
```

### Uninstall

```bash
# Remove installation
rm -rf ~/.clawcontroller
rm -rf /usr/local/bin/clawcontroller  # If CLI was installed
```

### Create Task

```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Build login page",
    "description": "Create responsive login form",
    "priority": "high",
    "tags": ["coding", "frontend"],
    "assignee_id": "dev"
  }'
```

### Log Activity

```bash
curl -X POST http://localhost:8000/api/tasks/{TASK_ID}/activity \
  -H "Content-Type: application/json" \
  -d '{"agent_id": "dev", "message": "Started working on layout"}'
```

---

## Troubleshooting

### Port Already in Use
```bash
lsof -i :8000  # Find backend process
lsof -i :5001  # Find frontend process
kill -9 <PID>
```

### Database Issues
```bash
# Reset database
rm data/mission_control.db
# Restart backend - will recreate automatically
```

### CORS Issues
- Backend allows all origins by default (`CORSMiddleware` in `main.py`)
- For production, restrict in `main.py` line 27

### WebSocket Connection Failed
- Verify backend is running: `curl http://localhost:8000/api/stats`
- Check firewall allows port 8000

---

## Related Documentation

| File | Description |
|------|-------------|
| `README.md` | Full user documentation |
| `AGENT_INSTRUCTIONS.md` | Integration guide for AI agents |
| `CHANGELOG.md` | Version history |
| `VERCEL_DEPLOYMENT.md` | Vercel deployment guide |
| `INTEGRACION_COMPLETADA.md` | SOUL hot-reload implementation details |
| `IMPLEMENTACION_COMPLETADA.md` | Spanish implementation summary |

---

## External Dependencies

### Python (`backend/requirements.txt`)
- `fastapi>=0.109.0`
- `uvicorn[standard]>=0.27.0`
- `sqlalchemy>=2.0.0`
- `httpx>=0.25.0` (for SOUL hot-reload)
- `websockets>=12.0`

### Node.js (`frontend/package.json`)
- `react@^19.2.0`
- `vite@^7.2.4`
- `tailwindcss@^4.1.18`
- `zustand@^5.0.11`
- `@dnd-kit/*` (drag-and-drop)
- `lucide-react` (icons)
- `date-fns` (date utilities)

---

## Project URLs

- **GitHub:** https://github.com/mdonan90/ClawController
- **Documentation:** https://clawcontroller.com
- **OpenClaw:** https://openclaw.ai
