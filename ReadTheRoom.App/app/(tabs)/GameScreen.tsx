import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  ImageSourcePropType,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Tabs } from 'expo-router';
import type { Character } from '../../locales/types';
import EndingScene from '../../components/EndingScene';
import SituationSummaryScene from '../../components/SituationSummaryScene';
import {
  applyStatChanges,
  type GameStats,
  type StatChanges,
} from '../../utils/gameStats';
import { preloadAssetSources } from '../../utils/assetPreload';
import {
  getScenarioBundle,
  type LocalizedText,
  type Scenario,
  type ScenarioChoice,
} from '../../utils/scenarioRegistry';
import {
  buildSituationSummary,
  type SituationSummary,
} from '../../utils/situationSummary';
import { saveGame, type SavedGameSession } from '../../utils/gamePersistence';
import { playBgm } from '../../utils/bgmPlayer';
import {
  getRoadmapProgressLabel,
  isRoadmapMainScenario,
} from '../../utils/scenarioProgress';
import {
  getScenarioDisplayTitle,
  getScenarioHeaderTitle,
} from '../../utils/scenarioDisplay';
import GameHeaderBar from '../../features/game/components/GameHeaderBar';
import StatusCard from '../../features/game/components/StatusCard';
import ScenarioPanel from '../../features/game/components/ScenarioPanel';
import RoadmapModal, {
  type RoadmapNode,
} from '../../features/game/components/RoadmapModal';
import {
  resolveChoiceContinuation,
  resolveSummaryContinuation,
} from '../../domain/game/transitions';
import {
  BACKGROUND_IMAGES,
  BACKGROUND_KEY_ALIASES,
  type BackgroundKey,
} from '../../shared/assets/registry';

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

type Checkpoint = {
  scenarioId: number;
  stats: GameStats;
  playHistory: PlayedChoice[];
};

type TutorialStep = {
  key: string;
  title: string;
  body: string;
};

const GAME_TUTORIAL_SEEN_KEY = 'readtheroom_game_tutorial_seen_v1';
const ALWAYS_SHOW_TUTORIAL_FOR_TESTING = true;
const TUTORIAL_CHARACTER_IDS = new Set(['ken', 'amy', 'sora']);

const FAILURE_RECOVERY_STATS: GameStats = {
  funds: 120,
  mental: 70,
  english: 70,
  insight: 70,
  stamina: 100,
  relation: 60,
};

const GAME_TUTORIAL_TEXT = {
  en: {
    skip: 'Skip',
    next: 'Next',
    start: 'Start Game',
    progress: 'Guide',
    dontShowAgain: "Don't show again",
    steps: [
      {
        key: 'storymap',
        title: 'StoryMap',
        body: 'Review your story progress and return to completed scenes.',
      },
      {
        key: 'title',
        title: 'Title',
        body: 'Check the current day, episode number, and scene title.',
      },
      {
        key: 'language',
        title: 'Language',
        body: 'Switch between Korean and English at any time.',
      },
      {
        key: 'status',
        title: 'Status',
        body: 'Track your current condition, including stamina and other stats.',
      },
      {
        key: 'situation',
        title: 'Situation',
        body: 'Read the local context, choose one of three options, and adapt through feedback.',
      },
    ],
  },
  ko: {
    skip: '건너뛰기',
    next: '다음',
    start: '게임 시작',
    progress: '가이드',
    dontShowAgain: '다시 보지 않기',
    steps: [
      {
        key: 'storymap',
        title: '스토리맵',
        body: '진행한 스토리를 확인하고 완료한 이전 장면으로 이동할 수 있습니다.',
      },
      {
        key: 'title',
        title: '타이틀',
        body: '현재 진행 날짜, 에피소드 번호, 장면 제목을 확인할 수 있습니다.',
      },
      {
        key: 'language',
        title: '언어팩',
        body: '한글과 영어 표시를 언제든지 선택할 수 있습니다.',
      },
      {
        key: 'status',
        title: '상태창',
        body: '현재 상태와 스태미너를 포함한 주요 스탯을 확인할 수 있습니다.',
      },
      {
        key: 'situation',
        title: '상황 설명',
        body: '현지 상황을 참고해 3가지 선택 중 하나를 고르세요. 선택에 따라 다른 결과와 피드백을 받으며 적응해 갑니다.',
      },
    ],
  },
} as const;

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
    nextBtn: 'Continue',
    summaryContinue: 'Continue',
    roadmapTitle: 'StoryMap',
    roadmapHint: 'Tap a completed scene to return to it.',
    roadmapBack: 'Go Back Here',
    roadmapLocked: 'Locked',
    roadmapCurrent: 'YOU ARE HERE',
    roadmapRewind: 'TAP TO REWIND',
    roadmapPageHeader: 'VISA / VISAS - PAGE 1',
    roadmapWeekLocked: 'This week is not unlocked yet.',
    resultSelectedLabel: 'Choice',
    resultSummaryLabel: 'Result',
    resultValuesLabel: 'Stat Changes',
    feedbackButton: 'Feedback',
    feedbackModalTitle: 'Feedback',
    feedbackExplanation: 'Result',
    feedbackTip: 'TIP',
    closeButton: 'Close',
    daySummaryLabel: "Today's Summary",
    noStatChanges: 'No stat changes',
    failureContinueBadge: 'Rewarded Ad',
    failureContinueTitle: 'Recover with a rewarded ad?',
    failureContinueMessage:
      'This is currently a test build. In the release version, you can choose to watch a rewarded ad to recover your condition and continue from the next scene.\n\nFor now, would you like to apply the same recovery in test mode and continue?',
    failureContinueYes: 'Continue',
    failureContinueNo: 'Cancel',
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
    nextBtn: '계속하기',
    summaryContinue: '계속하기',
    roadmapTitle: '스토리맵',
    roadmapHint: '완료한 장면은 다시 눌러 돌아갈 수 있어요.',
    roadmapBack: '이 지점으로 돌아가기',
    roadmapLocked: '잠금',
    roadmapCurrent: '현재 위치',
    roadmapRewind: '여기로 돌아가기',
    roadmapPageHeader: 'VISA / VISAS - PAGE 1',
    roadmapWeekLocked: '아직 열리지 않은 Week입니다.',
    resultSelectedLabel: '선택',
    resultSummaryLabel: '결과',
    resultValuesLabel: '스탯 변화',
    feedbackButton: '피드백',
    feedbackModalTitle: '피드백',
    feedbackExplanation: '결과',
    feedbackTip: 'TIP',
    closeButton: '닫기',
    daySummaryLabel: '오늘의 정리',
    noStatChanges: '스탯 변화 없음',
    failureContinueBadge: '보상형 광고',
    failureContinueTitle: '보상형 광고로 회복할까요?',
    failureContinueMessage:
      '현재는 테스트 버전입니다. 정식 버전에서는 보상형 광고를 시청하면 컨디션을 회복하고 다음 장면부터 이어서 플레이할 수 있습니다.\n\n지금은 테스트 모드로 같은 회복 효과를 적용하고 계속 진행하시겠습니까?',
    failureContinueYes: '계속하기',
    failureContinueNo: '취소',
  },
} as const;

