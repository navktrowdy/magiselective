// Reading bank part 2: more texts in every NSW selective text type, including full-size multi-part sets.

const gap = n => `<span class="gap">[${n}]</span>`;
const ex = ['Extract A', 'Extract B', 'Extract C', 'Extract D'];
const vq = (id, n, word, opts, a, exp, diff = 2) => ({ id, topic: 'Vocabulary in Context', diff,
  q: `Which word or phrase is closest in meaning to <b>${word}</b> (word ${n}) as it is used in the text?`, opts, a, exp });

const honeyOpts = [
  'A. Back at the hive, she passes the nectar to a younger "house bee" mouth to mouth.',
  'B. A single bee will make only about one-twelfth of a teaspoon of honey in her whole life.',
  'C. To do this, they fan their wings over the cells, creating a warm breeze that dries the nectar out.',
  'D. Once the honey is thick enough, the bees seal each cell with a lid of beeswax.',
  'E. Inside this special stomach, enzymes begin to change the nectar.',
  'F. Some flowers, such as roses, are pollinated by the wind instead.',
  'G. It all begins when a forager bee sips sugary nectar from a flower.',
];

export default [
  // ------------------------------------------------------------------
  { id: 'r10', type: 'Narrative', title: 'The Kite Maker\'s Apprentice',
    text: `<p>Mr Okafor's workshop smelled of bamboo shavings and glue. Kites hung from every beam: dragons with silk tails, hawks with painted eyes, a moon so round and pale it seemed to glow. Tayo had swept the floor there every Saturday for a year, and in all that time Mr Okafor had never once let him touch the cutting knife.</p>
<p>"Patience is the first tool," the old man would say, not looking up from his work. "The knife is the last."</p>
<p>So Tayo watched. He watched how Mr Okafor tested each bamboo strip by bending it until it sang, how he knotted the string with three quick twists, how he held the finished frame up to the window and squinted along its edges as if reading a secret message.</p>
<p>Then, one morning in spring, Mr Okafor did not come downstairs. His daughter came instead, apologising. Her father had hurt his wrist and would be resting for a few weeks. The kite festival was in nine days, and the order for the school's twenty kites sat unfinished on the bench.</p>
<p>Tayo looked at the knife for a long time. Then he picked up a strip of bamboo and bent it, slowly, until it sang.</p>
<p>On the morning of the festival, twenty kites rose above the oval, their tails rippling like streamers. At the edge of the crowd, his arm in a sling, Mr Okafor watched them climb. When Tayo found him, the old man did not say "well done". He simply handed Tayo a small wooden box. Inside, wrapped in a cloth, was a brand-new knife with Tayo's name carved into the handle.</p>`,
    questions: [
      { id: 'r10q1', topic: 'Character and Theme', diff: 1, q: 'Why had Mr Okafor never let Tayo use the cutting knife?',
        opts: ['He thought Tayo was careless.', 'He believed Tayo had to learn patience and watch carefully first.', 'The knife belonged to his daughter.', 'Tayo was not interested in making kites.'], a: 1,
        exp: `"Patience is the first tool… The knife is the last." He wanted Tayo to <b>learn by watching</b> before using the knife.` },
      { id: 'r10q2', topic: 'Figurative Language', diff: 2, q: 'Mr Okafor bent each bamboo strip "until it sang". This suggests he',
        opts: ['played music while he worked.', 'tested the bamboo by listening for a particular sound as it bent.', 'was singing to Tayo.', 'broke the bamboo on purpose.'], a: 1,
        exp: `Bamboo can't really sing. This <b>personification</b> describes the sound the strip makes when bent just right, which is how he tested it.` },
      { id: 'r10q3', topic: 'Inference', diff: 2, q: 'Why did Tayo "look at the knife for a long time"?',
        opts: ['He was deciding whether he was ready to finish the kites himself.', 'He wanted to clean it.', 'He was afraid Mr Okafor would be angry.', 'He did not know what it was.'], a: 0,
        exp: `The kites are unfinished, the festival is close and Mr Okafor is hurt. Tayo pauses because he is <b>making a big decision</b>, and his next action (bending the bamboo) shows his choice.` },
      { id: 'r10q4', topic: 'Inference', diff: 2, q: 'Which detail shows that Tayo had learnt from watching Mr Okafor?',
        opts: ['He swept the floor every Saturday.', 'He bent the bamboo slowly "until it sang".', 'He found Mr Okafor in the crowd.', 'He opened the wooden box.'], a: 1,
        exp: `Tayo copies Mr Okafor's exact method from paragraph 3. The repeated phrase "until it sang" links the two moments.<br><b>Tip:</b> writers often <b>repeat a phrase</b> to show a connection.` },
      { id: 'r10q5', topic: 'Character and Theme', diff: 3, q: 'What does the gift of the knife with Tayo\'s name on it mainly show?',
        opts: ['Mr Okafor wanted a new knife for himself.', 'Mr Okafor was too tired to talk.', 'Mr Okafor now sees Tayo as a true kite maker who has earned his trust.', 'The festival gave out prizes.'], a: 2,
        exp: `Earlier the knife was "the last" tool, given only when someone is ready. A knife with Tayo's own name says, without words, "<b>you have earned this</b>".` },
      { id: 'r10q6', topic: 'Character and Theme', diff: 2, q: 'Which is the best theme for this story?',
        opts: ['Kites are difficult to make.', 'Patience and careful learning prepare us for moments when we are needed.', 'Old people should not work.', 'Festivals are fun for everyone.'], a: 1,
        exp: `Tayo's year of patient watching lets him step up when he is needed. A <b>theme</b> is a life lesson, not just a detail of the plot.` },
    ] },

  // ------------------------------------------------------------------
  { id: 'r11', type: 'Poetry', title: 'Night Train',
    text: `<div class="poem">The night train hums across the plain,<br>a needle stitching through the dark;<br>its windows, beads on a golden chain,<br>each one a small, bright, sleepy spark.<br><br>
Inside, a baby dreams of milk,<br>a soldier dreams of going home,<br>an old man folds his hands like silk<br>and dreams of hills he used to roam.<br><br>
The farms outside are fast asleep,<br>the cattle stand like painted stone;<br>the moon keeps watch above the sheep<br>and lets the train pass on alone.<br><br>
By morning, all the dreams will scatter<br>like sparrows from a city square;<br>but for tonight, it does not matter.<br>The train rolls on. The dreams are there.</div>`,
    questions: [
      { id: 'r11q1', topic: 'Figurative Language', diff: 2, q: 'In the first stanza, the train is compared to "a needle stitching through the dark". This suggests that the train',
        opts: ['is very sharp and dangerous.', 'moves steadily in a line, joining places together across the night.', 'is being repaired.', 'is very small.'], a: 1,
        exp: `A needle moves in a steady line and joins fabric together. The <b>metaphor</b> shows the train threading a line through the dark countryside.` },
      { id: 'r11q2', topic: 'Figurative Language', diff: 1, q: '"the cattle stand like painted stone". Which technique is used?',
        opts: ['Personification', 'Simile', 'Onomatopoeia', 'Rhetorical question'], a: 1,
        exp: `The comparison uses "<b>like</b>", so it's a <b>simile</b>. It shows the cattle are completely still.` },
      { id: 'r11q3', topic: 'Main Idea', diff: 2, q: 'What is the second stanza mainly about?',
        opts: ['The different hopes and memories of the passengers.', 'The noise of the train.', 'Food served on the train.', 'A soldier going to war.'], a: 0,
        exp: `Each line describes a different passenger and what they <b>dream</b> of: milk, home, old hills. It shows how many different lives share one train.` },
      { id: 'r11q4', topic: "Author's Purpose and Tone", diff: 2, q: 'Which word best describes the mood of the poem?',
        opts: ['Calm and dreamy', 'Angry and loud', 'Funny and silly', 'Frightening and tense'], a: 0,
        exp: `Soft words (hums, sleepy, dreams, fast asleep, keeps watch) create a <b>calm, dreamy</b> mood.` },
      { id: 'r11q5', topic: 'Inference', diff: 3, q: 'What do the last two lines suggest?',
        opts: ['The train will crash in the morning.', 'Although dreams fade by morning, they are real and important while the journey lasts.', 'The passengers will get off at a city square.', 'Sparrows live on the train.'], a: 1,
        exp: `"Dreams will scatter" in the morning, "but for tonight, it does not matter… The dreams are there." The poet values the <b>present moment</b>.<br>C takes the simile ("like sparrows from a city square") too literally.` },
    ] },

  // ------------------------------------------------------------------
  { id: 'r12', type: 'Informational & Persuasive', title: 'How Bridges Stand Up',
    text: `<p>Every bridge has the same job: to carry a load across a gap without falling down. Engineers have found several clever ways to do this, and the shape of a bridge tells you which method it uses.</p>
<p>The simplest is the <b>beam bridge</b>, which is a flat deck resting on supports at each end, like a plank across a creek. When a heavy truck drives across, the top of the beam is squeezed while the bottom is stretched. Because of this, beam bridges work best over short distances. The longer the beam, the more it sags.</p>
<p>An <b>arch bridge</b> solves this problem by curving. The weight pressing down on the arch is pushed outwards along the curve and into the ground at each end. Stone arches built by the Romans nearly two thousand years ago are still standing, which shows how strong this shape can be.</p>
<p>For the very longest gaps, engineers build <b>suspension bridges</b>. The deck hangs from thick steel cables that run over tall towers and are anchored firmly into the ground on each side. The cables are pulled tight, carrying the weight up to the towers and down into the earth.</p>
<p>Next time you cross a bridge, look carefully at its shape. You may be able to tell exactly how it is holding you up.</p>`,
    questions: [
      { id: 'r12q1', topic: 'Main Idea', diff: 1, q: 'What is the main purpose of this text?',
        opts: ['To persuade people to become engineers.', 'To explain how different types of bridges carry weight.', 'To tell the history of the Roman Empire.', 'To warn people about unsafe bridges.'], a: 1,
        exp: `Each paragraph explains one bridge type and <b>how</b> it holds a load, so the text is informational/explanatory.` },
      { id: 'r12q2', topic: 'Inference', diff: 2, q: 'Why do beam bridges work best over short distances?',
        opts: ['They are made of wood.', 'Longer beams sag more under a load.', 'They have no supports.', 'Trucks are not allowed on them.'], a: 1,
        exp: `"The longer the beam, the more it sags." The answer is in the text, but you need to <b>connect</b> it to the question.` },
      { id: 'r12q3', topic: 'Inference', diff: 2, q: 'The writer mentions Roman arches that are "still standing" in order to',
        opts: ['show how strong and long-lasting the arch shape is.', 'explain how suspension bridges work.', 'suggest that old bridges are dangerous.', 'describe the Roman army.'], a: 0,
        exp: `The very next words are "which shows how strong this shape can be". The Roman example is <b>evidence</b> for that point.` },
      { id: 'r12q4', topic: 'Vocabulary in Context', diff: 2, q: 'In paragraph 4, the word <b>anchored</b> is closest in meaning to',
        opts: ['floating', 'fixed securely', 'painted', 'stretched'], a: 1,
        exp: `The cables are "anchored <b>firmly</b> into the ground", so they are <b>fixed securely</b>. An anchor stops a ship moving, which is a helpful memory link.` },
      { id: 'r12q5', topic: 'Text Structure', diff: 2, q: 'How is the information in this text mainly organised?',
        opts: ['As a story told in time order.', 'As a problem and an argument for one solution.', 'By describing one type of bridge in each paragraph, from simplest to longest-spanning.', 'As a list of instructions.'], a: 2,
        exp: `Paragraph 2 is beam ("simplest"), 3 is arch ("solves this problem"), 4 is suspension ("very longest gaps"). Each paragraph takes one type, building from simple to complex.` },
      { id: 'r12q6', topic: "Author's Purpose and Tone", diff: 1, q: 'Why does the writer end with "Next time you cross a bridge, look carefully at its shape"?',
        opts: ['To give a safety warning.', 'To encourage readers to use what they have learnt in real life.', 'To introduce a new type of bridge.', 'To criticise bridge builders.'], a: 1,
        exp: `The ending speaks directly to the reader ("you") and invites them to <b>apply</b> the information.` },
    ] },

  // ------------------------------------------------------------------
  { id: 'r13', type: 'Word Meaning in Context', title: 'The Storm Shelter',
    text: `<p class="hint">Read the text. The eight numbered words in bold are used in the questions.</p>
<p>When the cyclone warning came, the whole town of Banksia Bay moved <b>swiftly (1)</b>. Shops pulled down their shutters, and families carried blankets, torches and tins of food into the community hall, which had been built to <b>withstand (2)</b> the strongest winds.</p>
<p>Inside, the air was thick with nervous chatter. Mrs Nguyen, the school principal, climbed onto a chair and asked everyone to stay calm. Her voice was steady, and her calm manner seemed to <b>reassure (3)</b> even the youngest children.</p>
<p>By midnight the storm was at its peak. Rain <b>pounded (4)</b> the roof, and the windows rattled in their frames. Then the power failed, and the hall was plunged into darkness. For a moment nobody spoke. Then someone switched on a torch, and soon dozens of small lights were glowing like fireflies. An old fisherman began to tell stories of storms he had <b>endured (5)</b> at sea, and the children gathered around him, their fear slowly fading.</p>
<p>When dawn finally came, the townspeople stepped outside to find their streets <b>littered (6)</b> with branches and broken tiles. The damage was <b>considerable (7)</b>, but no one had been hurt. As they began to clear the mess together, the mood was one of <b>gratitude (8)</b> rather than despair.</p>`,
    questions: [
      vq('r13q1', 1, 'swiftly', ['slowly', 'quickly', 'quietly', 'angrily'], 1, `Everyone acts at once when a warning comes, so <b>swiftly = quickly</b>.`, 1),
      vq('r13q2', 2, 'withstand', ['resist without being damaged', 'welcome', 'measure', 'create'], 0, `A hall built "to withstand the strongest winds" is built to <b>resist them without breaking</b>. That's why it's used as a shelter.`),
      vq('r13q3', 3, 'reassure', ['frighten', 'confuse', 'comfort and calm', 'ignore'], 2, `Her steady voice and calm manner made children feel safer, so <b>reassure = comfort and calm</b>. The opposite of the "nervous chatter" before it.`),
      vq('r13q4', 4, 'pounded', ['gently touched', 'beat heavily against', 'avoided', 'dried'], 1, `At the storm's peak with rattling windows, the rain hit hard. <b>Pounded = beat heavily</b>.`),
      vq('r13q5', 5, 'endured', ['enjoyed', 'invented', 'lived through (something difficult)', 'escaped from easily'], 2, `Storms at sea are hard, so <b>endured = lived through something difficult</b>.<br><b>Trap:</b> "enjoyed" sounds similar but has the wrong meaning.`, 3),
      vq('r13q6', 6, 'littered', ['scattered with', 'cleaned', 'decorated neatly', 'blocked off'], 0, `Branches and broken tiles were all over the streets, so they were <b>scattered with</b> mess.`),
      vq('r13q7', 7, 'considerable', ['small', 'thoughtful', 'large in amount', 'invisible'], 2, `Contrast clue: "The damage was considerable, <b>but</b> no one had been hurt". The damage was big, but the good news was no injuries. <b>Considerable = large</b>.<br><b>Trap:</b> "considerate" means thoughtful, a different word!`, 3),
      vq('r13q8', 8, 'gratitude', ['thankfulness', 'anger', 'boredom', 'confusion'], 0, `"Gratitude rather than despair": they felt <b>thankful</b> that everyone was safe. "Rather than" signals the opposite of despair.`),
    ] },

  // ------------------------------------------------------------------
  { id: 'r14', type: 'Comparing Texts', title: 'Different Ways to Help',
    text: `<p class="hint">Read the four extracts. For each question, choose the extract (A, B, C or D) that matches the description. Each extract may be used more than once.</p>
<h4>Extract A</h4><p>Every Sunday, Grandpa Lee and I walk along the beach with two buckets. He picks up plastic; I pick up bottle caps. Last month we counted 412 caps. Grandpa says each one is a fish that won't swallow plastic. I'm not sure that's exactly how it works, but I like thinking about all those fish swimming around, safe and a little bit grateful.</p>
<h4>Extract B</h4><p>Volunteering is good for the people who do it, not just for those they help. Studies of adults and teenagers have found that volunteers often report feeling happier and less stressed. Experts believe that helping others gives people a sense of purpose and helps them feel connected to their community.</p>
<h4>Extract C</h4><p>Mrs Patel's shop burnt down on a Tuesday. By Thursday, the whole street had a plan. The baker brought bread, the plumber brought pipes, and the Year 6 class painted a sign that said WE'RE STILL HERE in letters so big you could read them from the train. When the shop reopened, Mrs Patel cried, then laughed, then made everybody tea.</p>
<h4>Extract D</h4><p>Should every student be required to do community service? I believe so. Schools teach us maths and spelling, but kindness is a skill too, and skills need practice. Twenty hours of helping each year is a small price for a generation of young people who know how to care for others.</p>`,
    questions: [
      { id: 'r14q1', topic: 'Comparing Texts', diff: 1, q: 'Which extract gives the writer\'s opinion about what schools should do?', opts: ex, a: 3, exp: `D says "I believe so" and argues schools should require community service. It is a <b>persuasive</b> text.` },
      { id: 'r14q2', topic: 'Comparing Texts', diff: 1, q: 'Which extract refers to research findings?', opts: ex, a: 1, exp: `B mentions "Studies… have found" and "Experts believe".` },
      { id: 'r14q3', topic: 'Comparing Texts', diff: 2, q: 'Which extract describes a whole neighbourhood helping one person?', opts: ex, a: 2, exp: `In C "the whole street had a plan" to help Mrs Patel after the fire.` },
      { id: 'r14q4', topic: 'Comparing Texts', diff: 2, q: 'In which extract is the narrator a little doubtful about something an adult says?', opts: ex, a: 0, exp: `"I'm not sure that's exactly how it works". The narrator in A gently doubts Grandpa's claim.` },
      { id: 'r14q5', topic: 'Comparing Texts', diff: 2, q: 'Which extract includes a specific number to show how much has been done?', opts: ex, a: 0, exp: `A: "we counted 412 caps". (D mentions twenty hours, but that's a proposal, not something already done.)` },
      { id: 'r14q6', topic: 'Comparing Texts', diff: 2, q: 'Which extract suggests that helping others benefits the helpers themselves?', opts: ex, a: 1, exp: `B: "good for the people who do it… happier and less stressed".` },
      { id: 'r14q7', topic: 'Comparing Texts', diff: 3, q: 'Which extract describes a character\'s emotions changing quickly?', opts: ex, a: 2, exp: `Mrs Patel "cried, then laughed, then made everybody tea". Her feelings shift rapidly.` },
      { id: 'r14q8', topic: 'Comparing Texts', diff: 2, q: 'Which extract compares kindness to a school subject?', opts: ex, a: 3, exp: `D: "Schools teach us maths and spelling, but kindness is a skill too".` },
      { id: 'r14q9', topic: 'Comparing Texts', diff: 2, q: 'Which extract is about protecting the environment?', opts: ex, a: 0, exp: `A is about collecting beach plastic so fish don't swallow it.` },
      { id: 'r14q10', topic: 'Comparing Texts', diff: 3, q: 'Which extract uses a rhetorical question to introduce its argument?', opts: ex, a: 3, exp: `D opens with "Should every student be required to do community service?", a question asked to introduce the writer's view, not to get an answer.` },
    ] },

  // ------------------------------------------------------------------
  { id: 'r15', type: 'Gapped Text', title: 'From Flower to Honey',
    text: `<p class="hint">Six sentences have been removed from the text. Choose the sentence (A–G) that best fits each gap. There is one extra sentence you do not need.</p>
<p>A spoonful of honey may look simple, but it is the result of an amazing team effort. ${gap(1)} She stores it in a special "honey stomach", separate from the stomach she uses for her own food.</p>
<p>${gap(2)} They break down the complex sugars in the nectar into simpler ones, which makes the honey easier to store and digest.</p>
<p>${gap(3)} This bee chews the nectar for a while, adding more enzymes, and then places it into one of the six-sided wax cells of the honeycomb.</p>
<p>At this stage, the nectar is still very watery. The bees must remove most of the water before it can become honey. ${gap(4)}</p>
<p>${gap(5)} This keeps the honey clean and safe, ready to feed the colony through winter.</p>
<p>It takes the work of many bees to fill even one small jar. ${gap(6)} So the next time you taste honey, remember the thousands of tiny wings that made it.</p>
<div class="gapopts">${honeyOpts.map(o => `<div>${o}</div>`).join('')}</div>`,
    questions: [
      { id: 'r15q1', topic: 'Text Structure', diff: 1, q: 'Which sentence best fits gap <b>[1]</b>?', opts: honeyOpts, a: 6, exp: `The next sentence says "<b>She</b> stores <b>it</b>…". Something must introduce "she" (a bee) and "it" (nectar). G does both and starts the process ("It all begins").` },
      { id: 'r15q2', topic: 'Text Structure', diff: 2, q: 'Which sentence best fits gap <b>[2]</b>?', opts: honeyOpts, a: 4, exp: `The following sentence begins "<b>They</b> break down the complex sugars". "They" must refer to the <b>enzymes</b> in E.` },
      { id: 'r15q3', topic: 'Text Structure', diff: 2, q: 'Which sentence best fits gap <b>[3]</b>?', opts: honeyOpts, a: 0, exp: `Next: "<b>This bee</b> chews the nectar…". A introduces the house bee who receives the nectar.` },
      { id: 'r15q4', topic: 'Text Structure', diff: 2, q: 'Which sentence best fits gap <b>[4]</b>?', opts: honeyOpts, a: 2, exp: `The bees "must remove most of the water". C explains <b>how</b> ("To do this… fan their wings… dries the nectar out").` },
      { id: 'r15q5', topic: 'Text Structure', diff: 2, q: 'Which sentence best fits gap <b>[5]</b>?', opts: honeyOpts, a: 3, exp: `"<b>This</b> keeps the honey clean and safe". Sealing with a wax lid (D) is what keeps it safe. The process is in time order, and sealing comes last.` },
      { id: 'r15q6', topic: 'Text Structure', diff: 3, q: 'Which sentence best fits gap <b>[6]</b>?', opts: honeyOpts, a: 1, exp: `"It takes the work of many bees to fill even one small jar" is supported by B's fact that one bee makes only 1/12 of a teaspoon.<br>F (wind pollination) is the extra sentence. It is off-topic.` },
    ] },

  // ------------------------------------------------------------------
  { id: 'r16', type: 'Informational & Persuasive', title: 'Every School Needs a Garden',
    text: `<p>Imagine biting into a crunchy carrot that you planted, watered and pulled from the soil yourself. For students at schools with vegetable gardens, this is an everyday experience, and it is one that every school in Australia should offer.</p>
<p>First, gardens are outdoor classrooms. Measuring garden beds teaches area and perimeter; tracking plant growth teaches data and graphs; learning about worms and soil teaches science. Lessons that might feel dull on a whiteboard come alive when students can touch and taste them.</p>
<p>Second, children who grow vegetables are more likely to eat them. Many parents struggle to get their children to try anything green, yet the same children will proudly munch on spinach they have grown. A garden can quietly change a family's eating habits.</p>
<p>Some people argue that gardens are expensive and take up valuable space. However, a garden can start with a few recycled tubs and a packet of seeds. Local nurseries and community groups are often happy to donate plants, soil and advice.</p>
<p>A school garden grows more than vegetables. It grows patience, responsibility and curiosity. Surely that is a harvest worth planting.</p>`,
    questions: [
      { id: 'r16q1', topic: "Author's Purpose and Tone", diff: 1, q: 'What is the writer\'s main purpose?',
        opts: ['To explain how to grow carrots.', 'To persuade readers that every school should have a vegetable garden.', 'To describe one particular school.', 'To complain about school lessons.'], a: 1,
        exp: `The final sentence of paragraph 1 states the position: gardens are something "every school in Australia should offer". Every paragraph then argues for it.` },
      { id: 'r16q2', topic: 'Text Structure', diff: 2, q: 'What is the purpose of paragraph 4?',
        opts: ['To give a new reason for gardens.', 'To answer an argument against school gardens.', 'To describe the vegetables in a garden.', 'To summarise the whole text.'], a: 1,
        exp: `"Some people argue… However…" The writer raises an objection (cost and space) and <b>rebuts</b> it. That is a counter-argument paragraph.` },
      { id: 'r16q3', topic: 'Inference', diff: 2, q: 'According to the writer, why might a garden change a family\'s eating habits?',
        opts: ['Gardens make vegetables cheaper in shops.', 'Children who grow vegetables become keener to eat them.', 'Parents must work in the garden.', 'Schools serve vegetables at lunch.'], a: 1,
        exp: `"Children who grow vegetables are more likely to eat them… the same children will proudly munch on spinach they have grown."` },
      { id: 'r16q4', topic: 'Figurative Language', diff: 3, q: '"A school garden grows more than vegetables." What does this mean?',
        opts: ['Gardens also grow flowers and fruit.', 'A garden also helps students develop qualities like patience and responsibility.', 'The garden is very large.', 'Vegetables grow slowly.'], a: 1,
        exp: `The next sentence explains it: "It grows patience, responsibility and curiosity." "Grow" is used <b>metaphorically</b> for developing qualities.` },
      { id: 'r16q5', topic: 'Vocabulary in Context', diff: 2, q: 'In the last sentence, "a harvest worth planting" most likely means',
        opts: ['a result worth working for.', 'a crop that is too expensive.', 'a type of vegetable.', 'a reason to stop gardening.'], a: 0,
        exp: `A harvest is what you collect after work and waiting. The writer means the benefits are <b>worth the effort</b>. This is a figurative closing line.` },
    ] },
];
