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
    mock: { questions: 30, minutes: 40 },
    mini: { questions: 12, minutes: 16 },
    strands: ['Narrative', 'Poetry', 'Informational & Persuasive', 'Gapped Text', 'Comparing Texts'],
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

export const SUBJECT_ORDER = ['reading', 'maths', 'thinking', 'writing'];

// Starting point taken from the CS Education Selective No. 17 reports (3 Sep 2026).
// Used to seed "focus topics" and as the first point on the progress chart.
export const BASELINE = {
  date: '2026-09-03',
  label: 'CS Selective No. 17',
  maths: {
    score: 42.86, cohortAverage: 70.46, raw: 15, rawTotal: 35, rank: 216, rankOf: 241,
    strands: {
      'Number and Algebra': [50.0, 74.03],
      'Measurement and Geometry': [33.33, 66.18],
      'Statistics and Probability': [66.67, 79.39],
      'Problem Solving': [25.0, 58.51],
      'Data Interpretation': [0, 73.03],
    },
    // topic: [correct, attempted]
    topics: {
      'Multiplication and Division': [1, 2], 'Area': [2, 3], 'Angles': [0, 2], 'Fractions': [1, 3],
      'Volume and Capacity': [1, 2], '2D Space': [0, 2], 'Probability': [1, 1], 'Patterns': [1, 4],
      'Problem Solving': [1, 4], 'Perimeter': [1, 1], 'Data': [3, 5], 'Percentages': [1, 1],
      'Time': [0, 1], 'Addition and Subtraction': [1, 1], 'Length': [0, 1], 'Data Interpretation': [0, 1],
      'Whole Numbers': [1, 1],
    },
  },
  thinking: {
    score: 55.0, cohortAverage: 66.7, raw: 22, rawTotal: 40, rank: 179, rankOf: 240,
    strands: { 'Problem Solving': [42.11, 65.53], 'Critical Thinking': [66.67, 67.76] },
    topics: {
      'Finding Procedures': [3, 10], 'Finding the Main Conclusion': [2, 4], 'Relevant Selection': [4, 7],
      'Matching Arguments': [5, 5], 'Identifying Similarities and Patterns': [1, 3],
      'Detecting Reasoning Error': [5, 6], 'Applying Principles': [1, 4],
      'Identifying Inferences and Assumptions': [1, 2],
    },
    blanks: 5,
  },
};

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
