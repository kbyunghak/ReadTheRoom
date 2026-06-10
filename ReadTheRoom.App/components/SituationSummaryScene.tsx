import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { SituationSummary, SummaryVariant } from '../utils/situationSummary';

type Props = {
  lang: 'en' | 'ko';
  summary: SituationSummary;
  onContinue: () => void;
};

const CARD_THEME: Record<
  SummaryVariant,
  {
    card: object;
    blob: object;
    text: string;
    dimText: string;
    panel: object;
    button: object;
    buttonText: string;
  }
> = {
  good: {
    card: { backgroundColor: '#269F8F' },
    blob: { backgroundColor: 'rgba(255,255,255,0.16)' },
    text: '#F8FFFE',
    dimText: 'rgba(248,255,254,0.88)',
    panel: { backgroundColor: 'rgba(255,255,255,0.18)' },
    button: { backgroundColor: '#FFFFFF' },
    buttonText: '#217B78',
  },
  mid: {
    card: { backgroundColor: '#F5B300' },
    blob: { backgroundColor: 'rgba(255,255,255,0.16)' },
    text: '#2C3E50',
    dimText: 'rgba(44,62,80,0.92)',
    panel: { backgroundColor: 'rgba(0,0,0,0.08)' },
    button: { backgroundColor: '#2C3E50' },
    buttonText: '#FFF8E6',
  },
  bad: {
    card: { backgroundColor: '#8D4A53' },
    blob: { backgroundColor: 'rgba(255,255,255,0.10)' },
    text: '#FFF6F5',
    dimText: 'rgba(255,246,245,0.9)',
    panel: { backgroundColor: 'rgba(255,255,255,0.12)' },
    button: { backgroundColor: '#FFFFFF' },
    buttonText: '#7A3E47',
  },
};

export default function SituationSummaryScene({ lang, summary, onContinue }: Props) {
  const theme = CARD_THEME[summary.variant];
  const text = {
    result: lang === 'ko' ? '상황 결과' : 'Result',
    expression: lang === 'ko' ? '영어 표현' : 'Expression',
    english: lang === 'ko' ? '영어 실력' : 'English',
    adaptation: lang === 'ko' ? '적응도' : 'Adaptation',
    continue: lang === 'ko' ? '계속하기' : 'Continue',
    scrollHint: lang === 'ko' ? '아래 내용을 더 확인해보세요' : 'Scroll for more',
  };

  const signedValue = (value: number) => (value > 0 ? `+${value}` : `${value}`);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.page}>
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.contentScrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          nestedScrollEnabled
          overScrollMode="always"
        >
          <View style={[styles.card, theme.card]}>
            <View style={[styles.blobLarge, theme.blob]} />
            <View style={[styles.blobSmall, theme.blob]} />

            <Text style={[styles.statusLabel, { color: theme.dimText }]}>
              {text.result}: {summary.variant.toUpperCase()}
            </Text>
            <Text style={[styles.title, { color: theme.text }]}>
              {summary.title[lang]}
            </Text>
            <Text style={[styles.description, { color: theme.dimText }]}>
              {summary.description[lang]}
            </Text>

            <View style={styles.infoStack}>
              <View style={[styles.infoPanel, theme.panel]}>
                <Text style={[styles.infoLabel, { color: theme.dimText }]}>{text.expression}</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>
                  {summary.expression.en}
                </Text>
                <Text style={[styles.infoSubValue, { color: theme.text }]}>
                  {summary.expression.ko}
                </Text>
              </View>
            </View>

            <View style={styles.scrollHintWrap}>
              <Text style={[styles.scrollHintText, { color: theme.dimText }]}>{text.scrollHint}</Text>
            </View>

            <View style={[styles.statsPanel, theme.panel]}>
              <Text style={[styles.statsText, { color: theme.text }]}>
                {text.english} {signedValue(summary.englishDelta)}
              </Text>
              <Text style={[styles.statsText, { color: theme.text }]}>
                {text.adaptation} {signedValue(summary.adaptationDelta)}
              </Text>
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity style={[styles.continueButton, theme.button]} onPress={onContinue} activeOpacity={0.92}>
          <Text style={[styles.continueButtonText, { color: theme.buttonText }]}>{text.continue}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EEF2F7',
  },
  page: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 28,
  },
  contentScroll: {
    flex: 1,
  },
  contentScrollContent: {
    paddingBottom: 24,
  },
  card: {
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    shadowColor: '#1B2533',
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  blobLarge: {
    position: 'absolute',
    top: -30,
    right: -18,
    width: 132,
    height: 132,
    borderRadius: 999,
  },
  blobSmall: {
    position: 'absolute',
    bottom: 82,
    left: -28,
    width: 112,
    height: 112,
    borderRadius: 999,
  },
  statusLabel: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 14,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '900',
    marginBottom: 18,
  },
  description: {
    fontSize: 18,
    lineHeight: 31,
    fontWeight: '700',
    marginBottom: 24,
  },
  infoStack: {
    gap: 12,
  },
  infoPanel: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '700',
  },
  infoSubValue: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '700',
    marginTop: 8,
    opacity: 0.92,
  },
  scrollHintWrap: {
    marginTop: 12,
    alignItems: 'center',
  },
  scrollHintText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  statsPanel: {
    marginTop: 14,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 4,
  },
  statsText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '800',
  },
  continueButton: {
    marginTop: 16,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#1B2533',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '900',
  },
});
