#!/usr/bin/env bash
set -e

cd "D:/mjm/MJM-main/frontend"

CHROME_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe"
REPORT_DIR="reports/lighthouse"
mkdir -p "$REPORT_DIR"

run_test() {
  local URL=$1
  local PAGE_NAME=$2
  local DEVICE=$3
  local RUN=$4
  
  local FLAGS="--no-sandbox --headless --disable-gpu"
  local OUT_FILE="${REPORT_DIR}/${PAGE_NAME}.${DEVICE}.run-${RUN}.report"
  
  if [ "$DEVICE" = "mobile" ]; then
    npx lighthouse "$URL" \
      --chrome-path="$CHROME_PATH" \
      --chrome-flags="$FLAGS" \
      --port=9222 \
      --output=json \
      --output-path="$OUT_FILE" \
      --only-categories=performance,accessibility,best-practices,seo \
      --screenEmulation.mobile \
      --screenEmulation.width=390 \
      --screenEmulation.height=844 \
      --screenEmulation.deviceScaleFactor=3 \
      --throttling.rttMs=150 \
      --throttling.throughputKbps=1638.4 \
      --throttling.cpuSlowdownMultiplier=4 \
      --max-wait-for-load=60000 \
      2>&1 | tail -5
  else
    npx lighthouse "$URL" \
      --chrome-path="$CHROME_PATH" \
      --chrome-flags="$FLAGS" \
      --port=9222 \
      --output=json \
      --output-path="$OUT_FILE" \
      --only-categories=performance,accessibility,best-practices,seo \
      --screenEmulation.desktop \
      --throttling.rttMs=0 \
      --throttling.throughputKbps=0 \
      --throttling.cpuSlowdownMultiplier=1 \
      --max-wait-for-load=60000 \
      2>&1 | tail -5
  fi
  
  echo "DONE: ${PAGE_NAME} ${DEVICE} run ${run}"
}

PAGES=(
  "/:home"
  "/shop:shop"
  "/categories:categories"
  "/auth/login:login"
  "/cart:cart"
  "/about:about"
  "/contact:contact"
  "/faq:faq"
  "/products:products"
  "/bundles:bundles"
  "/custom-printing:custom-printing"
  "/water-subscriptions:water-subscriptions"
  "/privacy:privacy"
  "/terms:terms"
  "/returns:returns"
  "/shipping:shipping"
)

for entry in "${PAGES[@]}"; do
  URL="http://localhost:3002${entry%%:*}"
  NAME="${entry##*:}"
  
  echo "===== Testing: $NAME ====="
  
  for run in 1 2 3; do
    run_test "$URL" "$NAME" "desktop" "$run"
    sleep 1
  done
  
  for run in 1 2 3; do
    run_test "$URL" "$NAME" "mobile" "$run"
    sleep 1
  done
  
  echo "---"
done

echo "===== ALL TESTS COMPLETED ====="
echo "Total reports: $(ls -1 "$REPORT_DIR"/*.json 2>/dev/null | wc -l)"
