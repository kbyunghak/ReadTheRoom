import assert from 'node:assert/strict';
import { buildResultCardData, buildSelectedChoiceText, getChangedStatEntries } from '../utils/resultCard.ts';
import { choiceWithPositiveChanges, choiceWithZeroChanges } from './fixtures/choices.ts';
import { tipScenarioNode } from './fixtures/scenarios.ts';

const test = (name: string, fn: () => void) => {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
};

test('buildSelectedChoiceText joins cue and body for result display', () => {
  const text = buildSelectedChoiceText('(Stay calm) Uh... Check the form one more time?');
  assert.equal(text, 'Stay calm Uh... Check the form one more time?');
});

test('getChangedStatEntries only returns non-zero stat changes in UI order', () => {
  const entries = getChangedStatEntries(choiceWithPositiveChanges.statChanges);
  assert.deepEqual(entries, [
    { statKey: 'mental', value: 5 },
    { statKey: 'english', value: 10 },
    { statKey: 'insight', value: 15 },
  ]);
});

test('buildResultCardData hides zero-value stat changes', () => {
  const result = buildResultCardData(choiceWithZeroChanges, 'ko');
  assert.deepEqual(result.changedStats, []);
});

test('buildResultCardData uses only the current language tip text', () => {
  const koResult = buildResultCardData(choiceWithPositiveChanges, 'ko', tipScenarioNode.tip);
  const enResult = buildResultCardData(choiceWithPositiveChanges, 'en', tipScenarioNode.tip);

  assert.equal(koResult.tipText, tipScenarioNode.tip?.ko ?? null);
  assert.equal(enResult.tipText, tipScenarioNode.tip?.en ?? null);
});

test('buildResultCardData omits tip text when there is no tip', () => {
  const result = buildResultCardData(choiceWithPositiveChanges, 'ko');
  assert.equal(result.tipText, null);
});
