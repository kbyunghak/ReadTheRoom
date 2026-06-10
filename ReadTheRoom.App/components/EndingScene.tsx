import React, { useState } from 'react';
import {
  ImageBackground,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  lang: 'en' | 'ko';
  variant: 'success' | 'failure';
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
};

const END_TEXT = {
  ko: {
    successMessage: '시행착오도 있었지만, 잘 해내고 있어요.\n이 이야기는 아직 계속돼요. 다음에는 어떤 길을 선택해볼까요?',
    failureMessage: '이번 선택은 쉽지 않았어요.\n이번엔 다르게 해볼까요?',
    continueAfterAd: '계속하기',
    chooseAnother: '다른 캐릭터 선택하기',
    restart: '처음부터 다시 하기',
    viewMistakes: '내가 잘못한 점 보기',
  },
  en: {
    successMessage: 'There were some missteps, but you are doing well.\nThis story is still unfolding. What path will you choose next?',
    failureMessage: 'This choice was not an easy one.\nWould you like to try a different path this time?',
    continueAfterAd: 'Continue',
    chooseAnother: 'Choose Another Character',
    restart: 'Restart From the Beginning',
    viewMistakes: 'See What Went Wrong',
  },
} as const;

const FAILURE_OVERLAYS: Partial<Record<string, ImageSourcePropType>> = {
  ken: require('../assets/images/characters/ken_end.png'),
  amy: require('../assets/images/characters/amy_end.png'),
  sora: require('../assets/images/characters/sora_end.png'),
  jun: require('../assets/images/characters/jun_end.png'),
  yoon: require('../assets/images/characters/yoon_end.png'),
  jina: require('../assets/images/characters/jina_end.png'),
};

export default function EndingScene({
  lang,
  variant,
  characterId,
  failureRecap,
  onContinueAfterAd,
  onTryAnotherChoice,
  onRestartFromBeginning,
  onViewMistakes,
}: Props) {
  const [showFailureRecap, setShowFailureRecap] = useState(false);
  const text = END_TEXT[lang];
  const failureOverlay = variant === 'failure' && characterId ? FAILURE_OVERLAYS[characterId] : undefined;
  const backgroundSource = failureOverlay ?? require('../assets/images/background/end.png');

  return (
    <ImageBackground
      source={backgroundSource}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.scrim} />

        <View style={styles.content}>
          <View style={styles.messageCard}>
            <Text style={styles.messageText}>
              {variant === 'success' ? text.successMessage : text.failureMessage}
            </Text>
          </View>

          <View style={styles.buttonColumn}>
            {variant === 'failure' ? (
              <TouchableOpacity style={styles.continueButton} onPress={onContinueAfterAd} activeOpacity={0.92}>
                <Text style={styles.continueButtonText}>{text.continueAfterAd}</Text>
                <MaterialCommunityIcons name="play-box-outline" size={18} color="#284A6E" />
              </TouchableOpacity>
            ) : null}

            {variant === 'failure' && failureRecap?.items.length ? (
              <TouchableOpacity
                style={styles.tertiaryButton}
                onPress={() => {
                  setShowFailureRecap(true);
                  onViewMistakes?.();
                }}
                activeOpacity={0.92}
              >
                <Text style={styles.tertiaryButtonText}>{text.viewMistakes}</Text>
                <MaterialCommunityIcons name="play-box-outline" size={18} color="#FFF7EF" />
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity style={styles.primaryButton} onPress={onTryAnotherChoice} activeOpacity={0.92}>
              <Text style={styles.primaryButtonText}>{text.chooseAnother}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={onRestartFromBeginning} activeOpacity={0.92}>
              <Text style={styles.secondaryButtonText}>{text.restart}</Text>
            </TouchableOpacity>
          </View>
        </View>

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
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  backgroundImage: {
    resizeMode: 'cover',
  },
  safeArea: {
    flex: 1,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 244, 232, 0.20)',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 38,
  },
  messageCard: {
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    shadowColor: '#D79F63',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  messageText: {
    textAlign: 'center',
    fontSize: 19,
    lineHeight: 30,
    color: '#63442E',
    fontWeight: '700',
  },
  buttonColumn: {
    marginTop: 18,
    gap: 12,
  },
  continueButton: {
    backgroundColor: 'rgba(240,248,255,0.96)',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
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
  primaryButton: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#7A4A2E',
  },
  secondaryButton: {
    backgroundColor: 'rgba(122,74,46,0.88)',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF7EF',
  },
  tertiaryButton: {
    backgroundColor: 'rgba(78,53,94,0.92)',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  tertiaryButtonText: {
    fontSize: 16,
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
