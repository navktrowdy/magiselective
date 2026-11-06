// Writing tasks: 30-minute prompts, a marking rubric and model responses.

export const RUBRIC = [
  { key: 'ideas', name: 'Ideas & Content', levels: [
    'Ideas are very limited or off-topic.',
    'Simple ideas that relate to the prompt, with little development.',
    'Relevant ideas with some detail; suits the audience and purpose.',
    'Well-developed, interesting ideas with good supporting detail.',
    'Original, thoughtful ideas, developed with rich, well-chosen detail.',
  ] },
  { key: 'structure', name: 'Structure & Organisation', levels: [
    'No clear beginning, middle or end.',
    'Some attempt at structure; ideas may jump around.',
    'Clear beginning, middle and end; mostly logical paragraphs.',
    'Well-organised paragraphs that link smoothly; effective opening and ending.',
    'Skilful structure that builds the reader\'s interest (e.g. strong hook, tension or argument building to a powerful close).',
  ] },
  { key: 'language', name: 'Language & Vocabulary', levels: [
    'Very basic words; repetitive.',
    'Simple vocabulary with occasional interesting words.',
    'Some precise vocabulary and varied sentence beginnings.',
    'Precise, vivid vocabulary; varied sentence types; some techniques (e.g. imagery, rhetorical questions).',
    'Sophisticated, deliberate word choices and techniques that create a strong effect on the reader.',
  ] },
  { key: 'conventions', name: 'Grammar, Punctuation & Spelling', levels: [
    'Many errors make it hard to read.',
    'Frequent errors, but meaning is mostly clear.',
    'Mostly correct sentences and punctuation; some errors with harder words.',
    'Accurate grammar and punctuation, including dialogue or complex sentences; few spelling errors.',
    'Almost error-free, with a confident range of punctuation (e.g. commas in complex sentences, semicolons, dialogue).',
  ] },
];

export const TIPS = [
  'Spend 3–4 minutes planning: jot down your idea, 3 main points or story events, and your ending.',
  'Hook the reader in the first sentence: a question, a surprising fact, dialogue or a vivid image.',
  'Use paragraphs. Each one should have ONE main idea or ONE scene.',
  'Show, don\'t tell: "Her hands trembled" is stronger than "She was scared".',
  'Vary sentence length. A short sentence after long ones creates impact.',
  'Save 3 minutes at the end to re-read and fix spelling, punctuation and missing words.',
];

