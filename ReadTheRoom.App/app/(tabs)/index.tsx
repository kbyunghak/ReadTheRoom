import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
import { locales } from '../../locales';

type Screen =
  | 'splash'
  | 'warning'
  | 'characterSelect'
  | 'characterDetail'
  | 'game';

type PendingCharacterStart = {
  character: Character;
  session: SavedGameSession;
};

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
  const [pendingCharacterStart, setPendingCharacterStart] =
    useState<PendingCharacterStart | null>(null);

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
      <>
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
              if (restored) {
                setPendingCharacterStart({ character, session: restored });
                return;
              }

              setGameInitialSession(null);
              setScreen('game');
            });
          }}
        />
        <SavedGamePrompt
          visible={pendingCharacterStart !== null}
          lang={lang}
          character={pendingCharacterStart?.character ?? null}
          situationTitle={savedSituationTitle}
          onContinue={() => {
            if (!pendingCharacterStart) {
              return;
            }

            const { character, session } = pendingCharacterStart;
            setPendingCharacterStart(null);
            setSelectedCharacter(character);
            setGameInitialSession(session);
            setLang(session.lang);
            setScreen('game');
          }}
          onRestart={() => {
            if (!pendingCharacterStart) {
              return;
            }

            const { character } = pendingCharacterStart;
            setPendingCharacterStart(null);
            setSelectedCharacter(character);
            setGameInitialSession(null);
            setSavedSession(null);
            setSavedSituationTitle(null);
            void clearSavedGame(character.id);
            setScreen('game');
          }}
          onCancel={() => setPendingCharacterStart(null)}
        />
      </>,
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

type SavedGamePromptProps = {
  visible: boolean;
  lang: 'en' | 'ko';
  character: Character | null;
  situationTitle: string | null;
  onContinue: () => void;
  onRestart: () => void;
  onCancel: () => void;
};

function SavedGamePrompt({
  visible,
  lang,
  character,
  situationTitle,
  onContinue,
  onRestart,
  onCancel,
}: SavedGamePromptProps) {
  if (!visible || !character) {
    return null;
  }

  const text = locales[lang].characterDetail;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalBadge}>
            <Text style={styles.modalBadgeText}>{text.continueSave}</Text>
          </View>
          <Text style={styles.modalTitle}>
            {text.savedRunTitle(character.name[lang])}
          </Text>
          <Text style={styles.modalDescription}>
            {text.currentSituation(situationTitle ?? text.inProgress)}
          </Text>
          <View style={styles.continueButtonRow}>
            <TouchableOpacity
              style={styles.continueSecondaryButton}
              onPress={onRestart}
            >
              <Text style={styles.continueSecondaryText}>{text.startOver}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.continuePrimaryButton}
              onPress={onContinue}
            >
              <Text style={styles.continuePrimaryText}>{text.continue}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.modalGhostButton} onPress={onCancel}>
            <Text style={styles.modalGhostButtonText}>{text.cancel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(8, 12, 22, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.96)',
    paddingHorizontal: 24,
    paddingVertical: 26,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  modalBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(245,159,0,0.14)',
    marginBottom: 14,
  },
  modalBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E67700',
    letterSpacing: 0.4,
  },
  modalTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    color: '#1C2433',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: '#596579',
    textAlign: 'center',
    marginBottom: 20,
  },
  continueButtonRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  continueSecondaryButton: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(28,36,51,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  continueSecondaryText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#465366',
  },
  continuePrimaryButton: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: '#F59F00',
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  continuePrimaryText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1A2E',
  },
  modalGhostButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  modalGhostButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7A889C',
  },
});
