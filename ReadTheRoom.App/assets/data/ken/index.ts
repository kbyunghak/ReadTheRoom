import type { CharacterScenarioPack } from '../scenarioTypes';
import { kenWeek1Scenarios } from './week1';

export const kenScenarioPack: CharacterScenarioPack = {
  characterId: 'ken',
  startScenarioId: 1,
  nodes: [
    ...kenWeek1Scenarios,
  ],
};

export const kenScenarioNodes = kenScenarioPack.nodes;
