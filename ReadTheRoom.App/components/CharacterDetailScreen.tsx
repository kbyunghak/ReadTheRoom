import React, { useRef, useEffect } from 'react';
import {
  View, Text, Image, StyleSheet, TouchableOpacity,
  Animated, Dimensions, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Character } from '../components/CharacterSelectScreen';

const { width, height } = Dimensions.get('window');

type Props = {
  character: Character;
  onConfirm: (character: Character) => void;
  onBack: () => void;
  lang: 'en' | 'ko';
};

// Stats component with animated bars
const StatRow = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => {
  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: value / max,
      duration: 600,
      delay: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const barWidth = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={statStyles.row}>
      <Text style={statStyles.label}>{label}</Text>
      <View style={statStyles.track}>
        <Animated.View style={[statStyles.fill, { width: barWidth, backgroundColor: color }]} />
      </View>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
    </View>
  );
};

const statStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  label: { width: 68, fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },
  track: { flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 4, overflow: 'hidden', marginHorizontal: 8 },
  fill: { height: '100%', borderRadius: 4 },
  value: { width: 36, fontSize: 12, fontWeight: 'bold', textAlign: 'right' },
});

export default function CharacterDetailScreen({ character, onConfirm, onBack, lang }: Props) {
  // Entry animation
  const slideAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>

        {/* Move back button */}
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>← {lang === 'ko' ? '뒤로' : 'Back'}</Text>
        </TouchableOpacity>

        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

          {/* Left Panel: Stats and Description */}
          <ScrollView style={styles.leftPanel} showsVerticalScrollIndicator={false}>

            {/* Character Name and Age */}
            <View style={styles.nameRow}>
              <Text style={styles.characterName}>{character.name}</Text>
              <Text style={styles.characterNameEn}>{character.nameEn}</Text>
            </View>
            <Text style={styles.ageText}>{character.age} · {character.tagline}</Text>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Description */}
            {character.description.map((desc, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bullet}>◆</Text>
                <Text style={styles.bulletText}>{desc}</Text>
              </View>
            ))}

            <View style={styles.divider} />

            {/* Stats Bars */}
            <Text style={styles.sectionLabel}>
              {lang === 'ko' ? '능력치' : 'Stats'}
            </Text>
            {character.stats.map((stat, i) => (
              <StatRow
                key={i}
                label={lang === 'ko' ? stat.label : stat.labelEn}
                value={stat.value}
                max={stat.max}
                color={stat.color}
              />
            ))}

            <View style={styles.divider} />

            {/* Occupation/Background Tag */}
            <View style={styles.traitBadge}>
              <Text style={styles.traitText}>{character.taglineKo}</Text>
            </View>

          </ScrollView>

          {/* Right Panel : Portrait */}
          <View style={styles.rightPanel}>
            <Image
              source={character.portraitImage}
              style={styles.portrait}
              resizeMode="cover"
            />
            {/* Portrait Overlay */}
            <View style={styles.portraitOverlay} />
          </View>

        </Animated.View>

        {/* Bottom Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={onBack}>
            <Text style={styles.cancelText}>{lang === 'ko' ? '다른 캐릭터 보기' : 'Go Back'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmButton} onPress={() => onConfirm(character)}>
            <Text style={styles.confirmText}>
              {lang === 'ko' ? `${character.name}(으)로 시작하기` : `Play as ${character.nameEn}`}
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1a1a2e' },
  container: { flex: 1 },

  // Move back button
  backButton: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  backText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '600' },

  // Main content (left-right split)
  content: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },

  // Left Panel
  leftPanel: {
    flex: 1,
    paddingTop: 8,
  },
  nameRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 4 },
  characterName: { fontSize: 30, fontWeight: 'bold', color: '#fff' },
  characterNameEn: { fontSize: 14, color: 'rgba(255,255,255,0.45)', fontWeight: '500' },
  ageText: { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 16 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 14 },

  // Description
  bulletRow: { flexDirection: 'row', marginBottom: 8, paddingRight: 4 },
  bullet: { color: '#F59F00', fontSize: 10, marginRight: 8, marginTop: 3 },
  bulletText: { flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 20 },

  // Stats
  sectionLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginBottom: 12, fontWeight: '700' },

  // Occupation/Background Tag
  traitBadge: {
    backgroundColor: 'rgba(245,159,0,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245,159,0,0.4)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  traitText: { fontSize: 12, color: '#F59F00', fontWeight: '600' },

  // Right Panel : Portrait
  rightPanel: {
    width: width * 0.42,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  portrait: {
    width: '100%',
    height: '100%',
  },
  portraitOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: 'rgba(26,26,46,0.6)',
  },

  // Bottom Buttons
  buttonRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 12,
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
  },
  cancelText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '600' },
  confirmButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F59F00',
    alignItems: 'center',
  },
  confirmText: { color: '#1a1a2e', fontSize: 15, fontWeight: 'bold' },
});
