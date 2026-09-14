import React, { useState } from 'react';
import {
  Image,
  ImageBackground,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getAssetDimensions } from '../utils/assetDimensions';
import { getEndingLayoutMetrics } from '../utils/endingLayout';

export type EndingVariant =
  | 'success'
  | 'failure'
  | 'in_progress'
  | 'survived'
  | 'final_clear';

type Props = {
  lang: 'en' | 'ko';
  variant: EndingVariant;
  characterId?: string | null;
  failureRecap?: {
    title: {
      ko: string;
      en: string;
    };
    items: {
      title: {
        ko: string;
        en: string;
      };
      detail: {
        ko: string;
        en: string;
      };
    }[];
  } | null;
  onContinueAfterAd?: () => void;
  onTryAnotherChoice: () => void;
  onRestartFromBeginning: () => void;
  onViewMistakes?: () => void;
  onViewJourney?: () => void;
  onStopJourney?: () => void;
  onFinishJourney?: () => void;
};

const END_TEXT = {
  ko: {
    successMessage: '시행착오도 있었지만, 잘 해내고 있어요.\n이 이야기는 아직 계속돼요. 다음에는 어떤 길을 선택해볼까요?',
    failureMessage: '이번 선택은 쉽지 않았어요.\n이번엔 다르게 해볼까요?',
    continueAfterAd: '광고 보고 계속하기',
    chooseAnother: '다른 캐릭터 선택하기',
    restart: '처음부터 다시 하기',
    viewMistakes: '내가 잘못한 점 보기',
    viewJourney: '나의 여정 보기',
    stopJourney: '여기서 그만하기',
    inProgressTitle: '여정은 아직 계속됩니다.',
    inProgressMessage: '다음 이야기가 준비 중이에요.\n지금까지의 여정을 돌아보거나\n다른 이야기를 만나보세요.',
    survivedTitle: '여기까지, 잘 버텼습니다.',
    survivedMessage: '모든 선택이 뜻대로 흘러가진 않았지만,\n당신은 여기까지 왔습니다.\n\n이번 여정은 여기서 끝나지만,\n당신이 지나온 이야기는 사라지지 않습니다.',
    survivedHint: '화면을 눌러 여정을 마칩니다.',
    finalClearTitle: '여정의 끝에 도착했습니다.',
    finalClearMessage: '수많은 선택이 하나의 이야기가 되었습니다.\n당신이 만들어 온 여정을\n다시 한번 돌아보세요.',
  },
  en: {
    successMessage: 'There were some missteps, but you are doing well.\nThis story is still unfolding. What path will you choose next?',
    failureMessage: 'This choice was not an easy one.\nWould you like to try a different path this time?',
    continueAfterAd: 'Watch Ad to Continue',
    chooseAnother: 'Choose Another Character',
    restart: 'Restart From the Beginning',
    viewMistakes: 'See What Went Wrong',
    viewJourney: 'View My Journey',
    stopJourney: 'End My Journey Here',
    inProgressTitle: 'The journey continues.',
    inProgressMessage: 'The next chapter is being prepared.\nLook back on your journey so far,\nor discover another story.',
    survivedTitle: 'You made it this far.',
    survivedMessage: 'Not every choice went the way you hoped,\nbut you made it here.\n\nThis journey ends here,\nbut the story you lived remains.',
    survivedHint: 'Tap anywhere to end your journey.',
    finalClearTitle: 'You reached the end of the journey.',
    finalClearMessage: 'Countless choices became one story.\nTake another look at\nthe journey you created.',
  },
} as const;

