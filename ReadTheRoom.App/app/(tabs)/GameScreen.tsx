import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, StatusBar, Image, ScrollView, ImageSourcePropType } from 'react-native';
// Updated import for SafeAreaView to resolve the deprecation warning
import { SafeAreaView } from 'react-native-safe-area-context';
import scenariosData from '../../assets/data/scenarios.json';
// Expo Router specific tab settings
import { Tabs } from 'expo-router';

// 1. Define Data Types
type LocalizedText = { en: string; ko: string;};

type StatChanges = {
  funds: number;
  mental: number;
  english: number;
  insight: number;
  stamina: number;
}

type Choice = {
  text: LocalizedText;
  feedback: LocalizedText; // Feedback text after selecting this choice, can be used in the future to show feedback or animations
  statChanges: StatChanges; // The changes to the player's stats when this choice is selected
  nextScenarioId: number; // The ID of the next scenario to navigate to
};

type Scenario = {
  id: number;
  level: number; // Difficulty level (1-5)
  question: number; // Scenario number within the level
  description: LocalizedText; // The situation description
  choices: Choice[];
};

const SCENARIOS: Record<string, Scenario> = scenariosData as unknown as Record<string, Scenario>;

// 2. UI Texts Dictionary (for future localization)
const UI_TEXT = {
  en: {
    title: "Vancouver Survival Guide",
    switchLangBtn: "Switch to Korean",
    mentalHpLabel: "Mental",
    fundsLabel: "Funds",
    englishLabel: "English",
    insightLabel: "Insight",
    staminaLabel: "Stamina",
    gameOverDesc: "My body and mind are completely broken. I just want to give up and go home.",
    restartBtn: "Restart Game",
    nextBtn:"Next"
  },
  ko: {
    title: "밴쿠버 생존기",
    switchLangBtn: "영어로 전환",
    mentalHpLabel: "멘탈",
    fundsLabel: "자금",
    englishLabel: "영어",
    insightLabel: "눈치",
    staminaLabel: "체력",
    gameOverDesc: "몸도 마음도 지쳐버린 밴쿠버 생활에 힘들었어. 다시 돌아가고 싶어.",
    restartBtn: "처음부터 다시",
    nextBtn: "다음"
  }
};

// 3. Stat Configuration: color and icon for each stat, can be expanded in the future to include more stats or different UI representations
const STAT_CONFIG = {
  funds:   { color: '#F59F00', icon: require('../../assets/icon/funds.png') },
  mental:  { color: '#F03E3E', icon: require('../../assets/icon/mental.png') },
  english: { color: '#339AF0', icon: require('../../assets/icon/english.png') },
  insight: { color: '#BE4BDB', icon: require('../../assets/icon/insight.png') },
  stamina: { color: '#40C057', icon: require('../../assets/icon/stamina.png') },
} as const;

