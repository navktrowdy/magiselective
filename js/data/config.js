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
export const BREAKS = [
  { name: 'India trip', start: '2026-12-23', end: '2027-01-25', builtIn: true },
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
