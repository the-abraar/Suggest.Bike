# Coding standards (judgement calls)

Reviewer: check the diff against these.

- Cite: every price, mileage, score or service claim shown to users traces to a source in `SOURCES.md` or carries an `APPROX`/UNVERIFIED marker. Why: the site gives money advice; editorial guesses read as facts.
- Date: any bike price change updates its as-of date in the same edit. Why: `validate` ages prices from that date; a silent refresh hides staleness.
- Derive: derived figures (running cost, EMI/loan, match scores) come from the engines in `src`, never re-implemented in a component. Why: two formulas drift apart.
- Derive: test fixtures and mocks take bike ids and field names from `src/data`, and a test fails if they drift. Why: stale ids pass silently.
- Cap: unbounded input (saved bikes, compare slots, URL params) has an explicit limit. Why: static site, all work runs in the visitor's browser.
- Escape: text from users or URL params is rendered as text, never HTML (`// safe-html: <reason>` only for constants). Why: the site is static and cannot sanitise server-side.
- Static: no feature may require a server at runtime; state lives in the URL or localStorage, and a missing or corrupt localStorage value must not crash a page. Why: GitHub Pages export.
- Bilingual: every new user-facing string exists in English and Bangla, with matching keys. Why: the toggle silently falls back and leaves mixed UI.
- Legal: advice on BRTA, fees or law states its as-of date and links the disclaimer. Why: liability for wrong figures.
- Privacy: microphone audio and phone numbers stay on-device and are never sent or logged without a privacy-page update. Why: legal pages promise this.
