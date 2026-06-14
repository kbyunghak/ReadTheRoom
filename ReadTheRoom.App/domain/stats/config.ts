import type { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import type { StatKey } from './types';

export type LocalizedStatLabel = {
  ko: string;
  en: string;
};

export type StatMetadata = {
  label: LocalizedStatLabel;
  sourceMax: number;
  displayMax: number;
  characterColor: string;
  statusColor: string;
  resultColor: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
};

export const STAT_METADATA: Record<StatKey, StatMetadata> = {
  funds: {
    label: { ko: '자금', en: 'Funds' },
    sourceMax: 1000,
    displayMax: 1000,
    characterColor: '#F59F00',
    statusColor: '#F0D44E',
    resultColor: '#D9E6F7',
    icon: 'currency-usd',
  },
  mental: {
    label: { ko: '멘탈', en: 'Mental' },
    sourceMax: 100,
    displayMax: 1000,
    characterColor: '#F03E3E',
    statusColor: '#4F8DFF',
    resultColor: '#D9E6F7',
    icon: 'brain',
  },
  english: {
    label: { ko: '영어', en: 'English' },
    sourceMax: 100,
    displayMax: 1000,
    characterColor: '#339AF0',
    statusColor: '#F26F97',
    resultColor: '#D9E6F7',
    icon: 'book-open-page-variant-outline',
  },
  insight: {
    label: { ko: '눈치', en: 'Insight' },
    sourceMax: 100,
    displayMax: 1000,
    characterColor: '#BE4BDB',
    statusColor: '#F0BE63',
    resultColor: '#D9E6F7',
    icon: 'eye-outline',
  },
  stamina: {
    label: { ko: '체력', en: 'Stamina' },
    sourceMax: 100,
    displayMax: 1000,
    characterColor: '#40C057',
    statusColor: '#4CC26A',
    resultColor: '#D9E6F7',
    icon: 'battery-high',
  },
  relation: {
    label: { ko: '관계', en: 'Relation' },
    sourceMax: 100,
    displayMax: 1000,
    characterColor: '#FF6B9D',
    statusColor: '#9C7CFF',
    resultColor: '#D9E6F7',
    icon: 'account-group-outline',
  },
};
