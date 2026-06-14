import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type Props = {
  label: string;
  value: number;
  max: number;
  color: string;
};

export default function CharacterStatBar({
  label,
  value,
  max,
  color,
}: Props) {
  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: value / max,
      duration: 600,
      delay: 200,
      useNativeDriver: false,
    }).start();
  }, [barAnim, max, value]);

  const barWidth = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.track}>
        <Animated.View
          style={[styles.fill, { width: barWidth, backgroundColor: color }]}
        />
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    width: 68,
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
  },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  value: {
    width: 36,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
  },
});
