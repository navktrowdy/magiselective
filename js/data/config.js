import EXTERNAL, { WRITING_RECURRING } from './external.js';
// Central configuration: subjects, test formats, category taxonomy and baseline.
// Edit DEFAULT_SETTINGS.examDate in the app's Settings page rather than here.

export const DEFAULT_SETTINGS = {
  nickname: 'Potalien',
  examDate: '2027-05-01',
  github: { owner: 'navktrowdy', repo: 'magiselective', branch: 'main', path: 'data/results', token: '' },
};

// Official NSW Selective High School Placement Test format (computer-based).
// Mini mocks are short, all-category tests for school nights.
export const SUBJECTS = {
  reading: {
    id: 'reading', name: 'Reading', icon: '📖', options: 4,
    mock: { questions: 17, minutes: 45, note: '14 passage questions + 3 multi-part sets' },
    mini: { questions: 2, minutes: 20, note: '1 passage + 1 multi-part set' },
    strands: ['Narrative', 'Poetry', 'Informational & Persuasive', 'Gapped Text', 'Comparing Texts', 'Word Meaning in Context'],
  },
  maths: {
    id: 'maths', name: 'Mathematical Reasoning', short: 'Maths', icon: '🔢', options: 5,
    mock: { questions: 35, minutes: 40 },
    mini: { questions: 13, minutes: 15 },
    strands: ['Number and Algebra', 'Measurement and Geometry', 'Statistics and Probability', 'Problem Solving', 'Data Interpretation'],
  },
  thinking: {
    id: 'thinking', name: 'Thinking Skills', short: 'Thinking', icon: '🧠', options: 4,
    mock: { questions: 40, minutes: 40 },
    mini: { questions: 15, minutes: 15 },
    strands: ['Critical Thinking', 'Problem Solving'],
  },
  writing: {
    id: 'writing', name: 'Writing', icon: '✍️',
    mock: { questions: 1, minutes: 30 },
    mini: null,
    strands: ['Writing'],
  },
};

// Look-and-feel themes (picked in Settings or on the My Potalien page). Swatches are for the picker.
export const THEMES = [
  { id: 'sand', name: 'Warm Sand', blurb: 'Calm cream, gold and green', sw: ['#faf6f0', '#c9a55c', '#5a8a64', '#2b2620'] },
  { id: 'spudonia', name: 'Planet Spudonia', blurb: 'Potalien\'s purple home planet', sw: ['#f4f0ff', '#6c4ad1', '#b8f04a', '#2a1f4d'] },
  { id: 'cosmic', name: 'Cosmic Night', blurb: 'Dark space mode, easy on the eyes', sw: ['#0f1430', '#8b7cf6', '#ffd166', '#1fb5c9'] },
  { id: 'candy', name: 'Candy Pop', blurb: 'Bright pink and orange', sw: ['#fff4f8', '#e8578f', '#ffb347', '#2ec4b6'] },
  { id: 'ocean', name: 'Ocean Breeze', blurb: 'Cool blues and coral', sw: ['#eef7fb', '#1f7aa8', '#2ec4b6', '#ff7f5c'] },
  { id: 'jungle', name: 'Jungle Explorer', blurb: 'Leafy greens and mango orange', sw: ['#f1f6e9', '#2f7d32', '#8bc34a', '#f39c12'] },
];

// Family breaks built into the app (no study planned). More can be added in Settings.
// External "Selective Trial Test Summary Report" (oldest first). Scores are percentages;
// total = 25% each of Maths, Thinking, Reading and Writing. No dates were given, so charts use test numbers.
export const CS_TRIALS = [
  { tests: '1–2', maths: 49, thinking: 38, reading: 32, writing: 68, total: 46.75, rank: 110, of: 138 },
  { tests: '3–4', maths: 40, thinking: 53, reading: 45, writing: 60, total: 49.5, rank: 121, of: 147 },
  { tests: '5–6', maths: 66, thinking: 50, reading: 66, writing: 72, total: 63.5, rank: 65, of: 149 },
  { tests: '7–8', maths: 80, thinking: 75, reading: 37, writing: 68, total: 65.0, rank: 49, of: 153 },
  { tests: '9–10', maths: 43, thinking: 38, reading: 55, writing: 68, total: 51.0, rank: 128, of: 151 },
  { tests: '11–12', maths: 54, thinking: 55, reading: 63, writing: 70, total: 60.6, rank: 162, of: 252 },
  { tests: '13–14', maths: 40, thinking: 65, reading: 76, writing: 57, total: 59.5, rank: 180, of: 258 },
  { tests: '15–16', maths: 37, thinking: 40, reading: 55, writing: 61, total: 48.25, rank: 222, of: 270 },
  { tests: '17–18', maths: 43, thinking: 55, reading: 50, writing: 70, total: 54.55, rank: 218, of: 277 },
  { tests: '19–20', maths: 43, thinking: 53, reading: 50, writing: 65, total: 52.75, rank: 222, of: 278 },
  { tests: '21–22', maths: 23, thinking: 48, reading: 50, writing: 75, total: 49.0, rank: 311, of: 378 },
  { tests: '23–24', maths: 29, thinking: 38, reading: 45, writing: 70, total: 45.5, rank: 312, of: 397 },
];