export default [
  { id: 'w1', type: 'Narrative', title: 'The Door That Wasn\'t There Yesterday',
    prompt: 'Write a story that begins with a character discovering a door that was not there the day before. Think about where the door leads, how your character feels and what changes for them.',
    model: `<p>The door appeared on a Tuesday, which annoyed Maya, because nothing interesting ever happened on Tuesdays.</p>
<p>It stood at the end of the school corridor, between the lost-property box and the fire extinguisher, where yesterday there had been nothing but a faded poster about handwashing. It was painted the deep green of a eucalyptus leaf, and its brass handle was warm, as if someone on the other side had only just let go.</p>
<p>Maya glanced over her shoulder. The corridor was empty; the bell would ring in four minutes. Her heart thudded like a basketball on a court. She turned the handle.</p>
<p>Instead of a cupboard, she found a library: not the cramped school library with its humming air-conditioner, but a towering hall of shelves that spiralled up into a sky full of slow, drifting lanterns. The air smelled of rain and old paper. On a desk in the centre lay a single open notebook, and on its first page, in handwriting she knew better than her own, was her name.</p>
<p>It was her grandmother's writing. Nani had died in March.</p>
<p>"Every story that was never finished ends up here," said a voice. A small, owl-eyed librarian peered at her over a stack of books. "Your grandmother left hers for you."</p>
<p>Maya read the first line: <i>Once there was a girl who was afraid of being brave…</i> The rest of the pages were blank.</p>
<p>When the bell rang, Maya was back in the corridor, the green door gone. But in her hand was the notebook, and that night, for the first time since March, she began to write.</p>`,
    notes: 'Why it scores well: a hook in the first line; vivid sensory detail (warm handle, rain and old paper); a simile (heart like a basketball); a twist that adds emotion; dialogue punctuated correctly; and an ending that links back to the theme of bravery.' },

  { id: 'w2', type: 'Persuasive', title: 'Should Homework Be Banned in Primary School?',
    prompt: 'Some people believe primary school students should not be given homework. Write a persuasive text for or against this idea. Give reasons and examples to convince your reader.',
    model: `<p>Imagine finishing school at 3 pm and having the whole afternoon to build a cubby, practise piano, help cook dinner or simply read for fun. For many primary students, that afternoon is swallowed up by worksheets. I strongly believe homework in primary school should be replaced with something far more valuable: time.</p>
<p>Firstly, children need time to play, and play is not a waste of time. When children invent games, solve arguments with friends and build things, they develop creativity, teamwork and problem-solving, the very skills employers say they want most. A spelling worksheet cannot teach a child how to negotiate the rules of backyard cricket.</p>
<p>Secondly, homework can create stress at home rather than learning. Many parents work long hours, and evenings can turn into battles over unfinished tasks. Students whose parents can help get ahead, while others fall behind, which hardly seems fair.</p>
<p>Some people argue that homework teaches responsibility. However, responsibility can be learnt in many other ways: feeding a pet, packing your own bag or helping with chores. These tasks teach the same lesson without the tears.</p>
<p>Of course, reading every night is valuable, and families should be encouraged to share books. But reading for pleasure is very different from compulsory sheets of sums.</p>
<p>Childhood is short. Let's give primary students their afternoons back and trust that a well-rested, curious child will learn more in class the next day. It's time to close the homework book for good.</p>`,
    notes: 'Why it scores well: an "Imagine…" hook; a clear position stated early; each paragraph opens with a connective (Firstly, Secondly); it answers the opposing view ("Some people argue… However…"); it uses persuasive techniques (rhetorical contrast, emotive language); and the conclusion uses a memorable final line.' },

  { id: 'w3', type: 'Descriptive', title: 'A Storm Arrives',
    prompt: 'Describe a place just before, during and after a storm. Use your senses to help the reader feel as if they are there.',
    model: `<p>The afternoon held its breath. Above the paddock, the sky had turned the yellow-grey of an old bruise, and the gum trees stood perfectly still, as though waiting to be told what to do. Even the magpies had gone quiet.</p>
<p>Then the wind arrived. It came rolling across the wheat in a silver wave, flattening the stalks and flinging dust against the farmhouse windows. The tin roof of the shed began to rattle and clang like a drum played by an impatient child. A single fat raindrop smacked onto the veranda, leaving a dark coin on the dusty boards. Then another. Then a thousand.</p>
<p>The rain came down in sheets, so thick the fence line vanished. Lightning split the sky with a crack that I felt in my teeth, and thunder rolled after it, deep and slow, shaking the glasses on the kitchen shelf. The air smelled sharp and metallic, mixed with the rich, earthy scent of soil drinking for the first time in months.</p>
<p>And then, as suddenly as it had begun, it was over. Water dripped from the gutters in a lazy rhythm. Puddles glowed orange in the evening sun, and the paddock gleamed as if it had been polished. Somewhere in the dripping gums, a magpie tried a few notes, then broke into full song, as if to announce that the world had been washed clean.</p>`,
    notes: 'Why it scores well: it is organised by time (before, during, after); it uses all five senses; it uses personification ("the afternoon held its breath"); it builds tension with short sentences ("Then another. Then a thousand."); and the ending echoes the opening (the magpies).' },

  { id: 'w4', type: 'Persuasive', title: 'Every Student Should Learn to Swim',
    prompt: 'Write a letter to your local council persuading them that free swimming lessons should be offered to every primary school student in the area.',
    model: `<p>Dear Councillors,</p>
<p>Australia is a nation surrounded by water. We have more than 10 000 beaches, countless rivers and dams, and backyard pools in thousands of homes. Yet many children in our area cannot swim confidently. I am writing to urge the council to provide free swimming lessons for every primary school student.</p>
<p>The most important reason is safety. Drowning is one of the leading causes of accidental death among young children. A child who can float, tread water and swim to safety has a far better chance in an emergency. No family should have to learn this lesson the hard way.</p>
<p>Secondly, the cost of lessons stops many families from enrolling their children. When money is tight, swimming lessons are often the first thing to go. Free lessons would make sure safety is not something only some families can afford.</p>
<p>Finally, swimming is excellent exercise and builds confidence. Children who can swim are more likely to join in at school carnivals, beach trips and nippers, which keeps them active and connected with their community.</p>
<p>Some may say that this would cost the council too much. But the cost of lessons is tiny compared with the cost of a single tragedy. Surely our children's safety is worth the investment.</p>
<p>Please make our community a safer one. Fund free swimming lessons for every primary student.</p>
<p>Yours sincerely,<br>Magi</p>`,
    notes: 'Why it scores well: it uses the correct letter format and a respectful tone for the audience; the strongest reason comes first; it includes facts and an emotive appeal; it handles a counter-argument; and it ends with a rhetorical statement and a clear call to action.' },

  { id: 'w5', type: 'Narrative', title: 'The Last One Picked',
    prompt: 'Write a story about a character who feels left out, and something unexpected that happens to change this.',
    model: `<p>Every Friday the same thing happened. Two captains, a line of hopeful faces, and the slow, painful shrinking of the line until only Jun was left, standing on the cracked asphalt and pretending to examine his shoelaces.</p>
<p>"Fine, we'll take him," Lachlan sighed, as if he had been handed a soggy sandwich.</p>
<p>Jun trudged to the back of the team. He wasn't fast, and the ball seemed to dodge his hands on purpose. But he noticed things. He noticed that Lachlan always passed to the left. He noticed that the other team's goalkeeper drifted towards the bubblers whenever play was at the far end.</p>
<p>With two minutes left, the scores were level. The ball bounced loose near Jun's feet, and everyone froze, already groaning. Jun didn't look at the ball. He looked at the goalkeeper, who was halfway to the bubblers.</p>
<p>He kicked. It wasn't a powerful kick, or a pretty one. It rolled, wobbling, across the asphalt and between two piles of jumpers into an empty goal.</p>
<p>For a moment nobody moved. Then Lachlan was thumping him on the back, and someone was shouting his name. It sounded strange, like a word in a different language.</p>
<p>The following Friday, Lachlan was captain again. He stood in front of the line and, without hesitating, pointed.</p>
<p>"Jun," he said. "And can you tell me what you see out there?"</p>`,
    notes: 'Why it scores well: it shows the character\'s feelings through actions (examining shoelaces); his strength (noticing things) is set up early and pays off at the climax; tension builds with short sentences; similes are used ("like a soggy sandwich"); and the ending shows the change without explaining it.' },

  { id: 'w6', type: 'Discussion', title: 'Screens in the Classroom',
    prompt: 'Many schools now use tablets and laptops in class. Discuss the advantages and disadvantages of using screens for learning, and give your own conclusion.',
    model: `<p>In many classrooms, the scratch of pencils has been replaced by the tap of keyboards. Tablets and laptops have changed how students learn, but are they always an improvement? There are strong arguments on both sides.</p>
<p>On the one hand, screens open up a world of information. A student researching volcanoes can watch real eruptions, explore 3D models and read the latest scientific reports in minutes. Learning programs can also adjust to each student's level, giving extra practice to those who need it and harder challenges to those ready to move on.</p>
<p>Screens also prepare students for the future. Most jobs now involve computers, so learning to type, search carefully and create digital presentations are useful skills.</p>
<p>On the other hand, screens can be a distraction. With games and videos only a click away, it can be hard to stay focused. Research also suggests that students often remember information better when they write it by hand, because writing slows them down and makes them think.</p>
<p>There are health concerns too. Too much screen time can cause tired eyes and poor posture, and it may replace time that could be spent moving or talking face to face.</p>
<p>In conclusion, screens are a powerful tool, but they should be used wisely rather than all the time. The best classrooms will likely combine the two: laptops for research and creating, and paper and pencil for thinking things through.</p>`,
    notes: 'Why it scores well: it is balanced, using "On the one hand / On the other hand"; each side gets specific examples; it uses topic sentences; the conclusion gives a reasoned personal view instead of simply repeating points; and the vocabulary is formal and precise.' },
];
