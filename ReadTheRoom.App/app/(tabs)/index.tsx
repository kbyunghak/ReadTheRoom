import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, StatusBar, Image } from 'react-native';
// Updated import for SafeAreaView to resolve the deprecation warning
import { SafeAreaView } from 'react-native-safe-area-context';

// 1. Define Data Types
type LocalizedText = { en: string; ko: string;};

type Choice = {
  text: LocalizedText;
  hpChange: number; // HP change upon selection
  nextScenarioId: number; // The ID of the next scenario to navigate to
};

type Scenario = {
  id: number;
  description: LocalizedText; // The situation description
  choices: Choice[];
};

// 2. UI Texts Dictionary (for future localization)
const UI_TEXT = {
  en: {
    title: "Vancouver Survival Guide",
    switchLangBtn: "Switch to Korean",
    mentalHpLabel: "Mental HP",
    gameOverDesc: "My body and mind are completely broken. I just want to give up and go home.",
    restartBtn: "Restart Game",
  },
  ko: {
    title: "밴쿠버 생존기",
    switchLangBtn: "영어로 전환",
    mentalHpLabel: "멘탈 체력",
    gameOverDesc: "몸도 마음도 지쳐버린 밴쿠버 생활에 힘들었어. 다시 돌아가고 싶어.",
    restartBtn: "처음부터 다시",
  }
};

// 3. Dummy Scenario Data (for testing and development)
const DUMMY_SCENARIOS: Record<number, Scenario> = {
  1: {
    id: 1,
    description: {
      en: "You are looking for a room on Craigslist. You find a 'cozy' basement with no windows. The rent is $1,500/month, utilities not included.",
      ko: "크레이그리스트에서 방을 구하고 있다. 창문 하나 없는 '아늑한' 베이스먼트가 한 달에 1500불이다. 유틸리티는 별도다."
    },
    choices: [
      { text: { en: "Sign the contract before someone else takes it.", ko: "누가 채갈까 봐 서둘러 계약한다." }, hpChange: -15, nextScenarioId: 2 },
      { text: { en: "Give up and search for a shared room with 3 others.", ko: "포기하고 거실 쉐어룸을 알아본다." }, hpChange: -20, nextScenarioId: 2 },
    ],
  },
  2: {
    id: 2,
    description: {
      en: "It's November in 'Raincouver'. It's been raining for 14 days straight. You are waiting for the bus, but three full buses just pass you by.",
      ko: "11월의 '레인쿠버'. 2주째 비가 내리고 있다. 버스를 기다리는데, 만원 버스 세 대가 당신을 그냥 지나쳐 간다."
    },
    choices: [
      { text: { en: "Walk 40 minutes in the freezing rain.", ko: "차가운 비를 맞으며 40분을 걸어간다." }, hpChange: -20, nextScenarioId: 3 },
      { text: { en: "Call an Uber with surge pricing ($45).", ko: "눈물을 머금고 45불짜리 우버를 부른다." }, hpChange: -10, nextScenarioId: 3 },
    ],
  },
  3: {
    id: 3,
    description: {
      en: "You caught a bad flu. You go to a walk-in clinic at 9 AM, but the receptionist says, 'We are full for the day. Come line up at 6 AM tomorrow.'",
      ko: "독감에 심하게 걸렸다. 아침 9시에 워크인 클리닉에 갔지만, 리셉셔니스트가 말한다. '오늘 마감됐어요. 내일 새벽 6시에 와서 줄 서세요.'"
    },
    choices: [
      { text: { en: "Buy Advil at Shoppers and endure the pain.", ko: "샤퍼스에서 애드빌을 사서 깡으로 버틴다." }, hpChange: -25, nextScenarioId: 4 },
      { text: { en: "Wait 8 hours at the ER.", ko: "응급실에 가서 8시간 동안 대기한다." }, hpChange: -30, nextScenarioId: 4 },
    ]
  },
  4: {
    id: 4,
    description: {
      en: "You went to a cafe to cheer yourself up. A simple coffee and a muffin cost $15, and the terminal asks for a 20%, 25%, or 30% tip.",
      ko: "기분 전환 겸 카페에 왔다. 커피와 머핀 하나가 15불인데, 결제 단말기에는 팁 20%, 25%, 30% 버튼이 떠 있다."
    },
    choices: [
      { text: { en: "Awkwardly press 'Custom Tip' and enter 15%.", ko: "눈치를 보며 'Custom Tip'을 눌러 15%를 준다." }, hpChange: -10, nextScenarioId: 5 },
      { text: { en: "Press 20% out of pressure and skip dinner.", ko: "압박감에 20%를 누르고 오늘 저녁을 굶는다." }, hpChange: -15, nextScenarioId: 5 },
    ]
  },
  5: {
    id: 5,
    description: {
      en: "Grocery shopping day. You pick up a pack of chicken breasts, but it's $25. The cost of living is suffocating.",
      ko: "장보는 날. 닭가슴살 한 팩을 집어 들었는데 25불이다. 숨 막히는 물가에 정신이 아득해진다."
    },
    choices: [
      { text: { en: "Put it back and buy instant noodles instead.", ko: "조용히 내려놓고 라면 코너로 향한다." }, hpChange: -15, nextScenarioId: 1 }, // 다시 1번으로 루프하거나 다른 엔딩으로
      { text: { en: "Buy it, convincing yourself it's an 'investment'.", ko: "이건 나를 위한 '투자'라고 자기합리화하며 산다." }, hpChange: -10, nextScenarioId: 1 },
    ]
  }
};

