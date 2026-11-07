// Writing tasks: 30-minute prompts, a marking rubric and model responses.

// Same 7 criteria (total 25) used in her external writing reports, so scores compare directly.
// levels[i] describes a score of i + 1.
export const RUBRIC = [
  { key: 'content', name: 'Content / Relevant details', max: 4, levels: [
    'Few ideas; some are off-topic or missing key task requirements.',
    'Relevant ideas but little detail; some task requirements missing.',
    'Relevant, detailed ideas that meet the task requirements.',
    'Rich, specific and original details that fully meet the task and engage the reader.'] },
  { key: 'form', name: 'Form / Structure', max: 4, levels: [
    'Does not follow the text type (e.g. story written as a report).',
    'Some features of the text type; beginning or ending is weak.',
    'Clear structure with the main features of the text type (e.g. headline, lead, quotes for a report).',
    'Skilful use of the text type with a strong hook and a satisfying conclusion.'] },
  { key: 'organising', name: 'Organising ideas / Paragraphs / Devices', max: 4, levels: [
    'Ideas are jumbled; no paragraphs.',
    'Some paragraphs; ideas jump around; few linking words.',
    'Logical paragraphs with linking words and some language devices.',
    'Ideas flow smoothly; paragraphs build effectively; devices used for effect.'] },
  { key: 'style', name: 'Style / Vocabulary', max: 3, levels: [
    'Simple, repetitive words.',
    'Some precise or interesting words; some figurative or persuasive language.',
    'Precise, vivid and varied vocabulary that suits the audience and purpose.'] },
  { key: 'sentences', name: 'Sentences', max: 4, levels: [
    'Many incomplete or run-on sentences.',
    'Mostly simple sentences; some errors in construction.',
    'Correct sentences with some variety, including complex sentences.',
    'Confident variety of sentence types and lengths used for effect.'] },
  { key: 'spelling', name: 'Spelling / Grammar', max: 3, levels: [
    'Frequent errors make it hard to read.',
    'Some errors, mainly with harder words or tense.',
    'Accurate spelling and grammar, including difficult words.'] },
  { key: 'punctuation', name: 'Punctuation', max: 3, levels: [
    'Basic punctuation often missing.',
    'Full stops and capitals correct; some errors with commas, apostrophes or speech marks.',
    'Accurate, varied punctuation including quotation marks and apostrophes.'] },
];
export const RUBRIC_TOTAL = RUBRIC.reduce((a, c) => a + c.max, 0);

export const TIPS = [
  'Newspaper report: headline → lead paragraph (who, what, when, where, why) → details → quotes from witnesses/officials → what happens next.',
  'Spend 3–4 minutes planning: jot down your idea, 3 main points or story events, and your ending.',
  'Hook the reader in the first sentence: a question, a surprising fact, dialogue or a vivid image.',
  'Use paragraphs. Each one should have ONE main idea or ONE scene.',
  'Show, don\'t tell: "Her hands trembled" is stronger than "She was scared".',
  'Vary sentence length. A short sentence after long ones creates impact.',
  'Save 3 minutes at the end to re-read and fix spelling, punctuation and missing words.',
];