const END_TEXT_KO = {
  successMessage: '시행착오는 있었지만 잘 해내고 있어요.\n이 이야기는 아직 계속돼요. 다음에는 어떤 길을 선택해볼까요?',
  failureMessage: '이번 선택은 쉽지 않았어요.\n이번엔 다르게 해볼까요?',
  continueAfterAd: '광고 보고 계속하기',
  chooseAnother: '다른 캐릭터 선택하기',
  restart: '처음부터 다시 하기',
  viewMistakes: '내가 잘못한 점 보기',
  viewJourney: '나의 여정 보기',
  stopJourney: '여기서 그만하기',
  inProgressTitle: '여정은 아직 계속됩니다.',
  inProgressMessage: '다음 이야기가 준비 중이에요.\n지금까지의 여정을 돌아보거나\n다른 이야기를 만나보세요.',
  survivedTitle: '여기까지, 잘 버텼습니다.',
  survivedMessage: '모든 선택이 뜻대로 흘러가진 않았지만,\n당신은 여기까지 왔습니다.\n\n이번 여정은 여기서 끝나지만,\n당신이 지나온 이야기는 사라지지 않습니다.',
  survivedHint: '화면을 눌러 여정을 마칩니다.',
  finalClearTitle: '여정의 끝에 도착했습니다.',
  finalClearMessage: '수많은 선택이 하나의 이야기가 되었습니다.\n당신이 만들어 온 여정을\n다시 한번 돌아보세요.',
} as const;

const FAILURE_OVERLAYS: Partial<Record<string, ImageSourcePropType>> = {
  ken: require('../assets/images/characters/ken_end.png'),
  amy: require('../assets/images/characters/amy_end.png'),
  sora: require('../assets/images/characters/sora_end.png'),
  jun: require('../assets/images/characters/jun_end.png'),
  yoon: require('../assets/images/characters/yoon_end.png'),
  jina: require('../assets/images/characters/jina_end.png'),
};

const EVENT_BACKGROUNDS: Partial<Record<EndingVariant, ImageSourcePropType>> = {
  in_progress: require('../assets/images/event/In_Progress.png'),
  survived: require('../assets/images/event/Survived_Ending.png'),
  final_clear: require('../assets/images/event/Final_Clear.png'),
};

