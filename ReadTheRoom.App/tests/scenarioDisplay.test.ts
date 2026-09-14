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

test('display title falls back to localized situation objects', () => {
  const scenario: Scenario = {
    ...baseScenario,
    situation: {
      ko: '상황 제목',
      en: 'Situation Title',
    },
  };

  assert.equal(getScenarioDisplayTitle(scenario, 'ko'), '상황 제목');
  assert.equal(getScenarioDisplayTitle(scenario, 'en'), 'Situation Title');
});

test('display title falls back between legacy situation strings', () => {
  const koreanScenario: Scenario = {
    ...baseScenario,
    situation: '기존 한글 상황',
    situationEN: 'Legacy English Situation',
  };
  const englishFallbackScenario: Scenario = {
    ...baseScenario,
    situation: '한글만 있는 상황',
    situationEN: '',
  };

  assert.equal(getScenarioDisplayTitle(koreanScenario, 'ko'), '기존 한글 상황');
  assert.equal(getScenarioDisplayTitle(koreanScenario, 'en'), 'Legacy English Situation');
  assert.equal(getScenarioDisplayTitle(englishFallbackScenario, 'en'), '한글만 있는 상황');
});

test('NORMAL header uses a zero-padded episode and localized title', () => {
  const scenario: Scenario = {
    ...baseScenario,
    id: 2,
    mainEpisode: 1,
    title: {
      ko: '세컨더리 룸의 압박 (예외)',
      en: 'Pressure in the Secondary Room (Exception)',
    },
  };

  assert.equal(getScenarioHeaderTitle(scenario, 'ko'), 'EP01: 세컨더리 룸의 압박');
  assert.equal(getScenarioHeaderTitle(scenario, 'en'), 'EP01: Pressure in the Secondary Room');
});

test('chunked headers prefer episode metadata and support EP11+', () => {
  const scenario: Scenario = {
    ...baseScenario,
    id: 11,
    stageNumber: 2,
    episodeNumber: 11,
    title: {
      ko: '새로운 시작',
      en: 'A New Beginning',
    },
  };

  assert.equal(getScenarioHeaderTitle(scenario, 'ko'), 'EP11: 새로운 시작');
  assert.equal(getScenarioHeaderTitle(scenario, 'en'), 'EP11: A New Beginning');
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

test('SPECIAL header falls back to a localized generic label without a display title', () => {
  const scenario: Scenario = {
    ...baseScenario,
    day: 3,
    situation: '',
    situationEN: '',
  };

  assert.equal(getScenarioHeaderTitle(scenario, 'ko'), '[Day 3] 특별 이벤트');
  assert.equal(getScenarioHeaderTitle(scenario, 'en'), '[Day 3] Special Event');
});

test('header falls back to day and title when no episode number exists', () => {
  const scenario: Scenario = {
    ...baseScenario,
    type: 'ENDING',
    title: {
      ko: '엔딩',
      en: 'Ending',
    },
  };

  assert.equal(getScenarioHeaderTitle(scenario, 'ko'), '[Day 1] 엔딩');
});

test('SUMMARY header shows only its localized JSON title', () => {
  const scenario: Scenario = {
    ...baseScenario,
    id: 1001,
    type: 'SUMMARY',
    title: {
      ko: '낯선 곳의 첫걸음',
      en: 'First Steps in a New Place',
    },
  };

  assert.equal(getScenarioHeaderTitle(scenario, 'ko'), '낯선 곳의 첫걸음');
  assert.equal(getScenarioHeaderTitle(scenario, 'en'), 'First Steps in a New Place');
});
