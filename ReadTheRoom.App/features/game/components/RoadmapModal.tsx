import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { forwardRef } from 'react';
import {
  Alert,
  ImageBackground,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { BACKGROUND_IMAGES } from '../../../shared/assets/registry';
import type { LocalizedText } from '../../../utils/scenarioRegistry';

export type RoadmapNode = {
  scenarioId: number;
  week: number;
  day: number;
  progressLabel: string;
  title: LocalizedText;
  stampLabel: string;
};

type Copy = {
  title: string;
  hint: string;
  close: string;
  current: string;
  rewind: string;
  locked: string;
  weekLocked: string;
};

type WeekMeta = {
  label?: string;
  week: number;
  dayStart: number;
  dayEnd: number;
};

type Props = {
  groupHeading?: string;
  visible: boolean;
  language: 'en' | 'ko';
  copy: Copy;
  locationTitle: string;
  selectedWeek: number;
  nodes: RoadmapNode[];
  weeks: readonly WeekMeta[];
  unlockedWeeks: Set<number>;
  completedScenarioIds: Set<number>;
  currentScenarioId: number;
  panelWidth: number;
  panelHeight: number;
  topInset: number;
  bottomInset: number;
  styles: Record<string, any>;
  stampColors: readonly string[];
  onClose: () => void;
  onSelectWeek: (week: number) => void;
  onJump: (node: RoadmapNode) => void;
};

const RoadmapModal = forwardRef<ScrollView, Props>(function RoadmapModal(
  {
    groupHeading,
    visible,
    language,
    copy,
    locationTitle,
    selectedWeek,
    nodes,
    weeks,
    unlockedWeeks,
    completedScenarioIds,
    currentScenarioId,
    panelWidth,
    panelHeight,
    topInset,
    bottomInset,
    styles,
    stampColors,
    onClose,
    onSelectWeek,
    onJump,
  },
  ref,
) {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height && width >= 700;
  const landscapeStampWidth = Math.max(
    120,
    Math.min(164, Math.floor((panelWidth - 126) / Math.max(nodes.length, 1))),
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent={false}
      onRequestClose={onClose}
    >
      <ImageBackground
        source={BACKGROUND_IMAGES.airport}
        style={styles.roadmapModalBackground}
        imageStyle={styles.roadmapModalBackgroundImage}
      >
        <View style={styles.roadmapModalScrim} />
        <View
          style={[
            styles.roadmapModalSafeArea,
            { paddingTop: topInset, paddingBottom: bottomInset },
          ]}
        >
          <View
            style={[
            styles.roadmapModalCard,
            isLandscape && styles.roadmapModalCardLandscape,
              {
                width: panelWidth,
                height: panelHeight,
                maxHeight: panelHeight,
              },
            ]}
          >
            <View
              style={[
                styles.roadmapFixedHeader,
                isLandscape && styles.roadmapFixedHeaderLandscape,
              ]}
            >
              <View style={styles.roadmapHeaderRow}>
                <View style={styles.roadmapHeaderCopy}>
                  <Text
                    style={[
                      styles.roadmapTitle,
                      isLandscape && styles.roadmapTitleLandscape,
                    ]}
                  >
                    {copy.title}
                  </Text>
                  <Text
                    style={styles.roadmapLocationTitle}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {locationTitle}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.roadmapCloseButton}
                  onPress={onClose}
                  accessibilityRole="button"
                  accessibilityLabel={copy.close}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={21}
                    color="#5B4C40"
                  />
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.roadmapPersistentHint,
                  isLandscape && styles.roadmapPersistentHintLandscape,
                ]}
              >
                <MaterialCommunityIcons
                  name="information-outline"
                  size={15}
                  color="#FFF5E5"
                />
                <Text style={styles.roadmapPersistentHintText}>{copy.hint}</Text>
              </View>
            </View>

            <View
              style={[
                styles.roadmapBody,
                isLandscape && styles.roadmapBodyLandscape,
              ]}
            >
              <ImageBackground
                source={require('../../../assets/images/paper.png')}
                style={styles.roadmapPaperFrame}
                imageStyle={styles.roadmapPaperTexture}
              >
                <ScrollView
                  ref={ref}
                  style={[
                    styles.roadmapEpisodeScroll,
                    Platform.OS === 'web'
                      ? ({
                          scrollbarWidth: 'thin',
                          scrollbarColor:
                            'rgba(139, 92, 165, 0.24) transparent',
                        } as never)
                      : null,
                  ]}
                  horizontal={isLandscape}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={!isLandscape && Platform.OS === 'web'}
                  nestedScrollEnabled
                  bounces={false}
                  contentContainerStyle={[
                    styles.roadmapEpisodeContent,
                    isLandscape && styles.roadmapEpisodeContentLandscape,
                  ]}
                >
                  <View
                    style={[
                      styles.passportPage,
                      isLandscape && styles.passportPageLandscape,
                      isLandscape
                        ? {
                            width: Math.max(
                              panelWidth - 80,
                              nodes.length * landscapeStampWidth,
                            ),
                          }
                        : null,
                    ]}
                  >
                    <Text style={styles.passportPageHeader}>
                      {groupHeading ?? `VISA / VISAS · WEEK ${selectedWeek}`}
                    </Text>
                    <View style={styles.passportHeaderRule} />

                    <View
                      style={[
                        styles.stampGrid,
                        isLandscape && styles.stampGridLandscape,
                      ]}
                    >
                      {nodes.map((node, index) => {
                        const hasCheckpoint = completedScenarioIds.has(
                          node.scenarioId,
                        );
                        const state =
                          node.scenarioId === currentScenarioId
                            ? 'current'
                            : hasCheckpoint
                              ? 'completed'
                              : 'locked';
                        const isAvailable = state === 'completed';
                        const stampColor =
                          stampColors[index % stampColors.length];
                        const rotation = index % 2 === 0 ? '-9deg' : '8deg';

                        return (
                          <View
                            key={`roadmap-${node.scenarioId}`}
                            style={[
                              styles.stampSlot,
                              isLandscape && styles.stampSlotLandscape,
                              isLandscape ? { width: landscapeStampWidth } : null,
                            ]}
                          >
                            <TouchableOpacity
                              activeOpacity={isAvailable ? 0.88 : 1}
                              disabled={!isAvailable}
                              onPress={() => onJump(node)}
                              style={[
                                styles.stampFrame,
                                isLandscape && styles.stampFrameLandscape,
                              ]}
                            >
                              <View
                                style={[
                                  styles.stampTape,
                                  index % 2 === 0
                                    ? styles.stampTapeBlue
                                    : styles.stampTapePeach,
                                ]}
                              />
                              <View
                                style={[
                                  styles.stampBody,
                                  isLandscape && styles.stampBodyLandscape,
                                  {
                                    borderColor: stampColor,
                                    transform: [{ rotate: rotation }],
                                  },
                                  state === 'current' &&
                                    styles.stampBodyCurrent,
                                  state === 'locked' &&
                                    styles.stampBodyLocked,
                                ]}
                              >
                                {state === 'locked' ? (
                                  <MaterialCommunityIcons
                                    name="lock-outline"
                                    size={14}
                                    color="#A69582"
                                  />
                                ) : null}
                                <Text
                                  style={[
                                    styles.stampPlace,
                                    isLandscape && styles.stampPlaceLandscape,
                                    {
                                      color:
                                        state === 'locked'
                                          ? '#8F806F'
                                          : stampColor,
                                    },
                                  ]}
                                  numberOfLines={2}
                                  adjustsFontSizeToFit
                                  minimumFontScale={0.74}
                                >
                                  {state === 'locked'
                                    ? 'LOCKED'
                                    : node.stampLabel}
                                </Text>
                                <Text
                                  style={[
                                    styles.stampDate,
                                    isLandscape && styles.stampDateLandscape,
                                    {
                                      color:
                                        state === 'locked'
                                          ? '#9C8D7B'
                                          : stampColor,
                                    },
                                  ]}
                                >
                                  {node.progressLabel}
                                </Text>
                                <Text
                                  style={[
                                    styles.stampMeta,
                                    isLandscape && styles.stampMetaLandscape,
                                    {
                                      color:
                                        state === 'locked'
                                          ? '#AA9A88'
                                          : stampColor,
                                    },
                                  ]}
                                >
                                  {state === 'current'
                                    ? copy.current
                                    : state === 'completed'
                                      ? copy.rewind
                                      : copy.locked}
                                </Text>
                              </View>
                              <Text
                                style={[
                                  styles.stampCaption,
                                  isLandscape && styles.stampCaptionLandscape,
                                  state === 'locked' &&
                                    styles.stampCaptionLocked,
                                ]}
                                numberOfLines={2}
                              >
                                {node.title[language]}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </ScrollView>
              </ImageBackground>

              <View
                style={[
                  styles.roadmapWeekTabs,
                  isLandscape && styles.roadmapWeekTabsLandscape,
                ]}
              >
                {weeks.map((weekMeta) => {
                  const isSelected = selectedWeek === weekMeta.week;
                  const isUnlocked = unlockedWeeks.has(weekMeta.week);

                  return (
                    <TouchableOpacity
                      key={`roadmap-week-${weekMeta.week}`}
                      style={[
                        styles.roadmapWeekTab,
                        isSelected && styles.roadmapWeekTabSelected,
                        !isUnlocked && styles.roadmapWeekTabLocked,
                      ]}
                      activeOpacity={isUnlocked ? 0.82 : 1}
                      onPress={() => {
                        if (!isUnlocked) {
                          Alert.alert(copy.title, copy.weekLocked);
                          return;
                        }
                        onSelectWeek(weekMeta.week);
                      }}
                    >
                      <View style={styles.roadmapWeekTabTopRow}>
                        <Text
                          style={[
                            styles.roadmapWeekTabTitle,
                            isSelected && styles.roadmapWeekTabTitleSelected,
                          ]}
                        >
                          {weekMeta.label ?? `W${weekMeta.week}`}
                        </Text>
                        {!isUnlocked ? (
                          <MaterialCommunityIcons
                            name="lock-outline"
                            size={11}
                            color="#A99884"
                          />
                        ) : null}
                      </View>
                      <Text
                        style={[
                          styles.roadmapWeekTabRange,
                          isSelected && styles.roadmapWeekTabRangeSelected,
                        ]}
                      >
                        {`${weekMeta.dayStart}–${weekMeta.dayEnd}`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>
    </Modal>
  );
});

export default RoadmapModal;
