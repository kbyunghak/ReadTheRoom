import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { STAT_METADATA } from '../../../domain/stats/config';
import type { StatKey } from '../../../domain/stats/types';

type Props = {
  statKey: StatKey;
  value: number;
  label: string;
  compact?: boolean;
};

export default function ResultStatItem({
  statKey,
  value,
  label,
  compact = false,
}: Props) {
  if (value === 0) return null;
  const isPositive = value > 0;
  const metadata = STAT_METADATA[statKey];

  return (
    <View style={[styles.item, compact && styles.compact]}>
      <MaterialCommunityIcons
        name={metadata.icon}
        size={20}
        color={metadata.resultColor}
      />
      <Text style={styles.label}>{label}</Text>
      <Text
        style={[
          styles.value,
          isPositive ? styles.positive : styles.negative,
        ]}
      >
        {isPositive ? `+${value}` : value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    minWidth: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compact: {
    minWidth: 0,
    flexShrink: 1,
    borderWidth: 1,
    borderColor: 'rgba(177, 132, 255, 0.22)',
    borderRadius: 10,
    backgroundColor: 'rgba(9, 20, 43, 0.44)',
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
    color: '#E6EEF9',
    fontWeight: '800',
  },
  value: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
  },
  positive: {
    color: '#6EE787',
  },
  negative: {
    color: '#FF8F8F',
  },
});
