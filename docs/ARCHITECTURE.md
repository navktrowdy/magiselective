# Architecture

The app is split into three layers so it can grow from one family and one exam into a product for many families and many exams.

| Layer | Where | What it holds | Changes when… |
|---|---|---|---|
| **Engine** | `js/*.js`, `js/gen/` | Test sessions, scoring, analytics, planner, Potalien, parent summary, AI marker, sync | a feature is added |
| **Exam pack** | `js/packs/<exam>/` | One exam: sections and timings, topic taxonomy, writing rubric and guide, concept notes, question banks, which generators apply | an exam is added or its format changes |
| **Family data** | `data/` | One family: `family.json` (external test results, routine, breaks), `results/`, `profile.json` | a family uses the app |

## Rules (checked by `tools/validate.mjs` on every push)
1. The engine reads the exam only through `js/pack.js`. It never imports from `js/packs/` and never names an exam; it uses `PACK.name` and `PACK.shortName`.
2. The engine contains no family details. They come from `js/family.js`, which loads `data/family.json` at runtime and falls back to empty defaults, so a new family gets a working app with no file at all.
3. Generators in `js/gen/` are shared building blocks. A pack lists the ones that suit its exam.

## Adding an exam
1. Copy `js/packs/nsw-selective/` to a new folder and edit `pack.js`: sections, timings, taxonomy, rubric, banks and generators.
2. Register it in `js/pack.js`.
3. Run the four checks in `tools/`.

Today the active pack is chosen in `js/pack.js` (NSW Selective by default). With accounts, it becomes a per-child setting.

## Planned next steps
- Split `js/app.js` into one module per screen.
- Move `data/` out of the public repository.
- After the exam: accounts and a database replace `js/store.js` and `js/family.js`; questions are served to signed-in users only; AI marking moves to the server; payments.
