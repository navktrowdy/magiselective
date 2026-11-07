// Writing guide adapted from Magizhini's tutor's writing notes (paraphrased; examples written for this app).

export const TEST_FACTS = [
  'One prompt, 30 minutes. You only find out the style (persuasive, narrative, diary…) when you open the test, so practise every style.',
  'Two examiners each mark out of 25 (50 in total), looking at four things: Content & relevance, Structure & organisation, Language use, and Mechanics (spelling, punctuation, grammar).',
  'A clearly planned "ordinary" idea beats an ambitious idea that runs out of time.',
];

// 30-minute plan (minutes from the start) — also used for live reminders in the writing timer.
export const TIME_PLAN = [
  { from: 0, to: 3, icon: '📝', name: 'Plan', tip: 'Read the prompt twice. Choose your style and angle. Jot a skeleton: paragraphs or key events, and your ENDING.' },
  { from: 3, to: 24, icon: '✍️', name: 'Write', tip: 'Follow your plan at a steady pace. Don\'t stop to perfect every sentence; get the whole piece down.' },
  { from: 24, to: 29, icon: '🔍', name: 'Proofread', tip: 'Read it back once: fix spelling, punctuation and grammar, and any sentence that doesn\'t make sense. Is the ending complete?' },
  { from: 29, to: 30, icon: '✅', name: 'Final check', tip: 'Did you answer the actual prompt? Does it have a title if one is needed?' },
];

