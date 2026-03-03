#!/bin/bash
# ClawController - Stop Script
# Stops both backend and frontend services

echo "🛑 Stopping ClawController..."

# Kill backend
BACKEND_PID=$(pgrep -f "uvicorn main:app.*8000" 2>/dev/null)
if [ -n "$BACKEND_PID" ]; then
    kill $BACKEND_PID 2>/dev/null
    echo "  ✅ Backend stopped (was PID: $BACKEND_PID)"
else
    echo "  ⚪ Backend not running"
fi

# Kill frontend
FRONTEND_PID=$(pgrep -f "vite.*5001" 2>/dev/null)
if [ -n "$FRONTEND_PID" ]; then
    kill $FRONTEND_PID 2>/dev/null
    echo "  ✅ Frontend stopped (was PID: $FRONTEND_PID)"
else
    echo "  ⚪ Frontend not running"
fi

echo ""
echo "ClawController stopped."
