// The ACTIVE exam pack. Everything exam-specific reaches the engine through this module,
// so supporting a new exam means adding a pack folder, not editing the engine.
import nswSelective from './packs/nsw-selective/pack.js';

export const PACKS = { [nswSelective.id]: nswSelective };
const chosen = typeof localStorage !== 'undefined' ? localStorage.getItem('ms.pack') : null;
export const PACK = PACKS[chosen] || nswSelective;

export const SUBJECTS = PACK.sections;
export const SUBJECT_ORDER = PACK.sectionOrder;
export const TOPIC_STRANDS = PACK.taxonomy;
export const RUBRIC = PACK.writing.rubric;
export const RUBRIC_TOTAL = RUBRIC.reduce((a, c) => a + c.max, 0);
export const TIPS = PACK.writing.tips;
export const WRITING_TASKS = PACK.writing.tasks;
export const WRITING_GUIDE = PACK.writing.guide;
export const CONCEPTS = PACK.concepts;
export const BANKS = PACK.banks;
export const GENERATORS = PACK.generators;
