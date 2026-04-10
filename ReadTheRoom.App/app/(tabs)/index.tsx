import React, { useState } from 'react';
import SplashScreen from '../../components/SplashScreen';
import CharacterSelectScreen, { Character } from '../../components/CharacterSelectScreen';
import CharacterDetailScreen from '../../components/CharacterDetailScreen';
import GameScreen from './GameScreen';

type Screen = 'splash' | 'characterSelect' | 'characterDetail' | 'game';

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [lang] = useState<'en' | 'ko'>('ko');

  if (screen === 'splash') {
    return <SplashScreen onLoadComplete={() => setScreen('characterSelect')} />;
  }
  if (screen === 'characterSelect') {
    return (
      <CharacterSelectScreen
        lang={lang}
        onSelectCharacter={(char) => {
          setSelectedCharacter(char);
          setScreen('characterDetail');
        }}
      />
    );
  }
  if (screen === 'characterDetail' && selectedCharacter) {
    return (
      <CharacterDetailScreen
        character={selectedCharacter}
        lang={lang}
        onBack={() => setScreen('characterSelect')}
        onConfirm={(char) => {
          setSelectedCharacter(char);
          setScreen('game');
        }}
      />
    );
  }
  return <GameScreen />;
}