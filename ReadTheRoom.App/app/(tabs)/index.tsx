import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, StatusBar, Image } from 'react-native';
// Updated import for SafeAreaView to resolve the deprecation warning
import { SafeAreaView } from 'react-native-safe-area-context';

// 1. Define Data Types (TypeScript)
type Choice = {
  text: string;
  hpChange: number; // HP change upon selection (can be positive or negative)
  nextScenarioId: number; // The ID of the next scenario to navigate to
};

type Scenario = {
  id: number;
  description: string; // The situation description
  choices: Choice[];
};

// 2. Dummy Data - Expanded for better flow testing
const DUMMY_SCENARIOS: Record<number, Scenario> = {
  1: {
    id: 1,
    description: "Company dinner. The boss makes a terrible dad joke and looks at you. The room goes dead silent.",
    choices: [
      { text: "Laugh out loud and agree.", hpChange: -10, nextScenarioId: 2 },
      { text: "Pretend you didn't hear and look at your phone.", hpChange: -20, nextScenarioId: 3 },
      { text: "Quietly escape to the restroom.", hpChange: 0, nextScenarioId: 4 },
    ],
  },
  2: {
    id: 2,
    description: "The boss gets excited and continues with a second and third joke. Your coworkers glare at you with resentment...",
    choices: [
      { text: "Try to change the subject to work.", hpChange: -15, nextScenarioId: 5 },
      { text: "Keep laughing nervously.", hpChange: -20, nextScenarioId: 6 },
    ],
  },
  3: {
    id: 3,
    description: "The boss singles you out. 'Hey, wasn't that funny?' You can feel the tension.",
    choices: [
      { text: "Apologize and say you missed it.", hpChange: -10, nextScenarioId: 5 },
      { text: "Give a fake, awkward smile.", hpChange: -15, nextScenarioId: 6 },
    ]
  },
  4: {
    id: 4,
    description: "You successfully escaped, but now you have to stay in the restroom for at least 10 minutes.",
    choices: [
      { text: "Wait patiently and check social media.", hpChange: +10, nextScenarioId: 7 },
      { text: "Go back out immediately.", hpChange: -10, nextScenarioId: 5 },
    ]
  },
  // --- NEW SCENARIOS ADDED BELOW ---
  5: {
    id: 5,
    description: "You managed to shift the focus, but now the boss is passionately talking about the Q3 performance report.",
    choices: [
      { text: "Nod vigorously like you care.", hpChange: -5, nextScenarioId: 1 },
      { text: "Pour him another drink to keep him talking.", hpChange: 0, nextScenarioId: 1 },
    ]
  },
  6: {
    id: 6,
    description: "Suddenly, a coworker 'accidentally' spills a glass of water, breaking the awkward atmosphere. A true hero!",
    choices: [
      { text: "Quickly help clean it up.", hpChange: +15, nextScenarioId: 1 },
      { text: "Use the chaos to sneak away.", hpChange: +5, nextScenarioId: 1 },
    ]
  },
  7: {
    id: 7,
    description: "While hiding in the restroom stall, you receive a text from a coworker: 'Where are you? Save me...'",
    choices: [
      { text: "Reply 'Stay strong' and ignore it.", hpChange: +5, nextScenarioId: 1 },
      { text: "Take a deep breath and return to the battlefield.", hpChange: -10, nextScenarioId: 5 },
    ]
  }
};

export default function GameScreen() {
  // State Management
  const [currentScenarioId, setCurrentScenarioId] = useState<number>(1);
  const [mentalHP, setMentalHP] = useState<number>(100);

  // Get the current scenario object based on the ID
  const currentScenario = DUMMY_SCENARIOS[currentScenarioId] || DUMMY_SCENARIOS[1];

  //Game Over Condition
  const isGameOver = mentalHP <= 0;

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
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Read the Room</Text>
          <TouchableOpacity style={styles.langButton}>
            <Text style={styles.langButtonText}>Switch to Korean</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>Mental HP: {mentalHP}%</Text>
          <View style={styles.hpBarBackground}>
            <View style={[styles.hpBarFill, { width: `${mentalHP}%` }, isGameOver && styles.hpBarDanger]} />
          </View>
        </View>

        <View style={styles.scenarioContainer}>
          <View style={[styles.scenarioCard, isGameOver && styles.gameOverCard]}>            
            <Text style={styles.scenarioText}>
              {isGameOver ? "My body and mind are completely broken. I just want to give up and go home." : currentScenario.description}
            </Text>
          </View>
        </View>
        
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
                <Text style={styles.restartButtonText}>Restart Game</Text>
              </TouchableOpacity>
            </View>
          ) : (
            currentScenario.choices.map((choice, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.choiceButton}
                onPress={() => handleChoice(choice)}
              >
                <Text style={styles.choiceText}>{choice.text}</Text>
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