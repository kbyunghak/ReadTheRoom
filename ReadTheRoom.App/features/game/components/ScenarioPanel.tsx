import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { forwardRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { StatKey } from '../../../domain/stats/types';
import { splitChoiceText } from '../../../utils/resultCard';
import type {
  Scenario,
  ScenarioChoice,
} from '../../../utils/scenarioRegistry';
import FeedbackModal from './FeedbackModal';

type Copy = {
  situationLabel: string;
  summaryLabel: string;
  summaryContinue: string;
  feedbackButton: string;
  continueButton: string;
  feedbackTitle: string;
  choiceLabel: string;
  resultLabel: string;
  statsLabel: string;
  tipLabel: string;
  closeLabel: string;
};

type Props = {
  scenario: Scenario;
  language: 'en' | 'ko';
  isNarrow: boolean;
  layout?: 'portrait' | 'landscape';
  isCompactLandscape?: boolean;
  bottom: number;
  top?: number;
  maxHeight: number;
  showResult: boolean;
  showFeedbackModal: boolean;
  selectedChoice: ScenarioChoice | null;
  copy: Copy;
  statLabels: Record<StatKey, string>;
  onChoice: (choice: ScenarioChoice) => void;
  onSummaryContinue: () => void;
  onOpenFeedback: () => void;
  onCloseFeedback: () => void;
  onContinue: () => void;
};

const ScenarioPanel = forwardRef<ScrollView, Props>(function ScenarioPanel(
  {
    scenario,
    language,
    isNarrow,
    layout = 'portrait',
    isCompactLandscape = false,
    bottom,
    top,
    maxHeight,
    showResult,
    showFeedbackModal,
    selectedChoice,
    copy,
    statLabels,
    onChoice,
    onSummaryContinue,
    onOpenFeedback,
    onCloseFeedback,
    onContinue,
  },
  ref,
) {
  const isSummary = scenario.type === 'SUMMARY';

  return (
    <ScrollView
      ref={ref}
      style={[
        styles.root,
        layout === 'landscape' && styles.rootLandscape,
        layout === 'portrait' ? { bottom, maxHeight } : { top, bottom },
      ]}
      contentContainerStyle={[
        styles.rootContent,
        layout === 'landscape' && styles.rootContentLandscape,
        isCompactLandscape && styles.rootContentCompactLandscape,
        { paddingHorizontal: layout === 'landscape' ? 18 : isNarrow ? 14 : 18 },
      ]}
      showsVerticalScrollIndicator={false}
      bounces={false}
      scrollEnabled={false}
      keyboardShouldPersistTaps="handled"
    >
      <View
        style={[
          styles.outer,
          layout === 'landscape' && styles.outerLandscape,
          isCompactLandscape && styles.outerCompactLandscape,
        ]}
      >
        {layout === 'landscape' ? (
          <View
            style={[
              styles.landscapeSituationWrap,
              isCompactLandscape && styles.landscapeSituationWrapCompact,
            ]}
          >
            <View
              style={[
                styles.tab,
                styles.landscapeSituationTab,
                isCompactLandscape && styles.tabCompactLandscape,
              ]}
            >
              <Text style={styles.tabText}>
                {isSummary ? copy.summaryLabel : copy.situationLabel}
              </Text>
            </View>
            <View
              style={[
                styles.card,
                styles.landscapeSituationCard,
                isCompactLandscape && styles.cardCompactLandscape,
                isCompactLandscape && styles.landscapeSituationCardCompact,
              ]}
            >
              <ScrollView
                style={styles.cardScroll}
                contentContainerStyle={styles.cardContent}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                <Text
                  style={[
                    styles.description,
                    styles.descriptionLandscape,
                    isCompactLandscape && styles.descriptionCompactLandscape,
                  ]}
                >
                  {scenario.description[language]}
                </Text>
              </ScrollView>
            </View>
          </View>
        ) : null}

        <View
          style={[
            styles.cardWrap,
            layout === 'landscape' && styles.cardWrapLandscape,
            isCompactLandscape && styles.cardWrapCompactLandscape,
          ]}
        >
          {layout === 'portrait' ? (
            <View style={styles.tab}>
              <Text style={styles.tabText}>
                {isSummary ? copy.summaryLabel : copy.situationLabel}
              </Text>
            </View>
          ) : null}
          <View
            style={[
              styles.card,
              { maxHeight: maxHeight - 18 },
              layout === 'landscape' && styles.cardLandscape,
              isCompactLandscape && styles.cardCompactLandscape,
            ]}
          >
            <ScrollView
              style={[styles.cardScroll, { maxHeight: maxHeight - 50 }]}
              contentContainerStyle={[
                styles.cardContent,
                { paddingBottom: showResult ? 12 : 2 },
              ]}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {layout === 'portrait' ? (
                <Text
                  style={styles.description}
                  numberOfLines={isSummary ? 3 : undefined}
                >
                  {scenario.description[language]}
                </Text>
              ) : null}

              {layout === 'landscape' && !isSummary ? (
                <Text
                  style={[
                    styles.landscapeChoiceHeading,
                    isCompactLandscape && styles.landscapeChoiceHeadingCompact,
                  ]}
                >
                  {language === 'ko' ? '어떻게 하시겠습니까?' : 'What will you do?'}
                </Text>
              ) : null}

              <View
                style={[
                  styles.choiceList,
                  layout === 'landscape' && styles.choiceListLandscape,
                  isCompactLandscape && styles.choiceListCompactLandscape,
                ]}
              >
                {isSummary ? (
                  <>
                    {scenario.tip?.[language] ? (
                      <View style={styles.summaryTip}>
                        <View style={styles.summaryTipHeader}>
                          <MaterialCommunityIcons
                            name="lightbulb-on-outline"
                            size={19}
                            color="#F4C542"
                          />
                          <Text style={styles.summaryTipLabel}>TIP</Text>
                        </View>
                        <Text style={styles.summaryTipText}>
                          {scenario.tip[language]}
                        </Text>
                      </View>
                    ) : null}
                    <TouchableOpacity
                      style={styles.nextButton}
                      onPress={onSummaryContinue}
                    >
                      <Text style={styles.nextButtonText}>
                        {copy.summaryContinue}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  scenario.choices.map((choice, index) => {
                    const text = splitChoiceText(choice.text[language]);
                    const isSelected = selectedChoice === choice;
                    const isInactive = showResult && !isSelected;

                    return (
                      <TouchableOpacity
                        key={`${scenario.id}-${index}`}
                        style={[
                          styles.choiceButton,
                          layout === 'landscape' && styles.choiceButtonLandscape,
                          isCompactLandscape && styles.choiceButtonCompactLandscape,
                          isSelected && styles.choiceButtonSelected,
                          isInactive && styles.choiceButtonInactive,
                        ]}
                        disabled={showResult}
                        activeOpacity={showResult ? 1 : 0.75}
                        onPress={() => onChoice(choice)}
                      >
                        <View
                          style={[
                            styles.choiceRow,
                            isCompactLandscape && styles.choiceRowCompactLandscape,
                          ]}
                        >
                          <View
                            style={[
                              styles.choiceIndex,
                              isCompactLandscape && styles.choiceIndexCompactLandscape,
                            ]}
                          >
                            <Text
                              style={[
                                styles.choiceIndexText,
                                isCompactLandscape &&
                                  styles.choiceIndexTextCompactLandscape,
                              ]}
                            >
                              {index + 1}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.choiceTextWrap,
                              isCompactLandscape &&
                                styles.choiceTextWrapCompactLandscape,
                            ]}
                          >
                            {text.cue ? (
                              <Text
                                style={[
                                  styles.choiceCue,
                                  isCompactLandscape &&
                                    styles.choiceCueCompactLandscape,
                                ]}
                              >
                                {text.cue}
                              </Text>
                            ) : null}
                            <Text
                              style={[
                                styles.choiceText,
                                isCompactLandscape &&
                                  styles.choiceTextCompactLandscape,
                              ]}
                            >
                              {text.body}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            </ScrollView>

            {showResult && selectedChoice ? (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.feedbackButton}
                  onPress={onOpenFeedback}
                >
                  <Text style={styles.feedbackButtonText}>
                    {copy.feedbackButton}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.nextButton, styles.continueButton]}
                  onPress={onContinue}
                >
                  <Text style={styles.nextButtonText}>
                    {copy.continueButton}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </View>

        {showResult && selectedChoice ? (
          <FeedbackModal
            visible={showFeedbackModal}
            choice={selectedChoice}
            tip={scenario.tip}
            language={language}
            copy={{
              title: copy.feedbackTitle,
              choiceLabel: copy.choiceLabel,
              resultLabel: copy.resultLabel,
              statsLabel: copy.statsLabel,
              tipLabel: copy.tipLabel,
              closeLabel: copy.closeLabel,
              continueLabel: copy.continueButton,
            }}
            statLabels={statLabels}
            onClose={onCloseFeedback}
            onContinue={onContinue}
          />
        ) : null}
      </View>
    </ScrollView>
  );
});

export default ScenarioPanel;

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 5,
    overflow: 'visible',
  },
  rootContent: {
    paddingTop: 28,
  },
  rootContentLandscape: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingBottom: 12,
  },
  rootContentCompactLandscape: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  rootLandscape: {
    top: 0,
    maxHeight: undefined,
  },
  outer: {
    width: '100%',
    overflow: 'visible',
    paddingHorizontal: 2,
  },
  outerLandscape: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 18,
  },
  outerCompactLandscape: {
    gap: 10,
  },
  cardWrap: {
    width: '100%',
    marginBottom: 4,
    overflow: 'visible',
  },
  cardWrapLandscape: {
    width: '36%',
    marginLeft: 'auto',
  },
  cardWrapCompactLandscape: {
    width: '35%',
  },
  landscapeSituationWrap: {
    width: '28%',
    marginBottom: 36,
  },
  landscapeSituationWrapCompact: {
    width: '27%',
    marginBottom: 14,
  },
  tab: {
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
  tabText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#F6FAFF',
  },
  landscapeSituationTab: {
    marginLeft: 10,
  },
  tabCompactLandscape: {
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: -6,
  },
  card: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: 'rgba(7, 18, 38, 0.74)',
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: 'rgba(99, 154, 235, 0.46)',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 18,
  },
  cardLandscape: {
    maxHeight: undefined,
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  cardCompactLandscape: {
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingTop: 9,
    paddingBottom: 9,
  },
  landscapeSituationCard: {
    minHeight: 174,
    maxHeight: 240,
    paddingBottom: 14,
  },
  landscapeSituationCardCompact: {
    minHeight: 0,
    maxHeight: 220,
    paddingBottom: 10,
  },
  landscapeChoiceHeading: {
    marginBottom: 11,
    color: '#F5F8FD',
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  landscapeChoiceHeadingCompact: {
    marginBottom: 6,
    fontSize: 15,
    lineHeight: 19,
  },
  cardScroll: {
    width: '100%',
  },
  cardContent: {
    flexDirection: 'column',
  },
  description: {
    width: '100%',
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: 10,
    fontSize: 14,
    color: '#F4F7FC',
    lineHeight: 26,
    textAlign: 'left',
    fontWeight: '700',
  },
  descriptionLandscape: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 10,
  },
  descriptionCompactLandscape: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 4,
  },
  choiceList: {
    width: '100%',
    flexGrow: 0,
    flexShrink: 0,
    flexDirection: 'column',
    gap: 10,
    overflow: 'visible',
  },
  choiceListLandscape: {
    gap: 7,
  },
  choiceListCompactLandscape: {
    gap: 5,
  },
  choiceButton: {
    minHeight: 60,
    backgroundColor: 'rgba(8, 22, 46, 0.82)',
    paddingVertical: 12,
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
  choiceButtonLandscape: {
    minHeight: 50,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  choiceButtonCompactLandscape: {
    minHeight: 42,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 14,
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
  choiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  choiceRowCompactLandscape: {
    gap: 8,
  },
  choiceIndex: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.8,
    borderColor: 'rgba(95, 162, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 38, 88, 0.62)',
  },
  choiceIndexCompactLandscape: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.4,
  },
  choiceIndexText: {
    color: '#DDEBFF',
    fontSize: 16,
    fontWeight: '900',
  },
  choiceIndexTextCompactLandscape: {
    fontSize: 13,
  },
  choiceTextWrap: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    gap: 2,
    paddingRight: 2,
  },
  choiceTextWrapCompactLandscape: {
    gap: 0,
    paddingRight: 0,
  },
  choiceCue: {
    color: 'rgba(184, 211, 255, 0.86)',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
  choiceCueCompactLandscape: {
    fontSize: 9,
    lineHeight: 11,
  },
  choiceText: {
    color: '#F7FAFF',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  choiceTextCompactLandscape: {
    fontSize: 12,
    lineHeight: 15,
  },
  summaryTip: {
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
  actions: {
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
  feedbackButton: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(122, 180, 238, 0.56)',
    backgroundColor: 'rgba(8, 27, 57, 0.9)',
  },
  feedbackButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#BFDFFF',
  },
  continueButton: {
    flex: 1,
    height: 48,
    marginTop: 0,
    paddingHorizontal: 12,
    paddingVertical: 0,
    borderRadius: 16,
  },
});
