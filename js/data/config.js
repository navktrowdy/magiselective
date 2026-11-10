// App-level configuration that is the same for every exam and every family.
// Exam-specific settings live in js/packs/<exam>/pack.js; family data lives in data/family.json.
// Look-and-feel themes (picked in Settings or on the My Potalien page). Swatches are for the picker.
export const THEMES = [
  { id: 'sand', name: 'Warm Sand', blurb: 'Calm cream, gold and green', sw: ['#faf6f0', '#c9a55c', '#5a8a64', '#2b2620'] },
  { id: 'spudonia', name: 'Planet Spudonia', blurb: 'Potalien\'s purple home planet', sw: ['#f4f0ff', '#6c4ad1', '#b8f04a', '#2a1f4d'] },
  { id: 'cosmic', name: 'Cosmic Night', blurb: 'Dark space mode, easy on the eyes', sw: ['#0f1430', '#8b7cf6', '#ffd166', '#1fb5c9'] },
  { id: 'candy', name: 'Candy Pop', blurb: 'Bright pink and orange', sw: ['#fff4f8', '#e8578f', '#ffb347', '#2ec4b6'] },
  { id: 'ocean', name: 'Ocean Breeze', blurb: 'Cool blues and coral', sw: ['#eef7fb', '#1f7aa8', '#2ec4b6', '#ff7f5c'] },
  { id: 'jungle', name: 'Jungle Explorer', blurb: 'Leafy greens and mango orange', sw: ['#f1f6e9', '#2f7d32', '#8bc34a', '#f39c12'] },
];
