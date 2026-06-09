import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GameStats, StatChanges } from './gameStats';
import type { LocalizedText, ScenarioChoice } from './scenarioRegistry';

const SAVE_KEY_PREFIX = 'readtheroom_saved_game_v1';

export type PersistenceStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

type SavedChoice = {
  text: LocalizedText;
  feedback: LocalizedText;
  statChanges: StatChanges;
  nextScenarioId: number;
};

type SavedPlayedChoice = {
  situationTitle: LocalizedText;
  choice: SavedChoice;
};

type SavedCheckpoint = {
  scenarioId: number;
  stats: GameStats;
  playHistory: SavedPlayedChoice[];
};

export type SavedGameSession = {
  characterId: string;
  lang: 'en' | 'ko';
  currentScenarioId: number;
  stats: GameStats;
  playHistory: SavedPlayedChoice[];
  currentSituationChoices: ScenarioChoice[];
  checkpoints: Record<number, SavedCheckpoint>;
  updatedAt: string;
};

const normalizeStats = (stats: GameStats): GameStats => ({
  ...stats,
  relation: stats.relation ?? 50,
});

const normalizeSession = (session: SavedGameSession): SavedGameSession => ({
  ...session,
  stats: normalizeStats(session.stats),
  checkpoints: Object.fromEntries(
    Object.entries(session.checkpoints).map(([key, checkpoint]) => [
      key,
      {
        ...checkpoint,
        stats: normalizeStats(checkpoint.stats),
      },
    ]),
  ),
});

export const getSaveKey = (characterId: string) => `${SAVE_KEY_PREFIX}:${characterId}`;

export const loadSavedGame = async (
  characterId: string,
  storage: PersistenceStorage = AsyncStorage,
): Promise<SavedGameSession | null> => {
  try {
    const raw = await storage.getItem(getSaveKey(characterId));
    if (!raw) return null;
    return normalizeSession(JSON.parse(raw) as SavedGameSession);
  } catch {
    return null;
  }
};

export const saveGame = async (session: SavedGameSession, storage: PersistenceStorage = AsyncStorage) => {
  try {
    await storage.setItem(getSaveKey(session.characterId), JSON.stringify(session));
  } catch {
    // Best-effort local persistence only.
  }
};

export const clearSavedGame = async (characterId: string, storage: PersistenceStorage = AsyncStorage) => {
  try {
    await storage.removeItem(getSaveKey(characterId));
  } catch {
    // Best-effort local persistence only.
  }
};
