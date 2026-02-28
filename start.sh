#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PIDS_FILE="$SCRIPT_DIR/.pids"

# Clean up stale pids file
rm -f "$PIDS_FILE"

echo "Starting backend (port 5001)..."
cd "$SCRIPT_DIR/backend"
uv run python app.py &
BACKEND_PID=$!
echo "backend=$BACKEND_PID" >> "$PIDS_FILE"

echo "Starting frontend (port 5173)..."
cd "$SCRIPT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!
echo "frontend=$FRONTEND_PID" >> "$PIDS_FILE"

echo ""
echo "Services started:"
echo "  Backend:  http://localhost:5001  (PID $BACKEND_PID)"
echo "  Frontend: http://localhost:5173  (PID $FRONTEND_PID)"
echo ""
echo "Run ./stop.sh to stop both services."

wait
