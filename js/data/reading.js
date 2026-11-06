// Reading question bank: original texts in the NSW selective text types.
// Each passage: id, type (strand), title, text (HTML), questions [{id, topic, diff, q, opts, a, exp}].

const gapOpts = [
  'A. These buds are protected from the heat and burst into life when the tree\'s leaves are burnt away.',
  'B. Their seeds are locked inside tough, woody pods that can stay closed on the plant for years.',
  'C. However, this does not mean that more fire is always better for the bush.',
  'D. Yet most native plants are not simply wiped out by it.',
  'E. This store of food and buds acts like an emergency kit buried safely in the soil.',
  'F. These burns reduce the build-up of dry fuel, so that when bushfires do come, they are less intense.',
  'G. Koalas are often harmed by bushfires because they move slowly.',
];
const gapOpts2 = [
  'A. Tightly packed feathers, overlapping like roof tiles, form a windproof and waterproof layer.',
  'B. Warm blood flowing down to the feet passes close to cold blood returning to the body, so heat is passed back before it can escape.',
  'C. Unlike many other birds, they cannot simply fly north to escape the cold.',
  'D. Penguins on the cold outer edge gradually work their way inwards, while those in the middle drift outwards.',
  'E. A huddle is so effective that it can become surprisingly warm.',
  'F. It is a reminder that in nature, working together can be just as important as being strong.',
  'G. Penguins catch fish and squid by diving deep beneath the ice.',
];
const vq = (id, n, word, opts, a, exp, diff = 2) => ({ id, topic: 'Vocabulary in Context', diff,
  q: `Which word or phrase is closest in meaning to <b>${word}</b> (word ${n}) as it is used in the text?`, opts, a, exp });
const gap = n => `<span class="gap">[${n}]</span>`;

