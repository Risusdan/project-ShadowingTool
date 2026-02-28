#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PIDS_FILE="$SCRIPT_DIR/.pids"

stopped=0

# Try killing from .pids file first
if [ -f "$PIDS_FILE" ]; then
    while IFS='=' read -r name pid; do
        if kill -0 "$pid" 2>/dev/null; then
            echo "Stopping $name (PID $pid)..."
            kill "$pid" 2>/dev/null
            stopped=$((stopped + 1))
        fi
    done < "$PIDS_FILE"
    rm -f "$PIDS_FILE"
fi

# Fallback: kill anything on ports 5001/5173
for port in 5001 5173; do
    pids=$(lsof -ti :"$port" 2>/dev/null || true)
    if [ -n "$pids" ]; then
        echo "Killing process(es) on port $port: $pids"
        echo "$pids" | xargs kill 2>/dev/null
        stopped=$((stopped + 1))
    fi
done

if [ "$stopped" -eq 0 ]; then
    echo "No running services found."
else
    echo "All services stopped."
fi
