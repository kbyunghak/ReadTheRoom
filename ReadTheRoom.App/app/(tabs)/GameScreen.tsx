import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ImageBackground,
  ImageSourcePropType,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Character } from '../../components/CharacterSelectScreen';
import EndingScene from '../../components/EndingScene';
import SituationSummaryScene from '../../components/SituationSummaryScene';
import { applyStatChanges, isGameOverFromStats, type GameStats, type StatChanges } from '../../utils/gameStats';
import { getConditionSummary, getStatusDetailTone } from '../../utils/conditionSummary';
import { preloadAssetSources } from '../../utils/assetPreload';
import { buildResultCardData, splitChoiceText } from '../../utils/resultCard';
import {
  getScenarioBundle,
  type LocalizedText,
  type Scenario,
  type ScenarioChoice,
} from '../../utils/scenarioRegistry';
import { buildSituationSummary, type SituationSummary } from '../../utils/situationSummary';
import { shouldShowSituationSummary } from '../../utils/questProgress';
import { saveGame, type SavedGameSession } from '../../utils/gamePersistence';
import { playBgm } from '../../utils/bgmPlayer';

type Choice = {
  text: LocalizedText;
  feedback: LocalizedText;
  statChanges: StatChanges;
  nextScenarioId: number;
};

type PlayedChoice = {
  situationTitle: LocalizedText;
  choice: Choice;
};

type RoadmapNode = {
  scenarioId: number;
  day: number;
  episode: number;
  title: LocalizedText;
  stampLabel: string;
};

type Checkpoint = {
  scenarioId: number;
  stats: GameStats;
  playHistory: PlayedChoice[];
};

type BackgroundKey =
  | 'airport'
  | 'adaptation'
  | 'office'
  | 'house'
  | 'cafe'
  | 'bank'
  | 'busstop'
  | 'night_street'
  | 'nightstreet_ppl'
  | 'city_night'
  | 'observatory_nature'
  | 'partyroom_lonely'
  | 'street'
  | 'mart'
  | 'arrival';

const resolveLocalizedScenarioTitle = (scenario: Scenario, lang: 'en' | 'ko') => {
  if (scenario.title) {
    return scenario.title[lang];
  }

  if (typeof scenario.situation === 'object' && scenario.situation) {
    return scenario.situation[lang];
  }

  if (lang === 'ko') {
    return scenario.situation || scenario.situationEN || '';
  }

  return scenario.situationEN || scenario.situation || '';
};

const BACKGROUND_IMAGES: Record<BackgroundKey, ImageSourcePropType> = {
  adaptation: require('../../assets/images/background/adaptation.png'),
  airport: require('../../assets/images/background/airport.png'),
  office: require('../../assets/images/background/office.png'),
  house: require('../../assets/images/background/house.png'),
  cafe: require('../../assets/images/background/cafe.png'),
  bank: require('../../assets/images/background/bank.png'),
  busstop: require('../../assets/images/background/busstop.png'),
  night_street: require('../../assets/images/background/night_street.png'),
  nightstreet_ppl: require('../../assets/images/background/nightstreet_ppl.png'),
  city_night: require('../../assets/images/background/city_night.png'),
  observatory_nature: require('../../assets/images/background/observatory_nature.png'),
  partyroom_lonely: require('../../assets/images/background/partyroom_lonely.png'),
  street: require('../../assets/images/background/busstop.png'),
  mart: require('../../assets/images/background/mart.png'),
  arrival: require('../../assets/images/background/airport.png'),
};

const BACKGROUND_KEY_ALIASES: Record<string, BackgroundKey> = {
  adaptation: 'adaptation',
  airport: 'airport',
  office: 'office',
  house: 'house',
  cafe: 'cafe',
  bank: 'bank',
  busstop: 'busstop',
  night_street: 'night_street',
  nightstreet_ppl: 'nightstreet_ppl',
  city_night: 'city_night',
  observatory_nature: 'observatory_nature',
  partyroom_lonely: 'partyroom_lonely',
  street: 'street',
  mart: 'mart',
  arrival: 'arrival',
  yvr_airport: 'airport',
  airport_exit: 'airport',
  airport_transport: 'airport',
  skytrain: 'airport',
  settling: 'house',
  dorm_hallway: 'house',
  dorm_room: 'house',
  dorm_lobby: 'house',
  kitchen: 'house',
  laundry: 'house',
  phone_store: 'office',
  tim_hortons: 'cafe',
  tim_hortons_counter: 'cafe',
  grocery: 'mart',
  grocery_store: 'mart',
  grocery_counter: 'mart',
  grocery_exit: 'mart',
  bus_stop: 'busstop',
  home_kitchen: 'house',
  living_room: 'house',
  child_bedroom: 'house',
  dining_room: 'house',
  shopping_mall: 'street',
  garden: 'observatory_nature',
  survival: 'nightstreet_ppl',
  classroom: 'office',
  library: 'office',
  street_vancouver: 'street',
  restaurant: 'cafe',
  work: 'office',
  interview: 'office',
  mall: 'street',
  online: 'house',
  pub: 'partyroom_lonely',
  school_gate: 'street',
  community_center: 'office',
  self_checkout: 'mart',
  hospital: 'office',
  campus: 'adaptation',
  campus_cafe: 'cafe',
  campus_street: 'street',
  vancouver_view: 'adaptation',
};

const UI_TEXT = {
  en: {
    roadmapBtn: 'StoryMap',
    switchLangBtn: 'Korean',
    mentalHpLabel: 'Mental',
    fundsLabel: 'Funds',
    englishLabel: 'English',
    insightLabel: 'Insight',
    staminaLabel: 'Stamina',
    relationLabel: 'Relation',
    nextBtn: 'NEXT >',
    roadmapTitle: 'StoryMap',
    roadmapHint: 'Tap a completed card to return to that point.',
    roadmapBack: 'Go Back Here',
    roadmapLocked: 'Locked',
    roadmapCurrent: 'YOU ARE HERE',
    roadmapRewind: 'TAP TO REWIND',
    roadmapPageHeader: 'VISA / VISAS - PAGE 1',
    resultTitle: 'Choice & Feedback',
    resultSelectedLabel: 'Choice',
    resultFeedbackLabel: 'Feedback',
    resultValuesLabel: 'Changes',
  },
  ko: {
    roadmapBtn: '스토리맵',
    switchLangBtn: 'English',
    mentalHpLabel: '멘탈',
    fundsLabel: '자금',
    englishLabel: '영어',
    insightLabel: '눈치',
    staminaLabel: '체력',
    relationLabel: '관계',
    nextBtn: '다음 >',
    roadmapTitle: '스토리맵',
    roadmapHint: '완료한 카드를 누르면 그 시점으로 돌아갈 수 있어요.',
    roadmapBack: '이 시점으로 돌아가기',
    roadmapLocked: '잠금',
    roadmapCurrent: '현재 위치',
    roadmapRewind: '여기서 돌아가기',
    roadmapPageHeader: 'VISA / VISAS - PAGE 1',
    resultTitle: '선택 및 피드백',
    resultSelectedLabel: '선택',
    resultFeedbackLabel: '피드백',
    resultValuesLabel: '결과값',
  },
} as const;

const ROADMAP_STAMP_COLORS = ['#C9645A', '#5A8FCA', '#6B9E74', '#A270C6'] as const;
const ROADMAP_STOP_WORDS = new Set([
  'AT',
  'THE',
  'AND',
  'OF',
  'TO',
  'IN',
  'FOR',
  'WITH',
  'A',
  'AN',
  'YOUR',
  'YOU',
  'IS',
  'ARE',
]);