export default [
  { id: 'w7', type: 'Newspaper Report', title: 'Mystery at the Museum',
    prompt: 'Overnight, a famous dinosaur skeleton went missing from the town museum. Write a newspaper report about the event for your local paper. Include what happened, who was involved, comments from different people, and what will happen next.',
    model: `<h4 style="margin:0">DINOSAUR VANISHES FROM TOWN MUSEUM</h4><p><i>By Potalien, Junior Reporter, The Riverbend Times</i></p>
<p>Riverbend residents woke to a prehistoric puzzle yesterday after the museum's prized <i>Tyrannosaurus</i> skeleton disappeared overnight, leaving nothing behind but a single muddy footprint and a trail of sawdust.</p>
<p>The theft was discovered at 7.30 am on Tuesday by cleaner Mrs Rosa Bianchi, who arrived to find the main hall eerily empty. "I've dusted that dinosaur every morning for twenty years," she said, still visibly shaken. "When I switched on the lights, there was just an enormous gap where he used to stand. My heart nearly stopped."</p>
<p>Police believe the thieves entered through a skylight on the roof between midnight and 4 am. Detective Sergeant Ken Okafor described the crime as "carefully planned and extremely unusual". "Moving a twelve-metre skeleton is no small task," he explained. "Whoever did this needed a large truck, several helpers and a great deal of patience."</p>
<p>Neighbour Arjun Patel reported hearing "a loud rumbling and the beeping of a reversing truck" at around 2 am, but assumed it was a late delivery.</p>
<p>The skeleton, nicknamed "Rex" by local schoolchildren, has been the museum's star attraction since 1998. Museum director Dr Helen Wu said the loss was "devastating for the whole community" and urged anyone with information to contact police immediately.</p>
<p>The museum will remain closed until further notice while detectives examine the scene. Meanwhile, Year 5 students at Riverbend Public School have already started a poster campaign titled "Bring Rex Home". Riverbend, it seems, is not ready to let its favourite dinosaur become history.</p>`,
    notes: 'Why it scores well: a punchy headline; a lead paragraph that answers who, what, when and where; quotes from FOUR different people (cleaner, detective, neighbour, director), which your tutor asked for; specific details (times, measurements); formal but vivid vocabulary ("eerily", "devastating"); and a closing line with a clever play on words.' },

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
  { id: 'w8', type: 'Diary Entry', title: 'The Day Everything Went Wrong (and Then Right)',
    prompt: 'Write a diary entry about a day that started badly but ended well. Show how you felt at different moments and what you learnt.',
    model: `<p><i>Saturday, 14 March</i></p><p>Dear Diary,</p>
<p>If today were a cake, the first half would have been burnt to a crisp. My alarm didn't go off, so I woke up at 8.40, twenty minutes before the regional chess tournament began. I threw on yesterday's jumper, grabbed a banana and sprinted to the car while Dad hunted for his keys. (They were in the fridge. Don't ask.)</p>
<p>We arrived just as the first round started. My hands were shaking so badly that I knocked over my own king in the first five minutes. I lost that game, and the second one too. By lunchtime, I wanted to curl up under the table and disappear.</p>
<p>Then Mum said something I keep thinking about: "You can't change the morning, but you can still choose the afternoon." So I ate my sandwich slowly, took three deep breaths and decided to enjoy the games instead of worrying about winning them.</p>
<p>Something changed. I started noticing patterns I had missed all morning. I won round three, then round four, and in the final round I beat a girl who had been unbeaten all day! I didn't win a trophy, but I came home with a certificate for "Best Comeback", and honestly, that feels even better.</p>
<p>Lesson learnt: a bad start is just a start. Also, check where Dad puts his keys.</p>`,
    notes: 'Why it scores well: the date and "Dear Diary" format are correct; an engaging opening metaphor (a burnt cake); feelings are shown through actions (shaking hands); humour; a clear turning point; and a reflective ending that states the lesson. It uses varied sentence lengths and a natural, personal voice.' },

  { id: 'w9', type: 'Persuasive Speech', title: 'Kids Should Learn to Cook at School',
    prompt: 'Write a speech for your school assembly arguing that every student should learn to cook at school. Use persuasive techniques to convince your audience.',
    model: `<p>Good morning, teachers and fellow students.</p>
<p>Raise your hand if you can cook a meal for your family without any help. Not many hands, are there? Today I want to convince you that cooking should be taught to every student at our school.</p>
<p>Firstly, cooking is a life skill that everyone needs. One day, every single one of us will have to feed ourselves. Knowing how to make a healthy meal means we won't have to rely on expensive takeaway or packets full of salt and sugar.</p>
<p>Secondly, cooking is secretly a maths and science lesson. When we double a recipe, we use multiplication. When we measure 250 millilitres of milk, we use capacity. When bread rises, we see chemistry in action. Imagine learning fractions while making pizza. Who wouldn't pay attention?</p>
<p>Some people say there isn't enough time in the school day. But surely an hour a week is a small price for a skill that lasts a lifetime. Other schools already run kitchen programs, and their students love them.</p>
<p>Cooking teaches independence, teamwork and creativity, all with something delicious at the end. So let's stir up some change. Let's make cooking part of every student's education.</p><p>Thank you.</p>`,
    notes: 'Why it scores well: it greets the audience and thanks them at the end (speech features); it opens with an interactive hook; it uses rhetorical questions, inclusive language ("we", "us") and a clear "Firstly/Secondly" structure; it answers a counter-argument; and it finishes with a pun ("stir up some change") and a call to action.' },

  { id: 'w10', type: 'Narrative', title: 'The Message in the Bottle',
    prompt: 'Write a story that begins with this sentence: "The bottle washed up on the sand just as the sun was setting, and there was something inside it."',
    model: `<p>The bottle washed up on the sand just as the sun was setting, and there was something inside it.</p>
<p>Aria almost walked past. Bottles washed up all the time on Shell Cove beach, usually filled with nothing but sand and seaweed. But this one glowed green in the last of the light, and through the scratched glass she could see a curl of yellowed paper.</p>
<p>It took her three tries and a sharp rock to pull out the cork. The paper crackled as she unrolled it. The handwriting was neat and old-fashioned, the ink faded to brown.</p>
<p><i>To whoever finds this: I am eleven years old and I live at the lighthouse on Gull Point. My father says no one will ever read this, but I think someone will. Please write back. — Edie, 1962.</i></p>
<p>Aria's breath caught. Gull Point lighthouse had been closed for decades. But the old woman who ran the bait shop at the end of the pier, the one who always slipped Aria a free toffee, was named Edith.</p>
<p>The next morning, Aria pushed open the bait-shop door, the bell jangling above her. Her heart thumped like a drum. She laid the letter on the counter.</p>
<p>The old woman looked at it for a long moment. Then her eyes filled with tears, and she smiled the widest smile Aria had ever seen.</p>
<p>"Sixty years," she whispered. "I knew someone would find it."</p>`,
    notes: 'Why it scores well: it uses the given opening exactly; sensory details (glowing green glass, crackling paper); a letter within the story; a twist that links the past and present; tension built with short sentences; a simile ("thumped like a drum"); and an emotional ending told through dialogue.' },

  { id: 'w11', type: 'Advice Letter', title: 'Dear Year 4 Student',
    prompt: 'A Year 4 student is nervous about starting Year 5 next year. Write a letter giving them advice on how to have a great year.',
    model: `<p>Dear future Year 5 superstar,</p>
<p>I remember exactly how you feel. This time last year, I was worried about harder maths, new teachers and whether I would find my friends in a new class. Now that Year 5 is nearly over, I want to share what I've learnt, because it turned out to be one of my best years yet.</p>
<p>My first piece of advice is: don't be afraid to ask questions. In Year 5, the work does get trickier, especially fractions and long division. But teachers would much rather answer a question than see you stuck. The students who ask the most questions usually learn the most.</p>
<p>Second, get organised early. Use a diary to write down homework and due dates. Pack your bag the night before. It sounds boring, but it saves so much stress on busy mornings.</p>
<p>Third, try something new. Join a club, enter the public speaking competition or try out for a sports team. I joined chess club on a whim, and now it's my favourite part of the week.</p>
<p>Finally, be kind, to others and to yourself. Everyone makes mistakes, even Year 6s! What matters is that you keep trying.</p>
<p>You are going to have an amazing year. Good luck!</p>
<p>Your friend,<br>Potalien (Year 5)</p>`,
    notes: 'Why it scores well: correct letter format with a friendly greeting and sign-off; it builds a connection by sharing feelings; it gives clear, organised advice using "first/second/third/finally"; it includes specific, practical examples; and its warm, encouraging tone suits the audience.' },
];