export default function GameScreen() {
  // State Management
  const [lang, setLang] = useState<'en' | 'ko'>('en'); // Default language is English
  const [currentScenarioId, setCurrentScenarioId] = useState<number>(1);
  const [mentalHP, setMentalHP] = useState<number>(100);

  const t = UI_TEXT[lang]; // Shorthand for current language texts
  // Get the current scenario object based on the ID
  const currentScenario = DUMMY_SCENARIOS[currentScenarioId] || DUMMY_SCENARIOS[1];
  //Game Over Condition
  const isGameOver = mentalHP <= 0;

  //Function to toggle language
  const toggleLanguage = () => {
    setLang(prevLang => (prevLang === 'en' ? 'ko' : 'en'));
  };

  // Function to handle choice selection
  const handleChoice = (choice: Choice) => {
    // 1. Calculate new HP (keep it strictly between 0 and 100)
    const newHP = Math.max(0, Math.min(100, mentalHP + choice.hpChange));
    setMentalHP(newHP);
    // 2. Navigate to the next scenario
    setCurrentScenarioId(choice.nextScenarioId);
  };

  const restartGame = () => {
    setMentalHP(100);
    setCurrentScenarioId(1);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t.title}</Text>
          <TouchableOpacity style={styles.langButton} onPress={toggleLanguage}>
            <Text style={styles.langButtonText}>{t.switchLangBtn}</Text>
          </TouchableOpacity>
        </View>

        {/* Status Container */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{t.mentalHpLabel}: {mentalHP}%</Text>
          <View style={styles.hpBarBackground}>
            <View style={[styles.hpBarFill, { width: `${mentalHP}%` }, isGameOver && styles.hpBarDanger]} />
          </View>
        </View>

        {/* Scenario Container */}
        <View style={styles.scenarioContainer}>
          <View style={[styles.scenarioCard, isGameOver && styles.gameOverCard]}>            
            <Text style={styles.scenarioText}>
              {isGameOver ? t.gameOverDesc : currentScenario.description[lang]}
            </Text>
          </View>
        </View>
        
        {/* Choices Container */}
        <View style={styles.choicesContainer}>
          {isGameOver ? (
            <View style={styles.gameOverContainer}>
              <Image 
                source={require('../../assets/UI/GameOver.png')}
                style={styles.gameOverImage} 
                resizeMode="contain"
              />
              {/* <Text style={styles.gameOverTitle}>GAME OVER</Text> */}
              <TouchableOpacity style={styles.restartButton} onPress={restartGame}>
                <Text style={styles.restartButtonText}>{t.restartBtn}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            currentScenario.choices.map((choice, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.choiceButton}
                onPress={() => handleChoice(choice)}
              >
                <Text style={styles.choiceText}>{choice.text[lang]}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

      </View>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  // 1. Core Wrappers
  safeArea: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  container: { flex: 1 },

  // 2. Top Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', elevation: 2 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  langButton: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#e9ecef', borderRadius: 20 },
  langButtonText: { fontSize: 12, fontWeight: '600', color: '#495057' },

  // 3. Status Bar
  statusContainer: { padding: 20, backgroundColor: '#fff', paddingBottom: 10 },
  statusText: { fontSize: 14, color: '#666', marginBottom: 5 },
  hpBarBackground: { height: 10, backgroundColor: '#e9ecef', borderRadius: 5, overflow: 'hidden' },
  hpBarFill: { height: '100%', backgroundColor: '#4CAF50' },
  hpBarDanger: { backgroundColor: '#F44336' }, // Red color when HP is low (added for better visual feedback)

  // 4. Scenario Area
  scenarioContainer: { flex: 1, padding: 20, justifyContent: 'center' },
  scenarioCard: { backgroundColor: 'white', padding: 25, borderRadius: 12, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  gameOverCard: { borderWidth: 2, borderColor: '#F44336', backgroundColor: '#fff5f5' }, // Game over card style
  scenarioText: { fontSize: 18, color: '#000000', lineHeight: 28, textAlign: 'center', fontWeight: '500' },

  // 5. Choice Buttons
  choicesContainer: { padding: 20, paddingBottom: 30, backgroundColor: '#f8f9fa' },
  choiceButton: { backgroundColor: '#228BE6', padding: 15, borderRadius: 12, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3 },
  choiceText: { color: 'white', textAlign: 'center', fontSize: 16, fontWeight: 'bold' },

  // 6. Game Over Styles
  gameOverContainer: { alignItems: 'center', paddingVertical: 10},
  gameOverImage: { width: 300, height: 180, marginBottom: 10 },
  gameOverTitle: { fontSize: 32, fontWeight: 'bold', color: '#F44336', marginBottom: 5 },
  restartButton: { backgroundColor: '#333', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30, elevation: 3 },
  restartButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});