export const TYPES = [
  { id: 'persuasive', name: 'Persuasive', icon: '📣', what: 'Convinces the reader to agree with a view or take action.',
    structure: ['Introduction: state your position clearly with a hook (a striking claim, question or scenario).', 'Body: one argument per paragraph, each with evidence, an example or a mini-story. Use PEEL: Point, Evidence, Explain, Link.', 'Conclusion: restate your view in fresh words, recap the strongest points, end with a call to action or memorable line.'],
    improve: ['Put your strongest argument first.', 'Answer the other side: "Some might argue… however…".', 'Vary paragraph openings: not "Another reason is…" every time.', 'Use specific, believable details instead of vague claims.', 'Match your tone to the audience (a principal vs. classmates).'],
    mistakes: ['Sitting on the fence: that\'s a discussion, not persuasion.', 'Piling up techniques that don\'t do any real work.', 'Repeating the same point in two paragraphs.', 'A conclusion that copies the introduction.'],
    check: ['My position is clear from the first sentence.', 'Each body paragraph makes a different point.', 'I used evidence, an example or an anecdote.', 'I used at least two persuasive techniques on purpose.', 'My conclusion adds something (call to action or final image).'] },
  { id: 'narrative', name: 'Narrative', icon: '📖', what: 'Tells a story, real or imagined.',
    structure: ['Orientation: introduce character and setting through action, not a block of description.', 'Complication: a problem or turning point.', 'Climax: the moment of highest tension.', 'Resolution: how it is solved and what has changed for the character.'],
    improve: ['Start in the middle of something happening.', 'Show, don\'t tell, for the moments that matter (a held breath, shaking hands).', 'Give your character ONE small, specific problem.', 'Slow down at the climax (more detail); speed up action with short sentences.', 'End on an image or action that shows the change, not a summary sentence.'],
    mistakes: ['A long orientation, then no time for the ending: plan the complication first.', '"It was all a dream" endings.', 'Too many "suddenly" and "shockingly" words instead of tense scenes.', 'Dialogue that doesn\'t sound real, or too much of it.'],
    check: ['My opening drops the reader into a moment.', 'There is a clear complication.', 'I showed at least one emotion through action or detail.', 'My ending resolves the problem (no dream twist).', 'I varied sentence length, especially at the climax.'] },
  { id: 'recount', name: 'Recount', icon: '🗓️', what: 'Retells real events or experiences in time order.',
    structure: ['Introduction: who, what, when, where.', 'Events in the order they happened.', 'Conclusion: reflect on why it mattered.'],
    improve: ['Choose the 2–3 moments that mattered most; don\'t list everything.', 'Vary time connectives: initially, soon after, moments later, by the time…', 'Add what you felt, noticed or realised.', 'Use sensory detail at the important moments.'],
    mistakes: ['A timetable: "First… Then… After that…".', 'No reflection at all.', 'Jumping backwards and forwards without signalling it.'],
    check: ['I focused on a few key moments.', 'My time connectives are varied.', 'I included a genuine reflection.', 'I stayed in the past tense.'] },
  { id: 'article', name: 'Newspaper / Article', icon: '📰', what: 'Informs about an event or issue in a journalistic style.',
    structure: ['Headline: grabs attention and shows the angle.', 'Lead paragraph: who, what, when, where, why.', 'Body: details, quotes and background, most important first.', 'Conclusion: what happens next, or a call to action.'],
    improve: ['Write the headline LAST.', 'Invent believable quotes from an eyewitness, expert or official.', 'Most important information first (inverted pyramid).', 'Stay formal and objective outside the quotes.'],
    mistakes: ['A label headline ("A Big Fire") instead of an angle.', 'Slipping into "I" storytelling.', 'Hiding the biggest news in the last paragraph.'],
    check: ['My lead covers who/what/when/where.', 'I included at least one quote or fact/statistic.', 'My tone stays objective outside quotes.', 'My headline shows the angle of the story.'] },
  { id: 'letter', name: 'Letter', icon: '✉️', what: 'Writes to a specific person or group: friendly or formal, telling or persuading.',
    structure: ['Greeting: "Dear …,"', 'Body: a story or point-by-point argument, depending on the purpose.', 'Sign-off that matches the tone: "Yours sincerely," vs "Love,".'],
    improve: ['Decide the relationship and purpose before you start.', 'In a formal letter, say what you want in the first couple of sentences.', 'Keep the greeting and sign-off in the same tone as the body.'],
    mistakes: ['A formal letter that ends "byee!".', 'An essay with "Dear ___" stuck on top.'],
    check: ['My greeting and sign-off match the relationship.', 'My purpose is clear early.', 'My tone stays the same throughout.'] },
  { id: 'expository', name: 'Expository (explain/inform)', icon: '🔬', what: 'Explains a topic clearly and logically, without opinion.',
    structure: ['Introduction: the topic and your focus.', 'Body: one aspect per paragraph with facts and explanation.', 'Conclusion: sum up and reinforce the focus.'],
    improve: ['Group related facts together by sub-topic.', 'Start each paragraph with a topic sentence that previews it.', 'Explain any special term the first time you use it.'],
    mistakes: ['Slipping into opinion ("clearly the best…").', 'A "brain dump" of facts with no order.'],
    check: ['Each paragraph has one clear sub-topic.', 'I stayed factual and neutral.', 'My conclusion doesn\'t add new information.'] },
  { id: 'advice', name: 'Advice Sheet', icon: '💡', what: 'Gives practical recommendations to help the reader decide or act.',
    structure: ['Title showing the topic.', 'Short introduction: the purpose.', 'Body: tips in order of importance, often as bullets or numbered steps.', 'Conclusion: encourage the reader to act.'],
    improve: ['Most important advice first.', 'Use command verbs: Check, Avoid, Remember, Try.', 'Explain WHY for some tips.'],
    mistakes: ['Vague advice like "be careful".', 'A wall of text instead of headings and bullets.'],
    check: ['Every tip is specific and actionable.', 'The most important tip is first.', 'It is easy to scan (headings/bullets).'] },
  { id: 'diary', name: 'Diary Entry', icon: '📔', what: 'A personal record of events, thoughts and feelings.',
    structure: ['Date and "Dear Diary," (optional).', 'What happened, and how you felt about it.', 'A closing thought.'],
    improve: ['Focus on feelings more than events.', 'Use a natural, personal voice, with the odd aside ("or at least, that\'s what I told myself").', 'Let ONE event carry the emotion instead of covering the whole day evenly.'],
    mistakes: ['A story with "Dear Diary" pasted on top.', 'A neutral report with no real feelings.'],
    check: ['It sounds like a real personal reflection.', 'I named and explored at least one feeling.', 'I focused on what mattered most.'] },
  { id: 'guide', name: 'Guide / Instructions', icon: '🧭', what: 'Helps the reader understand or do something step by step.',
    structure: ['Title: what the guide is about.', 'Introduction: purpose.', 'Steps or sections in order.', 'Conclusion: summary or extra tips.'],
    improve: ['Headings or numbered steps that make sense on their own.', 'Add a tip at the exact step where readers might get stuck.', 'Use commands consistently: "Attach the wire", not "You should attach…".'],
    mistakes: ['Skipping a step that seemed obvious to you.', 'Switching between commands and descriptions.'],
    check: ['Every step uses a command verb.', 'Steps are in order with nothing skipped.', 'The headings alone show the whole process.'] },
  { id: 'discussion', name: 'Discussion', icon: '⚖️', what: 'Explores different sides of an issue, then reaches a reasoned conclusion.',
    structure: ['Introduction: the issue and why it matters.', 'Body: each paragraph looks at a different viewpoint.', 'Conclusion: weigh up the arguments and give a reasoned judgement.'],
    improve: ['Give both sides fair, equal weight before deciding.', 'Use contrast words: however, on the other hand, conversely.', 'Make your final judgement refer back to specific points.'],
    mistakes: ['A persuasive piece in disguise.', 'A conclusion that decides nothing ("everyone should decide for themselves").'],
    check: ['Both sides are treated fairly.', 'I used contrasting linking words.', 'My conclusion gives a clear, reasoned judgement.'] },
];

