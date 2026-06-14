import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { buildDisplayStats } from '../domain/stats/display';
import type { Character } from '../locales/types';
import CharacterStatBar from '../features/characters/components/CharacterStatBar';
import type { SavedGameSession } from '../utils/gamePersistence';
import { locales, type AppLanguage } from '../locales';

const { width } = Dimensions.get('window');

type Props = {
  character: Character;
  onConfirm: (character: Character, mode: 'continue' | 'restart') => void;
  onBack: () => void;
  lang: AppLanguage;
  isPlayable?: boolean;
  savedSession?: SavedGameSession | null;
  savedSituationTitle?: string | null;
};

const InfoSection = ({ title, body }: { title: string; body: string }) => (
  <>
    <View style={styles.divider} />
    <Text style={styles.sectionLabel}>{title}</Text>
    <View style={styles.infoCard}>
      <Text style={styles.infoText}>{body}</Text>
    </View>
  </>
);

export default function CharacterDetailScreen({
  character,
  onConfirm,
  onBack,
  lang,
  isPlayable = true,
  savedSession = null,
  savedSituationTitle = null,
}: Props) {
  const text = locales[lang].characterDetail;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);
  const [showContinueModal, setShowContinueModal] = useState(false);
  const displayStats = buildDisplayStats(character.startingStats);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleConfirm = () => {
    if (!isPlayable) {
      setShowUnavailableModal(true);
      return;
    }

    if (savedSession) {
      setShowContinueModal(true);
      return;
    }

    onConfirm(character, 'restart');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>{text.back}</Text>
        </TouchableOpacity>

        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <ScrollView style={styles.leftPanel} showsVerticalScrollIndicator={false}>
            <View style={styles.nameRow}>
              <Text style={styles.characterName}>{character.name[lang]}</Text>
              <Text style={styles.characterNameEn}>{character.name.en}</Text>
            </View>
            <Text style={styles.ageText}>
              {character.age[lang]} • {character.jobTitle[lang]}
            </Text>

            <View style={styles.tierBadge}>
              <Text style={styles.tierBadgeText}>
                {text.tier} {character.tier}
              </Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionLabel}>{text.overview}</Text>
            {character.description[lang].map((desc, index) => (
              <View key={`${character.id}-desc-${index}`} style={styles.bulletRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{desc}</Text>
              </View>
            ))}

            <View style={styles.divider} />

            <Text style={styles.sectionLabel}>{text.stats}</Text>
            {displayStats.map((stat) => (
                <CharacterStatBar
                key={`${character.id}-${stat.key}`}
                label={stat.label[lang]}
                value={stat.value}
                max={stat.max}
                color={stat.color}
              />
            ))}

            <InfoSection title={text.specialEffect} body={character.specialEffect[lang]} />

            {character.balanceNote ? <InfoSection title={text.balanceNote} body={character.balanceNote[lang]} /> : null}

            {character.unlockNote ? <InfoSection title={text.unlockNote} body={character.unlockNote[lang]} /> : null}

            <View style={styles.divider} />

            <View style={styles.traitBadge}>
              <Text style={styles.traitText}>{character.trait[lang]}</Text>
            </View>
          </ScrollView>

          <View style={styles.rightPanel}>
            <Image source={character.image} style={styles.portrait} resizeMode="cover" />
            <View style={styles.portraitOverlay} />
          </View>
        </Animated.View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={onBack}>
            <Text style={styles.cancelText}>{text.goBack}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmText}>{text.playAs(character.name[lang])}</Text>
          </TouchableOpacity>
        </View>

        {showUnavailableModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalBadge}>
                <Text style={styles.modalBadgeText}>{text.inService}</Text>
              </View>
              <Text style={styles.modalTitle}>{text.unavailableTitle}</Text>
              <Text style={styles.modalDescription}>{text.unavailableDescription}</Text>
              <TouchableOpacity style={styles.modalButton} onPress={() => setShowUnavailableModal(false)}>
                <Text style={styles.modalButtonText}>{text.ok}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {showContinueModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalBadge}>
                <Text style={styles.modalBadgeText}>{text.continueSave}</Text>
              </View>
              <Text style={styles.modalTitle}>{text.savedRunTitle(character.name[lang])}</Text>
              <Text style={styles.modalDescription}>
                {text.currentSituation(savedSituationTitle ?? text.inProgress)}
              </Text>
              <View style={styles.continueButtonRow}>
                <TouchableOpacity
                  style={styles.continueSecondaryButton}
                  onPress={() => {
                    setShowContinueModal(false);
                    onConfirm(character, 'restart');
                  }}
                >
                  <Text style={styles.continueSecondaryText}>{text.startOver}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.continuePrimaryButton}
                  onPress={() => {
                    setShowContinueModal(false);
                    onConfirm(character, 'continue');
                  }}
                >
                  <Text style={styles.continuePrimaryText}>{text.continue}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.modalGhostButton} onPress={() => setShowContinueModal(false)}>
                <Text style={styles.modalGhostButtonText}>{text.cancel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1a1a2e' },
  container: { flex: 1 },
  backButton: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  backText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '600' },
  content: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  leftPanel: {
    flex: 1,
    paddingTop: 8,
  },
  nameRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 4 },
  characterName: { fontSize: 30, fontWeight: 'bold', color: '#fff' },
  characterNameEn: { fontSize: 14, color: 'rgba(255,255,255,0.45)', fontWeight: '500' },
  ageText: { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 10 },
  tierBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tierBadgeText: { fontSize: 11, color: '#F8E7C0', fontWeight: '800', letterSpacing: 0.4 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 14 },
  bulletRow: { flexDirection: 'row', marginBottom: 8, paddingRight: 4 },
  bullet: { color: '#F59F00', fontSize: 12, marginRight: 8, marginTop: 2 },
  bulletText: { flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 20 },
  sectionLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 2,
    marginBottom: 12,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.82)',
  },
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
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 12, 22, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.96)',
    paddingHorizontal: 24,
    paddingVertical: 26,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  modalBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(245,159,0,0.14)',
    marginBottom: 14,
  },
  modalBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E67700',
    letterSpacing: 0.4,
  },
  modalTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    color: '#1C2433',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: '#596579',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    minWidth: 120,
    borderRadius: 999,
    backgroundColor: '#F59F00',
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1A2E',
  },
  continueButtonRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  continueSecondaryButton: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(28,36,51,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  continueSecondaryText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#465366',
  },
  continuePrimaryButton: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: '#F59F00',
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  continuePrimaryText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1A2E',
  },
  modalGhostButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  modalGhostButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7A889C',
  },
});