// const STAT_UI_TYPE: 'bar' | 'battery' = 'battery'; 
// Version 1: bar style is a horizontal gauge, 
const StatBar = ({ icon, label, value, max, color }: { icon: ImageSourcePropType, label: string, value: number, max: number, color: string }) => {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <View style={styles.statBox}>
      <View style={styles.iconLabelRow}>
        <Image source={icon} style={styles.statIcon} resizeMode="contain" />
        <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
      </View>
      <View style={styles.gaugeBackground}>
        <View style={[styles.gaugeFill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
};
// Version 2: battery style is a rectangular box with the value displayed on top of the gauge.
const StatBattery = ({ icon, label, value, max, color }: { icon: ImageSourcePropType, label: string, value: number, max: number, color: string }) => {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <View style={styles.statBox}>
      <View style={styles.iconLabelRow}>
        <Image source={icon} style={styles.statIcon} resizeMode="contain" />
        <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
      </View>
      <View style={styles.batteryBody}>
        <View style={[styles.batteryFill, { width: `${percentage}%`, backgroundColor: color }]} />
        <Text style={styles.batteryText}>{value}</Text>
      </View>
    </View>
  );
};

// 5. StatChageBadge component to show the stat changes after selecting a choice, can be used in the future to show floating badges or animations for stat changes
const StatChangeBadge = ({ statKey, value, label }: { statKey: keyof typeof STAT_CONFIG, value: number, label: string }) => {
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


export default function GameScreen() {
  // State Management
  const [lang, setLang] = useState<'en' | 'ko'>('en'); // Default language is English
  const [currentScenarioId, setCurrentScenarioId] = useState<number>(1);
  const [statUiType, setStatUiType] = useState<'bar' | 'battery'>('battery');
  const [stats, setStats] = useState<StatChanges>({
    funds: 1000,
    mental: 100,
    english: 30,
    insight: 50,
    stamina: 100,
  }); //1st stat change implementation for ken, can be expanded in the future for more complex stat management
   
  //Display result state for feedback after choice selection
  const [showResult, setShowResult] = useState<boolean>(false);
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const t = UI_TEXT[lang]; // Shorthand for current language texts
  // Get the current scenario object based on the ID
  const currentScenario = SCENARIOS[String(currentScenarioId)] || SCENARIOS['1']; // Fallback to scenario 1 if ID not found

  // Game Over Condition: If any of the main stats drop to 0 or below, the game is over.
  // This can be expanded in the future to include more complex conditions or additional stats.
  const isGameOver = stats.mental <= 0 || stats.stamina <= 0 || stats.funds <= 0 || stats.english <= 0 || stats.insight <= 0;

  // Function to determine the game over description based on which stat caused the game over, 
  // can be expanded in the future to include more detailed descriptions or different endings based on the player's stats and choices throughout the game.
  const getGameOverDesc = () => {
    if (stats.funds <= 0)   return lang === 'ko' ? '통장 잔고가 바닥났다. 밴쿠버는 돈 없으면 못 버틴다.' : 'Your bank account hit zero. Vancouver has no mercy for the broke.';
    if (stats.mental <= 0)  return lang === 'ko' ? '멘탈이 완전히 무너졌다. 이제 한국으로 돌아가고 싶다.' : 'Your mental health has collapsed. You just want to go home.';
    if (stats.stamina <= 0) return lang === 'ko' ? '체력이 바닥났다. 아파도 쉴 수가 없는 삶이었다.' : 'Your body gave out. There was no time to rest.';
    if (stats.english <= 0) return lang === 'ko' ? '영어에 완전히 자신을 잃었다. 아무것도 말할 수가 없다.' : 'You lost all confidence in English. Communication feels impossible.';
    if (stats.insight <= 0) return lang === 'ko' ? '눈치가 완전히 사라졌다. 모든 상황이 미스터리다.' : 'You lost all sense of reading the room. Everything feels foreign.';
    return t.gameOverDesc;
  };

  //Function to toggle language
  const toggleLanguage = () => {
    setLang(prevLang => (prevLang === 'en' ? 'ko' : 'en'));
  };

  // Function to toggle between stat UI types (bar and battery)
  const toggleStatUiType = () => {
    setStatUiType(prev => (prev === 'bar' ? 'battery' : 'bar'));
  };

  // Function to handle choice selection
  const handleChoice = (choice: Choice) => {
    // Update stats based on the choice's stat changes
    setStats(prev => ({
      funds: prev.funds + (choice.statChanges.funds || 0),
      mental: Math.max(0, Math.min(100, prev.mental + (choice.statChanges.mental || 0))),
      english: Math.max(0, Math.min(100, prev.english + (choice.statChanges.english || 0))),
      insight: Math.max(0, Math.min(100, prev.insight + (choice.statChanges.insight || 0))),
      stamina: Math.max(0, Math.min(100, prev.stamina + (choice.statChanges.stamina || 0))),
    }));
 
    setSelectedChoice(choice);
    setShowResult(true); // Show result feedback after choice selection
  };

  const proceedToNextScenario = () => {
    if (selectedChoice) {
      setCurrentScenarioId(selectedChoice.nextScenarioId);        
    } 
    setShowResult(false); // Hide result feedback when moving to the next scenario
    setSelectedChoice(null); // Reset selected choice for the next scenario
  };

  const restartGame = () => {
    setStats({ funds: 1000, mental: 100, english: 30, insight: 50, stamina: 100 });
    setCurrentScenarioId(1);
    setShowResult(false);
    setSelectedChoice(null);
  };

  // Function to determine the border color of the result feedback based on whether the overall stat changes are positive or negative
  // Positive changes will have a green border, while negative changes will have a blue border.
  const getFeedbackBorderColor = (choice: Choice) => {
    const total = Object.values(choice.statChanges).reduce((a, b) => a + b, 0);
    return total >= 0 ? '#40C057' : '#228BE6';
  };

  return (
   // SafeAreaView fix: Add edges={['top']} to prevent overlap with status bar
  <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Hide Expo Router default header to prevent double header issue */}
      <Tabs.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t.title}</Text>
          <TouchableOpacity style={styles.langButton} onPress={toggleLanguage}>
            <Text style={styles.langButtonText}>{t.switchLangBtn}</Text>
          </TouchableOpacity>
        </View>

        {/* Status Container */}
        <TouchableOpacity 
          style={styles.statusContainer} 
          onPress={toggleStatUiType} 
          activeOpacity={0.9} // 클릭할 때 살짝 깜빡이는 효과 (1에 가까울수록 효과 적음)
        >
          {statUiType === 'bar' ? (
            <>
              <StatBar icon={STAT_CONFIG.funds.icon} label={t.fundsLabel} value={stats.funds} max={1000} color={STAT_CONFIG.funds.color} />
              <StatBar icon={STAT_CONFIG.mental.icon} label={t.mentalHpLabel} value={stats.mental} max={100} color={STAT_CONFIG.mental.color} />
              <StatBar icon={STAT_CONFIG.english.icon} label={t.englishLabel} value={stats.english} max={100} color={STAT_CONFIG.english.color} />
              <StatBar icon={STAT_CONFIG.insight.icon} label={t.insightLabel} value={stats.insight} max={100} color={STAT_CONFIG.insight.color} />
              <StatBar icon={STAT_CONFIG.stamina.icon} label={t.staminaLabel} value={stats.stamina} max={100} color={STAT_CONFIG.stamina.color} />
            </>
          ) : (
            <>
              <StatBattery icon={STAT_CONFIG.funds.icon} label={t.fundsLabel} value={stats.funds} max={1000} color={STAT_CONFIG.funds.color} />
              <StatBattery icon={STAT_CONFIG.mental.icon} label={t.mentalHpLabel} value={stats.mental} max={100} color={STAT_CONFIG.mental.color} />
              <StatBattery icon={STAT_CONFIG.english.icon} label={t.englishLabel} value={stats.english} max={100} color={STAT_CONFIG.english.color} />
              <StatBattery icon={STAT_CONFIG.insight.icon} label={t.insightLabel} value={stats.insight} max={100} color={STAT_CONFIG.insight.color} />
              <StatBattery icon={STAT_CONFIG.stamina.icon} label={t.staminaLabel} value={stats.stamina} max={100} color={STAT_CONFIG.stamina.color} />
            </>
          )}
        </TouchableOpacity>

        {/* Scenario Container */}
        <View style={styles.scenarioContainer}>
          <View style={[styles.scenarioCard, isGameOver && styles.gameOverCard]}>
            {/* Display level and quest number on the screen */}
            {!isGameOver && (
              <Text style={styles.levelText}>
                {lang === 'ko' 
                  ? `상황 ${currentScenario.level} - 퀘스트 ${currentScenario.question}` 
                  : `Level ${currentScenario.level} - Quest ${currentScenario.question}`}
              </Text>
            )}
            
            <Text style={styles.scenarioText}>
              {isGameOver ? getGameOverDesc() : currentScenario.description[lang]}
            </Text>
          </View>
        </View>
        
        {/* Choices Container */}
         <ScrollView style={styles.choicesContainer} contentContainerStyle={{ paddingBottom: 30 }}>
          {isGameOver ? (
            <View style={styles.gameOverContainer}>
              <Image 
                source={require('../../assets/UI/GameOver.png')}
                style={styles.gameOverImage} 
                resizeMode="contain"
              />
              <TouchableOpacity style={styles.restartButton} onPress={restartGame}>
                <Text style={styles.restartButtonText}>{t.restartBtn}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* 1. Selection Options */}
              {currentScenario.choices.map((choice, index) => {
                // Hide unselected choices after selection to focus on the selected choice and its feedback. 
                // This also prevents confusion about which choice was selected, especially if the stat changes are significant. 
                // This can be adjusted in the future to show all choices with the selected one highlighted instead, 
                // depending on user feedback and design preferences.
                if (showResult && selectedChoice !== choice) return null;

                return (
                  <TouchableOpacity 
                    key={index} 
                    // Highlight the selected choice button after selection, and disable all buttons to prevent multiple selections until the next scenario loads
                    style={[styles.choiceButton, showResult && styles.choiceButtonSelected]}
                    disabled={showResult}
                    onPress={() => handleChoice(choice)}
                  >
                    <Text style={styles.choiceText}>{choice.text[lang]}</Text>
                  </TouchableOpacity>
                );
              })}

              {/* Result Feedback */}
              {showResult && selectedChoice && (
                <View style={[styles.resultContainer, { borderLeftColor: getFeedbackBorderColor(selectedChoice) }]}>
                    {/* Feedback */}
                    <Text style={styles.resultDescText}>{selectedChoice.feedback[lang]}</Text>

                    {/* Stat Changes */}
                    <View style={styles.badgeRow}>
                      <StatChangeBadge statKey="funds"   value={selectedChoice.statChanges.funds}   label={t.fundsLabel} />
                      <StatChangeBadge statKey="mental"  value={selectedChoice.statChanges.mental}  label={t.mentalHpLabel} />
                      <StatChangeBadge statKey="english" value={selectedChoice.statChanges.english} label={t.englishLabel} />
                      <StatChangeBadge statKey="insight" value={selectedChoice.statChanges.insight} label={t.insightLabel} />
                      <StatChangeBadge statKey="stamina" value={selectedChoice.statChanges.stamina} label={t.staminaLabel} />
                    </View>

                    <TouchableOpacity style={styles.nextButton} onPress={proceedToNextScenario}>
                      <Text style={styles.nextButtonText}>{t.nextBtn} →</Text>
                    </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </ScrollView>

      </View>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  // 1. Core Wrappers
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flex: 1 },

  // 2. Top Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', elevation: 2 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  langButton: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#e9ecef', borderRadius: 20 },
  langButtonText: { fontSize: 12, fontWeight: '600', color: '#495057' },

  // 3. Status Style  
  statusContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: 12, backgroundColor: '#343a40' },
  statBox: { flex: 1, alignItems: 'center', marginHorizontal: 3 },
  iconLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  statIcon: { width: 14, height: 14, marginRight: 4 },
  statLabel: { fontSize: 11, fontWeight: 'bold', color: '#fff' },

  // Bar Style
  gaugeBackground: { height: 8, width: '100%', backgroundColor: '#495057', borderRadius: 4, overflow: 'hidden', marginBottom: 4 },
  gaugeFill: { height: '100%', borderRadius: 4 },
  statValue: { fontSize: 10, color: '#adb5bd', fontWeight: 'bold' },

  // Battery Style
  batteryBody: { height: 20, width: '100%', backgroundColor: '#495057', borderRadius: 4, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  batteryFill: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  batteryText: { fontSize: 11, fontWeight: 'bold', color: '#fff', textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 2, zIndex: 1 },

  // 4. Scenario Area
   scenarioContainer: { padding: 20, justifyContent: 'center' },
  // Added minHeight and justifyContent to prevent crushing
  scenarioCard: { backgroundColor: 'white', padding: 25, borderRadius: 12, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, minHeight: 160, justifyContent: 'center' },
  gameOverCard: { borderWidth: 2, borderColor: '#F44336', backgroundColor: '#fff5f5' }, // Game over card style
  levelText: { fontSize: 14, color: '#888', marginBottom: 10, fontWeight: 'bold', textAlign: 'center' },
  scenarioText: { fontSize: 18, color: '#000000', lineHeight: 28, textAlign: 'center', fontWeight: '500' },

  // 5. Choice Buttons
  //choicesContainer: { padding: 20, paddingBottom: 30, backgroundColor: '#f8f9fa' },
  choicesContainer: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  choiceButton: { backgroundColor: '#228BE6', padding: 15, borderRadius: 12, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3 },
  choiceButtonSelected: { backgroundColor: '#1864AB', elevation: 0 },
  choiceText: { color: 'white', textAlign: 'center', fontSize: 16, fontWeight: 'bold' },

  // 6. Game Over Styles
  gameOverContainer: { alignItems: 'center', paddingVertical: 10},
  gameOverImage: { width: 300, height: 180, marginBottom: 10 },
  gameOverTitle: { fontSize: 32, fontWeight: 'bold', color: '#F44336', marginBottom: 5 },
  restartButton: { backgroundColor: '#333', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30, elevation: 3 },
  restartButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  // 7. Result Feedback Styles
  resultContainer: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e9ecef', borderLeftWidth: 4, padding: 18, marginTop: 4 },
  resultDescText: { fontSize: 15, color: '#1a1a1a', lineHeight: 23, marginBottom: 14, fontWeight: '500', textAlign: 'center' },

  //8. Stat Change Badge Styles
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 16 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 5, paddingHorizontal: 11, borderRadius: 20 },
  badgePositive: { backgroundColor: '#f0fff4' },
  badgeNegative: { backgroundColor: '#fff0f0' },
  badgeDot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: { fontSize: 13, fontWeight: '600' },
  badgeTextPositive: { color: '#2f9e44' },
  badgeTextNegative: { color: '#c92a2a' },

  // 9. Next Button Style
  nextButton: { backgroundColor: '#1976d2', padding: 15, borderRadius: 12, alignItems: 'center' },
  nextButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },  
});