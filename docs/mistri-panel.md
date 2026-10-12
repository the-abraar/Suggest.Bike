# Mistri panel protocol (one page)

Goal: replace one editor's guesses for the mechanic-facing scores with ratings from named working mechanics, published with method and date.

## Who and how many

- 6 mechanics to start (minimum 5 for a rating to publish): 2 in Dhaka (one Bangshal parts-market workshop, one Mirpur or Jatrabari roadside workshop), 1 in Chattogram, and 3 in district towns in different divisions (for example Bogura, Jashore, Sylhet).
- At least 5 years running their own or a senior bench. No one employed by a distributor or authorised service centre (conflict of interest); ex-employees are fine.
- Each is named on `/method` (name, area, years) only with written consent. If someone wants to stay anonymous, they appear as "mechanic, Mirpur, 12 years".

## What they rate

Per bike, 1–10, with a one-line reason each:

| Score | Question asked |
| --- | --- |
| Mechanic familiarity | How often do you work on this engine, and can you fix it without the dealer? |
| Parts availability | Can you get brake, clutch, chain set, filters and electricals the same day? Genuine or copy? |
| Reliability | What comes back to your shop, and at what km? |

Also collected, not scored: typical labour charge for a full service, and current prices for 5 common parts (brake shoes, chain set, clutch plates, air filter, oil change). These update the parts table directly, with the month.

Not asked: comfort, highway, performance, beginner-friendliness. Those stay editorial and are labelled so.

## How a session runs

1. Quarterly, one visit or phone call per mechanic, 45–60 minutes, about 25 bikes per session (the most-viewed first, per GoatCounter).
2. The editor reads each bike name and the current score; the mechanic gives their number and reason. The editor does not argue, only records.
3. Paper or a shared sheet; one row per mechanic per bike. Keep the raw sheet.

## Payment

- ৳2,000 per session plus travel or mobile recharge for phone sessions. Paid whatever they say, so there is no incentive to flatter any brand.
- Never paid by, or introduced through, a distributor or dealer.

## How results are published

- Published score = median of panel ratings, rounded, when at least 5 mechanics rated the bike; otherwise the editorial score stays and keeps its "editorial estimate" label.
- Bike pages show "Rated by N mechanics, <month>" next to those three scores. `/method` lists the panel, the questions above and the date of the last round.
- If the panel median differs from the old editorial score by 3 points or more, the change is noted on the bike page for one quarter.
- Raw (anonymised) sheets are kept in the repo under `docs/panel/<yyyy-qN>.csv` so anyone can check the medians.
