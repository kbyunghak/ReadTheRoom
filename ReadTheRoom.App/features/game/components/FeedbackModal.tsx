import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import type { StatKey } from '../../../domain/stats/types';
import {
  buildResultCardData,
  splitChoiceText,
  type ResultCardLanguage,
} from '../../../utils/resultCard';
import type {
  LocalizedText,
  ScenarioChoice,
} from '../../../utils/scenarioRegistry';
import ResultStatItem from './ResultStatItem';

type FeedbackCopy = {
  title: string;
  choiceLabel: string;
  resultLabel: string;
  statsLabel: string;
  tipLabel: string;
  closeLabel: string;
  continueLabel: string;
};

type Props = {
  visible: boolean;
  choice: ScenarioChoice;
  tip?: LocalizedText;
  language: ResultCardLanguage;
  copy: FeedbackCopy;
  statLabels: Record<StatKey, string>;
  onClose: () => void;
  onContinue: () => void;
};

export default function FeedbackModal({
  visible,
  choice,
  tip,
  language,
  copy,
  statLabels,
  onClose,
  onContinue,
}: Props) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const result = buildResultCardData(choice, language, tip);
  const choiceText = splitChoiceText(choice.text[language]);
  const toneColor =
    result.resultTone === 'good'
      ? '#66D980'
      : result.resultTone === 'bad'
        ? '#FF7B86'
        : '#F4C542';
  const toneIcon =
    result.resultTone === 'good'
      ? 'check-circle-outline'
      : result.resultTone === 'bad'
        ? 'close-circle-outline'
        : 'alert-circle-outline';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
        <View
          style={[
            styles.card,
            {
              maxHeight: Math.min(
                height - insets.top - insets.bottom - 28,
                680,
              ),
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{copy.title}</Text>
            <TouchableOpacity
              style={styles.closeIcon}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={copy.closeLabel}
            >
              <MaterialCommunityIcons
                name="close"
                size={20}
                color="#D8E8FF"
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={[styles.section, styles.choiceSection]}>
              <SectionHeading
                icon="checkbox-marked-circle-outline"
                color="#64B1FF"
                label={copy.choiceLabel}
              />
              {choiceText.cue ? (
                <Text style={styles.choiceCue}>{choiceText.cue}</Text>
              ) : null}
              <Text style={styles.choiceText}>{choiceText.body}</Text>
            </View>

            <View
              style={[
                styles.section,
                {
                  borderColor: `${toneColor}66`,
                  backgroundColor: `${toneColor}12`,
                },
              ]}
            >
              <SectionHeading
                icon={toneIcon}
                color={toneColor}
                label={copy.resultLabel}
              />
              <Text style={styles.resultText}>{result.feedbackText}</Text>
            </View>

            {result.changedStats.length ? (
              <View style={styles.statsSection}>
                <SectionHeading
                  icon="chart-line-variant"
                  color="#B184FF"
                  label={copy.statsLabel}
                />
                <View style={styles.statsGrid}>
                  {result.changedStats.map((entry) => (
                    <ResultStatItem
                      key={`${choice.nextScenarioId}-${entry.statKey}`}
                      statKey={entry.statKey}
                      value={entry.value}
                      compact
                      label={statLabels[entry.statKey]}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            {result.tipText ? (
              <View style={styles.tipSection}>
                <SectionHeading
                  icon="lightbulb-on-outline"
                  color="#F4C542"
                  label={copy.tipLabel}
                />
                <Text style={styles.tipText}>{result.tipText}</Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={copy.closeLabel}
            >
              <Text style={styles.closeButtonText}>{copy.closeLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={onContinue}
              accessibilityRole="button"
              accessibilityLabel={copy.continueLabel}
            >
              <Text style={styles.continueButtonText}>
                {copy.continueLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function SectionHeading({
  icon,
  color,
  label,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  label: string;
}) {
  return (
    <View style={styles.sectionHeading}>
      <MaterialCommunityIcons name={icon} size={19} color={color} />
      <Text style={[styles.sectionTitle, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(2, 7, 18, 0.84)',
  },
  card: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '88%',
    alignSelf: 'center',
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(105, 173, 255, 0.72)',
    backgroundColor: 'rgba(5, 19, 43, 0.98)',
    shadowColor: '#4FA3FF',
    shadowOpacity: 0.22,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 181, 233, 0.2)',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#F5F8FC',
  },
  closeIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(105, 173, 255, 0.12)',
  },
  scroll: {
    flexShrink: 1,
    minHeight: 0,
  },
  content: {
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
  },
  section: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  choiceSection: {
    borderColor: 'rgba(100, 177, 255, 0.32)',
    backgroundColor: 'rgba(18, 52, 94, 0.26)',
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  choiceCue: {
    marginTop: 9,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(168, 206, 255, 0.82)',
    fontWeight: '700',
  },
  choiceText: {
    marginTop: 4,
    fontSize: 15,
    lineHeight: 22,
    color: '#F4F8FF',
    fontWeight: '800',
  },
  resultText: {
    marginTop: 9,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '900',
    color: '#F5F8FD',
  },
  statsSection: {
    borderWidth: 1,
    borderRadius: 16,
    borderColor: 'rgba(177, 132, 255, 0.24)',
    backgroundColor: 'rgba(89, 50, 138, 0.08)',
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 9,
  },
  tipSection: {
    borderWidth: 1,
    borderRadius: 16,
    borderColor: 'rgba(244, 197, 66, 0.46)',
    backgroundColor: 'rgba(126, 91, 19, 0.15)',
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  tipText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: '#F7F0D8',
    fontWeight: '700',
  },
  actions: {
    flexShrink: 0,
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 181, 233, 0.18)',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: 'rgba(4, 16, 37, 0.98)',
  },
  closeButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 181, 233, 0.36)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#C9D6E8',
  },
  continueButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D9E9FF',
  },
  continueButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#16385F',
  },
});
