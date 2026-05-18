#!/bin/bash
# Kill Corix containers running longer than 30 minutes
LABEL="corix-computer"
MAX_AGE_SECONDS=1800

docker ps --filter "label=${LABEL}" --format "{{.ID}} {{.CreatedAt}}" | while read -r ID CREATED REST; do
    CREATED_TS=$(date -d "${CREATED} ${REST}" +%s 2>/dev/null)
    NOW_TS=$(date +%s)
    if [ -n "$CREATED_TS" ]; then
        AGE=$((NOW_TS - CREATED_TS))
        if [ "$AGE" -gt "$MAX_AGE_SECONDS" ]; then
            echo "$(date '+%Y-%m-%d %H:%M:%S') Killing corix container $ID (age: ${AGE}s)"
            docker stop "$ID" 2>/dev/null
            docker rm "$ID" 2>/dev/null
        fi
    fi
done
