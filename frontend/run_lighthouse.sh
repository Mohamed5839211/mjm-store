#!/usr/bin/env bash
set -e

cd "D:/mjm/MJM-main/frontend"

CHROME_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe"
REPORT_DIR="reports/lighthouse"
mkdir -p "$REPORT_DIR"

PAGES=(
  "/:/"
  "/shop:/shop"
  "/categories:/categories"
  "/auth/login:/login"
  "/cart:/cart"
  "/about:/about"
  "/contact:/contact"
  "/faq:/faq"
  "/products:/products"
  "/bundles:/bundles"
  "/custom-printing:/custom-printing"
  "/water-subscriptions:/water-subscriptions"
  "/privacy:/privacy"
  "/terms:/terms"
  "/returns:/returns"
  "/shipping:/shipping"
)

run_lighthouse() {
  local URL=$1
  local PAGE_NAME=$2
  local DEVICE=$3
  local RUN=$4
  
  local OUT_FILE="${REPORT_DIR}/${PAGE_NAME}.${DEVICE}.run-${run}"
  
  npx lighthouse "$URL"     --chrome-path="$CHROME_PATH"     --chrome-flags="--no-sandbox --headless --disable-gpu"     --port=9222     --output=json     --output-html     --output-path="$OUT_FILE"     --only-categories=performance,accessibility,best-practices,seo     --preset="$DEVICE"     --max-wait-for-load=60000     --throttling.rttMs=0     --throttling.throughputKbps=0     --throttling.cpuSlowdownMultiplier=1     2>&1 | grep -E "(score|Status|error|Error)" || true
  
  # Rename HTML file if it exists
  if [ -f "${OUT_FILE}.report.html" ]; then
    mv "${OUT_FILE}.report.html" "${OUT_FILE}.report.html" 2>/dev/null || true
  fi
  
  echo "Completed: ${PAGE_NAME} ${DEVICE} run ${run}"
}

for entry in "${PAGES[@]}"; do
  URL="http://localhost:3002${entry%%:*}"
  NAME="${entry##*:}"
  
  # Skip dynamic pages
  if [[ "$NAME" =~ \[ ]]; then
    continue
  fi
  
  echo "=== Testing: $NAME ==="
  
  for run in 1 2 3; do
    run_lighthouse "$URL" "$NAME" "desktop" "$run" || true
    sleep 2
  done
  
  for run in 1 2 3; do
    run_lighthouse "$URL" "$NAME" "mobile" "$run" || true
    sleep 2
  done
  
  echo "---"
done

echo "=== All tests completed ==="
ls -la "$REPORT_DIR"/*.json | wc -l
