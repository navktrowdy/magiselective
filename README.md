# 👽🥔 Potalien Selective Prep

A practice app for the **NSW Selective High School Placement Test**. It runs on GitHub Pages and needs no install, no accounts and no running costs.

## What it does

| Module | Practice (untimed) | Mini mock | Full timed test (official format) |
|---|---|---|---|
| 📖 Reading | ✔ explanation after every question | 20 min (1 text + 1 multi-part set) | 45 min, 17 questions: 14 on passages + 3 multi-part sets (word meaning, cloze, short texts) |
| 🔢 Mathematical Reasoning | ✔ | 15 min, 13 Qs | 40 min, 35 questions |
| 🧠 Thinking Skills | ✔ | 15 min, 15 Qs | 40 min, 40 questions |
| ✍️ Writing | – | – | 30 min, 1 task, rubric + model answer |

- **Practice mode:** no timer. After each answer she sees whether it was right, a worked explanation and the concept notes. She can practise mixed questions, her weak topics, a single topic, or **re-try her mistakes**.
- **Timed tests:** cover every category, with a countdown, flag-for-review, a question navigator, auto-submit when time runs out and keyboard shortcuts (A–E, ←/→, F).
- **Results:** score, category and topic breakdown compared with her external tests, a timing analysis, the concept notes for every topic she missed, and a full question-by-question explanation.
- **Dashboard:** exam countdown, a weekly plan that changes by phase (Foundation → Build → Exam mode) and targets her weakest topics, a progress chart and focus topics.
- **My Potalien 👽🥔:** she adopts a potato-alien pet (5 species) and names it. It earns XP from every question, **evolves through 6 stages**, and its mood depends on her daily streak. She spends ✨ stardust on hats, glasses, capes and space backgrounds. There are 15 badges to unlock, including "No Spud Left Behind" for a full test with no blanks. The pet cheers or comforts her after each practice answer.
- **My Skills:** a progress map (radar chart), tiles for accuracy, questions, drills and time spent, and a card for every skill showing accuracy, questions answered and time per question. Skills are split into "Practise next" and "Strengths", and she gets a level title (Rising Star → Galaxy Brain).
- **Drills:** her full drill history. She can open any drill to review every answer and worked solution.
- **Exams:** log named monthly exams (score, class average, rank) and chart them against the class average. Her external test results are already included.
- Correct answers are spread evenly across A–E, so there is no letter pattern to guess from.

Test formats follow the [NSW Department of Education](https://education.nsw.gov.au/schooling/parents-and-carers/choosing-a-school-setting/selective-high-schools/placement-test/selective-high-school-practice-tests) guidelines.

### Question bank
- **Maths:** 73 hand-written questions plus 46 question generators × 6 versions (about 350 questions). Generators create fresh numbers and compute the answer and worked explanation in code, so they are always correct.
- **Thinking Skills:** 101 hand-written questions (critical thinking and logic puzzles) plus 14 problem-solving generators × 6 versions (about 185).
- **Reading:** 16 original texts (97 marks) across narrative, poetry, informational/persuasive, word meaning in context, gapped text (cloze) and short thematic texts.
- **Writing:** 11 tasks across narrative, persuasive, speech, newspaper report, diary, advice letter, descriptive and discussion. Each has a model answer and is marked with 7 standard writing criteria (out of 25).

### Weekly plan
The plan fits around Magizhini's routine (tuition Wed/Thu, boxing Fri, Tamil school Sat afternoon). That's about 2¼ hours of app time a week, with no app work on tuition days. Planned rest days never break the 🔥 streak. To change the routine, edit `ROUTINE` in `js/data/config.js`.

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
node tools/validate.mjs     # checks the hand-written banks
node tools/gencheck.mjs     # stress-tests every question generator
```

This checks IDs, answers, option counts and topics. To run the app locally, use `python3 -m http.server` and open http://localhost:8000.

## Weekly summary email (parents)

**Quick option:** add your email addresses in ⚙️ Settings → *Parent emails*. The 📧 **Email us** button on the Parent page then opens your email app with the summary ready to send.

**Automatic option, every Sunday at about 7 pm Sydney time:** a GitHub Action (`.github/workflows/weekly-email.yml`) reads the saved results and emails a formatted summary. One-time setup:
1. Use a Gmail account to send from. Turn on 2-Step Verification, then create an **App password** at <https://myaccount.google.com/apppasswords>.
2. In the repo, go to *Settings → Secrets and variables → Actions → New repository secret* and add:
   - `SMTP_USER`: the Gmail address
   - `SMTP_PASS`: the 16-character app password
   - `EMAIL_TO`: both parent addresses, separated by a comma
3. Test it: *Actions → Weekly parent summary email → Run workflow*.

Addresses and passwords stay in GitHub secrets and never appear in the (public) code. No email is sent during holiday weeks when there was no practice. The email only includes results saved to GitHub, so set up the token in Settings first.
