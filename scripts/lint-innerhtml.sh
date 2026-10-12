#!/usr/bin/env bash
# Fails on HTML sinks fed by template interpolation or string concatenation.
# Allow a line with a trailing `// safe-html: <reason>`.
set -euo pipefail
cd "$(dirname "$0")/.."
sink='(innerHTML|outerHTML|insertAdjacentHTML|document\.write|dangerouslySetInnerHTML)'
hits=$(grep -rnE --include='*.html' --include='*.js' --include='*.mjs' --include='*.jsx' --include='*.ts' --include='*.tsx' \
  --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=out --exclude-dir=.git --exclude-dir=generated --exclude-dir=.claude \
  "${sink}[^;]*(\\$\\{|['\"\`] *\\+|\\+ *['\"\`])" src scripts public tests tools 2>/dev/null | grep -v 'safe-html:' || true)
if [ -n "$hits" ]; then echo "$hits"; echo "unsafe HTML sink(s): escape, use textContent, or add '// safe-html: <reason>'" >&2; exit 1; fi
