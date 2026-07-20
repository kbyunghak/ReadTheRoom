import assert from 'node:assert/strict';
import { test } from 'vitest';
import { getConditionSummary, getStatusDetailTone } from '../utils/conditionSummary.ts';
import {
  episodeOneStartStats,
  fundsRiskStats,
  lowConfidenceEpisodeOneStats,
  multiRiskWithFundsStats,
  multiRiskWithoutFundsStats,
  riskMentalStats,
  stableStats,
  warningFundsStats,
  warningInsightStats,
  warningMentalStats,
  warningStaminaStats,
} from './fixtures/index.ts';

test('episode 1 override returns Super Nervous when opening stats are shaky', () => {
  const summary = getConditionSummary({
    episode: 1,
    lang: 'ko',
    stats: lowConfidenceEpisodeOneStats,
  });

  assert.equal(summary.title, '초긴장');
});

test('episode 1 override returns excitement when opening stats are stable', () => {
  const summary = getConditionSummary({
    episode: 1,
    lang: 'ko',
    stats: episodeOneStartStats,
  });

  assert.equal(summary.title, '설레임');
});

test('episode 1 override returns localized English copy', () => {
  const shakySummary = getConditionSummary({
    episode: 1,
    lang: 'en',
    stats: lowConfidenceEpisodeOneStats,
  });
  const stableSummary = getConditionSummary({
    episode: 1,
    lang: 'en',
    stats: episodeOneStartStats,
  });

  assert.equal(shakySummary.title, 'Super Nervous');
  assert.equal(shakySummary.description, 'It is finally starting. Take one deep breath.');
  assert.equal(stableSummary.title, 'Full of Excitement');
  assert.equal(stableSummary.description, 'You made it to the airport. It already feels exciting.');
});

test('three or more risk stats return 생존 경보', () => {
  const summary = getConditionSummary({
    episode: 2,
    lang: 'ko',
    stats: multiRiskWithFundsStats,
  });

  assert.equal(summary.title, '생존 경보');
});

test('two or more risk stats including funds return 생존 압박', () => {
  const summary = getConditionSummary({
    episode: 2,
    lang: 'ko',
    stats: {
      ...multiRiskWithFundsStats,
      stamina: 55,
    },
  });

  assert.equal(summary.title, '생존 압박');
});

test('two or more risk stats without funds return 비상 모드', () => {
  const summary = getConditionSummary({
    episode: 2,
    lang: 'ko',
    stats: {
      ...multiRiskWithoutFundsStats,
      stamina: 55,
    },
  });

  assert.equal(summary.title, '비상 모드');
});

test('single risk stat returns the specific stat state', () => {
  const summary = getConditionSummary({
    episode: 2,
    lang: 'ko',
    stats: riskMentalStats,
  });

  assert.equal(summary.title, '멘붕 직전');
});

test('warning-only states use mental as the highest priority', () => {
  const summary = getConditionSummary({
    episode: 2,
    lang: 'ko',
    stats: {
      ...warningMentalStats,
      insight: 35,
      stamina: 34,
      funds: 240,
    },
  });

  assert.equal(summary.title, '흔들림');
});

test('warning-only states fall through to insight, stamina, then funds', () => {
  const insightSummary = getConditionSummary({
    episode: 2,
    lang: 'ko',
    stats: warningInsightStats,
  });
  const staminaSummary = getConditionSummary({
    episode: 2,
    lang: 'ko',
    stats: warningStaminaStats,
  });
  const fundsSummary = getConditionSummary({
    episode: 2,
    lang: 'ko',
    stats: warningFundsStats,
  });

  assert.equal(insightSummary.title, '관찰 필요');
  assert.equal(staminaSummary.title, '숨 고르는 중');
  assert.equal(fundsSummary.title, '지갑 조심');
});

test('fully stable stats return 완벽 적응', () => {
  const summary = getConditionSummary({
    episode: 2,
    lang: 'ko',
    stats: stableStats,
  });

  assert.equal(summary.title, '완벽 적응');
});

test('english and relation do not affect the front-side representative state', () => {
  const summary = getConditionSummary({
    episode: 2,
    lang: 'ko',
    stats: {
      ...stableStats,
      english: 5,
      relation: 10,
    },
  });

  assert.equal(summary.title, '완벽 적응');
});

test('status detail tone includes all six stat entries', () => {
  const tone = getStatusDetailTone(fundsRiskStats, 'ko');

  assert.deepEqual(Object.keys(tone), [
    'funds',
    'mental',
    'relation',
    'english',
    'stamina',
    'insight',
  ]);
  assert.equal(tone.funds, '위험');
});

test('status detail tone classifies English boundary values', () => {
  const riskTone = getStatusDetailTone(
    {
      funds: 100,
      mental: 20,
      english: 20,
      insight: 20,
      stamina: 20,
      relation: 20,
    },
    'en',
  );
  const warningTone = getStatusDetailTone(
    {
      funds: 300,
      mental: 40,
      english: 40,
      insight: 40,
      stamina: 40,
      relation: 40,
    },
    'en',
  );
  const stableTone = getStatusDetailTone(stableStats, 'en');

  assert.equal(riskTone.funds, 'Risk');
  assert.equal(riskTone.mental, 'Risk');
  assert.equal(warningTone.funds, 'Care');
  assert.equal(warningTone.mental, 'Care');
  assert.equal(stableTone.funds, 'Stable');
  assert.equal(stableTone.mental, 'Stable');
});