const getRoadmapStampLabel = (title: string, scenarioId: number) => {
  const words = title
    .replace(/[^A-Za-z0-9 ]/g, ' ')
    .split(/\s+/)
    .map((word) => word.trim().toUpperCase())
    .filter((word) => word && !ROADMAP_STOP_WORDS.has(word));

  if (words.length >= 2) {
    return `${words[0]}\n${words[1]}`;
  }

  if (words.length === 1) {
    return words[0];
  }

  return `STEP ${scenarioId}`;
};

const STAT_CONFIG = {
  funds: { color: '#D9E6F7', icon: 'currency-usd' },
  mental: { color: '#D9E6F7', icon: 'brain' },
  english: { color: '#D9E6F7', icon: 'book-open-page-variant-outline' },
  insight: { color: '#D9E6F7', icon: 'eye-outline' },
  stamina: { color: '#D9E6F7', icon: 'battery-high' },
  relation: { color: '#D9E6F7', icon: 'account-group-outline' },
} as const;

const StatChangeBadge = ({ statKey, value, label }: { statKey: keyof typeof STAT_CONFIG; value: number; label: string }) => {
  if (value === 0) return null;
  const isPositive = value > 0;

  return (
    <View style={[styles.badge, isPositive ? styles.badgePositive : styles.badgeNegative]}>
      <View style={[styles.badgeDot, { backgroundColor: STAT_CONFIG[statKey].color }]} />
      <Text style={[styles.badgeText, isPositive ? styles.badgeTextPositive : styles.badgeTextNegative]}>
        {label} {isPositive ? `+${value}` : value}
      </Text>
    </View>
  );
};

const ResultStatItem = ({
  statKey,
  value,
  label,
}: {
  statKey: keyof typeof STAT_CONFIG;
  value: number;
  label: string;
}) => {
  if (value === 0) return null;
  const isPositive = value > 0;

  return (
    <View style={styles.resultStatItem}>
      <MaterialCommunityIcons name={STAT_CONFIG[statKey].icon} size={20} color={STAT_CONFIG[statKey].color} />
      <Text style={styles.resultStatLabel}>{label}</Text>
      <Text style={[styles.resultStatValue, isPositive ? styles.resultStatValuePositive : styles.resultStatValueNegative]}>
        {isPositive ? `+${value}` : value}
      </Text>
    </View>
  );
};

type Props = {
  character: Character | null;
  initialLang?: 'en' | 'ko';
  initialSession?: SavedGameSession | null;
  onGoToCharacterSelect?: () => void;
  onClearSavedGame?: () => void;
};

