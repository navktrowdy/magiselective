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
// CS Education "Selective Trial Test Summary Report" (oldest first). Scores are percentages;
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
// the total to about 2¼ hours a week, so it adds to (not replaces) CS homework and school work.
export const ROUTINE = {
  Mon: { icon: '🏠', busy: 'School homework & CS books', mins: 25 },
  Tue: { icon: '🏠', busy: 'School homework & CS books', mins: 25 },
  Wed: { icon: '📚', busy: 'CS tuition 4:30–8 pm', mins: 0 },
  Thu: { icon: '📚', busy: 'CS tuition 4:30–8 pm', mins: 0 },
  Fri: { icon: '🥊', busy: 'Boxing 4–5:30 pm', mins: 15 },
  Sat: { icon: '🪔', busy: 'Tamil school 1–5 pm', mins: 30, when: 'in the morning' },
  Sun: { icon: '🌤️', busy: 'Tamil homework', mins: 45 },
};

// CS Education exam results (entered from the PDF reports).
// topics: { appTopic: [correct, attempted] } — CS topic names mapped onto the app's topics.
// strands: { strand: [myScore %, cohortAverage %] }
export const CS_EXAMS = [
  { id: 'cs17-maths', name: 'CS Selective No. 17', date: '2026-09-03', subject: 'maths', score: 15, total: 35, avg: 70.46, rank: 216, rankOf: 241,
    strands: { 'Number and Algebra': [50.0, 74.03], 'Measurement and Geometry': [33.33, 66.18], 'Statistics and Probability': [66.67, 79.39], 'Problem Solving': [25.0, 58.51], 'Data Interpretation': [0, 73.03] },
    topics: { 'Multiplication and Division': [1, 2], 'Area': [2, 3], 'Angles': [0, 2], 'Fractions': [1, 3], 'Volume and Capacity': [1, 2], '2D Space': [0, 2], 'Probability': [1, 1], 'Patterns': [1, 4],
      'Problem Solving': [1, 4], 'Perimeter': [1, 1], 'Data': [3, 5], 'Percentages': [1, 1], 'Time': [0, 1], 'Addition and Subtraction': [1, 1], 'Length': [0, 1], 'Data Interpretation': [0, 1], 'Whole Numbers': [1, 1] } },
  { id: 'cs17-thinking', name: 'CS Selective No. 17', date: '2026-09-03', subject: 'thinking', score: 22, total: 40, avg: 66.7, rank: 179, rankOf: 240, blanks: 5,
    strands: { 'Problem Solving': [42.11, 65.53], 'Critical Thinking': [66.67, 67.76] },
    topics: { 'Finding Procedures': [3, 10], 'Finding the Main Conclusion': [2, 4], 'Relevant Selection': [4, 7], 'Matching Arguments': [5, 5], 'Identifying Similarities and Patterns': [1, 3],
      'Detecting Reasoning Error': [5, 6], 'Applying Principles': [1, 4], 'Identifying Inferences and Assumptions': [1, 2] } },
  { id: 'cs23-maths', name: 'CS Selective No. 23', date: '2026-10-29', subject: 'maths', score: 10, total: 35, avg: 56.65, rank: 352, rankOf: 391,
    strands: { 'Problem Solving': [20.0, 60.05], 'Measurement and Geometry': [7.69, 50.07], 'Number and Algebra': [50.0, 58.44], 'Data Interpretation': [100.0, 66.16], 'Statistics and Probability': [0, 62.15] },
    topics: { 'Problem Solving': [1, 5], 'Time': [1, 1], 'Fractions': [1, 2], 'Angles': [0, 2], 'Data Interpretation': [3, 3], 'Multiplication and Division': [2, 3], 'Area': [0, 2], '3D Space': [0, 1],
      'Length': [0, 1], 'Volume and Capacity': [0, 1], 'Data': [0, 3], 'Probability': [0, 1], '2D Space': [0, 2], 'Percentages': [0, 1], 'Whole Numbers': [1, 2], 'Patterns': [1, 2], 'Perimeter': [0, 2], 'Mass': [0, 1] } },
  { id: 'cs23-thinking', name: 'CS Selective No. 23', date: '2026-10-29', subject: 'thinking', score: 15, total: 40, avg: 59.44, rank: 355, rankOf: 390, blanks: 2,
    strands: { 'Problem Solving': [21.05, 55.82], 'Critical Thinking': [52.38, 62.71] },
    topics: { 'Finding Procedures': [1, 5], 'Matching Arguments': [2, 3], 'Applying Principles': [2, 4], 'Detecting Reasoning Error': [3, 6], 'Relevant Selection': [3, 7],
      'Identifying Similarities and Patterns': [0, 7], 'Finding the Main Conclusion': [4, 4], 'Identifying Inferences and Assumptions': [0, 4] } },
  { id: 'cs24-reading', name: 'CS Selective No. 24', date: '2026-11-05', subject: 'reading', score: 17, total: 38, avg: 60.44, rank: 296, rankOf: 349,
    strands: { 'Narrative': [50.0, 58.13], 'Poetry': [50.0, 64.71], 'Gapped Text': [33.33, 80.47], 'Comparing Texts': [80.0, 68.88], 'Word Meaning in Context': [0, 33.95] },
    topics: { 'Main Idea': [1, 4], 'Inference': [3, 4], 'Figurative Language': [1, 4], 'Vocabulary in Context': [0, 8], "Author's Purpose and Tone": [2, 2], 'Text Structure': [2, 6], 'Comparing Texts': [8, 10] } },
  { id: 'cs24-writing', name: 'CS Selective No. 24 (newspaper report)', date: '2026-11-05', subject: 'writing', score: 18, total: 25, avg: null, rank: 155, rankOf: 350,
    rubric: { content: 3.25, form: 3.1, organising: 3.1, style: 1.8, sentences: 2, spelling: 2, punctuation: 2.25 },
    feedback: ['Start with a more compelling hook.', 'Include quotes from witnesses or school staff (a required element of a news report).',
      'Write a stronger conclusion that wraps up the report.', 'Give more specific details about the incident and its consequences.',
      'Use richer vocabulary and figurative/persuasive language.', 'Use more complex sentences and vary sentence length.',
      'Watch spelling: separately, passersby, witnesses. Use apostrophes for possession (the students\' parents).'] },
];

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