const MAX_PORTRAIT_CANVAS_WIDTH = 430;
export default function EndingScene({
  lang,
  variant,
  characterId,
  failureRecap,
  onContinueAfterAd,
  onTryAnotherChoice,
  onRestartFromBeginning,
  onViewMistakes,
  onViewJourney,
  onStopJourney,
  onFinishJourney,
}: Props) {
  const [showFailureRecap, setShowFailureRecap] = useState(false);
  const [eventContentHeight, setEventContentHeight] = useState(0);
  const [eventViewportHeight, setEventViewportHeight] = useState(0);
  const [eventActionPanelHeight, setEventActionPanelHeight] = useState(0);
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();
  const safeAreaInsets = useSafeAreaInsets();
  const text = lang === 'ko' ? END_TEXT_KO : END_TEXT.en;
  const failureOverlay = variant === 'failure' && characterId ? FAILURE_OVERLAYS[characterId] : undefined;
  const eventImageSource = EVENT_BACKGROUNDS[variant];
  const backgroundSource = failureOverlay ?? require('../assets/images/background/end.png');
  const isJourneyEnding = variant === 'in_progress' || variant === 'final_clear';
  const isSurvived = variant === 'survived';
  const eventTitle =
    variant === 'in_progress'
      ? text.inProgressTitle
      : variant === 'survived'
        ? text.survivedTitle
        : variant === 'final_clear'
          ? text.finalClearTitle
          : null;
  const message =
    variant === 'success'
      ? text.successMessage
      : variant === 'failure'
        ? text.failureMessage
        : variant === 'in_progress'
          ? text.inProgressMessage
          : variant === 'survived'
            ? text.survivedMessage
            : text.finalClearMessage;
  const isLandscape = viewportWidth > viewportHeight && viewportWidth >= 700;
  const canvasWidth = isLandscape
    ? Math.min(viewportWidth, Math.round(viewportHeight * (16 / 9)))
    : Math.min(viewportWidth, MAX_PORTRAIT_CANVAS_WIDTH);
  const canvasHeight = isLandscape
    ? Math.min(viewportHeight, Math.round(viewportWidth * (9 / 16)))
    : viewportHeight;
  const eventImageDimensions = getAssetDimensions(eventImageSource);
  const eventImageAspectRatio =
    eventImageDimensions?.width && eventImageDimensions?.height
      ? eventImageDimensions.width / eventImageDimensions.height
      : 2 / 3;
  const safeAreaTop = safeAreaInsets.top;
  const safeAreaBottom = safeAreaInsets.bottom;
  const preliminaryCompact = !isLandscape && canvasHeight - safeAreaTop - safeAreaBottom < 700;
  const eventHorizontalPadding = isLandscape ? 28 : preliminaryCompact ? 14 : 16;
  const eventLayout = getEndingLayoutMetrics({
    canvasWidth,
    canvasHeight,
    safeAreaTop,
    safeAreaBottom,
    horizontalPadding: eventHorizontalPadding,
    imageAspectRatio: eventImageAspectRatio,
    isLandscape,
  });
  const isCompactHeight = eventLayout.compact;
  const eventContentOverflows =
    eventViewportHeight > 0 && eventContentHeight > eventViewportHeight + 1;
  const eventScrollEnabled = Boolean(
    eventImageSource && (eventLayout.verySmall || eventContentOverflows),
  );
  const eventButtonHeightStyle = eventImageSource
    ? { minHeight: eventLayout.buttonHeight }
    : null;
  const maximumFittingImageHeight =
    eventLayout.availableHeight -
    eventLayout.contentPaddingVertical * 2 -
    eventLayout.imageGap -
    eventActionPanelHeight;
  const minimumEventImageHeight = Math.min(160, eventLayout.availableHeight * 0.32);
  const eventImageHeight = eventActionPanelHeight && !isLandscape
    ? Math.min(
        eventLayout.imageHeight,
        Math.max(minimumEventImageHeight, maximumFittingImageHeight),
      )
    : eventLayout.imageHeight;
  const eventImageWidth = eventImageHeight * eventImageAspectRatio;

  return (
    <View
      style={[
        styles.viewport,
        {
          height: viewportHeight,
        },
      ]}
    >
      <View
        style={[
          styles.gameCanvas,
          isLandscape && styles.gameCanvasLandscape,
          { width: canvasWidth, height: canvasHeight },
        ]}
      >
        <ImageBackground
          source={eventImageSource ? undefined : backgroundSource}
          style={[
            styles.background,
            eventImageSource ? styles.eventBackground : null,
          ]}
          imageStyle={styles.backgroundImage}
          resizeMode="cover"
        >
          <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <View style={styles.scrim} />

            <Pressable
              style={styles.endingInteractionLayer}
              accessibilityRole={isSurvived ? 'button' : undefined}
              accessibilityLabel={isSurvived ? text.survivedHint : undefined}
              onPress={isSurvived ? onFinishJourney : undefined}
            >
              <ScrollView
                style={styles.contentScroll}
                contentContainerStyle={[
                  styles.content,
                  isLandscape && styles.contentLandscape,
                  isCompactHeight && styles.contentCompact,
                  eventImageSource ? styles.contentEvent : null,
                  eventImageSource && isLandscape
                    ? styles.contentEventLandscape
                    : null,
                  eventImageSource
                    ? {
                        paddingTop: eventLayout.contentPaddingVertical,
                        paddingBottom: eventLayout.contentPaddingVertical,
                      }
                    : null,
                ]}
                scrollEnabled={eventScrollEnabled}
                showsVerticalScrollIndicator={false}
                onLayout={(event) => setEventViewportHeight(event.nativeEvent.layout.height)}
                onContentSizeChange={(_, height) => setEventContentHeight(height)}
              >
                {eventImageSource ? (
                  <Image
                    source={eventImageSource}
                    resizeMode="contain"
                    style={[
                      styles.eventImage,
                      {
                        width: eventImageWidth,
                        height: eventImageHeight,
                        marginBottom: eventLayout.imageGap,
                      },
                    ]}
                  />
                ) : null}
                <View
                  style={[
                    styles.actionPanel,
                    isLandscape && styles.actionPanelLandscape,
                  ]}
                  onLayout={(event) =>
                    setEventActionPanelHeight(event.nativeEvent.layout.height)
                  }
                >
                  <View
                    style={[
                      styles.messageCard,
                      isLandscape && styles.messageCardLandscape,
                      isCompactHeight && styles.messageCardCompact,
                      eventImageSource
                        ? { paddingVertical: eventLayout.messagePaddingVertical }
                        : null,
                    ]}
                  >
                    {eventTitle ? (
                      <Text
                        style={[
                          styles.messageTitle,
                          { marginBottom: eventLayout.messageTitleGap },
                        ]}
                      >
                        {eventTitle}
                      </Text>
                    ) : null}
                    <Text
                      style={[
                        styles.messageText,
                        isLandscape && styles.messageTextLandscape,
                        isCompactHeight && styles.messageTextCompact,
                      ]}
                    >
                      {message}
                    </Text>
                    {isSurvived ? (
                      <Text style={styles.survivedHint}>{text.survivedHint}</Text>
                    ) : null}
                  </View>

                  {!isSurvived ? <View
                    style={[
                      styles.buttonColumn,
                      isLandscape && styles.buttonColumnLandscape,
                      isCompactHeight && styles.buttonColumnCompact,
                      eventImageSource
                        ? {
                            marginTop: eventLayout.buttonMarginTop,
                            gap: eventLayout.buttonGap,
                          }
                        : null,
                    ]}
                  >
                {variant === 'failure' ? (
                  <TouchableOpacity style={[styles.continueButton, eventButtonHeightStyle]} onPress={onContinueAfterAd} activeOpacity={0.92}>
                    <Text style={styles.continueButtonText}>{text.continueAfterAd}</Text>
                    <View style={styles.rewardAdBadge}>
                      <MaterialCommunityIcons name="gift-outline" size={15} color="#FDE9A8" />
                    </View>
                  </TouchableOpacity>
                ) : null}

                {variant === 'failure' && failureRecap?.items.length ? (
                  <TouchableOpacity
                    style={[styles.tertiaryButton, eventButtonHeightStyle]}
                    onPress={() => {
                      setShowFailureRecap(true);
                      onViewMistakes?.();
                    }}
                    activeOpacity={0.92}
                  >
                    <Text style={styles.tertiaryButtonText}>{text.viewMistakes}</Text>
                  </TouchableOpacity>
                ) : null}

                {isJourneyEnding ? (
                  <TouchableOpacity style={[styles.journeyButton, eventButtonHeightStyle]} onPress={onViewJourney} activeOpacity={0.92}>
                    <Text style={styles.journeyButtonText}>{text.viewJourney}</Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity style={[styles.primaryButton, eventButtonHeightStyle]} onPress={onTryAnotherChoice} activeOpacity={0.92}>
                  <Text style={styles.primaryButtonText}>{text.chooseAnother}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.secondaryButton, eventButtonHeightStyle]} onPress={onRestartFromBeginning} activeOpacity={0.92}>
                  <Text style={styles.secondaryButtonText}>{text.restart}</Text>
                </TouchableOpacity>

                {variant === 'failure' ? (
                  <TouchableOpacity style={[styles.stopButton, eventButtonHeightStyle]} onPress={onStopJourney} activeOpacity={0.92}>
                    <Text style={styles.stopButtonText}>{text.stopJourney}</Text>
                  </TouchableOpacity>
                ) : null}
                  </View> : null}
                </View>
              </ScrollView>
            </Pressable>

            {variant === 'failure' && showFailureRecap && failureRecap?.items.length ? (
              <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{failureRecap.title[lang]}</Text>
                    <TouchableOpacity
                      style={styles.modalCloseButton}
                      onPress={() => setShowFailureRecap(false)}
                      activeOpacity={0.9}
                    >
                      <MaterialCommunityIcons name="close" size={18} color="#6E4A44" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    style={styles.modalScroll}
                    contentContainerStyle={styles.modalScrollContent}
                    showsVerticalScrollIndicator={false}
                  >
                    {failureRecap.items.map((item, index) => (
                      <View key={`${item.title.en}-${index}`} style={styles.modalItem}>
                        <Text style={styles.modalItemTitle}>{item.title[lang]}</Text>
                        <Text style={styles.modalItemDetail}>{item.detail[lang]}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>
            ) : null}
          </SafeAreaView>
        </ImageBackground>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111015',
    overflow: 'hidden',
  },
  gameCanvas: {
    maxWidth: '100%',
    overflow: 'hidden',
    backgroundColor: '#1A1515',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  gameCanvasLandscape: {
    alignSelf: 'center',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  eventBackground: {
    backgroundColor: '#111015',
  },
  backgroundImage: {
    resizeMode: 'cover',
  },
  safeArea: {
    flex: 1,
  },
  endingInteractionLayer: {
    flex: 1,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 244, 232, 0.20)',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    width: '100%',
    maxWidth: '100%',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  contentScroll: {
    width: '100%',
    height: '100%',
  },
  contentEvent: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 16,
  },
  contentEventLandscape: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  eventImage: {
    flexShrink: 0,
    alignSelf: 'center',
    marginBottom: 16,
  },
  contentLandscape: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 28,
    paddingVertical: 24,
  },
  contentCompact: {
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  actionPanel: {
    width: '100%',
    maxWidth: '100%',
  },
  actionPanelLandscape: {
    width: '36%',
    minWidth: 300,
    maxWidth: 410,
  },
  messageCard: {
    width: '100%',
    maxWidth: '100%',
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    shadowColor: '#D79F63',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  messageCardCompact: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  messageCardLandscape: {
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  messageText: {
    textAlign: 'center',
    fontSize: 17,
    lineHeight: 25,
    color: '#63442E',
    fontWeight: '700',
  },
  messageTitle: {
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 20,
    lineHeight: 27,
    color: '#563923',
    fontWeight: '900',
  },
  survivedHint: {
    marginTop: 14,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
    color: '#765944',
    fontWeight: '700',
  },
  messageTextCompact: {
    fontSize: 15,
    lineHeight: 21,
  },
  messageTextLandscape: {
    textAlign: 'left',
    fontSize: 16,
    lineHeight: 23,
  },
  buttonColumn: {
    width: '100%',
    maxWidth: '100%',
    marginTop: 12,
    gap: 12,
  },
  buttonColumnCompact: {
    marginTop: 10,
    gap: 10,
  },
  buttonColumnLandscape: {
    marginTop: 10,
    gap: 9,
  },
  continueButton: {
    width: '100%',
    maxWidth: '100%',
    minHeight: 48,
    backgroundColor: 'rgba(240,248,255,0.96)',
    borderRadius: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(146,184,221,0.9)',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#284A6E',
  },
  rewardAdBadge: {
    width: 28,
    height: 22,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#315C87',
    borderWidth: 1,
    borderColor: 'rgba(253, 221, 141, 0.68)',
    shadowColor: '#284A6E',
    shadowOpacity: 0.18,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  primaryButton: {
    width: '100%',
    maxWidth: '100%',
    minHeight: 48,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#7A4A2E',
  },
  secondaryButton: {
    width: '100%',
    maxWidth: '100%',
    minHeight: 48,
    backgroundColor: 'rgba(122,74,46,0.88)',
    borderRadius: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF7EF',
  },
  tertiaryButton: {
    width: '100%',
    maxWidth: '100%',
    minHeight: 48,
    backgroundColor: 'rgba(78,53,94,0.92)',
    borderRadius: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tertiaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF7EF',
  },
  journeyButton: {
    width: '100%',
    minHeight: 48,
    backgroundColor: 'rgba(238,247,255,0.96)',
    borderRadius: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(120,166,211,0.82)',
  },
  journeyButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#284A6E',
  },
  stopButton: {
    width: '100%',
    minHeight: 44,
    borderRadius: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,247,239,0.6)',
    backgroundColor: 'rgba(38,28,30,0.68)',
  },
  stopButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF7EF',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27, 18, 22, 0.42)',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  modalCard: {
    maxHeight: '68%',
    backgroundColor: 'rgba(255, 248, 244, 0.97)',
    borderRadius: 26,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.75)',
    shadowColor: '#6B4740',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  modalScroll: {
    maxHeight: 360,
  },
  modalScrollContent: {
    paddingBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
    color: '#6E4A44',
    paddingRight: 12,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(110,74,68,0.08)',
  },
  modalItem: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(110,74,68,0.10)',
  },
  modalItemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#8A4F4D',
    marginBottom: 4,
  },
  modalItemDetail: {
    fontSize: 14,
    lineHeight: 21,
    color: '#6C524A',
    fontWeight: '600',
  },
});
