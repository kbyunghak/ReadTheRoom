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
const CORE_STAT_KEYS: StatKey[] = ['funds', 'english', 'stamina'];

export type { Character, CharacterStat, LocalizedText, StartingStats, StatKey };

const DISPLAY_STAT_META: Record<
  StatKey,
  {
    label: LocalizedText;
    sourceMax: number;
    displayMax: number;
    color: string;
    icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  }
> = {
  funds: {
    label: { ko: '자금', en: 'Funds' },
    sourceMax: 1000,
    displayMax: 1000,
    color: '#F59F00',
    icon: 'currency-usd',
  },
  mental: {
    label: { ko: '멘탈', en: 'Mental' },
    sourceMax: 100,
    displayMax: 1000,
    color: '#F03E3E',
    icon: 'brain',
  },
  english: {
    label: { ko: '영어', en: 'English' },
    sourceMax: 100,
    displayMax: 1000,
    color: '#339AF0',
    icon: 'book-open-variant',
  },
  insight: {
    label: { ko: '눈치', en: 'Insight' },
    sourceMax: 100,
    displayMax: 1000,
    color: '#BE4BDB',
    icon: 'eye-outline',
  },
  stamina: {
    label: { ko: '체력', en: 'Stamina' },
    sourceMax: 100,
    displayMax: 1000,
    color: '#40C057',
    icon: 'heart',
  },
  relation: {
    label: { ko: '관계', en: 'Relation' },
    sourceMax: 100,
    displayMax: 1000,
    color: '#FF6B9D',
    icon: 'account-group',
  },
};

const normalizeStat = (value: number, sourceMax: number, displayMax: number) =>
  Math.round(
    (Math.max(0, Math.min(value, sourceMax)) / sourceMax) * displayMax,
  );

export const buildDisplayStats = (
  startingStats: StartingStats,
): CharacterStat[] => {
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
  const { width } = useWindowDimensions();
  const text = locales[lang].characterSelect;
  const contentWidth = Math.min(width - SCREEN_PADDING * 2, MAX_CONTENT_WIDTH);
  const imageWidth = Math.min(164, Math.max(116, contentWidth * 0.37));
  const useCompactCard = contentWidth < 330;

  const renderCharacterCard = (character: Character) => {
    const displayStats = buildDisplayStats(character.startingStats).filter(
      (stat) => CORE_STAT_KEYS.includes(stat.key),
    );

    return (
      <View key={character.id} style={styles.card}>
        <View style={[styles.cardImageFrame, { width: imageWidth }]}>
          <Image
            source={character.cardImage}
            style={styles.cardImage}
            contentFit="cover"
            contentPosition="top center"
          />

          {character.id === 'ken' ? (
            <View style={styles.recommendedBadge}>
              <MaterialCommunityIcons name="star" size={11} color="#172033" />
              <Text style={styles.recommendedBadgeText}>
                {text.recommended}
              </Text>
            </View>
          ) : null}
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
            </View>

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
              activeOpacity={0.72}
            >
              <MaterialCommunityIcons
                name="magnify"
                size={18}
                color="#AAB4CA"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.characterMeta} numberOfLines={2}>
            {character.age[lang]} · {character.jobTitle[lang]}
          </Text>

          <Text style={styles.characterDescription} numberOfLines={2}>
            {character.description[lang][0]}
          </Text>

          <View style={styles.statsRow}>
            {displayStats.map((stat) => {
              const meta = DISPLAY_STAT_META[stat.key];

              return (
                <View
                  key={`${character.id}-${stat.key}`}
                  style={styles.statItem}
                >
                  <View style={styles.statLabelRow}>
                    <MaterialCommunityIcons
                      name={meta.icon}
                      size={13}
                      color={meta.color}
                    />
                    <Text style={styles.statLabel} numberOfLines={1}>
                      {stat.label[lang]}
                    </Text>
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                </View>
              );
            })}
          </View>

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
              size={20}
              color="#172033"
            />
          </TouchableOpacity>
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

          <View style={styles.guideCard}>
            <View style={styles.guideIcon}>
              <MaterialCommunityIcons
                name="book-open-page-variant"
                size={22}
                color="#FFE681"
              />
            </View>
            <View style={styles.guideCopy}>
              <Text style={styles.guideTitle}>{text.guideTitle}</Text>
              <Text style={styles.guideDescription}>
                {text.guideDescription}
              </Text>
            </View>
          </View>

          <View style={styles.footerHint}>
            <MaterialCommunityIcons name="lock" size={13} color="#697188" />
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
    paddingVertical: 20,
    paddingHorizontal: SCREEN_PADDING,
  },
  content: {
    alignSelf: 'center',
  },
  headerBlock: {
    marginBottom: 18,
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
    marginTop: 7,
    fontSize: 13,
    lineHeight: 19,
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
    gap: 12,
  },
  card: {
    minHeight: 232,
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: '#171A2B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  cardImageFrame: {
    alignSelf: 'stretch',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#24283B',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  recommendedBadge: {
    position: 'absolute',
    top: 9,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: '#FFC52E',
  },
  recommendedBadgeText: {
    color: '#172033',
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '900',
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 14,
    paddingVertical: 13,
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
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '800',
  },
  characterEnglishName: {
    flexShrink: 1,
    color: '#A9ADBD',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  detailsButton: {
    width: 30,
    height: 30,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  characterMeta: {
    marginTop: 2,
    color: '#B3B7C7',
    fontSize: 12,
    lineHeight: 17,
  },
  characterDescription: {
    marginTop: 9,
    minHeight: 38,
    color: '#D4D6DF',
    fontSize: 12,
    lineHeight: 19,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 7,
  },
  statItem: {
    flex: 1,
    minWidth: 0,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statLabel: {
    flexShrink: 1,
    color: '#9297AA',
    fontSize: 10,
    lineHeight: 14,
  },
  statValue: {
    marginTop: 2,
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '800',
  },
  startButton: {
    minHeight: 42,
    marginTop: 11,
    paddingHorizontal: 14,
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
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
  },
  guideCard: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
  },
  guideIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: 'rgba(255,211,67,0.12)',
  },
  guideCopy: {
    flex: 1,
  },
  guideTitle: {
    color: '#F5F5FA',
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800',
  },
  guideDescription: {
    marginTop: 2,
    color: '#A5A9B9',
    fontSize: 12,
    lineHeight: 18,
  },
  footerHint: {
    marginTop: 14,
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
