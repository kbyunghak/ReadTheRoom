import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  height: number;
  horizontalPadding: number;
  title: string;
  language: 'ko' | 'en';
  showLanguageMenu: boolean;
  onOpenRoadmap: () => void;
  onShowFullTitle: () => void;
  onToggleLanguageMenu: () => void;
  onSelectLanguage: (language: 'ko' | 'en') => void;
};

export default function GameHeaderBar({
  height,
  horizontalPadding,
  title,
  language,
  showLanguageMenu,
  onOpenRoadmap,
  onShowFullTitle,
  onToggleLanguageMenu,
  onSelectLanguage,
}: Props) {
  return (
    <>
      <View
        style={[
          styles.row,
          { height, paddingHorizontal: horizontalPadding },
        ]}
      >
        <TouchableOpacity style={styles.iconButton} onPress={onOpenRoadmap}>
          <MaterialCommunityIcons
            name="map-outline"
            size={20}
            color="#F1F1EF"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.titleButton}
          activeOpacity={0.82}
          onPress={onShowFullTitle}
        >
          <Text
            style={styles.title}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={onToggleLanguageMenu}
        >
          <MaterialCommunityIcons
            name="translate"
            size={20}
            color="#F1F1EF"
          />
        </TouchableOpacity>
      </View>

      {showLanguageMenu ? (
        <View
          style={[
            styles.languageMenu,
            { top: height + 4, right: horizontalPadding },
          ]}
        >
          <TouchableOpacity
            style={styles.languageMenuItem}
            onPress={() => onSelectLanguage('ko')}
          >
            <Text
              style={[
                styles.languageMenuText,
                language === 'ko' && styles.languageMenuTextActive,
              ]}
            >
              한국어
            </Text>
          </TouchableOpacity>
          <View style={styles.languageMenuDivider} />
          <TouchableOpacity
            style={styles.languageMenuItem}
            onPress={() => onSelectLanguage('en')}
          >
            <Text
              style={[
                styles.languageMenuText,
                language === 'en' && styles.languageMenuTextActive,
              ]}
            >
              English
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(8, 19, 38, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleButton: {
    position: 'absolute',
    left: 56,
    right: 56,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    textAlign: 'center',
    textShadowColor: 'rgba(3, 10, 19, 0.24)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  languageMenu: {
    position: 'absolute',
    minWidth: 108,
    backgroundColor: 'rgba(7, 18, 38, 0.96)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(113, 175, 255, 0.42)',
    overflow: 'hidden',
    zIndex: 20,
    shadowColor: '#061121',
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  languageMenuItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  languageMenuDivider: {
    height: 1,
    backgroundColor: 'rgba(207,226,255,0.12)',
  },
  languageMenuText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    color: 'rgba(231,237,244,0.82)',
  },
  languageMenuTextActive: {
    color: '#FFFFFF',
  },
});
