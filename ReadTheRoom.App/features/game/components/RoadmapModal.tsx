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
  week: number;
  dayStart: number;
  dayEnd: number;
};

type Props = {
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
              {
                width: panelWidth,
                height: panelHeight,
                maxHeight: panelHeight,
              },
            ]}
          >
            <View style={styles.roadmapFixedHeader}>
              <View style={styles.roadmapHeaderRow}>
                <View style={styles.roadmapHeaderCopy}>
                  <Text style={styles.roadmapTitle}>{copy.title}</Text>
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

              <View style={styles.roadmapPersistentHint}>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={15}
                  color="#FFF5E5"
                />
                <Text style={styles.roadmapPersistentHintText}>{copy.hint}</Text>
              </View>
            </View>

            <View style={styles.roadmapBody}>
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
                  showsVerticalScrollIndicator={Platform.OS === 'web'}
                  nestedScrollEnabled
                  bounces={false}
                  contentContainerStyle={styles.roadmapEpisodeContent}
                >
                  <View style={styles.passportPage}>
                    <Text style={styles.passportPageHeader}>
                      {`VISA / VISAS · WEEK ${selectedWeek}`}
                    </Text>
                    <View style={styles.passportHeaderRule} />

                    <View style={styles.stampGrid}>
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
                            style={styles.stampSlot}
                          >
                            <TouchableOpacity
                              activeOpacity={isAvailable ? 0.88 : 1}
                              disabled={!isAvailable}
                              onPress={() => onJump(node)}
                              style={styles.stampFrame}
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
                                    {
                                      color:
                                        state === 'locked'
                                          ? '#8F806F'
                                          : stampColor,
                                    },
                                  ]}
                                >
                                  {state === 'locked'
                                    ? 'LOCKED'
                                    : node.stampLabel}
                                </Text>
                                <Text
                                  style={[
                                    styles.stampDate,
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

              <View style={styles.roadmapWeekTabs}>
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
                          {`W${weekMeta.week}`}
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
