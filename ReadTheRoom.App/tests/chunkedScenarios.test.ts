import { describe, expect, test } from 'vitest';
import { getChunkedRoadmapGroups, getStageNumber, getSummaryId, loadCharacterScenarios, loadChunkedScenarioData } from '../utils/chunkedScenarios';
import { createCharacterScenarioBundles, getScenarioBundle } from '../utils/scenarioRegistry';
import { resolveChoiceContinuation, resolveSummaryContinuation } from '../domain/game/transitions';
import { getScenarioDisplayTitle, getScenarioHeaderTitle } from '../utils/scenarioDisplay';
import { FINAL_CLEAR_SCENARIO_ID } from '../utils/scenarioBundle';

const text = { ko: '테스트', en: 'Test' };
const makeChunk = (stage: number, nextStage = false) => {
  const chunk: Record<string, any> = {};
  for (let id = (stage - 1) * 10 + 1; id <= stage * 10; id++) {
    chunk[id] = {
      type: 'NORMAL', title: text, description: text, tip: text, backgroundKey: 'airport',
      choices: [{ type: 'GROWTH', text, feedback: text, statChanges: { mental: -5 }, nextScenarioId: id % 10 ? id + 1 : getSummaryId(stage) }],
    };
  }
  chunk[getSummaryId(stage)] = {
    type: 'SUMMARY', title: text, description: text, tip: text, backgroundKey: 'airport', choices: [],
    ...(nextStage ? { nextScenarioId: stage * 10 + 1 } : {}),
  };
  return chunk;
};

