import assert from 'node:assert/strict';
import { clearSavedGame, loadSavedGame, saveGame } from '../utils/gamePersistence.ts';
import { createMemoryStorage, defaultSavedSession } from './fixtures/index.ts';

const run = async (name: string, fn: () => Promise<void>) => {
  try {
    await fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
};

await run('saveGame persists a progressed session and loadSavedGame restores it', async () => {
  const storage = createMemoryStorage();
  const session = defaultSavedSession();

  await saveGame(session, storage);
  const loaded = await loadSavedGame('ken', storage);

  assert.deepEqual(loaded, session);
});

await run('saved progress does not reset unless clearSavedGame is called', async () => {
  const storage = createMemoryStorage();
  const progressedSession = defaultSavedSession({
    currentScenarioId: 12,
    stats: {
      funds: 380,
      mental: 74,
      english: 68,
      insight: 59,
      stamina: 44,
      relation: 63,
    },
  });

  await saveGame(progressedSession, storage);

  const firstLoad = await loadSavedGame('ken', storage);
  const secondLoad = await loadSavedGame('ken', storage);

  assert.equal(firstLoad?.currentScenarioId, 12);
  assert.equal(secondLoad?.currentScenarioId, 12);
  assert.deepEqual(secondLoad?.stats, progressedSession.stats);
});

await run('clearSavedGame removes the saved session explicitly', async () => {
  const storage = createMemoryStorage();
  await saveGame(defaultSavedSession(), storage);

  await clearSavedGame('ken', storage);
  const loaded = await loadSavedGame('ken', storage);

  assert.equal(loaded, null);
});

await run('character saves are isolated so one character does not overwrite another', async () => {
  const storage = createMemoryStorage();
  const kenSession = defaultSavedSession({ characterId: 'ken', currentScenarioId: 9 });
  const amySession = defaultSavedSession({ characterId: 'amy', currentScenarioId: 14 });

  await saveGame(kenSession, storage);
  await saveGame(amySession, storage);

  const loadedKen = await loadSavedGame('ken', storage);
  const loadedAmy = await loadSavedGame('amy', storage);

  assert.equal(loadedKen?.currentScenarioId, 9);
  assert.equal(loadedAmy?.currentScenarioId, 14);
  assert.equal(loadedKen?.characterId, 'ken');
  assert.equal(loadedAmy?.characterId, 'amy');
});

await run('loadSavedGame normalizes missing relation values in stats and checkpoints', async () => {
  const storage = createMemoryStorage();
  const statsWithoutRelation = {
    funds: 455,
    mental: 60,
    english: 50,
    insight: 45,
    stamina: 50,
  } as any;
  const brokenSession = defaultSavedSession({
    stats: statsWithoutRelation,
    checkpoints: {
      1: {
        scenarioId: 1,
        stats: {
          funds: 500,
          mental: 50,
          english: 25,
          insight: 45,
          stamina: 60,
        } as any,
        playHistory: [],
      },
    },
  });

  await saveGame(brokenSession, storage);
  const loaded = await loadSavedGame('ken', storage);

  assert.equal(loaded?.stats.relation, 50);
  assert.equal(loaded?.checkpoints[1]?.stats.relation, 50);
});

await run('saved checkpoints are preserved when the session is restored', async () => {
  const storage = createMemoryStorage();
  const session = defaultSavedSession({
    checkpoints: {
      1: {
        scenarioId: 1,
        stats: {
          funds: 500,
          mental: 50,
          english: 25,
          insight: 45,
          stamina: 60,
          relation: 40,
        },
        playHistory: [],
      },
      11: {
        scenarioId: 11,
        stats: {
          funds: 420,
          mental: 44,
          english: 38,
          insight: 47,
          stamina: 52,
          relation: 45,
        },
        playHistory: [],
      },
    },
  });

  await saveGame(session, storage);
  const loaded = await loadSavedGame('ken', storage);

  assert.deepEqual(Object.keys(loaded?.checkpoints ?? {}), ['1', '11']);
  assert.equal(loaded?.checkpoints[11]?.scenarioId, 11);
});