export default function GameScreen({ character, initialLang = 'en', initialSession = null, onGoToCharacterSelect, onClearSavedGame }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const activeInitialSession = initialSession?.characterId === character?.id ? initialSession : null;
  const initialStats = useMemo(
    () => ({
      funds: activeInitialSession ? activeInitialSession.stats.funds : character?.startingStats.funds ?? 1000,
      mental: activeInitialSession ? activeInitialSession.stats.mental : character?.startingStats.mental ?? 100,
      english: activeInitialSession ? activeInitialSession.stats.english : character?.startingStats.english ?? 30,
      insight: activeInitialSession ? activeInitialSession.stats.insight : character?.startingStats.insight ?? 50,
      stamina: activeInitialSession ? activeInitialSession.stats.stamina : character?.startingStats.stamina ?? 100,
      relation: activeInitialSession ? activeInitialSession.stats.relation : character?.startingStats.relation ?? 50,
    }),
    [activeInitialSession, character?.startingStats.english, character?.startingStats.funds, character?.startingStats.insight, character?.startingStats.mental, character?.startingStats.relation, character?.startingStats.stamina],
  );
  const storyScrollRef = useRef<ScrollView | null>(null);
  const roadmapScrollRef = useRef<ScrollView | null>(null);
  const statusCardFlipAnim = useRef(new Animated.Value(0)).current;
  const [sceneAssetsReady, setSceneAssetsReady] = useState(false);
  const [lang, setLang] = useState<'en' | 'ko'>(initialLang);
  const scenarioBundle = useMemo(() => getScenarioBundle(character?.id), [character?.id]);
  const startScenarioId = scenarioBundle.startScenarioId;
  const scenarios = scenarioBundle.scenarios;
  const [currentScenarioId, setCurrentScenarioId] = useState<number>(
    activeInitialSession ? activeInitialSession.currentScenarioId : startScenarioId,
  );
  const [stats, setStats] = useState<GameStats>(initialStats);
  const [showResult, setShowResult] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [endingType, setEndingType] = useState<'success' | 'failure' | null>(null);
  const [isStatusCardFlipped, setIsStatusCardFlipped] = useState(false);
  const [currentSituationChoices, setCurrentSituationChoices] = useState<ScenarioChoice[]>(
    activeInitialSession ? activeInitialSession.currentSituationChoices : [],
  );
  const [playHistory, setPlayHistory] = useState<PlayedChoice[]>(
    activeInitialSession ? activeInitialSession.playHistory : [],
  );
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showRoadmapHint, setShowRoadmapHint] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [pendingSummary, setPendingSummary] = useState<{
    summary: SituationSummary;
    nextScenarioId: number | null;
  } | null>(null);
  const [checkpoints, setCheckpoints] = useState<Record<number, Checkpoint>>(
    activeInitialSession
      ? activeInitialSession.checkpoints
      : {
          [startScenarioId]: {
            scenarioId: startScenarioId,
            stats: initialStats,
            playHistory: [],
          },
        },
  );

  const t = UI_TEXT[lang];
  const isKorean = lang === 'ko';
  const isNarrow = width <= 390;
  const headerHeight = 52;
  const headerHorizontalPadding = isNarrow ? 12 : 18;
  const characterTop = headerHeight;
  const characterHeight = Math.round(height * (isNarrow ? 0.58 : 0.6));
  const characterWidth = Math.round(width * 0.72);
  const storyContentPaddingTop = Math.round(height * (isNarrow ? 0.205 : 0.22));
  const storyContentPaddingBottom = Math.max(insets.bottom + 4, 4);
  const scenarioOverlap = Math.round(characterHeight * 0.38);
  const scenarioPanelBottom = Math.max(insets.bottom, 8);
  const scenarioPanelMaxHeight = Math.min(460, Math.max(360, Math.round(height * 0.42)));
  const roadmapPanelWidth = Math.min(Math.round(width * 0.92), 520);
  const roadmapPanelMaxHeight = Math.max(320, height - insets.top - insets.bottom - 32);

  useEffect(() => {
    setLang(activeInitialSession ? activeInitialSession.lang : initialLang);
    setCurrentScenarioId(activeInitialSession ? activeInitialSession.currentScenarioId : startScenarioId);
    setStats(initialStats);
    setCurrentSituationChoices(activeInitialSession ? activeInitialSession.currentSituationChoices : []);
    setPlayHistory(activeInitialSession ? activeInitialSession.playHistory : []);
    setShowRoadmap(false);
    setShowLanguageMenu(false);
    setShowResult(false);
    setSelectedChoice(null);
    setEndingType(null);
    setPendingSummary(null);
    setCheckpoints(
      activeInitialSession
        ? activeInitialSession.checkpoints
        : {
            [startScenarioId]: {
              scenarioId: startScenarioId,
              stats: initialStats,
              playHistory: [],
            },
          },
    );
  }, [activeInitialSession, initialLang, initialStats, startScenarioId]);

  useEffect(() => {
    setIsStatusCardFlipped(false);
    statusCardFlipAnim.setValue(0);
  }, [currentScenarioId, statusCardFlipAnim]);

  useEffect(() => {
    const track = pendingSummary
      ? 'summary'
      : endingType === 'success'
        ? 'good'
        : endingType === 'failure'
          ? 'sad'
          : 'play';

    void playBgm(track);
  }, [endingType, pendingSummary]);

  const fallbackScenario = useMemo(
    () =>
      scenarios[String(startScenarioId)] ??
      Object.values(scenarios)[0] ?? {
        id: startScenarioId || 1,
        backgroundKey: 'arrival',
        situation: { ko: '', en: '' },
        description: { ko: '', en: '' },
        choices: [],
      },
    [scenarios, startScenarioId],
  );
  const currentScenario: Scenario = scenarios[String(currentScenarioId)] ?? fallbackScenario;

  const resolvedBackgroundKey: BackgroundKey = currentScenario.backgroundKey
    ? (BACKGROUND_KEY_ALIASES[currentScenario.backgroundKey] ?? 'arrival')
    : 'arrival';
  const currentBackground = BACKGROUND_IMAGES[resolvedBackgroundKey];
  const currentCharacterOverlay = character?.cardImage ?? character?.image;
  const situationTitle = resolveLocalizedScenarioTitle(currentScenario, lang);

  useEffect(() => {
    let isMounted = true;
    setSceneAssetsReady(false);

    const assetsToPreload: ImageSourcePropType[] = [
      currentBackground,
      ...(currentCharacterOverlay ? [currentCharacterOverlay] : []),
    ];

    void preloadAssetSources(assetsToPreload).then(() => {
      if (isMounted) {
        setSceneAssetsReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [currentBackground, currentCharacterOverlay]);

const getTimelineTitle = (currentLang: 'ko' | 'en', quest?: string) => {
  const dayNumber =
    typeof currentScenario.day === 'number' && currentScenario.day > 0
      ? currentScenario.day
      : undefined;
  if (dayNumber) {
    return currentLang === 'ko' ? `${dayNumber}일차` : `Day ${dayNumber}`;
  }

  const situationNumber = Number(quest?.split('-')[0] ?? '1');
  const weekNumber = Number.isFinite(situationNumber) && situationNumber > 0 ? situationNumber : 1;
  const startDay = (weekNumber - 1) * 6 + 1;
  const endDay = weekNumber * 6;
    return currentLang === 'ko'
      ? `${weekNumber}주차: Day ${startDay} - ${endDay}`
      : `Week ${weekNumber}: Day ${startDay} - ${endDay}`;
  };

  const headerTitle = `Day${currentScenario.day ?? 1}. ${situationTitle}`;
  const currentSituationTitleLocalized = {
    ko: resolveLocalizedScenarioTitle(currentScenario, 'ko'),
    en: resolveLocalizedScenarioTitle(currentScenario, 'en'),
  };

  const failureRecap = useMemo(() => {
    const negativeItems = playHistory
      .map((entry) => {
        const impact =
          entry.choice.statChanges.funds +
          entry.choice.statChanges.mental * 10 +
          entry.choice.statChanges.english * 10 +
          entry.choice.statChanges.insight * 10 +
          entry.choice.statChanges.stamina * 10 +
          (entry.choice.statChanges.relation ?? 0) * 10;

        return { ...entry, impact };
      })
      .filter((entry) => entry.impact < 0)
      .sort((a, b) => a.impact - b.impact)
      .reduce<{
        title: LocalizedText;
        detail: LocalizedText;
        dedupeKey: string;
      }[]>((items, entry) => {
        const dedupeKey = `${entry.situationTitle.ko}::${entry.choice.feedback.ko}`;
        if (items.some((item) => item.dedupeKey === dedupeKey)) {
          return items;
        }

        items.push({
          title: entry.situationTitle,
          detail: entry.choice.feedback,
          dedupeKey,
        });
        return items;
      }, [])
      .slice(0, 3)
      .map(({ title, detail }) => ({
        title,
        detail,
      }));

    if (!negativeItems.length) {
      return null;
    }

    return {
      title: {
        ko: '이번 플레이에서 흔들렸던 순간',
        en: 'What Hurt This Run',
      },
      items: negativeItems,
    };
  }, [playHistory]);
  const roadmapNodes = useMemo(() => {
    return Object.values(scenarios)
      .sort((a, b) => a.id - b.id)
      .map((scenario) => ({
        scenarioId: scenario.id,
        day: scenario.day ?? 1,
        episode: scenario.episode ?? scenario.id,
        title: {
          ko: resolveLocalizedScenarioTitle(scenario, 'ko') || `상황 ${scenario.id}`,
          en: resolveLocalizedScenarioTitle(scenario, 'en') || `Situation ${scenario.id}`,
        },
        stampLabel: getRoadmapStampLabel(resolveLocalizedScenarioTitle(scenario, 'en') || `Step ${scenario.id}`, scenario.id),
      }));
  }, [scenarios]);

  useEffect(() => {
    setCheckpoints((prev) => {
      if (prev[currentScenarioId]) return prev;
      return {
        ...prev,
        [currentScenarioId]: {
          scenarioId: currentScenarioId,
          stats: { ...stats },
          playHistory: [...playHistory],
        },
      };
    });
  }, [currentScenarioId, playHistory, stats]);

  useEffect(() => {
    if (!showResult) return;

    const timer = setTimeout(() => {
      storyScrollRef.current?.scrollToEnd({ animated: true });
    }, 80);

    return () => clearTimeout(timer);
  }, [showResult]);

  useEffect(() => {
    if (!showRoadmap) return;

    const currentIndex = roadmapNodes.findIndex((node) => node.scenarioId === currentScenarioId);
    if (currentIndex < 0) return;

    const timer = setTimeout(() => {
      roadmapScrollRef.current?.scrollTo({
        y: Math.max(0, Math.floor(currentIndex / 2) * 176 - 18),
        animated: true,
      });
    }, 80);

    return () => clearTimeout(timer);
  }, [currentScenarioId, roadmapNodes, showRoadmap]);

  useEffect(() => {
    if (!showRoadmap) {
      setShowRoadmapHint(false);
      return;
    }

    setShowRoadmapHint(true);
    const timer = setTimeout(() => setShowRoadmapHint(false), 2600);
    return () => clearTimeout(timer);
  }, [showRoadmap]);

  useEffect(() => {
    if (!character?.id) return;
    if (showResult || endingType || pendingSummary) return;

    void saveGame({
      characterId: character.id,
      lang,
      currentScenarioId,
      stats,
      playHistory,
      currentSituationChoices,
      checkpoints,
      updatedAt: new Date().toISOString(),
    });
  }, [character?.id, checkpoints, currentScenarioId, currentSituationChoices, endingType, lang, pendingSummary, playHistory, showResult, stats]);

  const setLanguageAndClose = (nextLang: 'en' | 'ko') => {
    setLang(nextLang);
    setShowLanguageMenu(false);
  };

  const handleChoice = (choice: Choice) => {
    setStats((prev) => applyStatChanges(prev, choice.statChanges));
    setPlayHistory((prev) => [
      ...prev,
      {
        situationTitle: currentSituationTitleLocalized,
        choice,
      },
    ]);
    setSelectedChoice(choice);
    setShowResult(true);
  };

  const proceedToNextScenario = () => {
    if (selectedChoice) {
      if (isGameOverFromStats(stats)) {
        setShowResult(false);
        setSelectedChoice(null);
        setEndingType('failure');
        return;
      }

      const completedSituationChoices = [...currentSituationChoices, selectedChoice];
      const nextScenarioId = selectedChoice.nextScenarioId;
      const nextScenario = scenarios[String(nextScenarioId)];
      const shouldTriggerSummary =
        currentScenario.isPhaseEnd ?? shouldShowSituationSummary(currentScenario.id);

      if (currentScenario.isEnding) {
        setCurrentSituationChoices([]);
        setShowResult(false);
        setSelectedChoice(null);
        setEndingType('success');
        return;
      }

      if (!shouldTriggerSummary) {
        setCurrentSituationChoices(completedSituationChoices);
        setCurrentScenarioId(nextScenarioId);
      } else {
        setPendingSummary({
          summary: buildSituationSummary({
            situationTitle: currentSituationTitleLocalized,
            expression: currentScenario.description,
            choices: completedSituationChoices,
          }),
          nextScenarioId: nextScenario ? nextScenarioId : null,
        });
        setCurrentSituationChoices([]);
      }
    }

    setShowResult(false);
    setSelectedChoice(null);
  };

  const restartGame = () => {
    setStats(initialStats);
    setCurrentScenarioId(startScenarioId);
    setShowResult(false);
    setSelectedChoice(null);
    setEndingType(null);
    setCurrentSituationChoices([]);
    setPlayHistory([]);
    setShowRoadmap(false);
    setPendingSummary(null);
    setCheckpoints({
      [startScenarioId]: {
        scenarioId: startScenarioId,
        stats: initialStats,
        playHistory: [],
      },
    });
  };

  const continueAfterFailure = () => {
    setStats({ ...initialStats });
    setEndingType(null);
    setShowResult(false);
    setSelectedChoice(null);
  };

  const jumpToRoadmapNode = (node: RoadmapNode) => {
    const checkpoint = checkpoints[node.scenarioId];
    if (!checkpoint) return;

    setStats({ ...checkpoint.stats });
    setPlayHistory([...checkpoint.playHistory]);
    setCurrentSituationChoices([]);
    setPendingSummary(null);
    setShowResult(false);
    setSelectedChoice(null);
    setEndingType(null);
    setCurrentScenarioId(checkpoint.scenarioId);
    setShowRoadmap(false);
  };

  const getFeedbackBorderColor = (choice: Choice) => {
    const total = Object.values(choice.statChanges).reduce((a, b) => a + (b ?? 0), 0);
    return total >= 0 ? '#40C057' : '#228BE6';
  };

  const statusItems = [
    { key: 'funds', icon: STAT_CONFIG.funds.icon, label: t.fundsLabel, value: stats.funds, max: 1000, color: '#F0D44E' },
    { key: 'mental', icon: STAT_CONFIG.mental.icon, label: t.mentalHpLabel, value: stats.mental, max: 100, color: '#4F8DFF' },
    { key: 'relation', icon: STAT_CONFIG.relation.icon, label: t.relationLabel, value: stats.relation, max: 100, color: '#9C7CFF' },
    { key: 'english', icon: STAT_CONFIG.english.icon, label: t.englishLabel, value: stats.english, max: 100, color: '#F26F97' },
    { key: 'stamina', icon: STAT_CONFIG.stamina.icon, label: t.staminaLabel, value: stats.stamina, max: 100, color: '#4CC26A' },
    { key: 'insight', icon: STAT_CONFIG.insight.icon, label: t.insightLabel, value: stats.insight, max: 100, color: '#F0BE63' },
  ] as const;
  const statusDetailTone = useMemo(
    () => getStatusDetailTone(stats, isKorean ? 'ko' : 'en'),
    [isKorean, stats],
  );
  const conditionSummary = useMemo(
    () =>
      getConditionSummary({
        episode: currentScenario.episode,
        lang: isKorean ? 'ko' : 'en',
        stats,
      }),
    [currentScenario.episode, isKorean, stats],
  );
  const statusCardWidth = Math.min(Math.round(width * (isNarrow ? 0.39 : 0.33)), 188);
  const statusCardFrontRotate = statusCardFlipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const statusCardBackRotate = statusCardFlipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const toggleStatusCard = () => {
    const nextFlipped = !isStatusCardFlipped;
    setIsStatusCardFlipped(nextFlipped);
    Animated.spring(statusCardFlipAnim, {
      toValue: nextFlipped ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 50,
    }).start();
  };

  if (endingType) {
    return (
      <EndingScene
        lang={lang}
        variant={endingType}
        characterId={character?.id}
        failureRecap={failureRecap}
        onContinueAfterAd={endingType === 'failure' ? continueAfterFailure : undefined}
        onTryAnotherChoice={() => {
          restartGame();
          onClearSavedGame?.();
          onGoToCharacterSelect?.();
        }}
        onRestartFromBeginning={restartGame}
      />
    );
  }

  if (pendingSummary) {
    return (
      <SituationSummaryScene
        lang={lang}
        summary={pendingSummary.summary}
        onContinue={() => {
          const nextId = pendingSummary.nextScenarioId;
          setPendingSummary(null);
          if (nextId) {
            setCurrentScenarioId(nextId);
          } else {
            setEndingType('success');
          }
        }}
      />
    );
  }

  if (!sceneAssetsReady) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Tabs.Screen options={{ headerShown: false }} />
        <View style={styles.scenePlaceholder} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Tabs.Screen options={{ headerShown: false }} />
      <ImageBackground source={currentBackground} style={styles.backgroundImage} imageStyle={styles.backgroundImageStyle}>
        <View style={styles.backgroundScrim} />
        {currentCharacterOverlay && (
          <View style={[styles.characterOverlayWrap, { top: characterTop, height: characterHeight }]}>
            <Image source={currentCharacterOverlay} style={[styles.characterOverlay, { width: characterWidth }]} resizeMode="contain" />
          </View>
        )}
        <View style={styles.container}>
          <View
            style={{
              height: headerHeight,
              position: 'relative',
              zIndex: 16,
              overflow: 'visible',
              backgroundColor: 'rgba(7, 18, 38, 0.88)',
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(207,226,255,0.14)',
            }}
          >
            <View
              style={{
                height: headerHeight,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: headerHorizontalPadding,
              }}
            >
                <TouchableOpacity
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 11,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.14)',
                    backgroundColor: 'rgba(8, 19, 38, 0.28)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => {
                    setShowRoadmap(true);
                  }}
                >
                  <MaterialCommunityIcons name="map-outline" size={20} color="#F1F1EF" />
                </TouchableOpacity>

                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    left: 56,
                    right: 56,
                    top: 0,
                    bottom: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      lineHeight: 19,
                      fontWeight: '700',
                      color: '#FFFFFF',
                      letterSpacing: -0.2,
                      textAlign: 'center',
                      textShadowColor: 'rgba(3, 10, 19, 0.24)',
                      textShadowOffset: { width: 0, height: 2 },
                      textShadowRadius: 6,
                    }}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.78}
                  >
                    {headerTitle}
                  </Text>
                </View>

                <TouchableOpacity
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 11,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.14)',
                    backgroundColor: 'rgba(8, 19, 38, 0.28)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => {
                    setShowLanguageMenu((prev) => !prev);
                  }}
                >
                  <MaterialCommunityIcons name="translate" size={20} color="#F1F1EF" />
                </TouchableOpacity>
            </View>
            {showLanguageMenu ? (
              <View style={[styles.languageMenu, { top: headerHeight + 4, right: headerHorizontalPadding }]}>
                <TouchableOpacity style={styles.languageMenuItem} onPress={() => setLanguageAndClose('ko')}>
                  <Text style={[styles.languageMenuText, isKorean && styles.languageMenuTextActive]}>한국어</Text>
                </TouchableOpacity>
                <View style={styles.languageMenuDivider} />
                <TouchableOpacity style={styles.languageMenuItem} onPress={() => setLanguageAndClose('en')}>
                  <Text style={[styles.languageMenuText, !isKorean && styles.languageMenuTextActive]}>English</Text>
                </TouchableOpacity>
              </View>
            ) : null}
            <TouchableOpacity
              activeOpacity={0.96}
              onPress={toggleStatusCard}
              style={[
                styles.statusFloatingCardWrap,
                {
                  width: statusCardWidth,
                  right: headerHorizontalPadding,
                  top: headerHeight + 8,
                },
              ]}
            >
              <View
                style={{
                  width: '100%',
                  height: isStatusCardFlipped ? 356 : undefined,
                  minHeight: 0,
                }}
              >
                <Animated.View
                  style={[
                    {
                      position: 'relative',
                      width: '100%',
                      minHeight: 0,
                      paddingHorizontal: 11,
                      paddingTop: 8,
                      paddingBottom: 7,
                      borderRadius: 16,
                      borderWidth: 1.1,
                      borderColor: 'rgba(207,226,255,0.46)',
                      backgroundColor: 'rgba(9, 21, 45, 0.88)',
                      shadowColor: '#071224',
                      shadowOpacity: 0.2,
                      shadowRadius: 14,
                      shadowOffset: { width: 0, height: 6 },
                      elevation: 5,
                      backfaceVisibility: 'hidden',
                    },
                    {
                      transform: [{ perspective: 1000 }, { rotateY: statusCardFrontRotate }],
                    },
                  ]}
                >
                  <View
                    style={{
                      width: '100%',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        minWidth: 0,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 7,
                      }}
                    >
                      <View style={[styles.statusFloatingBadge, { borderColor: conditionSummary.color }]}>
                        <MaterialCommunityIcons
                          name={conditionSummary.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                          size={17}
                          color={conditionSummary.color}
                        />
                      </View>
                      <View style={styles.statusFloatingHeadingText}>
                        <Text
                          style={[styles.statusFloatingHeadingAccent, { color: conditionSummary.color }]}
                          numberOfLines={1}
                        >
                          {conditionSummary.title}
                        </Text>
                      </View>
                    </View>
                    <MaterialCommunityIcons
                      name="cards-outline"
                      size={14}
                      color="rgba(232,241,255,0.68)"
                      style={{ marginLeft: 8, flexShrink: 0, opacity: 0.82 }}
                    />
                  </View>
                  <View
                    style={{
                      height: 1,
                      marginTop: 5,
                      backgroundColor: 'rgba(207,226,255,0.18)',
                    }}
                  />
                  <Text
                    style={{
                      marginTop: 5,
                      marginBottom: 0,
                      padding: 0,
                      fontSize: 10,
                      lineHeight: 14,
                      color: 'rgba(228,234,244,0.82)',
                      fontWeight: '700',
                    }}
                    numberOfLines={2}
                  >
                    {conditionSummary.description}
                  </Text>
                </Animated.View>

                <Animated.View
                  style={[
                    styles.statusFloatingCard,
                    styles.statusFloatingCardFace,
                    styles.statusFloatingCardBack,
                    {
                      transform: [{ perspective: 1000 }, { rotateY: statusCardBackRotate }],
                    },
                  ]}
                >
                  <Text style={styles.statusBackTitle}>{isKorean ? '상태 보기' : 'Status'}</Text>
                  <View style={styles.statusFloatingDivider} />
                  <View style={styles.statusBackGrid}>
                    {statusItems.map((item) => (
                    <View key={`status-back-${item.key}`} style={styles.statusBackItem}>
                      <MaterialCommunityIcons name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap} size={20} color={item.color} />
                      <View style={styles.statusBackItemText}>
                        <View style={styles.statusBackTopRow}>
                          <Text style={styles.statusBackLabel}>{item.label}</Text>
                          <Text style={styles.statusBackValue}>
                            {item.value}
                            {' / '}
                            {item.max}
                          </Text>
                        </View>
                        <View style={[styles.statusBackTonePill, { borderColor: `${item.color}55`, backgroundColor: `${item.color}18` }]}>
                          <Text style={[styles.statusBackTone, { color: item.color }]}>{statusDetailTone[item.key]}</Text>
                        </View>
                      </View>
                    </View>
                    ))}
                  </View>
                </Animated.View>
              </View>
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={storyScrollRef}
            style={
              showResult
                ? styles.storyScroll
                : {
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: scenarioPanelBottom,
                    maxHeight: scenarioPanelMaxHeight,
                    zIndex: 5,
                    overflow: 'visible',
                  }
            }
            contentContainerStyle={[
              showResult
                ? [
                    styles.storyContent,
                    {
                      paddingTop: storyContentPaddingTop,
                      paddingBottom: storyContentPaddingBottom,
                      paddingHorizontal: isNarrow ? 14 : 18,
                    },
                  ]
                : {
                    paddingTop: 18,
                    paddingHorizontal: isNarrow ? 14 : 18,
                  },
            ]}
            showsVerticalScrollIndicator={false}
            bounces={false}
            scrollEnabled={showResult}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={
                showResult
                  ? styles.storyFrame
                  : {
                      width: '100%',
                      overflow: 'visible',
                      paddingHorizontal: 2,
                    }
              }
            >
              <View
                style={{
                  width: '100%',
                  marginTop: showResult ? -scenarioOverlap : 0,
                  marginBottom: 4,
                  overflow: 'visible',
                }}
              >
                <View style={styles.scenarioTab}>
                  <Text style={styles.scenarioTabText}>{isKorean ? '상황 설명' : 'Situation'}</Text>
                </View>
                <View
                  style={{
                    width: '100%',
                    maxHeight: showResult ? undefined : scenarioPanelMaxHeight - 18,
                    overflow: 'hidden',
                    backgroundColor: 'rgba(7, 18, 38, 0.74)',
                    borderRadius: 18,
                    borderWidth: 1.2,
                    borderColor: 'rgba(99, 154, 235, 0.46)',
                    paddingHorizontal: 16,
                    paddingTop: 14,
                    paddingBottom: 16,
                  }}
                >
                  <ScrollView
                    style={{
                      width: '100%',
                      maxHeight: showResult ? undefined : scenarioPanelMaxHeight - 50,
                    }}
                    contentContainerStyle={{
                      flexDirection: 'column',
                      paddingBottom: 2,
                    }}
                    nestedScrollEnabled
                    scrollEnabled={!showResult}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                  >
                    <View
                      style={{
                        width: '100%',
                        flexGrow: 0,
                        flexShrink: 0,
                        marginBottom: 6,
                      }}
                    >
                      <Text style={styles.scenarioText}>{currentScenario.description[lang]}</Text>
                    </View>
                    {!showResult ? (
                      <View
                        style={{
                          width: '100%',
                          flexGrow: 0,
                          flexShrink: 0,
                          flexDirection: 'column',
                          gap: 8,
                          overflow: 'visible',
                        }}
                      >
                        {currentScenario.choices.map((choice, index) => {
                          const choiceCopy = splitChoiceText(choice.text[lang]);

                          return (
                            <TouchableOpacity
                              key={index}
                              style={styles.choiceButton}
                              onPress={() => handleChoice(choice)}
                            >
                              <View style={styles.choiceContentRow}>
                                <View style={styles.choiceIndexBubble}>
                                  <Text style={styles.choiceIndexText}>{index + 1}</Text>
                                </View>
                                <View style={styles.choiceTextWrap}>
                                  {choiceCopy.cue ? <Text style={styles.choiceCueText}>{choiceCopy.cue}</Text> : null}
                                  <Text style={styles.choiceText}>{choiceCopy.body}</Text>
                                </View>
                              </View>
                            </TouchableOpacity>
                          );
                        })} 
                      </View>
                    ) : null}
                  </ScrollView>
                </View>
              </View>

              {showResult && selectedChoice && (() => {
                const resultCardData = buildResultCardData(selectedChoice, lang, currentScenario.tip);

                return (
                  <View style={styles.resultOverlayStack}>
                    <View style={[styles.resultContainer, { borderLeftColor: getFeedbackBorderColor(selectedChoice) }]}>
                      <View style={styles.resultHeaderRow}>
                        <View style={styles.resultHeaderLine} />
                        <Text style={styles.resultHeaderTitle}>{t.resultTitle}</Text>
                        <View style={styles.resultHeaderLine} />
                      </View>

                      <View style={styles.resultInfoBlock}>
                        <View style={styles.resultInfoLabelRow}>
                          <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={18} color="#64B1FF" />
                          <Text style={[styles.resultInfoLabel, styles.resultInfoLabelChoice]}>{t.resultSelectedLabel}</Text>
                        </View>
                        <Text style={styles.resultInfoText}>{resultCardData.selectedText}</Text>
                      </View>

                      <View style={styles.resultInfoDivider} />

                      <View style={styles.resultInfoBlock}>
                        <View style={styles.resultInfoLabelRow}>
                          <MaterialCommunityIcons name="comment-check-outline" size={18} color="#66D980" />
                          <Text style={[styles.resultInfoLabel, styles.resultInfoLabelFeedback]}>{t.resultFeedbackLabel}</Text>
                        </View>
                        <Text style={styles.resultInfoText}>{resultCardData.feedbackText}</Text>
                      </View>

                      <View style={styles.resultInfoDivider} />

                      <View style={styles.resultInfoBlock}>
                        <View style={styles.resultInfoLabelRow}>
                          <MaterialCommunityIcons name="chart-line-variant" size={18} color="#B184FF" />
                          <Text style={[styles.resultInfoLabel, styles.resultInfoLabelValues]}>{t.resultValuesLabel}</Text>
                        </View>
                        <View style={styles.resultStatsRow}>
                          {resultCardData.changedStats.map((entry) => (
                            <ResultStatItem
                              key={`${selectedChoice.nextScenarioId}-${entry.statKey}`}
                              statKey={entry.statKey}
                              value={entry.value}
                              label={
                                entry.statKey === 'funds'
                                  ? t.fundsLabel
                                  : entry.statKey === 'mental'
                                    ? t.mentalHpLabel
                                    : entry.statKey === 'english'
                                      ? t.englishLabel
                                      : entry.statKey === 'insight'
                                        ? t.insightLabel
                                        : entry.statKey === 'stamina'
                                          ? t.staminaLabel
                                          : t.relationLabel
                              }
                            />
                          ))}
                        </View>
                      </View>
                    </View>

                    {resultCardData.tipText ? (
                      <View style={styles.resultTipCard}>
                        <MaterialCommunityIcons
                          name="lightbulb-on-outline"
                          size={20}
                          color="#F4C542"
                          style={styles.resultTipIcon}
                        />
                        <Text style={styles.resultTipText}>{resultCardData.tipText}</Text>
                      </View>
                    ) : null}

                    <TouchableOpacity style={styles.nextButton} onPress={proceedToNextScenario}>
                      <Text style={styles.nextButtonText}>{t.nextBtn}</Text>
                    </TouchableOpacity>
                  </View>
                );
              })()}
            </View>
          </ScrollView>

        </View>

      </ImageBackground>

      <Modal
        visible={showRoadmap}
        transparent
        animationType="fade"
        statusBarTranslucent={false}
        onRequestClose={() => setShowRoadmap(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(5, 10, 22, 0.72)',
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 16,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            elevation: 1000,
          }}
        >
          <View
            style={{
              width: roadmapPanelWidth,
              maxHeight: roadmapPanelMaxHeight,
              flexShrink: 1,
              backgroundColor: '#E9DEC9',
              borderRadius: 24,
              paddingHorizontal: 14,
              paddingTop: 14,
              paddingBottom: 12,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.55)',
              shadowColor: '#000000',
              shadowOpacity: 0.32,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 12 },
              elevation: 1001,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                flexShrink: 0,
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                paddingBottom: 12,
              }}
            >
              <View style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                <Text style={styles.roadmapTitle}>{isKorean ? '로드맵' : 'Roadmap'}</Text>
                <Text
                  style={{
                    marginTop: 4,
                    fontSize: 15,
                    lineHeight: 20,
                    fontWeight: '900',
                    color: '#5F4B3B',
                  }}
                  numberOfLines={2}
                >
                  {`Day ${currentScenario.day ?? 1}. ${situationTitle}`}
                </Text>
              </View>
              <TouchableOpacity
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255,255,255,0.72)',
                  borderWidth: 1,
                  borderColor: 'rgba(95,75,59,0.16)',
                  zIndex: 1003,
                  elevation: 1003,
                }}
                onPress={() => setShowRoadmap(false)}
              >
                <MaterialCommunityIcons name="close" size={21} color="#5B4C40" />
              </TouchableOpacity>
            </View>

            {showRoadmapHint ? (
              <View
                pointerEvents="none"
                style={{
                  flexShrink: 0,
                  marginBottom: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 9,
                  borderRadius: 12,
                  backgroundColor: 'rgba(72, 54, 42, 0.9)',
                  zIndex: 1002,
                  elevation: 1002,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    lineHeight: 17,
                    color: '#FFF8EC',
                    fontWeight: '700',
                    textAlign: 'center',
                  }}
                >
                  {t.roadmapHint}
                </Text>
              </View>
            ) : null}

            <ScrollView
              ref={roadmapScrollRef}
              style={{ flexShrink: 1 }}
              showsVerticalScrollIndicator
              nestedScrollEnabled
              bounces={false}
              contentContainerStyle={{
                paddingBottom: Math.max(10, insets.bottom),
              }}
            >
              <View style={styles.passportPage}>
                <Text style={styles.passportPageHeader}>{t.roadmapPageHeader}</Text>
                <View style={styles.passportHeaderRule} />

                <View style={styles.stampGrid}>
                  {roadmapNodes.map((node, index) => {
                    const state =
                      node.scenarioId < currentScenarioId
                        ? 'completed'
                        : node.scenarioId === currentScenarioId
                          ? 'current'
                          : 'locked';
                    const isAvailable = state !== 'locked' && Boolean(checkpoints[node.scenarioId]);
                    const stampColor = ROADMAP_STAMP_COLORS[index % ROADMAP_STAMP_COLORS.length];
                    const rotation = index % 2 === 0 ? '-9deg' : '8deg';

                    return (
                      <View key={`roadmap-${node.scenarioId}`} style={styles.stampSlot}>
                        <TouchableOpacity
                          activeOpacity={isAvailable ? 0.88 : 1}
                          disabled={!isAvailable}
                          onPress={() => jumpToRoadmapNode(node)}
                          style={[
                            styles.stampFrame,
                            state === 'locked' && { opacity: 0.74 },
                          ]}
                        >
                          <View
                            style={[
                              styles.stampTape,
                              index % 2 === 0 ? styles.stampTapeBlue : styles.stampTapePeach,
                            ]}
                          />
                          <View
                            style={[
                              styles.stampBody,
                              {
                                borderColor: stampColor,
                                transform: [{ rotate: rotation }],
                              },
                              state === 'current' && styles.stampBodyCurrent,
                              state === 'locked' && styles.stampBodyLocked,
                            ]}
                          >
                            <Text
                              style={[
                                styles.stampPlace,
                                { color: state === 'locked' ? '#8F806F' : stampColor },
                              ]}
                            >
                              {state === 'locked' ? 'LOCKED' : node.stampLabel}
                            </Text>
                            <Text
                              style={[
                                styles.stampDate,
                                { color: state === 'locked' ? '#9C8D7B' : stampColor },
                              ]}
                            >
                              {`DAY ${String(node.day).padStart(2, '0')} · EP ${String(node.episode).padStart(2, '0')}`}
                            </Text>
                            <Text
                              style={[
                                styles.stampMeta,
                                { color: state === 'locked' ? '#AA9A88' : stampColor },
                              ]}
                            >
                              {state === 'current'
                                ? t.roadmapCurrent
                                : state === 'completed'
                                  ? t.roadmapRewind
                                  : t.roadmapLocked}
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.stampCaption,
                              state === 'locked' && { color: '#887866' },
                            ]}
                            numberOfLines={2}
                          >
                            {node.title[lang]}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0E1B2D' },
  scenePlaceholder: {
    flex: 1,
    backgroundColor: '#0E1B2D',
  },
  backgroundImage: { flex: 1 },
  backgroundImageStyle: {
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
  },
  backgroundScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,17,31,0.20)',
  },
  characterOverlayWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 158,
    width: '100%',
    height: '34%',
    alignItems: 'center',
  },
  characterOverlay: {
    width: '76%',
    height: '100%',
    shadowColor: '#061121',
    shadowOpacity: 0.26,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },
  container: { flex: 1 },
  topSection: {
    paddingHorizontal: 12,
    paddingTop: 0,
    paddingBottom: 6,
    position: 'relative',
    zIndex: 6,
    overflow: 'visible',
    backgroundColor: 'rgba(7, 18, 38, 0.88)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(207,226,255,0.14)',
  },
  topToolbarBand: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  topToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
  topActionButton: {
    minHeight: 30,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(8, 19, 38, 0.28)',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  topActionButtonSmall: {
    minWidth: 72,
  },
  topActionButtonIconOnly: {
    minWidth: 48,
    paddingHorizontal: 0,
  },
  topActionButtonText: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(241,241,239,0.9)',
  },
  languageMenu: {
    position: 'absolute',
    minWidth: 108,
    backgroundColor: 'rgba(7, 18, 38, 0.96)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(113, 175, 255, 0.42)',
    overflow: 'hidden',
    zIndex: 20,
    shadowColor: '#061121',
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  languageMenuItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  languageMenuDivider: {
    height: 1,
    backgroundColor: 'rgba(207,226,255,0.12)',
  },
  languageMenuText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    color: 'rgba(231,237,244,0.82)',
  },
  languageMenuTextActive: {
    color: '#FFFFFF',
  },
  headerInlineTitleWrap: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 4,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInlineTitleText: {
    fontSize: 16,
    lineHeight: 19,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    textAlign: 'center',
    textShadowColor: 'rgba(3, 10, 19, 0.24)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  storyMapControl: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 2,
  },
  storyMapControlNarrow: {
    width: 50,
  },
  storyMapControlText: {
    fontSize: 8,
    lineHeight: 11,
    fontWeight: '800',
    color: '#ECE8DE',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  storyMapControlTextNarrow: {
    fontSize: 7,
    lineHeight: 10,
  },
  statusFloatingCardWrap: {
    position: 'absolute',
    marginBottom: 0,
    zIndex: 12,
    elevation: 12,
  },
  statusFloatingCardFlipStage: {
    minHeight: 92,
  },
  statusFloatingCard: {
    minHeight: 92,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.1,
    borderColor: 'rgba(207,226,255,0.46)',
    backgroundColor: 'rgba(9, 21, 45, 0.88)',
    shadowColor: '#071224',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  statusFloatingHintIcon: {
    opacity: 0.82,
  },
  statusFloatingCardFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backfaceVisibility: 'hidden',
  },
  statusFloatingCardBack: {
    justifyContent: 'flex-start',
  },
  statusFloatingFrontRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    minWidth: 0,
  },
  statusFloatingBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34, 86, 200, 0.16)',
  },
  statusFloatingHeadingText: {
    minWidth: 0,
    flex: 1,
    justifyContent: 'center',
  },
  statusFloatingHeadingAccent: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '900',
  },
  statusFloatingDescription: {
    marginTop: 5,
    fontSize: 10,
    lineHeight: 14,
    color: 'rgba(228,234,244,0.82)',
    fontWeight: '700',
  },
  statusFloatingFooterRow: {
    marginTop: 4,
    alignItems: 'flex-end',
  },
  statusBackTitle: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '900',
    color: '#F5F8FD',
  },
  statusBackGrid: {
    marginTop: 8,
    gap: 6,
  },
  statusBackItem: {
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(180, 209, 255, 0.12)',
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  statusBackItemText: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  statusBackTopRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
  statusBackLabel: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
    color: 'rgba(227,236,246,0.9)',
  },
  statusBackTone: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '800',
  },
  statusBackTonePill: {
    alignSelf: 'flex-start',
    minWidth: 48,
    minHeight: 22,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  statusBackValue: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '900',
    color: '#F5F8FD',
    flexShrink: 0,
  },
  statusFloatingDivider: {
    marginTop: 5,
    height: 1,
    backgroundColor: 'rgba(207,226,255,0.18)',
  },
  languageToggleWrap: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 2,
  },
  languageToggleWrapNarrow: {
    width: 56,
  },
  languageToggleTrack: {
    width: 52,
    height: 28,
    borderRadius: 999,
    backgroundColor: 'rgba(86, 98, 112, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    paddingHorizontal: 2,
    justifyContent: 'center',
  },
  languageToggleTrackNarrow: {
    width: 46,
    height: 26,
  },
  languageToggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 999,
    backgroundColor: '#F2F1EC',
  },
  languageToggleKnobNarrow: {
    width: 18,
    height: 18,
  },
  languageToggleKnobRight: {
    alignSelf: 'flex-end',
  },
  languageToggleKnobRightNarrow: {
    marginRight: 0,
  },
  languageToggleText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
    color: '#F0ECE3',
    textAlign: 'center',
  },
  languageToggleTextNarrow: {
    fontSize: 9,
    lineHeight: 10,
  },
  compactStatBox: {
    width: 34,
    alignItems: 'center',
  },
  compactStatRing: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 2.5,
    backgroundColor: 'rgba(255,255,255,0.86)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  compactGaugeTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: 'rgba(43,53,69,0.16)',
  },
  compactGaugeFill: {
    height: '100%',
  },
  statBox: { width: '31%', alignItems: 'center', marginHorizontal: 0, marginBottom: 2 },
  statIconTile: {
    width: 52,
    height: 52,
    borderRadius: 7,
    backgroundColor: 'rgba(192,210,235,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  statIconGlyph: {
    textShadowColor: 'rgba(13,25,45,0.22)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tileGaugeBackground: {
    position: 'absolute',
    bottom: 5,
    width: 22,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  tileGaugeFill: {
    height: '100%',
    borderRadius: 999,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#EEF5FF',
    marginBottom: 4,
  },
  storyScroll: {
    flex: 1,
    zIndex: 1,
  },
  storyContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 18,
    paddingTop: 388,
    paddingBottom: 0,
  },
  storyFrame: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    borderWidth: 0,
    overflow: 'visible',
    paddingHorizontal: 2,
    paddingTop: 8,
    paddingBottom: 0,
  },
  scenarioCardWrap: {
    marginBottom: 4,
  },
  scenarioTab: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(39, 87, 170, 0.92)',
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(122, 181, 255, 0.65)',
    paddingHorizontal: 16,
    paddingVertical: 7,
    marginLeft: 14,
    marginBottom: -8,
    zIndex: 2,
    shadowColor: '#3F95FF',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  scenarioTabText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#F6FAFF',
  },
  scenarioCard: {
    backgroundColor: 'rgba(7, 18, 38, 0.74)',
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 0,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    minHeight: 118,
    borderWidth: 1.2,
    borderColor: 'rgba(99, 154, 235, 0.46)',
    justifyContent: 'flex-start',
  },
  scenarioBody: {
    gap: 14,
  },
  scenarioText: {
    fontSize: 14,
    color: '#F4F7FC',
    lineHeight: 26,
    textAlign: 'left',
    fontWeight: '700',
  },
  choiceList: {
    marginTop: 0,
    gap: 10,
  },
  choiceButton: {
    marginHorizontal: 0,
    marginTop: 0,
    minHeight: 56,
    backgroundColor: 'rgba(8, 22, 46, 0.82)',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 1.6,
    borderColor: 'rgba(92, 168, 255, 0.86)',
    borderRadius: 20,
    shadowColor: '#2E88FF',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  choiceButtonSelected: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.40)',
  },
  choiceContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  choiceIndexBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.8,
    borderColor: 'rgba(95, 162, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 38, 88, 0.62)',
  },
  choiceIndexText: {
    color: '#DDEBFF',
    fontSize: 16,
    fontWeight: '900',
  },
  choiceTextWrap: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    gap: 2,
    paddingRight: 2,
  },
  choiceCueText: {
    color: 'rgba(184, 211, 255, 0.86)',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    textAlign: 'left',
  },
  choiceText: {
    color: '#F7FAFF',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    textAlign: 'left',
  },
  resultOverlayStack: {
    marginHorizontal: 14,
    marginTop: 12,
    gap: 12,
  },
  resultContainer: {
    backgroundColor: 'rgba(6, 19, 41, 0.86)',
    borderRadius: 24,
    borderWidth: 1.1,
    borderColor: 'rgba(123, 186, 255, 0.7)',
    borderLeftWidth: 2.2,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    shadowColor: '#70B6FF',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 7,
  },
  resultHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 14,
  },
  resultHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(117, 180, 255, 0.35)',
  },
  resultHeaderTitle: {
    fontSize: 21,
    lineHeight: 24,
    fontWeight: '900',
    color: '#F7FBFF',
    letterSpacing: -0.2,
  },
  resultInfoBlock: {
    gap: 6,
  },
  resultInfoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultInfoLabel: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '900',
  },
  resultInfoLabelChoice: {
    color: '#64B1FF',
  },
  resultInfoLabelDialogue: {
    color: '#5EC6FF',
  },
  resultInfoLabelFeedback: {
    color: '#66D980',
  },
  resultInfoLabelValues: {
    color: '#B184FF',
  },
  resultInfoText: {
    fontSize: 15,
    lineHeight: 23,
    color: '#F2F6FC',
    fontWeight: '700',
  },
  resultInfoDivider: {
    marginVertical: 12,
    height: 1,
    backgroundColor: 'rgba(118, 168, 228, 0.22)',
  },
  resultStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 2,
  },
  resultStatItem: {
    minWidth: 82,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resultStatLabel: {
    fontSize: 14,
    lineHeight: 18,
    color: '#E6EEF9',
    fontWeight: '800',
  },
  resultStatValue: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
  },
  resultStatValuePositive: {
    color: '#6EE787',
  },
  resultStatValueNegative: {
    color: '#FF8F8F',
  },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 16 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 5, paddingHorizontal: 11, borderRadius: 20 },
  badgePositive: { backgroundColor: '#F0FFF4' },
  badgeNegative: { backgroundColor: '#FFF0F0' },
  badgeDot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: { fontSize: 13, fontWeight: '700' },
  badgeTextPositive: { color: '#2F9E44' },
  badgeTextNegative: { color: '#C92A2A' },
  resultTipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(6, 19, 41, 0.8)',
    borderWidth: 1.1,
    borderColor: 'rgba(123, 186, 255, 0.52)',
  },
  resultTipIcon: {
    marginTop: 1,
  },
  resultTipText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: '#EDF4FF',
    fontWeight: '700',
  },
  nextButton: {
    backgroundColor: 'rgba(225, 240, 255, 0.98)',
    paddingVertical: 17,
    borderRadius: 999,
    alignItems: 'center',
    borderWidth: 1.8,
    borderColor: 'rgba(168, 209, 255, 0.95)',
    shadowColor: '#A8D3FF',
    shadowOpacity: 0.55,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  nextButtonText: { color: '#274A72', fontSize: 16, fontWeight: '900', letterSpacing: 0.6 },
  roadmapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 15, 27, 0.42)',
    justifyContent: 'center',
    paddingHorizontal: 18,
    zIndex: 10,
  },
  roadmapCard: {
    backgroundColor: '#E9DEC9',
    borderRadius: 28,
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    shadowColor: '#302113',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  roadmapHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  roadmapHeaderText: {
    flex: 1,
    paddingRight: 12,
  },
  roadmapTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#4E4034',
    marginBottom: 4,
  },
  roadmapHint: {
    fontSize: 12,
    lineHeight: 18,
    color: '#7C6757',
    fontWeight: '600',
  },
  roadmapCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  roadmapScrollContent: {
    paddingBottom: 10,
  },
  passportPage: {
    backgroundColor: '#F6EAD9',
    borderRadius: 6,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    borderLeftWidth: 5,
    borderLeftColor: '#9B59B6',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
    shadowColor: '#2A1B14',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  passportPageHeader: {
    fontSize: 12,
    textAlign: 'right',
    color: '#A79073',
    fontWeight: '700',
    marginBottom: 10,
  },
  passportHeaderRule: {
    height: 2,
    backgroundColor: '#D5C3AA',
    opacity: 0.9,
    marginBottom: 18,
  },
  stampGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  stampSlot: {
    width: '48%',
    minHeight: 178,
  },
  stampFrame: {
    minHeight: 178,
    alignItems: 'center',
  },
  stampFrameLocked: {
    opacity: 0.52,
  },
  stampTape: {
    position: 'absolute',
    top: -2,
    width: 48,
    height: 18,
    borderRadius: 2,
    opacity: 0.82,
    zIndex: 2,
  },
  stampTapeBlue: {
    backgroundColor: 'rgba(126, 219, 228, 0.72)',
    transform: [{ rotate: '-8deg' }],
  },
  stampTapePeach: {
    backgroundColor: 'rgba(249, 182, 171, 0.76)',
    transform: [{ rotate: '9deg' }],
  },
  stampBody: {
    width: '88%',
    minHeight: 96,
    borderWidth: 3,
    borderRadius: 12,
    marginTop: 14,
    paddingHorizontal: 8,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  stampBodyCurrent: {
    backgroundColor: 'rgba(255, 250, 240, 0.92)',
    shadowColor: '#C9645A',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  stampBodyLocked: {
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: '#D1C3AF',
  },
  stampPlace: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '900',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  stampDate: {
    marginTop: 6,
    paddingTop: 5,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  stampMeta: {
    marginTop: 6,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  stampTextLocked: {
    color: '#B7A793',
  },
  stampCaption: {
    marginTop: 14,
    fontSize: 15,
    lineHeight: 20,
    color: '#5F4B3B',
    fontWeight: '700',
    textAlign: 'center',
  },
  stampCaptionLocked: {
    color: '#AD9D89',
  },
});