describe('new chunks and legacy use the same gameplay bundle', () => {
  test('uses the established 1000 + stage SUMMARY IDs', () => {
    expect([1, 2, 3, 10].map(getSummaryId)).toEqual([1001, 1002, 1003, 1010]);
  });

  test('registered Ken chunks take priority; Amy and Sora retain legacy', () => {
    const bundles = createCharacterScenarioBundles({ ken: [makeChunk(1, true), makeChunk(2)] });
    expect(bundles.ken.version).toBe('episode-chunks-v1');
    expect(bundles.ken.scenarios['11'].episodeNumber).toBe(11);
    expect(bundles.amy).toEqual(getScenarioBundle('amy'));
    expect(bundles.sora).toEqual(getScenarioBundle('sora'));
    expect(getScenarioBundle('ken').version).toBe('episode-chunks-v1');
    expect(getScenarioBundle('amy').version).not.toBe('episode-chunks-v1');
    expect(getScenarioBundle('sora').version).not.toBe('episode-chunks-v1');
    expect(createCharacterScenarioBundles({}).ken.version).not.toBe('episode-chunks-v1');
  });

  test('normalizes partial stats and retains tips without mutating input', () => {
    const chunk = makeChunk(1);
    const bundle = loadChunkedScenarioData([chunk]);
    expect(bundle.scenarios['1'].choices[0].statChanges).toEqual({ funds: 0, mental: -5, english: 0, insight: 0, stamina: 0, relation: 0 });
    expect(bundle.scenarios['1'].tip).toEqual(text);
    expect(chunk['1'].choices[0].statChanges).toEqual({ mental: -5 });
    expect(chunk['1'].id).toBeUndefined();
    expect(getScenarioDisplayTitle(bundle.scenarios[String(getSummaryId(1))], 'en')).toBe('Test');
  });

  test('sorts episodes numerically and puts SUMMARY last without counting it', () => {
    const bundle = loadChunkedScenarioData([makeChunk(2), makeChunk(1, true)]);
    expect(bundle.startScenarioId).toBe(1);
    expect(bundle.phases[0].nodeIds).toEqual([1,2,3,4,5,6,7,8,9,10,getSummaryId(1)]);
    expect(getChunkedRoadmapGroups(bundle).map(group => [group.week, group.dayStart, group.dayEnd])).toEqual([[1,1,10],[2,11,20]]);
    expect([1,10,11,20,21,101,110].map(getStageNumber)).toEqual([1,1,2,2,3,11,11]);
    expect(loadChunkedScenarioData([makeChunk(11)]).scenarios['101'].stageNumber).toBe(11);
  });

  test('chunked transitions traverse EP9 -> EP10 -> SUMMARY -> EP11 without a legacy summary', () => {
    const { scenarios } = loadChunkedScenarioData([makeChunk(1, true), makeChunk(2)]);
    const stats = { funds: 500, mental: 50, english: 50, insight: 50, stamina: 50, relation: 50 };
    const ep9 = resolveChoiceContinuation({ stats, scenario: scenarios['9'], choice: scenarios['9'].choices[0], nextScenarioExists: true, summaryMode: 'json-node' });
    const ep10 = resolveChoiceContinuation({ stats, scenario: scenarios['10'], choice: scenarios['10'].choices[0], nextScenarioExists: true, summaryMode: 'json-node' });
    const summary = resolveSummaryContinuation({ scenario: scenarios[String(getSummaryId(1))], nextScenarioExists: true });

    expect(ep9).toEqual({ type: 'advance', nextScenarioId: 10 });
    expect(ep10).toEqual({ type: 'advance', nextScenarioId: getSummaryId(1) });
    expect(summary).toEqual({ type: 'advance', nextScenarioId: 11 });
    expect([ep9.type, ep10.type, summary.type]).toEqual(['advance', 'advance', 'advance']);
    expect(resolveSummaryContinuation({ scenario: scenarios[String(getSummaryId(2))], nextScenarioExists: false })).toEqual({ type: 'ending' });
  });

  test('chunked transitions show IN_PROGRESS only after SUMMARY Continue when EP11 is missing', () => {
    const { scenarios } = loadChunkedScenarioData([makeChunk(1, true)]);
    const stats = { funds: 500, mental: 50, english: 50, insight: 50, stamina: 50, relation: 50 };
    const ep9 = resolveChoiceContinuation({ stats, scenario: scenarios['9'], choice: scenarios['9'].choices[0], nextScenarioExists: true, summaryMode: 'json-node' });
    const ep10 = resolveChoiceContinuation({ stats, scenario: scenarios['10'], choice: scenarios['10'].choices[0], nextScenarioExists: true, summaryMode: 'json-node' });

    expect(ep9).toEqual({ type: 'advance', nextScenarioId: 10 });
    expect(ep10).toEqual({ type: 'advance', nextScenarioId: 1001 });
    expect(ep10.type).not.toBe('summary');

    const afterSummaryContinue = resolveSummaryContinuation({
      scenario: scenarios['1001'],
      nextScenarioExists: false,
    });
    expect(afterSummaryContinue).toEqual({ type: 'in_progress', nextScenarioId: 11 });
  });

  test('loads the registered Ken Stage 1 through its future-content boundary', () => {
    const bundle = getScenarioBundle('ken');
    const stage = bundle.phases[0];

    expect(bundle.version).toBe('episode-chunks-v1');
    expect(bundle.startScenarioId).toBe(1);
    expect(stage.nodeIds).toEqual([1,2,3,4,5,6,7,8,9,10,1001]);
    expect(bundle.scenarios['10'].choices.every(choice => choice.nextScenarioId === 1001)).toBe(true);
    expect(bundle.scenarios['1001'].nextScenarioId).toBe(11);
    expect(bundle.scenarios['11']).toBeUndefined();
    expect(getScenarioHeaderTitle(bundle.scenarios['1'], 'ko')).toBe(`EP01: ${bundle.scenarios['1'].title?.ko}`);
    expect(getScenarioHeaderTitle(bundle.scenarios['1'], 'en')).toBe(`EP01: ${bundle.scenarios['1'].title?.en}`);
    expect(getScenarioHeaderTitle(bundle.scenarios['1001'], 'ko')).toBe(bundle.scenarios['1001'].title?.ko);
    expect(resolveSummaryContinuation({ scenario: bundle.scenarios['1001'], nextScenarioExists: false })).toEqual({ type: 'in_progress', nextScenarioId: 11 });

    const reachable = new Set<number>();
    const queue = [bundle.startScenarioId];
    while (queue.length) {
      const id = queue.shift()!;
      if (reachable.has(id) || !bundle.scenarios[String(id)]) continue;
      reachable.add(id);
      const node = bundle.scenarios[String(id)];
      node.choices.forEach(choice => queue.push(choice.nextScenarioId));
      if (node.nextScenarioId && bundle.scenarios[String(node.nextScenarioId)]) {
        queue.push(node.nextScenarioId);
      }
    }
    expect([...reachable].sort((a, b) => a - b)).toEqual(stage.nodeIds.slice().sort((a, b) => a - b));
  });

  test('allows the expected future chunk reference and connects it once registered', () => {
    const first = makeChunk(1, true);
    expect(loadChunkedScenarioData([first]).scenarios['1001'].nextScenarioId).toBe(11);

    const bundle = loadChunkedScenarioData([first, makeChunk(2)]);
    expect(resolveSummaryContinuation({ scenario: bundle.scenarios['1001'], nextScenarioExists: true })).toEqual({ type: 'advance', nextScenarioId: 11 });
  });

  test('supports the final-clear sentinel without registering scenario 9999', () => {
    const chunk = makeChunk(1);
    chunk[getSummaryId(1)].nextScenarioId = FINAL_CLEAR_SCENARIO_ID;
    const bundle = loadChunkedScenarioData([chunk]);

    expect(bundle.scenarios[String(FINAL_CLEAR_SCENARIO_ID)]).toBeUndefined();
    expect(resolveSummaryContinuation({ scenario: bundle.scenarios['1001'], nextScenarioExists: false })).toEqual({ type: 'final_clear' });
  });

  test('supports an omitted terminal target but rejects an arbitrary missing SUMMARY target', () => {
    const terminalBundle = loadChunkedScenarioData([makeChunk(1)]);
    expect(resolveSummaryContinuation({ scenario: terminalBundle.scenarios['1001'], nextScenarioExists: false })).toEqual({ type: 'ending' });

    const broken = makeChunk(1);
    broken[getSummaryId(1)].nextScenarioId = 57;
    expect(() => loadChunkedScenarioData([broken])).toThrow('SUMMARY 1001 must lead to 11');
  });

  test('invalid registered data throws rather than silently falling back', () => {
    expect(() => loadCharacterScenarios([{}], {})).toThrow('at least one NORMAL');
    expect(() => loadChunkedScenarioData([makeChunk(1), makeChunk(1)])).toThrow('duplicate ID');
  });

  test.each([
    ['missing destination', (c: Record<string, any>) => { c[1].choices[0].nextScenarioId = 999; }],
    ['invalid stat key', (c: Record<string, any>) => { c[1].choices[0].statChanges.health = 5; }],
    ['invalid stat value', (c: Record<string, any>) => { c[1].choices[0].statChanges.mental = '5'; }],
    ['empty choices', (c: Record<string, any>) => { c[1].choices = []; }],
    ['missing translation', (c: Record<string, any>) => { c[1].description = { en: 'Test' }; }],
    ['redundant ID', (c: Record<string, any>) => { c[1].id = 1; }],
    ['missing SUMMARY', (c: Record<string, any>) => { delete c[getSummaryId(1)]; }],
    ['SUMMARY choices', (c: Record<string, any>) => { c[getSummaryId(1)].choices = c[1].choices; }],
    ['SUMMARY in episode namespace', (c: Record<string, any>) => { c[1].type = 'SUMMARY'; }],
    ['missing episode', (c: Record<string, any>) => { delete c[5]; }],
    ['bypass SUMMARY', (c: Record<string, any>) => { c[10].choices[0].nextScenarioId = 1; }],
    ['wrong SUMMARY destination', (c: Record<string, any>) => { c[getSummaryId(1)].nextScenarioId = 1; }],
  ])('rejects %s', (_name, mutate) => {
    const chunk = structuredClone(makeChunk(1));
    mutate(chunk);
    expect(() => loadChunkedScenarioData([chunk])).toThrow('Invalid scenario chunks');
  });
});
