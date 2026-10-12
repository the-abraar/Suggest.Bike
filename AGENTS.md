# Agent notes

- Run `scripts/check.sh` before finishing (typecheck, stray files, unsafe HTML, data validate, tests, build). `--fast` = typecheck, stray files, unsafe HTML only; it is the pre-commit hook (`.githooks`, enabled locally via `git config core.hooksPath .githooks`).
- No Python. Node 22 (matches CI). Stack is Next 16 static export to `out/`; no ESLint, `tsc` is the lint.
- `typecheck` and `build` regenerate `src/data/generated` and `public/data/bikes` (gitignored) from `src/data`; edit the source, not the generated files.
- `deploy.yml` gates (validate, tsc, finder test, build) are the deploy contract; `check.yml` is the separate full check.
- Real-browser QA is not in `check.sh`: when changing UI or layout, read `tools/qa/README.md` (own `package.json`, screenshots in gitignored `tools/qa/shots/`).
- Price freshness: read `scripts/price-audit.mjs` (`npm run audit:prices`) when touching bike prices; sources in `SOURCES.md`.
- Launch context and open gaps: `judge.md`, `Todo_agent.md`.
- Review rules: `CODING_STANDARDS.md`.
