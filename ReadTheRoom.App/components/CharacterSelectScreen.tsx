import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { STAT_METADATA } from '../domain/stats/config';
import { buildCoreCharacterStats } from '../domain/stats/display';
import { BETA_CHARACTERS } from '../locales/characters';
import { locales, type AppLanguage } from '../locales';
import type {
  Character,
  CharacterStat,
  LocalizedText,
  StartingStats,
  StatKey,
} from '../locales/types';

const SCREEN_PADDING = 18;
const MAX_CONTENT_WIDTH = 560;
export type { Character, CharacterStat, LocalizedText, StartingStats, StatKey };

type Props = {
  onStartCharacter: (character: Character) => void;
  onViewDetails: (character: Character) => void;
  lang: AppLanguage;
  onToggleLanguage: () => void;
};

export default function CharacterSelectScreen({
  onStartCharacter,
  onViewDetails,
  lang,
  onToggleLanguage,
}: Props) {
  const { width, height } = useWindowDimensions();
  const text = locales[lang].characterSelect;
  const contentWidth = Math.min(width - SCREEN_PADDING * 2, MAX_CONTENT_WIDTH);
  const cardHeight = Math.min(165, Math.max(140, height * 0.18));
  const imageWidth = Math.min(130, Math.max(105, height * 0.13));
  const useCompactCard = contentWidth < 330;

  const renderCharacterCard = (character: Character) => {
    const displayStats = buildCoreCharacterStats(character.startingStats);

    return (
      <View key={character.id} style={[styles.card, { height: cardHeight }]}>
        <View
          style={[
            styles.cardImageFrame,
            {
              width: imageWidth,
              height: cardHeight,
            },
          ]}
        >
          <Image
            source={character.image}
            style={styles.cardImage}
            contentFit="contain"
            contentPosition="bottom center"
          />
        </View>

        <View
          style={[
            styles.cardBody,
            useCompactCard && {
              paddingHorizontal: 10,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.nameGroup}>
              <Text style={styles.characterName} numberOfLines={1}>
                {character.name[lang]}
              </Text>
              {lang === 'ko' ? (
                <Text style={styles.characterEnglishName} numberOfLines={1}>
                  {character.name.en}
                </Text>
              ) : null}
              {character.id === 'ken' ? (
                <View style={styles.recommendedBadge}>
                  <MaterialCommunityIcons
                    name="star-outline"
                    size={10}
                    color="#74542F"
                  />
                  <Text style={styles.recommendedBadgeText} numberOfLines={1}>
                    {text.recommended}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <Text style={styles.characterMeta} numberOfLines={2}>
            {character.age[lang]} · {character.jobTitle[lang]}
          </Text>

          <Text
            style={[
              styles.characterDescription,
              {
                minHeight: 14,
              },
            ]}
            numberOfLines={1}
          >
            {character.description[lang][0]}
          </Text>

          <View style={styles.statsRow}>
            {displayStats.map((stat) => {
              const meta = STAT_METADATA[stat.key];

              return (
                <View
                  key={`${character.id}-${stat.key}`}
                  style={styles.statItem}
                >
                  <MaterialCommunityIcons
                    name={meta.icon}
                    size={12}
                    color={meta.characterColor}
                  />
                  <Text style={styles.statLabel} numberOfLines={1}>
                    {stat.label[lang]}
                  </Text>
                  <Text style={styles.statValue}>{stat.value}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.cardActionRow}>
            <TouchableOpacity
              style={[
                styles.startButton,
                useCompactCard && {
                  paddingHorizontal: 8,
                },
              ]}
              onPress={() => onStartCharacter(character)}
              accessibilityRole="button"
              accessibilityLabel={text.playAs(character.name[lang])}
              activeOpacity={0.88}
            >
              <Text
                style={[
                  styles.startButtonText,
                  useCompactCard && { fontSize: 12 },
                ]}
                numberOfLines={1}
              >
                {text.playAs(character.name[lang])}
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={18}
                color="#172033"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => onViewDetails(character)}
              accessibilityRole="button"
              accessibilityLabel={
                lang === 'ko'
                  ? `${character.name.ko} 자세히 보기`
                  : `View ${character.name.en} details`
              }
              hitSlop={8}
              activeOpacity={0.78}
            >
              <MaterialCommunityIcons
                name="information-outline"
                size={19}
                color="#78684F"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { width: contentWidth }]}>
          <View style={styles.headerBlock}>
            <Text style={styles.headerSub}>{text.subtitle}</Text>

            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>{text.title}</Text>

              <TouchableOpacity
                style={styles.languageButton}
                onPress={onToggleLanguage}
                activeOpacity={0.86}
              >
                <MaterialCommunityIcons name="web" size={17} color="#FFFFFF" />
                <Text style={styles.languageButtonText}>
                  {text.languageToggle}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.headerDescription}>{text.description}</Text>
          </View>

          <View style={styles.cardList}>
            {BETA_CHARACTERS.map(renderCharacterCard)}
          </View>

          <View style={styles.footerHint}>
            <MaterialCommunityIcons
              name="information-outline"
              size={13}
              color="#697188"
            />
            <Text style={styles.footerHintText}>{text.settingsHint}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111423',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: SCREEN_PADDING,
  },
  content: {
    alignSelf: 'center',
  },
  headerBlock: {
    marginBottom: 12,
  },
  headerSub: {
    fontSize: 13,
    lineHeight: 18,
    color: '#A7AABD',
    marginBottom: 5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 29,
    lineHeight: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.6,
  },
  headerDescription: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: '#B6B8C7',
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  languageButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardList: {
    gap: 9,
  },
  card: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: '#171A2B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  cardImageFrame: {
    alignSelf: 'flex-end',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    backgroundColor: '#24283B',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  recommendedBadge: {
    flexShrink: 0,
    maxWidth: 54,
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderRadius: 999,
    paddingHorizontal: 6,
    backgroundColor: '#F7E8BF',
    borderWidth: 1,
    borderColor: 'rgba(151,111,62,0.55)',
  },
  recommendedBadgeText: {
    flexShrink: 1,
    color: '#74542F',
    fontSize: 9,
    lineHeight: 11,
    fontWeight: '800',
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  nameGroup: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  characterName: {
    flexShrink: 1,
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 21,
    fontWeight: '800',
  },
  characterEnglishName: {
    flexShrink: 1,
    color: '#A9ADBD',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  detailsButton: {
    width: 34,
    height: 34,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: 'rgba(255,248,232,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(122,82,39,0.3)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  characterMeta: {
    marginTop: 3,
    color: '#B3B7C7',
    fontSize: 12,
    lineHeight: 15,
  },
  characterDescription: {
    marginTop: 5,
    color: '#D4D6DF',
    fontSize: 12,
    lineHeight: 14,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 5,
  },
  statItem: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statLabel: {
    flexShrink: 1,
    color: '#9297AA',
    fontSize: 10,
    lineHeight: 12,
  },
  statValue: {
    marginLeft: 'auto',
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '800',
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 7,
  },
  startButton: {
    flex: 1,
    minHeight: 38,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 11,
    backgroundColor: '#FFC126',
  },
  startButtonText: {
    flexShrink: 1,
    color: '#172033',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '900',
  },
  footerHint: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  footerHintText: {
    color: '#73798D',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
});
