import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, SafeAreaView, Platform, StatusBar } from 'react-native';
import axios from 'axios';
import { LanguageStrings } from '../../constants/LanguageStrings';

interface GameLog {
  id: number;
  userChoice: string;
  narrative: string;
  hpChange: number;
  isGameOver: boolean;
}

interface ApiResponse {
  narrative: string;
  hp_change: number;
  is_game_over: boolean;
}


type LanguageType = keyof typeof LanguageStrings;

export default function App() {
  const [inputText, setInputText] = useState('');
 const [gameLogs, setGameLogs] = useState<GameLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLang, setCurrentLang] = useState<LanguageType>('Korean'); // Default Language

  const uiText = LanguageStrings[currentLang];

  if (!uiText) {
    return <View><Text>Loading language settings...</Text></View>;
  }

  // Android Emulator: 'http://10.0.2.2:7114/api/AnalyzeChoice'
  // iOS Simulator: 'http://localhost:7114/api/AnalyzeChoice'
  const API_URL = 'http://10.0.2.2:7114/api/AnalyzeChoice'; 

  const toggleLanguage = () => {
    setCurrentLang((prev) => (prev === 'Korean' ? 'English' : 'Korean'));
  };

  const handleSend = async () => {
    if (!inputText.trim()) {
      Alert.alert(uiText.alertTitle, uiText.alertMessage);
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        choice: inputText,
        lang: currentLang 
      };

      const response = await axios.post<ApiResponse>(API_URL, payload);
      const result = response.data;

      const newLog: GameLog = {
        id: Date.now(),
        userChoice: inputText,
        narrative: result.narrative,
        hpChange: result.hp_change,
        isGameOver: result.is_game_over
      };

      setGameLogs([newLog, ...gameLogs]); 
      setInputText(''); 

      if (result.is_game_over) {
        Alert.alert("GAME OVER", "You failed to read the room...");
      }

    } catch (error) {
      console.error('API Error:', error);
      Alert.alert('Error', 'Failed to connect to the Game Master.\nIs the server running?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{uiText.appTitle}</Text>
          <TouchableOpacity onPress={toggleLanguage} style={styles.langButton}>
            <Text style={styles.langButtonText}>{uiText.langButton}</Text>
          </TouchableOpacity>
        </View>

        {/* HP Bar */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{uiText.hpLabel}: 100%</Text>
          <View style={styles.hpBarBackground}>
            <View style={[styles.hpBarFill, { width: '100%' }]} />
          </View>
        </View>

        {/* Chat Log */}
        <ScrollView style={styles.logContainer}>
          {gameLogs.map((log) => (
            <View key={log.id} style={[styles.logCard, log.isGameOver && styles.gameOverCard]}>
              <Text style={styles.userText}>You: {log.userChoice}</Text>
              <View style={styles.divider} />
              <Text style={styles.aiText}>{log.narrative}</Text>
              <Text style={[
                styles.hpText, 
                { color: log.hpChange >= 0 ? '#4CAF50' : '#F44336' }
              ]}>
                HP {log.hpChange > 0 ? '+' : ''}{log.hpChange}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={uiText.placeholder}
            value={inputText}
            onChangeText={setInputText}
            editable={!isLoading}
          />
          <TouchableOpacity 
            style={[styles.sendButton, isLoading && styles.disabledButton]} 
            onPress={handleSend} 
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.sendButtonText}>{uiText.sendButton}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', elevation: 2 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  langButton: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#e9ecef', borderRadius: 20 },
  langButtonText: { fontSize: 12, fontWeight: '600', color: '#495057' },
  statusContainer: { padding: 20, backgroundColor: '#fff', paddingBottom: 10 },
  statusText: { fontSize: 14, color: '#666', marginBottom: 5 },
  hpBarBackground: { height: 10, backgroundColor: '#e9ecef', borderRadius: 5, overflow: 'hidden' },
  hpBarFill: { height: '100%', backgroundColor: '#4CAF50' },
  logContainer: { flex: 1, padding: 20 },
  logCard: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  gameOverCard: { borderWidth: 2, borderColor: '#F44336' },
  userText: { fontSize: 16, color: '#212529', fontWeight: 'bold' },
  aiText: { fontSize: 15, color: '#495057', marginTop: 8, lineHeight: 22 },
  hpText: { fontSize: 14, fontWeight: 'bold', marginTop: 8, textAlign: 'right' },
  divider: { height: 1, backgroundColor: '#f1f3f5', marginVertical: 10 },
  inputContainer: { flexDirection: 'row', padding: 15, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e9ecef' },
  input: { flex: 1, backgroundColor: '#f8f9fa', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 10, marginRight: 10, borderWidth: 1, borderColor: '#ced4da' },
  sendButton: { backgroundColor: '#228BE6', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  disabledButton: { backgroundColor: '#adb5bd' },
  sendButtonText: { color: 'white', fontWeight: 'bold', fontSize: 12 } 
});