const ROADMAP_STAMP_COLORS = [
  '#C9645A',
  '#5A8FCA',
  '#6B9E74',
  '#A270C6',
] as const;
const ROADMAP_WEEKS = [
  { week: 1, dayStart: 1, dayEnd: 6 },
  { week: 2, dayStart: 7, dayEnd: 12 },
  { week: 3, dayStart: 13, dayEnd: 18 },
  { week: 4, dayStart: 19, dayEnd: 24 },
  { week: 5, dayStart: 25, dayEnd: 30 },
] as const;

const getRoadmapLocationLabel = (title: string) => {
  const withoutInternalNote = title.replace(/\s*\([^)]*\)\s*$/u, '').trim();
  return withoutInternalNote.split(/[,?]/u)[0]?.trim() || withoutInternalNote;
};
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

type Props = {
  character: Character | null;
  initialLang?: 'en' | 'ko';
  initialSession?: SavedGameSession | null;
  onGoToCharacterSelect?: () => void;
  onClearSavedGame?: () => void;
};

export default function GameScreen({
  character,
  initialLang = 'en',
  initialSession = null,
  onGoToCharacterSelect,
  onClearSavedGame,
}: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const activeInitialSession =
    initialSession?.characterId === character?.id ? initialSession : null;
  const characterBaseStats = useMemo<GameStats>(
    () => ({
      funds: character?.startingStats.funds ?? 1000,
      mental: character?.startingStats.mental ?? 100,
      english: character?.startingStats.english ?? 30,
      insight: character?.startingStats.insight ?? 50,
      stamina: character?.startingStats.stamina ?? 100,
      relation: character?.startingStats.relation ?? 50,
    }),
    [
      character?.startingStats.english,
      character?.startingStats.funds,
      character?.startingStats.insight,
      character?.startingStats.mental,
      character?.startingStats.relation,
      character?.startingStats.stamina,
    ],
  );
  const initialStats = useMemo(
    () => ({
      funds: activeInitialSession
        ? activeInitialSession.stats.funds
        : characterBaseStats.funds,
      mental: activeInitialSession
        ? activeInitialSession.stats.mental
        : characterBaseStats.mental,
      english: activeInitialSession
        ? activeInitialSession.stats.english
        : characterBaseStats.english,
      insight: activeInitialSession
        ? activeInitialSession.stats.insight
        : characterBaseStats.insight,
      stamina: activeInitialSession
        ? activeInitialSession.stats.stamina
        : characterBaseStats.stamina,
      relation: activeInitialSession
        ? activeInitialSession.stats.relation
        : characterBaseStats.relation,
    }),
    [activeInitialSession, characterBaseStats],
  );
  const storyScrollRef = useRef<ScrollView | null>(null);
  const roadmapScrollRef = useRef<ScrollView | null>(null);
  const [sceneAssetsReady, setSceneAssetsReady] = useState(false);
  const [lang, setLang] = useState<'en' | 'ko'>(initialLang);
  const scenarioBundle = useMemo(
    () => getScenarioBundle(character?.id),
    [character?.id],
  );
  const startScenarioId = scenarioBundle.startScenarioId;
  const scenarios = scenarioBundle.scenarios;
  const [currentScenarioId, setCurrentScenarioId] = useState<number>(
    activeInitialSession
      ? activeInitialSession.currentScenarioId
      : startScenarioId,
  );
  const [stats, setStats] = useState<GameStats>(initialStats);
  const [showResult, setShowResult] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [endingType, setEndingType] = useState<'success' | 'failure' | null>(
    null,
  );
  const [currentSituationChoices, setCurrentSituationChoices] = useState<
    ScenarioChoice[]
  >(activeInitialSession ? activeInitialSession.currentSituationChoices : []);
  const [playHistory, setPlayHistory] = useState<PlayedChoice[]>(
    activeInitialSession ? activeInitialSession.playHistory : [],
  );
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [selectedRoadmapWeek, setSelectedRoadmapWeek] = useState(1);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [pendingSummary, setPendingSummary] = useState<{
    summary: SituationSummary;
    nextScenarioId: number | null;
  } | null>(null);
  const [failureRecoveryNextScenarioId, setFailureRecoveryNextScenarioId] =
    useState<number | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStepIndex, setTutorialStepIndex] = useState(0);
  const [tutorialDontShowAgain, setTutorialDontShowAgain] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
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
  const tutorialText = GAME_TUTORIAL_TEXT[lang];
  const tutorialSteps: readonly TutorialStep[] = tutorialText.steps;
  const tutorialStep = tutorialSteps[tutorialStepIndex] ?? tutorialSteps[0];
  const isLastTutorialStep = tutorialStepIndex >= tutorialSteps.length - 1;
  const isKorean = lang === 'ko';
  const isNarrow = width <= 390;
  const statusCardWidth = Math.min(
    Math.round(width * (isNarrow ? 0.39 : 0.33)),
    188,
  );
  const headerHeight = 52;
  const headerHorizontalPadding = isNarrow ? 12 : 18;
  const characterTop = headerHeight;
  const characterHeight = Math.round(height * (isNarrow ? 0.58 : 0.6));
  const characterWidth = Math.round(width * 0.72);
  const scenarioPanelBottom = Math.max(insets.bottom, 8);
  const scenarioPanelMaxHeight = Math.min(
    460,
    Math.max(360, Math.round(height * 0.42)),
  );
  const roadmapVerticalInset = isNarrow ? 12 : 16;
  const roadmapPanelWidth = Math.min(Math.round(width * 0.92), 520);
  const roadmapPanelMaxHeight = Math.max(
    300,
    height - insets.top - insets.bottom - roadmapVerticalInset * 2,
  );
  const tutorialBubbleWidth = Math.min(width - 36, 330);
  // The tutorial overlay is rendered inside SafeAreaView content, so header
  // anchors should use local coordinates instead of adding the top inset again.
  const tutorialTopInset = 8;
  const tutorialHeaderIconFocus = {
    top: 2,
    width: 48,
    height: 48,
  };
  const tutorialAnchor = (() => {
    switch (tutorialStep.key) {
      case 'storymap':
        return {
          bubble: {
            top: tutorialTopInset + headerHeight + 8,
            left: 14,
            width: tutorialBubbleWidth,
          },
          arrow: styles.tutorialArrowTopLeft,
          focus: {
            ...tutorialHeaderIconFocus,
            left: headerHorizontalPadding - 6,
          },
        };
      case 'title':
        return {
          bubble: {
            top: tutorialTopInset + headerHeight + 8,
            left: Math.max(14, (width - tutorialBubbleWidth) / 2),
            width: tutorialBubbleWidth,
          },
          arrow: styles.tutorialArrowTopCenter,
          focus: {
            top: 6,
            left: Math.max(64, width * 0.18),
            right: Math.max(64, width * 0.18),
            height: 40,
          },
        };
      case 'language':
        return {
          bubble: {
            top: tutorialTopInset + headerHeight + 8,
            right: 14,
            width: tutorialBubbleWidth,
          },
          arrow: styles.tutorialArrowTopRight,
          focus: {
            ...tutorialHeaderIconFocus,
            right: headerHorizontalPadding - 6,
          },
        };
      case 'status':
        return {
          bubble: {
            top: tutorialTopInset + headerHeight + 108,
            right: 14,
            width: tutorialBubbleWidth,
          },
          arrow: styles.tutorialArrowTopRight,
          focus: {
            top: headerHeight + 8,
            right: headerHorizontalPadding,
            width: statusCardWidth,
            height: 86,
          },
        };
      case 'situation':
      default:
        return {
          bubble: {
            bottom:
              scenarioPanelBottom + Math.min(250, scenarioPanelMaxHeight - 118),
            left: 14,
            width: tutorialBubbleWidth,
          },
          arrow: styles.tutorialArrowBottomLeft,
          focus: {
            left: 10,
            right: 10,
            bottom: scenarioPanelBottom,
            height: Math.min(240, scenarioPanelMaxHeight),
          },
        };
    }
  })();

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    void NavigationBar.setBehaviorAsync('overlay-swipe');
    void NavigationBar.setVisibilityAsync('hidden');

    return () => {
      void NavigationBar.setVisibilityAsync('visible');
    };
  }, []);

  useEffect(() => {
    setLang(activeInitialSession ? activeInitialSession.lang : initialLang);
    setCurrentScenarioId(
      activeInitialSession
        ? activeInitialSession.currentScenarioId
        : startScenarioId,
    );
    setStats(initialStats);
    setCurrentSituationChoices(
      activeInitialSession ? activeInitialSession.currentSituationChoices : [],
    );
    setPlayHistory(
      activeInitialSession ? activeInitialSession.playHistory : [],
    );
    setShowRoadmap(false);
    setShowLanguageMenu(false);
    setShowResult(false);
    setShowFeedbackModal(false);
    setSelectedChoice(null);
    setShowRecoveryModal(false);
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
    let isMounted = true;
    const characterId = character?.id;
    const shouldConsiderTutorial =
      Boolean(characterId) &&
      (ALWAYS_SHOW_TUTORIAL_FOR_TESTING || !activeInitialSession) &&
      TUTORIAL_CHARACTER_IDS.has(characterId ?? '');

    if (!shouldConsiderTutorial) {
      setShowTutorial(false);
      setTutorialStepIndex(0);
      return () => {
        isMounted = false;
      };
    }

    void AsyncStorage.getItem(GAME_TUTORIAL_SEEN_KEY).then((seen) => {
      if (!isMounted) return;
      setTutorialStepIndex(0);
      setTutorialDontShowAgain(seen === 'true');
      setShowTutorial(ALWAYS_SHOW_TUTORIAL_FOR_TESTING || seen !== 'true');
    });

    return () => {
      isMounted = false;
    };
  }, [activeInitialSession, character?.id]);

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
  const currentScenario: Scenario =
    scenarios[String(currentScenarioId)] ?? fallbackScenario;
  const isSummaryScenario = currentScenario.type === 'SUMMARY';

  const resolvedBackgroundKey: BackgroundKey = currentScenario.backgroundKey
    ? (BACKGROUND_KEY_ALIASES[currentScenario.backgroundKey] ?? 'arrival')
    : 'arrival';
  const currentBackground = BACKGROUND_IMAGES[resolvedBackgroundKey];
  const currentCharacterOverlay = character?.cardImage ?? character?.image;
  const situationTitle = getScenarioDisplayTitle(currentScenario, lang);

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

  const usesMainEpisodeProgress = useMemo(
    () =>
      Object.values(scenarios).some(
        (scenario) => typeof scenario.mainEpisode === 'number',
      ),
    [scenarios],
  );
  const headerTitle = getScenarioHeaderTitle(currentScenario, lang);
  const currentSituationTitleLocalized = {
    ko: getScenarioDisplayTitle(currentScenario, 'ko'),
    en: getScenarioDisplayTitle(currentScenario, 'en'),
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
      .reduce<
        {
          title: LocalizedText;
          detail: LocalizedText;
          dedupeKey: string;
        }[]
      >((items, entry) => {
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
        ko: '이번 플레이에서 아쉬웠던 순간들',
        en: 'What Hurt This Run',
      },
      items: negativeItems,
    };
  }, [playHistory]);
  const roadmapNodes = useMemo(() => {
    return Object.values(scenarios)
      .filter(
        (scenario) =>
          !usesMainEpisodeProgress || isRoadmapMainScenario(scenario),
      )
      .sort((a, b) =>
        usesMainEpisodeProgress
          ? (a.week ?? 1) - (b.week ?? 1) ||
            (a.day ?? 1) - (b.day ?? 1) ||
            (a.mainEpisode ?? 0) - (b.mainEpisode ?? 0)
          : a.id - b.id,
      )
      .map((scenario) => ({
        scenarioId: scenario.id,
        week: scenario.week ?? Math.ceil((scenario.day ?? 1) / 6),
        day: scenario.day ?? 1,
        progressLabel: usesMainEpisodeProgress
          ? getRoadmapProgressLabel(scenario)
          : `DAY ${String(scenario.day ?? 1).padStart(2, '0')} EP ${String(
              scenario.episode ?? scenario.id,
            ).padStart(2, '0')}`,
        title: {
          ko: getScenarioDisplayTitle(scenario, 'ko') || `시나리오 ${scenario.id}`,
          en:
            getScenarioDisplayTitle(scenario, 'en') ||
            `Situation ${scenario.id}`,
        },
        stampLabel: getRoadmapStampLabel(
          getScenarioDisplayTitle(scenario, 'en') || `Step ${scenario.id}`,
          scenario.id,
        ),
      }));
  }, [scenarios, usesMainEpisodeProgress]);
  const currentRoadmapWeek =
    currentScenario.week ?? Math.ceil((currentScenario.day ?? 1) / 6);
  const unlockedRoadmapWeeks = useMemo(() => {
    const weeks = new Set<number>([currentRoadmapWeek]);

    roadmapNodes.forEach((node) => {
      if (checkpoints[node.scenarioId]) {
        weeks.add(node.week);
      }
    });

    return weeks;
  }, [checkpoints, currentRoadmapWeek, roadmapNodes]);
  const selectedWeekRoadmapNodes = useMemo(
    () => roadmapNodes.filter((node) => node.week === selectedRoadmapWeek),
    [roadmapNodes, selectedRoadmapWeek],
  );
  const selectedRoadmapWeekMeta =
    ROADMAP_WEEKS.find((item) => item.week === selectedRoadmapWeek) ??
    ROADMAP_WEEKS[0];
  const roadmapLocationTitle =
    selectedRoadmapWeek === currentRoadmapWeek
      ? `W${currentRoadmapWeek} · Day ${currentScenario.day ?? 1} · ${getRoadmapLocationLabel(
          situationTitle,
        )}`
      : `W${selectedRoadmapWeek} · Day ${String(
          selectedRoadmapWeekMeta.dayStart,
        ).padStart(
          2,
          '0',
        )}~${String(selectedRoadmapWeekMeta.dayEnd).padStart(2, '0')}`;

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

    setSelectedRoadmapWeek(currentRoadmapWeek);
  }, [currentRoadmapWeek, showRoadmap]);

  useEffect(() => {
    if (!showRoadmap) return;

    const exactCurrentIndex = selectedWeekRoadmapNodes.findIndex(
      (node) => node.scenarioId === currentScenarioId,
    );
    const currentIndex =
      exactCurrentIndex >= 0
        ? exactCurrentIndex
        : selectedWeekRoadmapNodes.reduce(
            (lastIndex, node, index) =>
              checkpoints[node.scenarioId] ? index : lastIndex,
            -1,
          );

    const timer = setTimeout(() => {
      roadmapScrollRef.current?.scrollTo({
        y:
          currentIndex < 0
            ? 0
            : Math.max(0, Math.floor(currentIndex / 2) * 176 - 18),
        animated: true,
      });
    }, 80);

    return () => clearTimeout(timer);
  }, [checkpoints, currentScenarioId, selectedWeekRoadmapNodes, showRoadmap]);

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
  }, [
    character?.id,
    checkpoints,
    currentScenarioId,
    currentSituationChoices,
    endingType,
    lang,
    pendingSummary,
    playHistory,
    showResult,
    stats,
  ]);

  const setLanguageAndClose = (nextLang: 'en' | 'ko') => {
    setLang(nextLang);
    setShowLanguageMenu(false);
  };

  const completeTutorial = () => {
    setShowTutorial(false);
    setTutorialStepIndex(0);
    if (tutorialDontShowAgain) {
      void AsyncStorage.setItem(GAME_TUTORIAL_SEEN_KEY, 'true');
    } else {
      void AsyncStorage.removeItem(GAME_TUTORIAL_SEEN_KEY);
    }
  };

  const advanceTutorial = () => {
    if (isLastTutorialStep) {
      completeTutorial();
      return;
    }

    setTutorialStepIndex((prev) =>
      Math.min(prev + 1, tutorialSteps.length - 1),
    );
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
    setShowFeedbackModal(true);
  };

  const handleSummaryContinue = () => {
    if (!isSummaryScenario) return;

    const nextScenarioId = currentScenario.nextScenarioId;
    const continuation = resolveSummaryContinuation({
      scenario: currentScenario,
      nextScenarioExists:
        nextScenarioId !== undefined &&
        Boolean(scenarios[String(nextScenarioId)]),
    });

    if (continuation.type === 'missing') {
      Alert.alert(
        isKorean ? '시나리오 오류' : 'Scenario Error',
        isKorean
          ? `다음 시나리오 ${continuation.nextScenarioId}를 찾을 수 없습니다.`
          : `The next scenario ${continuation.nextScenarioId} could not be found.`,
      );
      return;
    }

    if (currentScenario.statChanges) {
      setStats((prev) =>
        applyStatChanges(prev, currentScenario.statChanges ?? {}),
      );
    }

    setCurrentSituationChoices([]);
    setShowResult(false);
    setSelectedChoice(null);

    if (continuation.type === 'advance') {
      setCurrentScenarioId(continuation.nextScenarioId);
    } else {
      setEndingType('success');
    }
  };

  const proceedToNextScenario = () => {
    setShowFeedbackModal(false);
    if (selectedChoice) {
      const nextScenarioId = selectedChoice.nextScenarioId;
      const nextScenario = scenarios[String(nextScenarioId)];
      const continuation = resolveChoiceContinuation({
        stats,
        scenario: currentScenario,
        choice: selectedChoice,
        nextScenarioExists: Boolean(nextScenario),
      });

      if (continuation.type === 'failure') {
        setFailureRecoveryNextScenarioId(
          nextScenario ? selectedChoice.nextScenarioId : null,
        );
        setShowResult(false);
        setSelectedChoice(null);
        setEndingType('failure');
        return;
      }

      const completedSituationChoices = [
        ...currentSituationChoices,
        selectedChoice,
      ];

      if (continuation.type === 'ending') {
        setCurrentSituationChoices([]);
        setShowResult(false);
        setSelectedChoice(null);
        setEndingType('success');
        return;
      }

      if (continuation.type === 'advance') {
        setCurrentSituationChoices(completedSituationChoices);
        setCurrentScenarioId(continuation.nextScenarioId);
      } else {
        setPendingSummary({
          summary: buildSituationSummary({
            situationTitle: currentSituationTitleLocalized,
            expression: currentScenario.description,
            choices: completedSituationChoices,
          }),
          nextScenarioId: continuation.nextScenarioId,
        });
        setCurrentSituationChoices([]);
      }
    }

    setShowResult(false);
    setShowFeedbackModal(false);
    setSelectedChoice(null);
  };

  const restartGame = () => {
    setStats(initialStats);
    setCurrentScenarioId(startScenarioId);
    setShowResult(false);
    setShowFeedbackModal(false);
    setSelectedChoice(null);
    setEndingType(null);
    setCurrentSituationChoices([]);
    setPlayHistory([]);
    setShowRoadmap(false);
    setPendingSummary(null);
    setFailureRecoveryNextScenarioId(null);
    setCheckpoints({
      [startScenarioId]: {
        scenarioId: startScenarioId,
        stats: initialStats,
        playHistory: [],
      },
    });
  };

  const recoverAfterFailure = () => {
    setStats({
      funds: Math.max(characterBaseStats.funds, FAILURE_RECOVERY_STATS.funds),
      mental: Math.max(
        characterBaseStats.mental,
        FAILURE_RECOVERY_STATS.mental,
      ),
      english: Math.max(
        characterBaseStats.english,
        FAILURE_RECOVERY_STATS.english,
      ),
      insight: Math.max(
        characterBaseStats.insight,
        FAILURE_RECOVERY_STATS.insight,
      ),
      stamina: Math.max(
        characterBaseStats.stamina,
        FAILURE_RECOVERY_STATS.stamina,
      ),
      relation: Math.max(
        characterBaseStats.relation,
        FAILURE_RECOVERY_STATS.relation,
      ),
    });
    if (failureRecoveryNextScenarioId) {
      setCurrentScenarioId(failureRecoveryNextScenarioId);
    }
    setFailureRecoveryNextScenarioId(null);
    setCurrentSituationChoices([]);
    setShowRecoveryModal(false);
    setEndingType(null);
    setShowResult(false);
    setSelectedChoice(null);
  };

  const confirmContinueAfterFailure = () => {
    setShowRecoveryModal(true);
  };

  const jumpToRoadmapNode = (node: RoadmapNode) => {
    const checkpoint = checkpoints[node.scenarioId];
    if (!checkpoint) return;

    setStats({ ...checkpoint.stats });
    setPlayHistory([...checkpoint.playHistory]);
    setCurrentSituationChoices([]);
    setPendingSummary(null);
    setFailureRecoveryNextScenarioId(null);
    setShowRecoveryModal(false);
    setShowResult(false);
    setSelectedChoice(null);
    setEndingType(null);
    setCurrentScenarioId(checkpoint.scenarioId);
    setShowRoadmap(false);
  };

  if (endingType) {
    return (
      <>
        <EndingScene
          lang={lang}
          variant={endingType}
          characterId={character?.id}
          failureRecap={failureRecap}
          onContinueAfterAd={
            endingType === 'failure' ? confirmContinueAfterFailure : undefined
          }
          onTryAnotherChoice={() => {
            restartGame();
            onClearSavedGame?.();
            onGoToCharacterSelect?.();
          }}
          onRestartFromBeginning={restartGame}
        />
        {endingType === 'failure' ? (
          <RecoveryConfirmModal
            visible={showRecoveryModal}
            badgeLabel={t.failureContinueBadge}
            title={t.failureContinueTitle}
            message={t.failureContinueMessage}
            cancelLabel={t.failureContinueNo}
            continueLabel={t.failureContinueYes}
            onCancel={() => setShowRecoveryModal(false)}
            onContinue={() => {
              setShowRecoveryModal(false);
              recoverAfterFailure();
            }}
          />
        ) : null}
      </>
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
        <Tabs.Screen
          options={{ headerShown: false, tabBarStyle: { display: 'none' } }}
        />
        <View style={styles.scenePlaceholder} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar hidden />
      <Tabs.Screen
        options={{ headerShown: false, tabBarStyle: { display: 'none' } }}
      />
      <ImageBackground
        source={currentBackground}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
      >
        <View style={styles.backgroundScrim} />
        {currentCharacterOverlay && (
          <View
            style={[
              styles.characterOverlayWrap,
              { top: characterTop, height: characterHeight },
            ]}
          >
            <Image
              source={currentCharacterOverlay}
              style={[styles.characterOverlay, { width: characterWidth }]}
              resizeMode="contain"
            />
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
            <GameHeaderBar
              height={headerHeight}
              horizontalPadding={headerHorizontalPadding}
              title={headerTitle}
              language={lang}
              showLanguageMenu={showLanguageMenu}
              onOpenRoadmap={() => setShowRoadmap(true)}
              onShowFullTitle={() => setShowTitleModal(true)}
              onToggleLanguageMenu={() =>
                setShowLanguageMenu((prev) => !prev)
              }
              onSelectLanguage={setLanguageAndClose}
            />
            {!showResult ? (
              <>
              <StatusCard
                width={statusCardWidth}
                right={headerHorizontalPadding}
                top={headerHeight + 8}
                stats={stats}
                episode={currentScenario.episode}
                language={lang}
                resetKey={currentScenarioId}
                labels={{
                  funds: t.fundsLabel,
                  mental: t.mentalHpLabel,
                  english: t.englishLabel,
                  insight: t.insightLabel,
                  stamina: t.staminaLabel,
                  relation: t.relationLabel,
                }}
              />
              </>
            ) : null}
          </View>

          <ScenarioPanel
            ref={storyScrollRef}
            scenario={currentScenario}
            language={lang}
            isNarrow={isNarrow}
            bottom={scenarioPanelBottom}
            maxHeight={scenarioPanelMaxHeight}
            showResult={showResult}
            showFeedbackModal={showFeedbackModal}
            selectedChoice={selectedChoice}
            copy={{
              situationLabel: isKorean ? '상황 설명' : 'Situation',
              summaryLabel: t.daySummaryLabel,
              summaryContinue: t.summaryContinue,
              feedbackButton: t.feedbackButton,
              continueButton: t.nextBtn,
              feedbackTitle: t.feedbackModalTitle,
              choiceLabel: t.resultSelectedLabel,
              resultLabel: t.feedbackExplanation,
              statsLabel: t.resultValuesLabel,
              tipLabel: t.feedbackTip,
              closeLabel: t.closeButton,
            }}
            statLabels={{
              funds: t.fundsLabel,
              mental: t.mentalHpLabel,
              english: t.englishLabel,
              insight: t.insightLabel,
              stamina: t.staminaLabel,
              relation: t.relationLabel,
            }}
            onChoice={handleChoice}
            onSummaryContinue={handleSummaryContinue}
            onOpenFeedback={() => setShowFeedbackModal(true)}
            onCloseFeedback={() => setShowFeedbackModal(false)}
            onContinue={proceedToNextScenario}
          />

          {showTutorial ? (
            <View style={styles.tutorialOverlay}>
              <View style={styles.tutorialScrim} />
              <View
                pointerEvents="none"
                style={[styles.tutorialFocus, tutorialAnchor.focus]}
              />
              <View style={[styles.tutorialBubble, tutorialAnchor.bubble]}>
                <View style={[styles.tutorialArrow, tutorialAnchor.arrow]} />
                <View style={styles.tutorialHeader}>
                  <View style={styles.tutorialBadge}>
                    <Text style={styles.tutorialBadgeText}>
                      {tutorialText.progress} {tutorialStepIndex + 1}/
                      {tutorialSteps.length}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.tutorialSkipButton}
                    onPress={completeTutorial}
                    activeOpacity={0.86}
                  >
                    <Text style={styles.tutorialSkipText}>
                      {tutorialText.skip}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.tutorialTitle}>{tutorialStep.title}</Text>
                <Text style={styles.tutorialBody}>{tutorialStep.body}</Text>

                <View style={styles.tutorialDots}>
                  {tutorialSteps.map((step, index) => (
                    <View
                      key={step.key}
                      style={[
                        styles.tutorialDot,
                        index === tutorialStepIndex &&
                          styles.tutorialDotActive,
                      ]}
                    />
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.tutorialCheckboxRow}
                  onPress={() => setTutorialDontShowAgain((prev) => !prev)}
                  activeOpacity={0.86}
                >
                  <View
                    style={[
                      styles.tutorialCheckbox,
                      tutorialDontShowAgain && styles.tutorialCheckboxChecked,
                    ]}
                  >
                    {tutorialDontShowAgain ? (
                      <Text style={styles.tutorialCheckboxMark}>✓</Text>
                    ) : null}
                  </View>
                  <Text style={styles.tutorialCheckboxText}>
                    {tutorialText.dontShowAgain}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.tutorialNextButton}
                  onPress={advanceTutorial}
                  activeOpacity={0.9}
                >
                  <Text style={styles.tutorialNextText}>
                    {isLastTutorialStep
                      ? tutorialText.start
                      : tutorialText.next}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>
      </ImageBackground>

      <Modal
        visible={showTitleModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowTitleModal(false)}
      >
        <View style={styles.titleModalOverlay}>
          <View style={styles.titleModalCard}>
            <View style={styles.titleModalHeader}>
              <View style={styles.titleModalBadge}>
                <Text style={styles.titleModalBadgeText}>
                  {isKorean ? '현재 장면' : 'Current Scene'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.titleModalCloseButton}
                onPress={() => setShowTitleModal(false)}
                activeOpacity={0.88}
              >
                <Text style={styles.titleModalCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.titleModalTitle}>
              {isKorean ? '장면 제목' : 'Scene Title'}
            </Text>
            <Text style={styles.titleModalBody}>{headerTitle}</Text>

            <TouchableOpacity
              style={styles.titleModalButton}
              onPress={() => setShowTitleModal(false)}
              activeOpacity={0.9}
            >
              <Text style={styles.titleModalButtonText}>
                {isKorean ? '확인' : 'OK'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <RoadmapModal
        ref={roadmapScrollRef}
        visible={showRoadmap}
        language={lang}
        copy={{
          title: t.roadmapTitle,
          hint: t.roadmapHint,
          close: t.closeButton,
          current: t.roadmapCurrent,
          rewind: t.roadmapRewind,
          locked: t.roadmapLocked,
          weekLocked: t.roadmapWeekLocked,
        }}
        locationTitle={roadmapLocationTitle}
        selectedWeek={selectedRoadmapWeek}
        nodes={selectedWeekRoadmapNodes}
        weeks={ROADMAP_WEEKS}
        unlockedWeeks={unlockedRoadmapWeeks}
        completedScenarioIds={new Set(Object.keys(checkpoints).map(Number))}
        currentScenarioId={currentScenarioId}
        panelWidth={roadmapPanelWidth}
        panelHeight={roadmapPanelMaxHeight}
        topInset={insets.top + roadmapVerticalInset}
        bottomInset={insets.bottom + roadmapVerticalInset}
        styles={styles}
        stampColors={ROADMAP_STAMP_COLORS}
        onClose={() => setShowRoadmap(false)}
        onSelectWeek={setSelectedRoadmapWeek}
        onJump={jumpToRoadmapNode}
      />
    </SafeAreaView>
  );
}

type RecoveryConfirmModalProps = {
  visible: boolean;
  badgeLabel: string;
  title: string;
  message: string;
  cancelLabel: string;
  continueLabel: string;
  onCancel: () => void;
  onContinue: () => void;
};

function RecoveryConfirmModal({
  visible,
  badgeLabel,
  title,
  message,
  cancelLabel,
  continueLabel,
  onCancel,
  onContinue,
}: RecoveryConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.titleModalOverlay}>
        <View style={styles.titleModalCard}>
          <View style={styles.titleModalHeader}>
            <View style={styles.recoveryModalBadge}>
              <View style={styles.recoveryRewardIcon}>
                <Text style={styles.recoveryRewardIconText}>AD</Text>
              </View>
              <Text style={styles.titleModalBadgeText}>{badgeLabel}</Text>
            </View>
            <TouchableOpacity
              style={styles.titleModalCloseButton}
              onPress={onCancel}
              activeOpacity={0.88}
            >
              <Text style={styles.titleModalCloseText}>×</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.titleModalTitle}>{title}</Text>
          <Text style={styles.titleModalBody}>{message}</Text>

          <View style={styles.recoveryModalActions}>
            <TouchableOpacity
              style={styles.recoveryModalCancelButton}
              onPress={onCancel}
              activeOpacity={0.9}
            >
              <Text style={styles.recoveryModalCancelText}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.recoveryModalContinueButton}
              onPress={onContinue}
              activeOpacity={0.9}
            >
              <Text style={styles.recoveryModalContinueText}>
                {continueLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
  tutorialOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
  },
  tutorialScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(3, 9, 20, 0.62)',
  },
  tutorialFocus: {
    position: 'absolute',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(142, 200, 255, 0.92)',
    backgroundColor: 'rgba(77, 151, 255, 0.08)',
    shadowColor: '#64B4FF',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 20,
  },
  tutorialBubble: {
    position: 'absolute',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(159, 203, 255, 0.46)',
    backgroundColor: 'rgba(9, 24, 48, 0.96)',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 15,
    shadowColor: '#1D78FF',
    shadowOpacity: 0.24,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 18,
  },
  tutorialArrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  tutorialArrowTopLeft: {
    top: -9,
    left: 22,
    borderBottomWidth: 10,
    borderBottomColor: 'rgba(9, 24, 48, 0.96)',
  },
  tutorialArrowTopCenter: {
    top: -9,
    left: '48%',
    borderBottomWidth: 10,
    borderBottomColor: 'rgba(9, 24, 48, 0.96)',
  },
  tutorialArrowTopRight: {
    top: -9,
    right: 22,
    borderBottomWidth: 10,
    borderBottomColor: 'rgba(9, 24, 48, 0.96)',
  },
  tutorialArrowBottomLeft: {
    bottom: -9,
    left: 26,
    borderTopWidth: 10,
    borderTopColor: 'rgba(9, 24, 48, 0.96)',
  },
  tutorialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  tutorialBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(142, 194, 255, 0.42)',
    backgroundColor: 'rgba(26, 82, 150, 0.7)',
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  tutorialBadgeText: {
    color: '#DCEEFF',
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '900',
  },
  tutorialSkipButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  tutorialSkipText: {
    color: 'rgba(230, 238, 248, 0.72)',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
  },
  tutorialTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  tutorialBody: {
    marginTop: 8,
    color: '#DCE8F8',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700',
  },
  tutorialDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 14,
    marginBottom: 12,
  },
  tutorialDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(207, 226, 255, 0.32)',
  },
  tutorialDotActive: {
    width: 18,
    backgroundColor: '#8EC8FF',
  },
  tutorialCheckboxRow: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    marginBottom: 10,
    paddingRight: 8,
  },
  tutorialCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.4,
    borderColor: 'rgba(220, 238, 255, 0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  tutorialCheckboxChecked: {
    borderColor: '#8EC8FF',
    backgroundColor: '#2C74BB',
  },
  tutorialCheckboxMark: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '900',
  },
  tutorialCheckboxText: {
    color: 'rgba(230, 238, 248, 0.78)',
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
  },
  tutorialNextButton: {
    minHeight: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DCEEFF',
    borderWidth: 1,
    borderColor: 'rgba(168, 209, 255, 0.9)',
  },
  tutorialNextText: {
    color: '#22496F',
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '900',
  },
  titleModalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(2, 8, 18, 0.68)',
  },
  titleModalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(126, 190, 255, 0.52)',
    backgroundColor: 'rgba(7, 20, 43, 0.97)',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
    shadowColor: '#1D78FF',
    shadowOpacity: 0.24,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 22,
  },
  titleModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  titleModalBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(142, 194, 255, 0.42)',
    backgroundColor: 'rgba(26, 82, 150, 0.7)',
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  titleModalBadgeText: {
    color: '#DCEEFF',
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '900',
  },
  recoveryModalBadge: {
    minHeight: 29,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(241, 198, 106, 0.42)',
    backgroundColor: 'rgba(44, 79, 122, 0.50)',
    paddingLeft: 8,
    paddingRight: 11,
    paddingVertical: 5,
  },
  recoveryRewardIcon: {
    minWidth: 26,
    height: 18,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1C66A',
    borderWidth: 1,
    borderColor: 'rgba(255, 245, 214, 0.78)',
  },
  recoveryRewardIconText: {
    color: '#18314F',
    fontSize: 9,
    lineHeight: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  titleModalCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(207, 226, 255, 0.28)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  titleModalCloseText: {
    color: '#EAF3FF',
    fontSize: 25,
    lineHeight: 29,
    fontWeight: '700',
  },
  titleModalTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  titleModalBody: {
    marginTop: 12,
    color: '#DCE8F8',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '800',
  },
  titleModalButton: {
    minHeight: 46,
    marginTop: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DCEEFF',
    borderWidth: 1,
    borderColor: 'rgba(168, 209, 255, 0.9)',
  },
  titleModalButtonText: {
    color: '#22496F',
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '900',
  },
  recoveryModalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  recoveryModalCancelButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(207, 226, 255, 0.34)',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
  },
  recoveryModalContinueButton: {
    flex: 1.18,
    minHeight: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DCEEFF',
    borderWidth: 1,
    borderColor: 'rgba(168, 209, 255, 0.9)',
  },
  recoveryModalCancelText: {
    color: 'rgba(232, 241, 255, 0.84)',
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '900',
  },
  recoveryModalContinueText: {
    color: '#22496F',
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '900',
  },
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
  statBox: {
    width: '31%',
    alignItems: 'center',
    marginHorizontal: 0,
    marginBottom: 2,
  },
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
    backgroundColor: 'rgba(27, 78, 139, 0.92)',
    borderColor: '#8CC8FF',
    shadowColor: '#54A9FF',
    shadowOpacity: 0.48,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  choiceButtonInactive: {
    opacity: 0.38,
    backgroundColor: 'rgba(6, 16, 34, 0.68)',
    borderColor: 'rgba(110, 145, 190, 0.36)',
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
    marginTop: 0,
    gap: 10,
  },
  resultContainer: {
    backgroundColor: 'rgba(6, 19, 41, 0.92)',
    borderRadius: 20,
    borderWidth: 1.1,
    borderColor: 'rgba(123, 186, 255, 0.7)',
    borderLeftWidth: 2.2,
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 15,
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
    fontSize: 14,
    lineHeight: 21,
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
    gap: 9,
    paddingTop: 2,
  },
  resultStatItem: {
    minWidth: 76,
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
  resultNoChangesText: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(230, 238, 249, 0.72)',
    fontWeight: '700',
  },
  summaryTipCard: {
    marginTop: 2,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(123, 186, 255, 0.52)',
    backgroundColor: 'rgba(6, 19, 41, 0.8)',
  },
  summaryTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  summaryTipLabel: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '900',
    color: '#F4C542',
    letterSpacing: 0.5,
  },
  summaryTipText: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 19,
    color: '#EDF4FF',
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 20,
  },
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
  resultActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  resultActionRowFixed: {
    flexShrink: 0,
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(99, 154, 235, 0.24)',
    backgroundColor: 'rgba(5, 16, 35, 0.96)',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  resultFeedbackButton: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(122, 180, 238, 0.56)',
    backgroundColor: 'rgba(8, 27, 57, 0.9)',
  },
  resultFeedbackButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#BFDFFF',
  },
  resultContinueButton: {
    flex: 1,
    height: 48,
    marginTop: 0,
    paddingHorizontal: 12,
    paddingVertical: 0,
    borderRadius: 16,
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
  nextButtonText: {
    color: '#274A72',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  roadmapModalBackground: {
    flex: 1,
  },
  roadmapModalBackgroundImage: {
    resizeMode: 'cover',
  },
  roadmapModalScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(3, 9, 20, 0.78)',
  },
  roadmapModalSafeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  roadmapModalCard: {
    flexShrink: 1,
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.58)',
    backgroundColor: '#E9DEC9',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
    shadowColor: '#070B12',
    shadowOpacity: 0.42,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 30,
  },
  roadmapFixedHeader: {
    flexShrink: 0,
    paddingBottom: 10,
  },
  roadmapHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  roadmapHeaderCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },
  roadmapLocationTitle: {
    marginTop: 1,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '900',
    color: '#5F4B3B',
  },
  roadmapPersistentHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(130, 94, 64, 0.34)',
    backgroundColor: 'rgba(104, 73, 50, 0.82)',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  roadmapPersistentHintText: {
    flex: 1,
    color: '#FFF8EC',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
  },
  roadmapBody: {
    flex: 1,
    minHeight: 0,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  roadmapPaperFrame: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(112, 83, 58, 0.2)',
    backgroundColor: '#F2E7D5',
  },
  roadmapPaperTexture: {
    resizeMode: 'cover',
    opacity: 0.46,
  },
  roadmapEpisodeScroll: {
    flex: 1,
    minHeight: 0,
  },
  roadmapEpisodeContent: {
    paddingRight: 7,
    paddingBottom: 32,
  },
  roadmapWeekTabs: {
    width: 44,
    marginLeft: 7,
    gap: 4,
  },
  roadmapWeekTab: {
    flex: 1,
    minHeight: 42,
    maxHeight: 64,
    justifyContent: 'center',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: '#CDBA9C',
    borderTopRightRadius: 9,
    borderBottomRightRadius: 9,
    backgroundColor: '#E7D5B9',
    paddingHorizontal: 5,
    paddingVertical: 5,
  },
  roadmapWeekTabSelected: {
    borderColor: '#9570A6',
    backgroundColor: '#8A6798',
    shadowColor: '#7B3A9E',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 2, height: 2 },
    elevation: 3,
  },
  roadmapWeekTabLocked: {
    opacity: 0.58,
    backgroundColor: '#E1D4C0',
  },
  roadmapWeekTabTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  roadmapWeekTabTitle: {
    color: '#725F4C',
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '900',
  },
  roadmapWeekTabTitleSelected: {
    color: '#FFFFFF',
  },
  roadmapWeekTabRange: {
    marginTop: 2,
    color: '#9B866F',
    fontSize: 8,
    lineHeight: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  roadmapWeekTabRangeSelected: {
    color: '#F6EAFE',
  },
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
    backgroundColor: 'rgba(246, 234, 217, 0.86)',
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
    backgroundColor: 'rgba(255, 250, 240, 0.16)',
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
    color: '#655442',
    fontWeight: '800',
  },
});
