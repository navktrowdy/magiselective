// Potalien (potato + alien) companion: species, evolution stages, shop items, badges and chatter.

export const SPECIES = [
  { id: 'spudnik', name: 'Spudnik', body: '#d9a65b', spots: '#b5803a', eyes: 2, antennae: 2,
    blurb: 'The classic Potalien. Golden, curious and always asking "why?"' },
  { id: 'cyclotot', name: 'Cyclo-Tot', body: '#b39ddb', spots: '#8e7cc3', eyes: 1, antennae: 1,
    blurb: 'One giant eye that never misses a detail. Loves Thinking Skills puzzles.' },
  { id: 'tritater', name: 'Tri-Tater', body: '#9ccc65', spots: '#7cb342', eyes: 3, antennae: 2,
    blurb: 'Three eyes for triple-checking every answer. A maths machine.' },
  { id: 'sweetnova', name: 'Sweet Nova', body: '#ff9e5e', spots: '#e57c3a', eyes: 2, antennae: 3,
    blurb: 'A sweet-potato star from the Nebula Patch who reads books under starlight.' },
  { id: 'chipcomet', name: 'Chip Comet', body: '#f6d365', spots: '#e0b43c', eyes: 2, antennae: 2, tail: true,
    blurb: 'Fast and crunchy, with a comet tail. Brilliant at beating the clock.' },
];

// XP needed for each evolution stage.
export const STAGES = [
  { xp: 0, name: 'Seed Spud', perk: 'A tiny potato from outer space.' },
  { xp: 500, name: 'Sprout Spud', perk: 'Grows a leafy sprout!' },
  { xp: 1500, name: 'Potalien Cadet', perk: 'Antennae start to glow.' },
  { xp: 3500, name: 'Star Captain', perk: 'Earns a captain\'s star badge.' },
  { xp: 7000, name: 'Galactic Commander', perk: 'A golden aura appears.' },
  { xp: 12000, name: 'Cosmic Legend', perk: 'Sparkles with stardust. Ready for exam day!' },
];

export const SHOP = [
  { id: 'bow', slot: 'head', name: 'Pink Bow', price: 60 },
  { id: 'partyhat', slot: 'head', name: 'Party Hat', price: 80 },
  { id: 'headphones', slot: 'head', name: 'Headphones', price: 150 },
  { id: 'helmet', slot: 'head', name: 'Space Helmet', price: 250 },
  { id: 'wizard', slot: 'head', name: 'Wizard Hat', price: 300 },
  { id: 'crown', slot: 'head', name: 'Royal Crown', price: 600 },
  { id: 'roundglasses', slot: 'face', name: 'Smart Glasses', price: 80 },
  { id: 'starglasses', slot: 'face', name: 'Star Glasses', price: 150 },
  { id: 'bowtie', slot: 'neck', name: 'Bow Tie', price: 60 },
  { id: 'scarf', slot: 'neck', name: 'Cosy Scarf', price: 80 },
  { id: 'cape', slot: 'neck', name: 'Hero Cape', price: 400 },
  { id: 'farm', slot: 'bg', name: 'Potato Farm', price: 100 },
  { id: 'mars', slot: 'bg', name: 'Mars', price: 150 },
  { id: 'galaxy', slot: 'bg', name: 'Galaxy', price: 300 },
  { id: 'nebula', slot: 'bg', name: 'Rainbow Nebula', price: 500 },
];
export const FREE_BG = { id: 'moon', slot: 'bg', name: 'The Moon', price: 0 };

export const BADGES = [
  { id: 'liftoff', icon: '🚀', name: 'Lift-off', desc: 'Finish your first drill.' },
  { id: 'explorer', icon: '🧭', name: 'Explorer', desc: 'Try all four modules.' },
  { id: 'q100', icon: '💯', name: 'Century Spud', desc: 'Answer 100 questions.' },
  { id: 'q500', icon: '🌋', name: 'Question Volcano', desc: 'Answer 500 questions.' },
  { id: 'q1000', icon: '🪐', name: 'Thousand-Question Planet', desc: 'Answer 1000 questions.' },
  { id: 'streak3', icon: '🔥', name: 'Warming Up', desc: 'Practise on 3 planned days in a row (CS days don\'t count against you).' },
  { id: 'streak7', icon: '☄️', name: 'Week of Fire', desc: 'Practise on 7 planned days in a row.' },
  { id: 'streak14', icon: '🌞', name: 'Unstoppable', desc: 'Practise on 14 planned days in a row.' },
  { id: 'perfect', icon: '🌟', name: 'Perfect Orbit', desc: 'Score 100% in a drill of 5 or more questions.' },
  { id: 'mission', icon: '🛰️', name: 'Mission Complete', desc: 'Finish a full timed test.' },
  { id: 'noblanks', icon: '🥔', name: 'No Spud Left Behind', desc: 'Finish a full timed test with zero blanks.' },
  { id: 'comeback', icon: '🔁', name: 'Comeback Kid', desc: 'Fix 10 past mistakes.' },
  { id: 'writer', icon: '🪄', name: 'Word Wizard', desc: 'Complete 3 writing tasks.' },
  { id: 'skillstar', icon: '⭐', name: 'Skill Star', desc: 'Reach 80% in a skill (8+ questions).' },
  { id: 'abovecrowd', icon: '🏔️', name: 'Above the Crowd', desc: 'Beat the CS class average in a timed test.' },
];

export const TALK = {
  happy: ['Blast-off day! Ready for a drill, {nick}?', 'My antennae are tingling. I think we\'ll learn something cool today!',
    'Every question you answer gives me stardust. Let\'s go!', 'Beep boop, brain power at maximum!'],
  content: ['Welcome back, {nick}! Shall we power up a weak skill?', 'One drill a day keeps the exam nerves away!',
    'I\'ve been polishing my spots for you ✨'],
  missing: ['I missed you, {nick}! My spuds were getting cold 🥺', 'The spaceship was so quiet without you. Quick drill?'],
  sleepy: ['Zzz… oh! {nick}! Let\'s wake our brains up with a quick drill.', '*yawn* I\'ve been asleep for days. Practise with me?'],
  holiday: ['No studying on holiday! Enjoy every mango 🥭', 'Say vanakkam to everyone in India for me! 🙏', 'I packed my sunglasses 😎 Brains need holidays too.',
    'Holiday mode ON. See you when you\'re back, {nick}! ✈️'],
  welcome: ['Welcome back, {nick}! Let\'s start gently: one short drill today 🌱', 'I missed you! How was India? Let\'s ease back in slowly.'],
  correct: ['Spud-tacular! 🥔✨', 'Out of this world! 🪐', 'Your brain is glowing like my antennae!', 'Potato-perfect!',
    'Correct! Beam me up some more!', 'Woohoo! +10 XP!'],
  wrong: ['Oops! Even aliens crash-land sometimes. The explanation is gold, read it!', 'Mistakes are rocket fuel 🚀 Now you know the trick!',
    'Hmm, tricky one! Check the concept box below.', 'Don\'t worry, I get confused in Earth maths too. Let\'s learn it!'],
};
