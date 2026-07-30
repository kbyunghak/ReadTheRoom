import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import SplashScreen from '../../components/SplashScreen';
import WarningScreen from '../../components/WarningScreen';
import CharacterSelectScreen, {
  Character,
} from '../../components/CharacterSelectScreen';
import CharacterDetailScreen from '../../components/CharacterDetailScreen';
import GameScreen from './GameScreen';
import {
  getScenarioBundle,
  hasScenarioForCharacter,
} from '../../utils/scenarioRegistry';
import {
  clearSavedGame,
  loadSavedGame,
  type SavedGameSession,
} from '../../utils/gamePersistence';
import { playBgm, stopBgm, type BgmTrack } from '../../utils/bgmPlayer';

type Screen =
  | 'splash'
  | 'warning'
  | 'characterSelect'
  | 'characterDetail'
  | 'game';

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null,
  );
  const [lang, setLang] = useState<'en' | 'ko'>('ko');
  const [savedSession, setSavedSession] = useState<SavedGameSession | null>(
    null,
  );
  const [gameInitialSession, setGameInitialSession] =
    useState<SavedGameSession | null>(null);
  const [savedSituationTitle, setSavedSituationTitle] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setSavedSession(null);
    setSavedSituationTitle(null);
  }, []);

  const loadCharacterProgress = async (character: Character) => {
    const restored = await loadSavedGame(character.id);
    let situationTitle: string | null = null;

    if (restored) {
      const scenarios = getScenarioBundle(character.id).scenarios;
      const scenario = scenarios?.[String(restored.currentScenarioId)];
      situationTitle =
        typeof scenario?.situation === 'object' && scenario?.situation
          ? scenario.situation[lang]
          : lang === 'ko'
            ? typeof scenario?.situation === 'string'
              ? scenario.situation
              : scenario?.situationEN || null
            : scenario?.situationEN ||
              (typeof scenario?.situation === 'string'
                ? scenario.situation
                : null);
    }

    setSavedSession(restored);
    setSavedSituationTitle(situationTitle);

    return restored;
  };

  useEffect(() => {
    const track: BgmTrack =
      screen === 'game'
        ? 'play'
        : screen === 'characterSelect' || screen === 'characterDetail'
          ? 'title'
          : 'main';

    const fadeDurationMs =
      screen === 'splash' ? 0 : screen === 'warning' ? 150 : 700;

    void playBgm(track, fadeDurationMs);
  }, [screen]);

  useEffect(() => {
    return () => {
      void stopBgm();
    };
  }, []);

  const renderScreen = (children: React.ReactNode) => (
    <>
      <Tabs.Screen
        options={{
          tabBarStyle: { display: 'none' },
        }}
      />
      {children}
    </>
  );

  if (screen === 'splash') {
    return renderScreen(
      <SplashScreen onLoadComplete={() => setScreen('warning')} />,
    );
  }

  if (screen === 'warning') {
    return renderScreen(
      <WarningScreen onComplete={() => setScreen('characterSelect')} />,
    );
  }

  if (screen === 'characterSelect') {
    return renderScreen(
      <CharacterSelectScreen
        lang={lang}
        onToggleLanguage={() =>
          setLang((prev) => (prev === 'ko' ? 'en' : 'ko'))
        }
        onViewDetails={(character) => {
          setSelectedCharacter(character);
          void loadCharacterProgress(character).then(() => {
            setScreen('characterDetail');
          });
        }}
        onStartCharacter={(character) => {
          setSelectedCharacter(character);
          void loadCharacterProgress(character).then((restored) => {
            setGameInitialSession(restored);
            if (restored) {
              setLang(restored.lang);
            }
            setScreen('game');
          });
        }}
      />,
    );
  }

  if (screen === 'characterDetail' && selectedCharacter) {
    return renderScreen(
      <CharacterDetailScreen
        character={selectedCharacter}
        lang={lang}
        isPlayable={hasScenarioForCharacter(selectedCharacter.id)}
        savedSession={
          savedSession?.characterId === selectedCharacter.id
            ? savedSession
            : null
        }
        savedSituationTitle={savedSituationTitle}
        onBack={() => setScreen('characterSelect')}
        onConfirm={(char, mode) => {
          setSelectedCharacter(char);
          if (mode === 'continue') {
            const sessionToContinue =
              savedSession?.characterId === char.id ? savedSession : null;
            setGameInitialSession(sessionToContinue);
            setLang(sessionToContinue?.lang ?? lang);
          } else {
            setGameInitialSession(null);
            setSavedSession(null);
            setSavedSituationTitle(null);
            void clearSavedGame(char.id);
          }
          setScreen('game');
        }}
      />,
    );
  }

  return renderScreen(
    <GameScreen
      character={selectedCharacter}
      initialLang={lang}
      initialSession={gameInitialSession}
      onGoToCharacterSelect={() => {
        setSelectedCharacter(null);
        setGameInitialSession(null);
        setSavedSituationTitle(null);
        setScreen('characterSelect');
      }}
      onClearSavedGame={() => {
        setGameInitialSession(null);
        setSavedSession(null);
        setSavedSituationTitle(null);
        if (selectedCharacter?.id) {
          void clearSavedGame(selectedCharacter.id);
        }
      }}
    />,
  );
}
