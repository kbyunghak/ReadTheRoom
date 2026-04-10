import React, { useState } from 'react';
import {
  View, Text, Image, StyleSheet, TouchableOpacity,
  ScrollView, Dimensions, ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
// Character card width - shows 3 full cards + peek of next card on screen
const CARD_WIDTH = (width - 48) / 3.3; // 48 = horizontal padding, 3.3 to show 3 cards + peek

// Character data structure
export type Character = {
  id: string;
  name: string;
  nameEn: string;
  age: string;
  tagline: string;
  taglineKo: string;
  image: ImageSourcePropType; // Character card image
  portraitImage: ImageSourcePropType; // Detail screen full image
  description: string[];
  stats: { label: string; labelEn: string; value: number; max: number; color: string }[];
  startingStats: { funds: number; mental: number; english: number; insight: number; stamina: number };
  trait: string; // Starting occupation/background
};

export const CHARACTERS: Character[] = [
  {
    id: 'ken',
    name: '켄',
    nameEn: 'Ken',
    age: '20세 (남)',
    tagline: '철없는 유학생',
    taglineKo: '대학교 1학년 유학생 생활 시작',
    image: require('../../assets/characters/ken_card.png'),
    portraitImage: require('../../assets/characters/ken_portrait.png'),
    description: [
      '한국에서 온 20세 대학생 (남)',
      '캐나다 밴쿠버에 온 지 얼마 안 됨',
      '영어 자신감 높음; 낙천적, 무난한 성격',
    ],
    stats: [
      { label: '영어 자신감', labelEn: 'English', value: 625, max: 1000, color: '#339AF0' },
      { label: '눈치', labelEn: 'Insight', value: 425, max: 1000, color: '#BE4BDB' },
      { label: '체력', labelEn: 'Stamina', value: 575, max: 1000, color: '#40C057' },
      { label: '멘탈', labelEn: 'Mental', value: 500, max: 1000, color: '#F03E3E' },
      { label: '자금', labelEn: 'Funds', value: 487, max: 1000, color: '#F59F00' },
    ],
    startingStats: { funds: 1000, mental: 100, english: 30, insight: 50, stamina: 100 },
    trait: '유학생',
  },
  {
    id: 'amy',
    name: '에이미',
    nameEn: 'Amy',
    age: '28세 (여)',
    tagline: '상계를 위협던',
    taglineKo: '다운타운 카페에서 바리스타',
    image: require('../../assets/characters/amy_card.png'),
    portraitImage: require('../../assets/characters/amy_portrait.png'),
    description: [
      '해외에서 방황하다 밴쿠버로 이주',
      '커피를 좋아하며 3년차 바리스타',
      '적응력 높고 맷집 좋은 성격',
    ],
    stats: [
      { label: '성찰력', labelEn: 'Insight', value: 800, max: 1000, color: '#40C057' },
      { label: '증명관', labelEn: 'English', value: 450, max: 1000, color: '#339AF0' },
      { label: '체력', labelEn: 'Stamina', value: 425, max: 1000, color: '#40C057' },
      { label: '멘탈', labelEn: 'Mental', value: 600, max: 1000, color: '#F03E3E' },
      { label: '자금', labelEn: 'Funds', value: 300, max: 1000, color: '#F59F00' },
    ],
    startingStats: { funds: 600, mental: 100, english: 60, insight: 80, stamina: 80 },
    trait: '바리스타',
  },
  {
    id: 'sora',
    name: '소라',
    nameEn: 'Sora',
    age: '32세 (여)',
    tagline: '초보 주부',
    taglineKo: '유학맘 육아 & 살림 초보 주부',
    image: require('../../assets/characters/sora_card.png'),
    portraitImage: require('../../assets/characters/sora_portrait.png'),
    description: [
      '신혼 생활 중 6세 아들 기현 엄마',
      '남편 따라 밴쿠버에 왔다 적응 중',
      '대인관계 좋고 다정한 성격',
    ],
    stats: [
      { label: '정보력', labelEn: 'Insight', value: 725, max: 1000, color: '#BE4BDB' },
      { label: '멘탈', labelEn: 'Mental', value: 200, max: 1000, color: '#F03E3E' },
    ],
    startingStats: { funds: 800, mental: 60, english: 20, insight: 70, stamina: 70 },
    trait: '유학맘',
  },
  {
    id: 'jun',
    name: '준',
    nameEn: 'Jun',
    age: '42세 (남)',
    tagline: '생계형 이민자 아빠',
    taglineKo: '직업: 물류센터 작업',
    image: require('../../assets/characters/jun_card.png'),
    portraitImage: require('../../assets/characters/jun_portrait.png'),
    description: [
      '밴쿠버 정착 10년 차 가장',
      '물류센터에서 장시간 노동',
      '가족을 위해 체력으로 버티는 삶',
    ],
    stats: [
      { label: '체력', labelEn: 'Stamina', value: 900, max: 1000, color: '#40C057' },
      { label: '자금', labelEn: 'Funds', value: 500, max: 1000, color: '#F59F00' },
    ],
    startingStats: { funds: 500, mental: 70, english: 40, insight: 60, stamina: 100 },
    trait: '이민자',
  },
  {
    id: 'jin',
    name: '진',
    nameEn: 'Jin',
    age: '68세 (여)',
    tagline: '밴쿠버 호호할머니',
    taglineKo: '직업: 손주 돌보는 할머니',
    image: require('../../assets/characters/jin_card.png'),
    portraitImage: require('../../assets/characters/jin_portrait.png'),
    description: [
      '밴쿠버 이민 20년 차 시니어',
      '낯선 타국에서 손주를 돌봄',
      '인간미 넘치는 따뜻한 할머니',
    ],
    stats: [
      { label: '인지력', labelEn: 'Insight', value: 725, max: 1000, color: '#BE4BDB' },
      { label: '인간관계', labelEn: 'Mental', value: 700, max: 1000, color: '#F03E3E' },
    ],
    startingStats: { funds: 400, mental: 80, english: 10, insight: 80, stamina: 60 },
    trait: '시니어',
  },
];

type Props = {
  onSelectCharacter: (character: Character) => void;
  lang: 'en' | 'ko';
};

export default function CharacterSelectScreen({ onSelectCharacter, lang }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>

        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerSub}>
            {lang === 'ko' ? '당신의 이야기를 선택하세요' : 'Choose your story'}
          </Text>
          <Text style={styles.headerTitle}>
            {lang === 'ko' ? '캐릭터 선택' : 'Select Character'}
          </Text>
        </View>

        {/* Character Cards Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          snapToInterval={CARD_WIDTH + 12} // CARD_WIDTH + gap
          decelerationRate="fast"
        >
          {CHARACTERS.map((char) => (
            <TouchableOpacity
              key={char.id}
              style={[styles.card, hoveredId === char.id && styles.cardHovered]}
              onPress={() => onSelectCharacter(char)}
              onPressIn={() => setHoveredId(char.id)}
              onPressOut={() => setHoveredId(null)}
              activeOpacity={0.92}
            >
              {/* Character Image */}
              <Image source={char.image} style={styles.cardImage} resizeMode="cover" />

              {/* Bottom Information Overlay */}
              <View style={styles.cardOverlay}>
                <Text style={styles.cardName}>{char.name}</Text>
                <Text style={styles.cardAge}>{char.age}</Text>
                <Text style={styles.cardTrait}>{char.trait}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Hint Text */}
        <Text style={styles.hint}>
          {lang === 'ko' ? '카드를 탭하면 상세 정보를 볼 수 있어요' : 'Tap a card to view details'}
        </Text>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1a1a2e' },
  container: { flex: 1, paddingTop: 8 },

  // Header
  header: { paddingHorizontal: 24, paddingBottom: 24 },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.5)', letterSpacing: 3, marginBottom: 6 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', letterSpacing: 1 },

  // Card Scroll
  scrollContent: { paddingHorizontal: 20, gap: 12, paddingBottom: 8 },
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.85, // Height ratio for portrait images
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
  cardImage: {
    width: '100%',
    height: '78%',
  },
  cardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20,20,35,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  cardName: { fontSize: 17, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  cardAge: { fontSize: 11, color: 'rgba(255,255,255,0.55)', marginBottom: 4 },
  cardTrait: {
    fontSize: 11,
    color: '#F59F00',
    fontWeight: '600',
    backgroundColor: 'rgba(245,159,0,0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },

  // Hint Text
  hint: {
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    paddingVertical: 20,
    letterSpacing: 0.5,
  },
});
