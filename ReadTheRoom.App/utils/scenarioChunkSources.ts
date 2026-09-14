import ken1to10 from '../assets/data/ken/ken_1_10.json';

// Metro requires literal imports. Import each JSON above and add it to its array.
// Only activate a character when all destinations and saved IDs are compatible.
export const newScenarioSources: Record<string, readonly unknown[]> = {
  ken: [ken1to10],
  amy: [],
  sora: [],
};
