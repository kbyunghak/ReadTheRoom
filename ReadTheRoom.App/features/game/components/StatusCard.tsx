import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { STAT_METADATA } from '../../../domain/stats/config';
import type { GameStats, StatKey } from '../../../domain/stats/types';
import {
  getConditionSummary,
  getStatusDetailTone,
} from '../../../utils/conditionSummary';

type Props = {
  width: number;
  right: number;
  top: number;
  stats: GameStats;
  episode?: number;
  language: 'en' | 'ko';
  labels: Record<StatKey, string>;
  resetKey: number;
};

const STATUS_ORDER: StatKey[] = [
  'funds',
  'mental',
  'relation',
  'english',
  'stamina',
  'insight',
];

export default function StatusCard({
  width,
  right,
  top,
  stats,
  episode,
  language,
  labels,
  resetKey,
}: Props) {
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const [isFlipped, setIsFlipped] = useState(false);
  const condition = getConditionSummary({ episode, lang: language, stats });
  const detailTone = getStatusDetailTone(stats, language);
  const frontRotate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backRotate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  useEffect(() => {
    setIsFlipped(false);
    flipAnimation.setValue(0);
  }, [flipAnimation, resetKey]);

  const toggle = () => {
    const nextFlipped = !isFlipped;
    setIsFlipped(nextFlipped);
    Animated.spring(flipAnimation, {
      toValue: nextFlipped ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 50,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.96}
      onPress={toggle}
      style={[styles.wrap, { width, right, top }]}
    >
      <View style={[styles.stage, isFlipped && styles.stageFlipped]}>
        <Animated.View
          style={[styles.front, { transform: [{ perspective: 1000 }, { rotateY: frontRotate }] }]}
        >
          <View style={styles.frontHeader}>
            <View style={styles.frontTitleRow}>
              <View style={[styles.badge, { borderColor: condition.color }]}>
                <MaterialCommunityIcons
                  name={
                    condition.icon as keyof typeof MaterialCommunityIcons.glyphMap
                  }
                  size={17}
                  color={condition.color}
                />
              </View>
              <Text
                style={[styles.frontTitle, { color: condition.color }]}
                numberOfLines={1}
              >
                {condition.title}
              </Text>
            </View>
            <MaterialCommunityIcons
              name="cards-outline"
              size={14}
              color="rgba(232,241,255,0.68)"
              style={styles.flipHint}
            />
          </View>
          <View style={styles.divider} />
          <Text style={styles.description} numberOfLines={2}>
            {condition.description}
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            styles.back,
            { transform: [{ perspective: 1000 }, { rotateY: backRotate }] },
          ]}
        >
          <Text style={styles.backTitle}>
            {language === 'ko' ? '상태 보기' : 'Status'}
          </Text>
          <View style={styles.divider} />
          <View style={styles.grid}>
            {STATUS_ORDER.map((key) => {
              const metadata = STAT_METADATA[key];
              const max = key === 'funds' ? 1000 : 100;

              return (
                <View key={key} style={styles.item}>
                  <MaterialCommunityIcons
                    name={metadata.icon}
                    size={20}
                    color={metadata.statusColor}
                  />
                  <View style={styles.itemText}>
                    <View style={styles.itemTopRow}>
                      <Text style={styles.label}>{labels[key]}</Text>
                      <Text style={styles.value}>
                        {stats[key]} / {max}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.tonePill,
                        {
                          borderColor: `${metadata.statusColor}55`,
                          backgroundColor: `${metadata.statusColor}18`,
                        },
                      ]}
                    >
                      <Text
                        style={[styles.tone, { color: metadata.statusColor }]}
                      >
                        {detailTone[key]}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    marginBottom: 0,
    zIndex: 12,
    elevation: 12,
  },
  stage: {
    width: '100%',
    minHeight: 0,
  },
  stageFlipped: {
    height: 356,
  },
  card: {
    width: '100%',
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.1,
    borderColor: 'rgba(207,226,255,0.46)',
    backgroundColor: 'rgba(9, 21, 45, 0.88)',
    shadowColor: '#071224',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
    backfaceVisibility: 'hidden',
  },
  front: {
    position: 'relative',
    width: '100%',
    minHeight: 0,
    paddingHorizontal: 11,
    paddingTop: 8,
    paddingBottom: 7,
    borderRadius: 16,
    borderWidth: 1.1,
    borderColor: 'rgba(207,226,255,0.46)',
    backgroundColor: 'rgba(9, 21, 45, 0.88)',
    shadowColor: '#071224',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
    backfaceVisibility: 'hidden',
  },
  frontHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  frontTitleRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  badge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34, 86, 200, 0.16)',
  },
  frontTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '900',
  },
  flipHint: {
    marginLeft: 8,
    flexShrink: 0,
    opacity: 0.82,
  },
  divider: {
    marginTop: 5,
    height: 1,
    backgroundColor: 'rgba(207,226,255,0.18)',
  },
  description: {
    marginTop: 5,
    marginBottom: 0,
    padding: 0,
    fontSize: 10,
    lineHeight: 14,
    color: 'rgba(228,234,244,0.82)',
    fontWeight: '700',
  },
  back: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-start',
  },
  backTitle: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '900',
    color: '#F5F8FD',
  },
  grid: {
    marginTop: 8,
    gap: 6,
  },
  item: {
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(180, 209, 255, 0.12)',
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  itemText: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
  label: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
    color: 'rgba(227,236,246,0.9)',
  },
  value: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '900',
    color: '#F5F8FD',
    flexShrink: 0,
  },
  tonePill: {
    alignSelf: 'flex-start',
    minWidth: 48,
    minHeight: 22,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  tone: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '800',
  },
});
