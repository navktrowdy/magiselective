// EXAM PACK: NSW Selective High School Placement Test (Year 6 sitting, for Year 7 entry).
// A pack is everything that is specific to ONE exam: its sections and timings, the topic taxonomy,
// the writing rubric and guide, the concept notes, the question banks and which generators apply.
// The engine (js/*.js) only reads the active pack through js/pack.js and never names an exam itself.
// To support another exam (e.g. NSW OC, a Victorian selective entry test), add a sibling folder
// with the same shape and register it in js/pack.js.
import maths from './content/maths.js';
import thinking1 from './content/thinking.js';
import thinking2 from './content/thinking2.js';
import reading1 from './content/reading.js';
import reading2 from './content/reading2.js';
import writing, { RUBRIC, TIPS } from './content/writing.js';
import * as writingGuide from './content/writingGuide.js';
import concepts from './content/concepts.js';
import mathsGen from '../../gen/mathsGen.js';
import anglesGen from '../../gen/anglesGen.js';
import spaceGen from '../../gen/spaceGen.js';
import thinkingGen from '../../gen/thinkingGen.js';

// Official test format (computer-based). Mini mocks are short, all-category tests for school nights.
const sections = {
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

// Topics are grouped into strands (the "categories" every test must cover).
const taxonomy = {
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

export default {
  id: 'nsw-selective',
  name: 'NSW Selective High School Placement Test',
  shortName: 'Selective',
  region: 'NSW, Australia',
  student: 'a Year 5 student (age 10)', // who usually prepares for it (used by the AI writing marker)
  defaultExamDate: '2027-05-01',
  sections,
  sectionOrder: ['reading', 'maths', 'thinking', 'writing'],
  taxonomy,
  // Reading: 17 questions in 45 minutes = 14 single questions on passages + one of each multi-part set.
  reading: { multiPartTypes: ['Word Meaning in Context', 'Gapped Text', 'Comparing Texts'], passageQuestions: 14 },
  writing: { rubric: RUBRIC, tips: TIPS, tasks: writing, guide: writingGuide },
  concepts,
  banks: { maths, thinking: [...thinking1, ...thinking2], reading: [...reading1, ...reading2] },
  generators: { maths: [...mathsGen, ...anglesGen, ...spaceGen], thinking: thinkingGen },
};
