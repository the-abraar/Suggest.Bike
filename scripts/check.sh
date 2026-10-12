#!/usr/bin/env bash
# Runs every check, prints a summary table, exits 1 if any step failed. --fast = lint + stray files only.
set -euo pipefail
cd "$(dirname "$0")/.."
FAST=0; [ "${1:-}" = "--fast" ] && FAST=1
names=(); results=()
step() { # name cmd...
  local n=$1; shift; echo "== $n"
  if "$@"; then results+=(pass); else results+=(FAIL); fi
  names+=("$n")
}
stray() {
  local f; f=$(find . \( -path ./node_modules -o -path ./.git -o -path ./.next -o -path ./out -o -path ./tools/qa/node_modules \) -prune -o \
    \( -name '*-e' -o -name '*.orig' -o -name '*.rej' -o -name '*.bak' \) -print)
  [ -z "$f" ] || { echo "$f"; return 1; }
}
step "typecheck (tsc)" npm run --silent typecheck
step "stray files" stray
step "unsafe HTML" scripts/lint-innerhtml.sh
if [ "$FAST" = 0 ]; then
  step "validate data" npm run --silent validate
  step "tests (engines)" npm test --silent
  step "build" npm run --silent build
fi
echo; printf '%-30s | %s\n' step result; printf '%-30s-+-%s\n' "------------------------------" ------
fail=0
for i in "${!names[@]}"; do printf '%-30s | %s\n' "${names[$i]}" "${results[$i]}"; [ "${results[$i]}" = pass ] || fail=1; done
exit $fail
