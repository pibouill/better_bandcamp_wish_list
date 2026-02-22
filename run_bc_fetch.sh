#!/bin/bash

# Configuration
PROJECT_DIR="/Users/pierre/work/stuff/bandcamp"
NODE_BIN="/opt/homebrew/bin/node"
SCRIPT_FILE="bc_fetch.mjs"
LOG_FILE="$PROJECT_DIR/wishlist-cron.log"

{
  echo "Starting job: $(date)"
  # Navigate to project directory
  cd "$PROJECT_DIR" && "$NODE_BIN" "$SCRIPT_FILE" whileone
  echo "Job finished: $(date)"
} >> "$LOG_FILE" 2>&1