/** Trend facts from the trial history, used by the Exams page, Parent page and email. */
export function trialTrends(trials = CS_TRIALS) {
  const avg = (arr, k) => Math.round(arr.reduce((a, t) => a + t[k], 0) / arr.length);
  const half = Math.floor(trials.length / 2);
  const early = trials.slice(0, half), late = trials.slice(half), last3 = trials.slice(-3);
  const subjects = ['maths', 'thinking', 'reading', 'writing'].map(k => ({
    key: k, early: avg(early, k), late: avg(late, k), last3: avg(last3, k),
    best: Math.max(...trials.map(t => t[k])), bestAt: trials.find(t => t[k] === Math.max(...trials.map(x => x[k]))).tests,
    latest: trials[trials.length - 1][k],
  }));
  const ahead = t => Math.round((1 - t.rank / t.of) * 100);
  return { subjects, ahead, latest: trials[trials.length - 1], best: trials.reduce((m, t) => (t.total > m.total ? t : m)), aheadAvg: Math.round(trials.reduce((a, t) => a + ahead(t), 0) / trials.length) };
}

export const BREAKS = [
  { name: 'India trip', start: '2026-12-23', end: '2027-01-24', builtIn: true },
  { name: 'Jet-lag rest day', start: '2027-01-25', end: '2027-01-25', builtIn: true, recovery: true },
];

export const SUBJECT_ORDER = ['reading', 'maths', 'thinking', 'writing'];

// Magizhini's weekly routine. The plan only puts app work on lighter days and keeps
// the total to about 2¼ hours a week, so it adds to (not replaces) tuition homework and school work.
export const ROUTINE = {
  Mon: { icon: '🏠', busy: 'School homework & tuition books', mins: 25 },
  Tue: { icon: '🏠', busy: 'School homework & tuition books', mins: 25 },
  Wed: { icon: '📚', busy: 'Tuition 4:30–8 pm', mins: 0 },
  Thu: { icon: '📚', busy: 'Tuition 4:30–8 pm', mins: 0 },
  Fri: { icon: '🥊', busy: 'Boxing 4–5:30 pm', mins: 15 },
  Sat: { icon: '🪔', busy: 'Tamil school 1–5 pm', mins: 30, when: 'in the morning' },
  Sun: { icon: '🌤️', busy: 'Tamil homework', mins: 45 },
};

// External test results (No. 14–24) live in ./external.js.
export const CS_EXAMS = EXTERNAL;
export { WRITING_RECURRING };

// Summary per subject used across the app: latest exam + all exam topic counts combined.
export const BASELINE = (() => {
  const out = {};
  const sorted = [...CS_EXAMS].sort((a, b) => a.date.localeCompare(b.date));
  for (const e of sorted) {
    const prev = out[e.subject] || { topics: {} };
    const topics = { ...prev.topics };
    for (const [t, [c, n]] of Object.entries(e.topics || {})) { const x = topics[t] || [0, 0]; topics[t] = [x[0] + c, x[1] + n]; }
    out[e.subject] = { score: Math.round((e.score / e.total) * 10000) / 100, cohortAverage: e.avg, strands: e.strands || {}, topics, date: e.date, name: e.name, rank: e.rank, rankOf: e.rankOf };
  }
  return out;
})();

// Topics are grouped into strands (the "categories" every test must cover).
export const TOPIC_STRANDS = {
  maths: {
    'Whole Numbers': 'Number and Algebra',
    'Addition and Subtraction': 'Number and Algebra',
    'Multiplication and Division': 'Number and Algebra',
    'Fractions': 'Number and Algebra',
    'Decimals': 'Number and Algebra',
    'Percentages': 'Number and Algebra',
    'Patterns': 'Number and Algebra',
    'Length': 'Measurement and Geometry',
    'Mass': 'Measurement and Geometry',
    'Perimeter': 'Measurement and Geometry',
    'Area': 'Measurement and Geometry',
    'Volume and Capacity': 'Measurement and Geometry',
    'Time': 'Measurement and Geometry',
    'Angles': 'Measurement and Geometry',
    '2D Space': 'Measurement and Geometry',
    '3D Space': 'Measurement and Geometry',
    'Data': 'Statistics and Probability',
    'Probability': 'Statistics and Probability',
    'Problem Solving': 'Problem Solving',
    'Data Interpretation': 'Data Interpretation',
  },
  thinking: {
    'Finding the Main Conclusion': 'Critical Thinking',
    'Identifying Inferences and Assumptions': 'Critical Thinking',
    'Strengthening and Weakening': 'Critical Thinking',
    'Detecting Reasoning Error': 'Critical Thinking',
    'Matching Arguments': 'Critical Thinking',
    'Applying Principles': 'Critical Thinking',
    'Finding Procedures': 'Problem Solving',
    'Relevant Selection': 'Problem Solving',
    'Identifying Similarities and Patterns': 'Problem Solving',
    'Spatial Reasoning': 'Problem Solving',
  },
  reading: {
    'Main Idea': null, 'Inference': null, 'Vocabulary in Context': null,
    "Author's Purpose and Tone": null, 'Figurative Language': null,
    'Text Structure': null, 'Comparing Texts': null, 'Character and Theme': null,
  },
};