// Which guide section matches each writing task type in the app.
export const TYPE_FOR = {
  'Narrative': 'narrative', 'Descriptive': 'narrative', 'Persuasive': 'persuasive', 'Persuasive Speech': 'persuasive',
  'Newspaper Report': 'article', 'Discussion': 'discussion', 'Diary Entry': 'diary', 'Advice Letter': 'letter',
  'Recount': 'recount', 'Expository': 'expository', 'Guide': 'guide', 'Advice Sheet': 'advice',
};

export const TECHNIQUES = [
  { group: 'Figurative & descriptive', items: [
    ['Simile', 'Compares using "like" or "as".', 'The playground emptied like water down a drain.'],
    ['Metaphor', 'Says something IS something else.', 'The classroom was a beehive before the bell.'],
    ['Personification', 'Gives human actions to things.', 'The old gate groaned as the wind shoved it open.'],
    ['Pathetic fallacy', 'Weather or setting mirrors a mood.', 'Grey clouds sulked over the town on results day.'],
    ['Imagery', 'Sensory detail: see, hear, smell, taste, touch.', 'Hot chips, salty air and the shriek of gulls filled the pier.'],
    ['Foreshadowing', 'An early hint of what will happen.', 'She checked the lock twice, though she didn\'t know why.'],
    ['Hyperbole', 'Deliberate exaggeration.', 'My bag weighed about a thousand tonnes.'],
    ['Symbolism', 'An object stands for a bigger idea.', 'The cracked trophy sat on the shelf, like their friendship.'],
  ] },
  { group: 'Persuasive', items: [
    ['Rhetorical question', 'A question asked for effect.', 'Shouldn\'t every child feel safe at school?'],
    ['Rule of three', 'Ideas in threes for rhythm.', 'It is cheaper, healthier and kinder.'],
    ['Inclusive language', '"We", "us", "our" bring the reader in.', 'Our park, our future, our choice.'],
    ['Modality', 'Strong words: must, should, need.', 'We must act today, not someday.'],
    ['Statistics / evidence', 'Facts and numbers make it believable.', 'Three in four students say they feel calmer outside.'],
    ['Expert opinion', 'Borrow an expert\'s credibility.', 'Doctors agree that sleep helps learning.'],
    ['Emotive language', 'Words chosen for feeling.', 'Abandoned puppies shivered in the rain.'],
    ['Concession & rebuttal', 'Admit the other side, then answer it.', 'Some say it costs too much. However, …'],
    ['Direct address', 'Speak to "you".', 'You have felt it too, haven\'t you?'],
  ] },
  { group: 'Sound & sentences', items: [
    ['Alliteration', 'Repeated first sounds.', 'Wild waves whipped the wharf.'],
    ['Onomatopoeia', 'Words that sound like the noise.', 'The ice cracked, then plopped into the water.'],
    ['Repetition', 'Repeat a word or phrase for emphasis.', 'She waited. She waited all morning.'],
    ['Short sentence for impact', 'A short sentence after long ones.', 'Then the lights went out. Silence.'],
    ['Sentence variety', 'Mix short, compound and complex sentences.', 'The bell rang. Everyone froze, unsure whether it was the fire alarm or the end of lunch.'],
    ['Contrast', 'Put opposite ideas side by side.', 'Inside, laughter; outside, the storm.'],
  ] },
];

export const VOCAB = [
  ['said', 'whispered, insisted, admitted, argued, muttered'], ['big', 'enormous, immense, vast, towering'], ['small', 'tiny, cramped, modest, minute'],
  ['happy', 'delighted, elated, content, overjoyed'], ['sad', 'miserable, dejected, heartbroken, gloomy'], ['good', 'excellent, admirable, worthwhile, effective'],
  ['bad', 'dreadful, harmful, disastrous, unfortunate'], ['walked', 'strolled, trudged, marched, wandered'], ['scared', 'terrified, uneasy, petrified, anxious'],
  ['very tired', 'exhausted (one strong word beats "very" + weak word)'],
];
export const VOCAB_TIP = 'Only use a new word if you are sure what it means. A simple word used correctly beats a fancy word used wrongly.';
