#!/bin/bash

SCRIPT_FILE="bc_fetch.mjs"
LOG_FILE="wishlist-cron.log"

{
	echo "Starting job: $(date)"
	node "$SCRIPT_FILE" "${1:-}"
	echo "Job finished: $(date)"
} >>"$LOG_FILE" 2>&1
