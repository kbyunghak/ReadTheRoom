import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BETA_CHARACTERS } from '../locales/characters';
import { locales, type AppLanguage } from '../locales';
import type { Character, CharacterStat, LocalizedText, StartingStats, StatKey } from '../locales/types';

const GRID_PADDING = 20;
const GRID_GAP = 12;
const GRID_COLUMNS = 3;

export type { Character, CharacterStat, LocalizedText, StartingStats, StatKey };

const DISPLAY_STAT_META: Record<
  StatKey,
  { label: LocalizedText; sourceMax: number; displayMax: number; color: string }
> = {
  funds: {
    label: { ko: '자금', en: 'Funds' },
    sourceMax: 1000,
    displayMax: 1000,
    color: '#F59F00',
  },
  mental: {
    label: { ko: '멘탈', en: 'Mental' },
    sourceMax: 100,
    displayMax: 1000,
    color: '#F03E3E',
  },
  english: {
    label: { ko: '영어', en: 'English' },
    sourceMax: 100,
    displayMax: 1000,
    color: '#339AF0',
  },
  insight: {
    label: { ko: '눈치', en: 'Insight' },
    sourceMax: 100,
    displayMax: 1000,
    color: '#BE4BDB',
  },
  stamina: {
    label: { ko: '체력', en: 'Stamina' },
    sourceMax: 100,
    displayMax: 1000,
    color: '#40C057',
  },
  relation: {
    label: { ko: '관계', en: 'Relation' },
    sourceMax: 100,
    displayMax: 1000,
    color: '#FF6B9D',
  },
};

const normalizeStat = (value: number, sourceMax: number, displayMax: number) =>
  Math.round((Math.max(0, Math.min(value, sourceMax)) / sourceMax) * displayMax);

export const buildDisplayStats = (startingStats: StartingStats): CharacterStat[] => {
  return (Object.keys(DISPLAY_STAT_META) as StatKey[]).map((key) => {
    const meta = DISPLAY_STAT_META[key];
    return {
      key,
      label: meta.label,
      value: normalizeStat(startingStats[key], meta.sourceMax, meta.displayMax),
      max: meta.displayMax,
      color: meta.color,
    };
  });
};

type Props = {
  onSelectCharacter: (character: Character) => void;
  lang: AppLanguage;
  onToggleLanguage: () => void;
};

export default function CharacterSelectScreen({ onSelectCharacter, lang, onToggleLanguage }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const text = locales[lang].characterSelect;
  const maxGridWidth = Platform.OS === 'web' ? 980 : width;
  const gridWidth = Math.min(width - GRID_PADDING * 2, maxGridWidth);
  const cardWidth = (gridWidth - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
  const useCompactWebCard = Platform.OS === 'web' && width > 600;
  const cardHeight = cardWidth * (useCompactWebCard ? 1.72 : 2.12);

  const renderCharacterCard = (char: Character) => (
    <TouchableOpacity
      key={char.id}
      style={[
        styles.card,
        { width: cardWidth, height: cardHeight },
        hoveredId === char.id && styles.cardHovered,
      ]}
      onPress={() => onSelectCharacter(char)}
      onPressIn={() => setHoveredId(char.id)}
      onPressOut={() => setHoveredId(null)}
      activeOpacity={0.92}
    >
      <View
        style={{
          width: '100%',
          aspectRatio: 3 / 4,
          flexShrink: 0,
          overflow: 'hidden',
          backgroundColor: '#202036',
        }}
      >
        <Image
          source={char.image}
          style={{
            width: '100%',
            height: '100%',
          }}
          contentFit="cover"
          contentPosition="top center"
        />
      </View>

      <View
        style={{
          flex: 1,
          minHeight: 0,
          backgroundColor: 'rgba(20,20,35,0.95)',
          paddingHorizontal: 10,
          paddingTop: 11,
          paddingBottom: 10,
          justifyContent: 'space-between',
        }}
      >
        <View style={styles.cardTextGroup}>
          <Text style={styles.cardName}>{char.name[lang]}</Text>
          <Text style={styles.cardAge}>{char.age[lang]}</Text>
        </View>
        <Text style={styles.cardTrait}>{char.jobTitle[lang]}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.headerBlock}>
          <Text style={styles.headerSub}>{text.subtitle}</Text>

          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>{text.title}</Text>

            <TouchableOpacity style={styles.languageButton} onPress={onToggleLanguage} activeOpacity={0.9}>
              <Text style={styles.languageButtonText}>{text.languageToggle}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={[styles.gridInner, { width: gridWidth }]}>
            <View style={styles.row}>
              {BETA_CHARACTERS.map(renderCharacterCard)}
            </View>
          </View>
        </View>

        <Text style={styles.hint}>{text.hint}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1a1a2e' },
  container: { flex: 1, paddingTop: 8 },
  headerBlock: {
    paddingHorizontal: 24,
    paddingBottom: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
    marginBottom: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
    paddingRight: 8,
  },
  languageButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  languageButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  grid: {
    paddingHorizontal: GRID_PADDING,
    paddingBottom: 4,
    alignItems: 'center',
  },
  gridInner: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: GRID_GAP,
    justifyContent: 'space-between',
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#2a2a3e',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardHovered: {
    borderColor: '#F59F00',
    transform: [{ scale: 1.02 }],
  },
  cardTextGroup: {
    gap: 3,
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: 20,
  },
  cardAge: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 14,
  },
  cardTrait: {
    fontSize: 10,
    lineHeight: 13,
    color: '#F59F00',
    fontWeight: '600',
    backgroundColor: 'rgba(245,159,0,0.15)',
    alignSelf: 'stretch',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    flexShrink: 1,
    minHeight: 30,
    textAlignVertical: 'center',
  },
  hint: {
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    paddingTop: 14,
    paddingBottom: 10,
    letterSpacing: 0.5,
  },
});
