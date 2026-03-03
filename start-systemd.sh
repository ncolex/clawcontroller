#!/bin/bash
# ClawController - Systemd Start Script
# Runs backend and frontend in foreground/managed mode

set -e
SCRIPT_DIR="/home/ncx/.clawcontroller"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# Start Backend (Backgrounded, but trapped)
cd "$BACKEND_DIR"
source venv/bin/activate
python -m uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Start Frontend
cd "$FRONTEND_DIR"
npm run dev -- --port 5001 --host 0.0.0.0 &
FRONTEND_PID=$!

# Trap signals to kill children
trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT SIGTERM

# Wait for processes
wait
