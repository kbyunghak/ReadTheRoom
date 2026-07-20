import assert from 'node:assert/strict';
import { test } from 'vitest';
import { getScenarioDisplayTitle, getScenarioHeaderTitle } from '../utils/scenarioDisplay.ts';
import type { Scenario } from '../utils/scenarioRegistry.ts';

const baseScenario = {
  id: 9001,
  type: 'NORMAL',
  day: 1,
  description: { ko: '', en: '' },
  choices: [],
} satisfies Scenario;

test('display title removes internal exception labels outside the component', () => {
  const scenario: Scenario = {
    ...baseScenario,
    title: {
      ko: '세컨더리 룸의 압박 (예외)',
      en: 'Pressure in the Secondary Room (Exception)',
    },
  };

  assert.equal(getScenarioDisplayTitle(scenario, 'ko'), '세컨더리 룸의 압박');
  assert.equal(getScenarioDisplayTitle(scenario, 'en'), 'Pressure in the Secondary Room');
});

test('SUMMARY display title uses a localized day completion label', () => {
  const scenario: Scenario = {
    ...baseScenario,
    id: 1001,
    type: 'SUMMARY',
    title: {
      ko: 'Day 1 종료: Every choice shapes your story',
      en: 'End of Day 1: Every choice shapes your story',
    },
  };

  assert.equal(getScenarioDisplayTitle(scenario, 'ko'), 'Day 1 종료');
  assert.equal(getScenarioDisplayTitle(scenario, 'en'), 'Day 1 Complete');
});

test('NORMAL header includes day, main episode, and display title', () => {
  const scenario: Scenario = {
    ...baseScenario,
    id: 2,
    mainEpisode: 1,
    title: {
      ko: '세컨더리 룸의 압박 (예외)',
      en: 'Pressure in the Secondary Room (Exception)',
    },
  };

  assert.equal(getScenarioHeaderTitle(scenario, 'ko'), '[Day 1] EP 01: 세컨더리 룸의 압박');
});

test('SPECIAL header does not force an episode number', () => {
  const scenario: Scenario = {
    ...baseScenario,
    day: 2,
    title: {
      ko: '마트 결제대의 식은땀',
      en: 'Cold Sweat at Checkout',
    },
  };

  assert.equal(getScenarioHeaderTitle(scenario, 'ko'), '[Day 2] 마트 결제대의 식은땀');
});

test('SUMMARY header only shows the day completion label', () => {
  const scenario: Scenario = {
    ...baseScenario,
    id: 1001,
    type: 'SUMMARY',
  };

  assert.equal(getScenarioHeaderTitle(scenario, 'ko'), '[Day 1] 종료');
  assert.equal(getScenarioHeaderTitle(scenario, 'en'), '[Day 1] Complete');
});
