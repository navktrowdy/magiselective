# 👽🥔 Potalien Selective Prep

A practice app for the **NSW Selective High School Placement Test**. It runs on GitHub Pages and needs no install, no accounts and no running costs.

## What it does

| Module | Practice (untimed) | Mini mock | Full timed test (official format) |
|---|---|---|---|
| 📖 Reading | ✔ explanation after every question | 16 min | 40 min, ~30 questions |
| 🔢 Mathematical Reasoning | ✔ | 15 min, 13 Qs | 40 min, 35 questions |
| 🧠 Thinking Skills | ✔ | 15 min, 15 Qs | 40 min, 40 questions |
| ✍️ Writing | – | – | 30 min, 1 task, rubric + model answer |

- **Practice mode:** no timer. After each answer she sees whether it was right, a worked explanation and the concept notes. She can practise mixed questions, her weak topics, a single topic, or **re-try her mistakes**.
- **Timed tests:** cover every category, with a countdown, flag-for-review, a question navigator, auto-submit when time runs out and keyboard shortcuts (A–E, ←/→, F).
- **Results:** score, category and topic breakdown compared with the Sep 2026 CS Education test, a timing analysis, the concept notes for every topic she missed, and a full question-by-question explanation.
- **Dashboard:** exam countdown, a weekly plan that changes by phase (Foundation → Build → Exam mode) and targets her weakest topics, a progress chart and focus topics.
- **My Potalien 👽🥔:** she adopts a potato-alien pet (5 species) and names it. It earns XP from every question, **evolves through 6 stages**, and its mood depends on her daily streak. She spends ✨ stardust on hats, glasses, capes and space backgrounds. There are 15 badges to unlock, including "No Spud Left Behind" for a full test with no blanks. The pet cheers or comforts her after each practice answer.
- **My Skills:** a progress map (radar chart), tiles for accuracy, questions, drills and time spent, and a card for every skill showing accuracy, questions answered and time per question. Skills are split into "Practise next" and "Strengths", and she gets a level title (Rising Star → Galaxy Brain).
- **Drills:** her full drill history. She can open any drill to review every answer and worked solution.
- **Exams:** log named monthly exams (score, class average, rank) and chart them against the class average. The CS Selective No. 17 results are already included.
- Correct answers are spread evenly across A–E, so there is no letter pattern to guess from.

## One-time setup (parent)

1. **Turn on GitHub Pages:** repo → *Settings* → *Pages* → Source: *Deploy from a branch* → Branch `main`, folder `/ (root)` → Save.
   After a minute the app is live at `https://navktrowdy.github.io/magiselective/`.
2. **Let the app save results to GitHub:** create a fine-grained token (*GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens*):
   - Repository access: **only `magiselective`**
   - Permissions: **Contents: Read and write** (nothing else)
   - Expiry: after the exam (e.g. 31 May 2027)
3. Open the app → **Settings** → paste the token → **Test connection** → **Save**. Do this once on each computer she uses.

Each finished test is committed as a file in `data/results/`, and the pet's profile is saved in `data/profile.json`. XP, streaks and badges are worked out from the results, so they are the same on every computer. Results are also cached in the browser, so nothing is lost if the internet drops; press "Save to GitHub now" later. The **Download backup** button in Settings exports everything.

> **Privacy:** the repository is public, so results only use the nickname ("Potalien"). Do not put her full name in Settings.

## Adding more questions

Questions live in `js/data/` (`maths.js`, `thinking.js`, `reading.js`, `writing.js`), and the concept notes are in `concepts.js`. After editing, run:

```bash
node tools/validate.mjs
```

This checks IDs, answers, option counts and topics. To run the app locally, use `python3 -m http.server` and open http://localhost:8000.