export default [
  // ------------------------------------------------------------------
  { id: 'r1', type: 'Narrative', title: 'The Lighthouse Key',
    text: `<p>Nell had never been allowed past the rope at the bottom of the lighthouse stairs. "Those steps are older than your great-grandmother," Grandpa would say, tapping the rusted sign that read KEEP OUT. So when he pressed a heavy iron key into her palm on the morning of the storm, she simply stared at it.</p>
<p>"The lamp's motor has jammed," he said, his breath short. His knee, swollen since spring, was wrapped in a tea towel. "There's a crank handle in the lamp room. Thirty turns, every fifteen minutes, until the storm passes. Can you do that?"</p>
<p>Nell looked out the kitchen window. The sea had turned the colour of a bruise, and somewhere beyond the headland a fishing boat's lights blinked like a nervous eye. She nodded before she had decided to.</p>
<p>The stairs coiled upward like the inside of a shell. By the hundredth step her legs burned; by the hundred-and-fiftieth she had stopped counting. When she finally pushed open the lamp-room door, the wind screamed through a gap in the glass, and the great lens sat dark and silent, like a sleeping giant.</p>
<p>She found the crank, fitted it, and pushed. Nothing. She pushed again, leaning her whole weight into it, and with a groan the lens began to turn. A beam of light swept out across the water, once, twice, and far below, the little boat turned slowly towards the harbour.</p>
<p>Nell kept turning until her arms trembled and the sky outside softened to grey. When Grandpa finally limped into the doorway at dawn, he didn't say anything at all. He just took off his cap and held it against his chest.</p>`,
    questions: [
      { id: 'r1q1', topic: 'Inference', diff: 1, q: 'Why did Grandpa give Nell the key?',
        opts: ['He wanted her to explore the lighthouse at last.', 'The KEEP OUT sign had fallen down.', 'His injured knee meant he could not climb the stairs himself.', 'Nell had asked for it many times.'], a: 2,
        exp: `The clues are "his breath short" and "His knee, swollen since spring, was wrapped in a tea towel". He later "limped" in. The text never says it directly, so you must <b>infer</b> it from these details.<br><b>Inference</b> = using clues in the text + what you know to work out what isn't stated.` },
      { id: 'r1q2', topic: 'Figurative Language', diff: 2, q: '"The sea had turned the colour of a bruise." This suggests the sea was',
        opts: ['dark, purple-grey and threatening.', 'calm and bright blue.', 'full of injured sea creatures.', 'warmer than usual.'], a: 0,
        exp: `Bruises are dark purple, blue and grey, and they come from being hurt. This <b>metaphor-like image</b> gives the sea a stormy colour and a sense of danger.<br>C takes the image too literally.` },
      { id: 'r1q3', topic: 'Character and Theme', diff: 2, q: 'What does "She nodded before she had decided to" show about Nell?',
        opts: ['She had not heard the question properly.', 'She agreed to help almost without thinking, even though she was unsure.', 'She was annoyed with her grandfather.', 'She had planned this moment for a long time.'], a: 1,
        exp: `Her body answered before her mind made a decision. This shows an <b>instinct</b> to help despite being nervous.<br>It reveals her character: brave and caring when it matters.` },
      { id: 'r1q4', topic: 'Vocabulary in Context', diff: 1, q: 'In "The stairs coiled upward like the inside of a shell", the word <b>coiled</b> is closest in meaning to',
        opts: ['collapsed', 'stretched straight', 'shook', 'spiralled'], a: 3,
        exp: `A shell's inside winds around in a spiral, and lighthouse stairs wind around the tower. <b>Coiled = spiralled / wound round</b>.<br><b>Strategy:</b> substitute each option into the sentence and see which keeps the meaning.` },
      { id: 'r1q5', topic: 'Inference', diff: 2, q: 'What does the little boat turning "slowly towards the harbour" suggest?',
        opts: ['The crew was lost.', 'The light Nell made was helping guide the boat to safety.', 'The storm had already ended.', 'Grandpa had signalled to the boat by radio.'], a: 1,
        exp: `The boat turns right after "a beam of light swept out across the water". The writer links the two events to show Nell's effort is <b>saving the boat</b>.<br>C is wrong because Nell keeps turning until dawn, so the storm continues.` },
      { id: 'r1q6', topic: 'Character and Theme', diff: 3, q: 'Why does Grandpa hold his cap against his chest at the end?',
        opts: ['He is cold after the storm.', 'He is about to leave for the harbour.', 'He is showing deep respect and pride for what Nell has done.', 'He is upset that she took so long.'], a: 2,
        exp: `Taking off a hat and holding it to the chest is a traditional gesture of <b>respect</b>. Saying nothing suggests he is too moved for words.<br>Writers often "show, not tell" feelings through actions.` },
    ] },

  // ------------------------------------------------------------------
  { id: 'r2', type: 'Poetry', title: 'The Old Bicycle',
    text: `<div class="poem">In the corner of the garden shed,<br>beneath a sheet of dust and thread,<br>my father's bike leans on the wall,<br>too proud to fall, too tired to call.<br><br>
Its bell has lost its silver ring,<br>its chain hangs loose, a tangled string,<br>yet on its rusted frame I see<br>the scratches of a memory.<br><br>
On summer evenings, so he said,<br>he rode it home as skies turned red,<br>the wind a song inside his ears,<br>the miles stacked up like all his years.<br><br>
I oil the chain. I pump the tyre.<br>I wipe the frame to bring back fire.<br>And when I ride it down our street,<br>I hear two hearts, and one heartbeat.</div>`,
    questions: [
      { id: 'r2q1', topic: 'Figurative Language', diff: 1, q: '"too proud to fall, too tired to call". Which technique is used here?',
        opts: ['Onomatopoeia', 'Personification', 'Simile', 'Alliteration'], a: 1,
        exp: `The bike is given <b>human feelings</b> (pride, tiredness). That is <b>personification</b>.<br>Simile uses "like/as". Onomatopoeia imitates sounds. Alliteration repeats first sounds.` },
      { id: 'r2q2', topic: 'Inference', diff: 2, q: 'What does "the scratches of a memory" suggest?',
        opts: ['The bike was badly damaged in an accident.', 'The speaker scratched the bike by mistake.', 'The marks on the bike are reminders of its past adventures.', 'The speaker cannot remember the bike.'], a: 2,
        exp: `The scratches are physical marks, but the poet calls them scratches "of a memory". They are <b>evidence of a past life</b>: the rides described in stanza 3.` },
      { id: 'r2q3', topic: 'Main Idea', diff: 2, q: 'What is the poem mainly about?',
        opts: ['How to repair an old bicycle.', 'A child connecting with their father\'s past by restoring his bike.', 'The dangers of riding at night.', 'Cleaning out a messy garden shed.'], a: 1,
        exp: `The poem moves from the forgotten bike → the father's memories → the speaker restoring and riding it, feeling connected to him.<br>A is a detail, not the main idea. <b>Main idea</b> = what the WHOLE text is about.` },
      { id: 'r2q4', topic: "Author's Purpose and Tone", diff: 3, q: 'How does the mood change from the first stanza to the last stanza?',
        opts: ['From neglected and sad to warm and hopeful.', 'From exciting to frightening.', 'From angry to calm.', 'It stays gloomy throughout.'], a: 0,
        exp: `Stanza 1: dust, leaning, "too tired", which feels <b>neglected</b>.<br>Last stanza: action verbs (oil, pump, wipe, ride), "bring back fire", "two hearts", which feels <b>warm and hopeful</b>.<br><b>Tip:</b> compare word choices at the start and the end to track a mood shift.` },
      { id: 'r2q5', topic: 'Figurative Language', diff: 3, q: 'What does the final line, "I hear two hearts, and one heartbeat", most likely mean?',
        opts: ['The speaker is out of breath from riding.', 'The speaker\'s father is riding next to them.', 'The bike makes a ticking sound.', 'Riding the bike, the speaker feels closely connected to their father.'], a: 3,
        exp: `"Two hearts" = the speaker and the father; "one heartbeat" = they feel <b>united</b>. The bike links them across time.<br>B is too literal: the father isn't described as being there.` },
    ] },

  // ------------------------------------------------------------------
  { id: 'r3', type: 'Informational & Persuasive', title: 'The Waggle Dance',
    text: `<p>Honeybees cannot talk, yet they share remarkably precise directions. When a forager bee discovers a patch of flowers rich in nectar, she returns to the hive and performs what scientists call the "waggle dance".</p>
<p>During the dance, the bee runs forward in a straight line while shaking her body from side to side, then loops back to her starting point and repeats the run. The direction of the straight run tells the other bees which way to fly. Because the inside of the hive is dark, the bees use gravity as a guide: a run straight up the honeycomb means "fly towards the sun", while a run angled 40 degrees to the right of straight up means "fly 40 degrees to the right of the sun".</p>
<p>The length of the waggle run signals distance. A short waggle means the flowers are close; a longer waggle means they are further away. Researchers have found that each second of waggling represents roughly one kilometre of flight, although this varies between colonies.</p>
<p>The dance was first decoded by Austrian scientist Karl von Frisch, who spent decades watching bees in glass-walled hives. His discovery was so surprising that many scientists at first refused to believe insects could communicate in such an abstract way. In 1973 he was awarded the Nobel Prize for his work.</p>
<p>Today the waggle dance helps scientists in an unexpected way. By filming dances and decoding them, researchers can map where bees are finding food and discover which landscapes are most valuable for protecting bee populations.</p>`,
    questions: [
      { id: 'r3q1', topic: 'Main Idea', diff: 1, q: 'What is the main purpose of this text?',
        opts: ['To persuade people to keep bees.', 'To explain how honeybees use a dance to share where food is.', 'To tell the life story of Karl von Frisch.', 'To describe what honey is made from.'], a: 1,
        exp: `Most paragraphs explain HOW the dance works (direction, distance) and what we learnt from it. The text is <b>informational/explanatory</b>.<br>C is only one paragraph, which is a detail.` },
      { id: 'r3q2', topic: 'Inference', diff: 3, q: 'If a bee\'s waggle run points straight <b>down</b> the honeycomb, the other bees should fly',
        opts: ['towards the sun.', 'directly away from the sun.', '40 degrees to the right of the sun.', 'back into the hive.'], a: 1,
        exp: `The text says <b>straight up = towards the sun</b>. Straight down is the opposite of up, so it must mean the opposite direction: <b>away from the sun</b>.<br>This is an inference: the text doesn't say it directly, but the rule lets you work it out.` },
      { id: 'r3q3', topic: 'Inference', diff: 2, q: 'A bee waggles for about 3 seconds. Roughly how far away are the flowers?',
        opts: ['300 metres', '1 kilometre', '3 kilometres', '30 kilometres'], a: 2,
        exp: `"Each second of waggling represents roughly one kilometre" → 3 seconds ≈ <b>3 km</b>.<br><b>Tip:</b> find the exact sentence in the text that gives the rule.` },
      { id: 'r3q4', topic: 'Vocabulary in Context', diff: 3, q: 'In paragraph 4, "communicate in such an <b>abstract</b> way" means communicating by',
        opts: ['touching each other directly.', 'making loud noises.', 'leading other bees to the flowers.', 'using movements as symbols that stand for ideas like direction and distance.'], a: 3,
        exp: `The dance doesn't SHOW the flowers. It uses movements as a <b>code</b> (angle = direction, time = distance). That's what "abstract" means here: using symbols for ideas.<br>C is the non-abstract way, which is the opposite.` },
      { id: 'r3q5', topic: 'Text Structure', diff: 2, q: 'What does the final paragraph mainly do?',
        opts: ['It shows a modern use of von Frisch\'s discovery.', 'It argues that the waggle dance is not real.', 'It repeats the information in paragraph 2.', 'It describes how honey is collected.'], a: 0,
        exp: `"Today… helps scientists in an unexpected way" signals a shift to the <b>present-day application</b>: mapping food sources to protect bees.` },
      { id: 'r3q6', topic: 'Inference', diff: 2, q: 'Why did many scientists at first refuse to believe von Frisch?',
        opts: ['He had not won the Nobel Prize yet.', 'His hives were made of glass.', 'They did not think insects were capable of such complex communication.', 'Bees cannot see inside the hive.'], a: 2,
        exp: `The text says the discovery was "so surprising" because they doubted <b>insects could communicate in such an abstract way</b>. Their disbelief was about what insects can do.` },
    ] },

  // ------------------------------------------------------------------
  { id: 'r4', type: 'Informational & Persuasive', title: 'Bring Back the Lunchtime Library',
    text: `<p>Dear Principal Harris,</p>
<p>Last term, the library closed at lunchtime so that the librarian could catch up on cataloguing. I am writing to ask you to open it again, because the lunchtime library was one of the best things about our school.</p>
<p>Not every student wants to run around the oval at lunch. Some of us need a quiet place to read, draw or simply think. When the library closed, those students were left with nowhere to go. I have seen Year 3 students sitting alone by the bins because the playground was too noisy for them.</p>
<p>Some people say the library costs too much to staff at lunch. But it doesn't have to. Many senior students, including me, would happily volunteer as library monitors. We could stamp books, shelve returns and keep the room tidy, which would also give us real responsibility.</p>
<p>Finally, reading is not just a subject; it is a habit. A habit grows when it is easy. If the library is open when students are free, more of them will pick up a book.</p>
<p>Please give the lunchtime library a second chapter.</p>
<p>Yours sincerely,<br>Amira, Year 6</p>`,
    questions: [
      { id: 'r4q1', topic: "Author's Purpose and Tone", diff: 1, q: 'What is Amira\'s main purpose in writing this letter?',
        opts: ['To complain about the librarian.', 'To describe what library monitors do.', 'To persuade the principal to reopen the library at lunchtime.', 'To explain how books are catalogued.'], a: 2,
        exp: `"I am writing to ask you to open it again" states her purpose directly. The letter is <b>persuasive</b>, and every paragraph gives a reason to reopen it.` },
      { id: 'r4q2', topic: 'Text Structure', diff: 2, q: 'How does Amira respond to the argument that the library costs too much to staff?',
        opts: ['She ignores it.', 'She suggests the school should spend more money.', 'She agrees it is too expensive.', 'She offers a solution: student volunteers.'], a: 3,
        exp: `She raises the objection ("Some people say…"), then <b>rebuts</b> it with a solution: senior students volunteering.<br>This technique is called <b>counter-argument</b>. Mentioning the other side and answering it makes persuasion stronger.` },
      { id: 'r4q3', topic: "Author's Purpose and Tone", diff: 2, q: 'Why does Amira mention Year 3 students "sitting alone by the bins"?',
        opts: ['To create sympathy with a vivid, emotional example.', 'To show the bins need to be moved.', 'To blame Year 3 students.', 'To prove the oval is too small.'], a: 0,
        exp: `A specific, sad picture makes the reader <b>feel</b> the problem. This is an <b>emotional appeal</b>, a common persuasive technique.` },
      { id: 'r4q4', topic: 'Figurative Language', diff: 2, q: '"Please give the lunchtime library a second chapter." Why is this an effective ending?',
        opts: ['It asks for more books to be bought.', 'It uses a book-related play on words to ask for a fresh start.', 'It shows Amira has written a story.', 'It tells the principal to read more.'], a: 1,
        exp: `"Second chapter" means a <b>new beginning</b>, and chapters belong to books, so it's a clever <b>pun</b> that links to the topic and leaves a memorable final line.` },
      { id: 'r4q5', topic: 'Inference', diff: 3, q: 'Which statement would Amira <b>most likely</b> agree with?',
        opts: ['Students should spend every lunchtime playing sport.', 'Libraries are only useful during class time.', 'Students should have different choices about how they spend lunchtime.', 'Younger students should be kept out of the library.'], a: 2,
        exp: `"Not every student wants to run around the oval… Some of us need a quiet place". She values <b>choice</b> for different kinds of students.<br>A and B contradict her letter. D goes against her concern for Year 3s.` },
    ] },

  // ------------------------------------------------------------------
  { id: 'r5', type: 'Gapped Text', title: 'Born from the Flames',
    text: `<p class="hint">Six sentences have been removed from the text. Choose the sentence (A–G) that best fits each gap. There is one extra sentence you do not need.</p>
<p>Fire has shaped the Australian bush for millions of years. ${gap(1)} Instead, many have developed clever ways to survive, and some even depend on fire to reproduce.</p>
<p>Eucalyptus trees are a good example. Beneath their thick bark lie thousands of tiny buds that remain asleep for years. ${gap(2)} Within weeks of a fire, a blackened trunk can be covered in fuzzy green shoots, which is why burnt forests often look as if they are wearing green jumpers.</p>
<p>Some plants protect themselves underground. Many mallee eucalypts grow a woody swelling called a lignotuber at the base of the trunk. ${gap(3)} Even if everything above the ground is destroyed, new stems can sprout from it.</p>
<p>Banksias take a different approach. ${gap(4)} The heat of a fire causes these pods to split, releasing the seeds onto a bed of ash that is rich in nutrients. With fewer competing plants around, the seedlings have a head start.</p>
<p>${gap(5)} Too many fires too close together can kill young plants before they are old enough to produce seeds. Scientists and Aboriginal rangers are now working together to use cool, carefully timed burns, a practice First Nations people have used for thousands of years. ${gap(6)}</p>
<div class="gapopts">${gapOpts.map(o => `<div>${o}</div>`).join('')}</div>`,
    questions: [
      { id: 'r5q1', topic: 'Text Structure', diff: 2, q: 'Which sentence best fits gap <b>[1]</b>?', opts: gapOpts, a: 3,
        exp: `The next sentence starts with "<b>Instead</b>, many have developed clever ways to survive". "Instead" needs something to contrast with. D ("not simply wiped out") sets this up perfectly.<br><b>Strategy:</b> look at linking words just AFTER the gap as well as before it.` },
      { id: 'r5q2', topic: 'Text Structure', diff: 1, q: 'Which sentence best fits gap <b>[2]</b>?', opts: gapOpts, a: 0,
        exp: `The sentence before mentions "tiny buds that remain asleep". A continues with "<b>These buds</b>… burst into life", and the next sentence describes the green shoots.<br>"These buds" is a <b>reference word</b> pointing back to the previous sentence.` },
      { id: 'r5q3', topic: 'Text Structure', diff: 2, q: 'Which sentence best fits gap <b>[3]</b>?', opts: gapOpts, a: 4,
        exp: `The paragraph is about protection <b>underground</b> (the lignotuber). E: "This store… buried safely in the soil" matches, and "This" refers back to the lignotuber.` },
      { id: 'r5q4', topic: 'Text Structure', diff: 1, q: 'Which sentence best fits gap <b>[4]</b>?', opts: gapOpts, a: 1,
        exp: `The next sentence says "these <b>pods</b> split". Only B mentions pods, so it must come first to introduce them.` },
      { id: 'r5q5', topic: 'Text Structure', diff: 3, q: 'Which sentence best fits gap <b>[5]</b>?', opts: gapOpts, a: 2,
        exp: `The paragraph changes direction: so far fire has seemed helpful, but now "Too many fires… can kill young plants". C's "<b>However</b>" signals this <b>contrast</b>.<br>Starting a new paragraph with a contrast word is very common.` },
      { id: 'r5q6', topic: 'Text Structure', diff: 2, q: 'Which sentence best fits gap <b>[6]</b>?', opts: gapOpts, a: 5,
        exp: `F says "<b>These burns</b>…", referring back to the "cool, carefully timed burns" just mentioned, and explains why they help.<br>G (koalas) is the extra sentence. It is about animals, not plant survival, so it doesn't fit anywhere.` },
    ] },

  // ------------------------------------------------------------------
  { id: 'r6', type: 'Comparing Texts', title: 'Learning Something New',
    text: `<p class="hint">Read the four extracts about learning. Then answer the questions.</p>
<h4>Extract A</h4><p>Lena stood at the edge of the deep end, toes curled over the tiles. The water looked darker here, as if it had no bottom. Her coach counted to three. On "three", Lena didn't jump. She just stood. On the second "three", she held her nose and fell forward like a tree. When she surfaced, gasping and laughing, the deep end didn't look dark any more. It looked like hers.</p>
<h4>Extract B</h4><p>Nana Rose's first text message read: "HELLO DARLING THIS IS NANA HOW DO I MAKE IT STOP SHOUTING." Within a week she had discovered emojis. Within a fortnight she was sending us a daily weather report made entirely of tiny suns, clouds and, for reasons no one could explain, a dancing pineapple.</p>
<h4>Extract C</h4><p>Each time we practise a skill, the connections between certain brain cells become stronger, much like a path through long grass becomes clearer the more often it is walked. Researchers have found that short, regular practice sessions build these pathways more effectively than one long session, because the brain strengthens connections while we rest and sleep.</p>
<h4>Extract D</h4><p>For three weeks Tomas's violin sounded like a cat stuck in a fence. In the fourth week he shut it in its case and slid it under his bed. It stayed there until the school concert, when he heard a girl from his class play a tune so sweet that the hall went silent. That night, he dusted off the case.</p>`,
    questions: [
      { id: 'r6q1', topic: 'Comparing Texts', diff: 1, q: 'Which extract describes a character who gives up but is later inspired to try again?',
        opts: ['Extract A', 'Extract B', 'Extract C', 'Extract D'], a: 3,
        exp: `Tomas hides the violin (gives up), then hears a classmate play and "dusted off the case" (tries again). The final action <b>implies</b> his return.` },
      { id: 'r6q2', topic: 'Comparing Texts', diff: 1, q: 'Which extract uses research findings to explain why something happens?',
        opts: ['Extract A', 'Extract B', 'Extract C', 'Extract D'], a: 2,
        exp: `C mentions "Researchers have found…" and explains the brain process. It's the only <b>informational</b> extract.` },
      { id: 'r6q3', topic: 'Comparing Texts', diff: 1, q: 'Which extract uses humour to describe someone learning to use technology?',
        opts: ['Extract A', 'Extract B', 'Extract C', 'Extract D'], a: 1,
        exp: `Nana's all-capitals message ("HOW DO I MAKE IT STOP SHOUTING") and the mysterious "dancing pineapple" are funny, and the technology is a phone.` },
      { id: 'r6q4', topic: 'Comparing Texts', diff: 2, q: 'In which extract does a character overcome a fear?',
        opts: ['Extract A', 'Extract B', 'Extract C', 'Extract D'], a: 0,
        exp: `Lena hesitates at the scary deep end ("as if it had no bottom"), then jumps. At the end it "looked like hers", which shows she has <b>conquered</b> the fear.<br>D is about frustration, not fear.` },
      { id: 'r6q5', topic: 'Comparing Texts', diff: 2, q: 'Which extract would be most useful to a student wanting advice on how to plan their practice time?',
        opts: ['Extract A', 'Extract B', 'Extract C', 'Extract D'], a: 2,
        exp: `C gives practical advice: "short, regular practice sessions" work better than one long session.<br><b>Applying a text</b> to a real purpose is a common question type.` },
      { id: 'r6q6', topic: 'Comparing Texts', diff: 2, q: 'Which extract uses a simile to show how bad something sounded?',
        opts: ['Extract A', 'Extract B', 'Extract C', 'Extract D'], a: 3,
        exp: `"sounded <b>like</b> a cat stuck in a fence" is a <b>simile</b> about sound.<br>A ("like a tree") and C ("like a path") also use similes, but not about sound.` },
    ] },

  // ------------------------------------------------------------------
  { id: 'r7', type: 'Narrative', title: 'The Spice Stall',
    text: `<p>Dev had a rule about the market: never make eye contact with the customers. That way, Aunty Priya would do the talking, and he could stack the jars of turmeric and cumin in neat towers and be left alone.</p>
<p>But this Saturday Aunty Priya's phone buzzed, and her face went pale. "Your cousin's baby is coming early," she said, already grabbing her keys. "You'll be fine. Prices are on the board. Smile." And then she was gone, and Dev was alone behind a table that suddenly seemed very wide.</p>
<p>The first customer was a tall man who wanted "something for a curry that doesn't taste like every other curry". Dev opened his mouth, but nothing came out. Then he remembered Sunday nights at Aunty's house, and the smell that drifted from her kitchen.</p>
<p>"Try this," he heard himself say, holding up a small jar. "Fenugreek. Just a pinch, toasted first. My aunt says it's the secret nobody tells you."</p>
<p>The man bought two jars. By noon, Dev had sold more fenugreek than the stall usually sold in a month, and he had started saying "My aunt says" as if it were a magic spell. When Aunty Priya returned, flushed and smiling, she found the table nearly empty and her nephew deep in conversation with an old woman about the best way to grind cardamom.</p>`,
    questions: [
      { id: 'r7q1', topic: 'Character and Theme', diff: 1, q: 'At the start of the story, Dev\'s "rule" shows that he is',
        opts: ['lazy and unhelpful.', 'shy and prefers not to talk to customers.', 'rude to his aunt.', 'an expert salesperson.'], a: 1,
        exp: `He avoids eye contact so his aunt "would do the talking" and he could "be left alone". That suggests <b>shyness</b>, not laziness: he still works by stacking jars.` },
      { id: 'r7q2', topic: 'Inference', diff: 2, q: 'Why does the table "suddenly" seem "very wide"?',
        opts: ['Aunty Priya had moved the table.', 'Dev feels alone and overwhelmed by the responsibility.', 'The jars had been sold.', 'The market had become bigger.'], a: 1,
        exp: `The table hasn't changed; Dev's <b>feelings</b> have. Being alone makes the job feel big. This is how writers show emotion through description.` },
      { id: 'r7q3', topic: 'Inference', diff: 2, q: 'What helps Dev answer the first customer?',
        opts: ['Reading the price board.', 'Remembering his aunt\'s cooking and the smells from her kitchen.', 'A phone call from his aunt.', 'Watching another stall-holder.'], a: 1,
        exp: `Right after he freezes: "Then he remembered Sunday nights at Aunty's house, and the smell…", and immediately he recommends fenugreek. The memory unlocks his knowledge.` },
      { id: 'r7q4', topic: 'Figurative Language', diff: 2, q: 'Dev says "My aunt says" "as if it were a magic spell". This suggests that',
        opts: ['Dev believes his aunt is a magician.', 'the phrase gives Dev confidence and seems to work wonders with customers.', 'customers are frightened of his aunt.', 'Dev is pretending to be his aunt.'], a: 1,
        exp: `A magic spell makes things happen. The phrase helps him <b>sell</b> and gives him courage by borrowing his aunt's authority. (This is a <b>simile</b>: "as if".)` },
      { id: 'r7q5', topic: 'Character and Theme', diff: 3, q: 'Which statement best describes a <b>theme</b> of the story?',
        opts: ['Markets are busy places.', 'Babies often arrive early.', 'People can discover hidden confidence when they are needed.', 'Spices are expensive.'], a: 2,
        exp: `A <b>theme</b> is a big idea about life. Dev changes from avoiding customers to chatting happily, because the situation needed him.<br>A, B and D are just details from the story, not life lessons.` },
    ] },
  // ------------------------------------------------------------------
  { id: 'r8', type: 'Word Meaning in Context', title: 'The Girl Who Painted the Reef',
    text: `<p class="hint">Read the text. The numbered words in bold are used in the questions.</p>
<p>Ever since she was small, Lina had been <b>captivated (1)</b> by the ocean. While other children built sandcastles, she would wade into the shallows and peer at the darting fish. Her grandmother, a marine biologist, <b>nurtured (2)</b> this curiosity, lending her books and old snorkels.</p>
<p>At twelve, Lina noticed that the coral near her town looked pale and <b>fragile (3)</b>. Her grandmother explained that warming seas were causing the coral to lose the tiny algae that give it colour. Lina was <b>determined (4)</b> to do something. She began painting large murals of healthy reefs on the walls of local shops, each with a short message about protecting the ocean.</p>
<p>At first, some shop owners were <b>reluctant (5)</b> to let a child paint their walls. But when the first mural attracted crowds of tourists taking photographs, the owners changed their minds. Within a year, Lina's paintings had <b>transformed (6)</b> the main street into an outdoor gallery, and the town council had begun a program to monitor the reef.</p>`,
    questions: [
      vq('r8q1', 1, 'captivated', ['fascinated', 'trapped', 'frightened', 'bored'], 0,
        `Lina spends her time staring at fish instead of building sandcastles, so the ocean holds her attention. <b>Captivated = fascinated</b>.<br><b>Trap:</b> "trapped" is related to "captive" but doesn't fit the sentence. Always choose the meaning that fits HERE.`, 1),
      vq('r8q2', 2, 'nurtured', ['ignored', 'encouraged', 'fed', 'punished'], 1,
        `Her grandmother lends her books and snorkels, which helps the curiosity grow. <b>Nurtured = encouraged / helped to develop</b>.<br>"Fed" is the literal meaning for a baby or animal, but here it is curiosity being nurtured.`),
      vq('r8q3', 3, 'fragile', ['colourful', 'enormous', 'easily damaged', 'ancient'], 2,
        `Clue: "pale" and losing its colour because of warming seas, which suggests weakness. <b>Fragile = easily damaged or broken</b>.`),
      vq('r8q4', 4, 'determined', ['worried', 'unsure', 'excited', 'firmly decided'], 3,
        `"Lina was determined to do something. She began painting…" She acted straight away, so she had <b>firmly decided</b>.<br>"Unsure" is the opposite.`),
      vq('r8q5', 5, 'reluctant', ['unwilling', 'eager', 'unable', 'angry'], 0,
        `"At first… reluctant… But… the owners changed their minds." The contrast word <b>But</b> shows they first did NOT want to. <b>Reluctant = unwilling</b>.<br><b>Strategy:</b> contrast words (but, however) tell you the word means the opposite of what comes after.`, 3),
      vq('r8q6', 6, 'transformed', ['damaged', 'changed completely', 'cleaned', 'decorated slightly'], 1,
        `The street became "an outdoor gallery", which is a total change. <b>Transformed = changed completely</b>.<br>"Decorated slightly" is too weak for "transformed".`),
    ] },

  // ------------------------------------------------------------------
  { id: 'r9', type: 'Gapped Text', title: 'Surviving the Antarctic Winter',
    text: `<p class="hint">Six sentences have been removed from the text. Choose the sentence (A–G) that best fits each gap. There is one extra sentence you do not need.</p>
<p>Emperor penguins live through the harshest winters on Earth, when temperatures in Antarctica can drop below minus 40 degrees Celsius. ${gap(1)} Instead, they rely on a remarkable combination of body features and teamwork.</p>
<p>Their first line of defence is their coat. ${gap(2)} Beneath the feathers, a thick layer of fat stores energy and traps heat inside the body.</p>
<p>Penguins also have a clever trick in their feet. ${gap(3)} As a result, their feet stay just above freezing, which saves heat without letting the feet freeze solid.</p>
<p>The most famous strategy, however, is the huddle. Thousands of penguins crowd together, shuffling slowly in a giant moving mass. ${gap(4)} This means that every penguin, sooner or later, gets a turn in the warm centre.</p>
<p>${gap(5)} Temperatures in the middle of a huddle can rise above 30 degrees Celsius. In fact, penguins sometimes become too hot and have to break away to cool down. ${gap(6)}</p>
<div class="gapopts">${gapOpts2.map(o => `<div>${o}</div>`).join('')}</div>`,
    questions: [
      { id: 'r9q1', topic: 'Text Structure', diff: 2, q: 'Which sentence best fits gap <b>[1]</b>?', opts: gapOpts2, a: 2,
        exp: `The next sentence begins "<b>Instead</b>, they rely on…". "Instead" needs something they CAN'T or DON'T do. C ("cannot simply fly north") sets this up.<br><b>Strategy:</b> look at the linking word straight after the gap.` },
      { id: 'r9q2', topic: 'Text Structure', diff: 1, q: 'Which sentence best fits gap <b>[2]</b>?', opts: gapOpts2, a: 0,
        exp: `"Their first line of defence is their <b>coat</b>" → A describes the coat (feathers). The next sentence says "Beneath the <b>feathers</b>", so the feathers must have just been mentioned.` },
      { id: 'r9q3', topic: 'Text Structure', diff: 2, q: 'Which sentence best fits gap <b>[3]</b>?', opts: gapOpts2, a: 1,
        exp: `The paragraph is about the <b>feet</b>, and the next sentence starts "As a result, their feet stay just above freezing". B explains the cause (blood passing heat back), so "As a result" follows logically.<br><b>Cause → effect</b> links are a common cloze clue.` },
      { id: 'r9q4', topic: 'Text Structure', diff: 2, q: 'Which sentence best fits gap <b>[4]</b>?', opts: gapOpts2, a: 3,
        exp: `The following sentence says "This means that every penguin… gets a turn in the warm centre". D explains the movement from edge to middle that makes this true.` },
      { id: 'r9q5', topic: 'Text Structure', diff: 2, q: 'Which sentence best fits gap <b>[5]</b>?', opts: gapOpts2, a: 4,
        exp: `The paragraph is about the huddle being <b>hot</b> (above 30 °C, penguins too hot). E introduces that idea: "surprisingly warm". Starting a paragraph with its main idea (a topic sentence) is very common.` },
      { id: 'r9q6', topic: 'Text Structure', diff: 3, q: 'Which sentence best fits gap <b>[6]</b>?', opts: gapOpts2, a: 5,
        exp: `The final gap usually wraps up the whole text. F gives a concluding lesson about <b>teamwork</b>, linking back to "body features and teamwork" in paragraph 1.<br>G (catching fish) is the extra sentence. It isn't about keeping warm.` },
    ] },
];
