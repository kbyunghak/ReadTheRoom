import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Props = {
  height: number;
  horizontalPadding: number;
  menuTop: number;
  title: string;
  showGameMenu: boolean;
  menuCopy: {
    storyMap: string;
    home: string;
    language: string;
    cancel: string;
  };
  onOpenRoadmap: () => void;
  onToggleGameMenu: () => void;
  onCloseGameMenu: () => void;
  onGoToCharacterSelect: () => void;
  language: 'ko' | 'en';
  onSelectLanguage: (language: 'ko' | 'en') => void;
  onShowFullTitle: () => void;
};

export default function GameHeaderBar({
  height,
  horizontalPadding,
  menuTop,
  title,
  showGameMenu,
  menuCopy,
  onOpenRoadmap,
  onToggleGameMenu,
  onCloseGameMenu,
  onGoToCharacterSelect,
  language,
  onSelectLanguage,
  onShowFullTitle,
}: Props) {
  const [showLanguageOptions, setShowLanguageOptions] = useState(false);
  const closeMenu = () => {
    setShowLanguageOptions(false);
    onCloseGameMenu();
  };
  return (
    <>
      <View
        style={[
          styles.row,
          { height, paddingHorizontal: horizontalPadding },
        ]}
      >
        <TouchableOpacity style={styles.iconButton} onPress={onToggleGameMenu}>
          <MaterialCommunityIcons
            name="menu"
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
      </View>

      {showGameMenu ? (
        <Modal
          transparent
          animationType="fade"
          statusBarTranslucent
          onShow={() => setShowLanguageOptions(false)}
          onRequestClose={closeMenu}
        >
          <View style={styles.menuModalRoot}>
            <Pressable style={StyleSheet.absoluteFill} onPress={closeMenu} />
            <View
              style={[
                styles.gameMenu,
                { top: menuTop, left: horizontalPadding },
              ]}
            >
              <TouchableOpacity
                style={styles.gameMenuItem}
                onPress={() => {
                  closeMenu();
                  onGoToCharacterSelect();
                }}
              >
                <MaterialCommunityIcons name="home-outline" size={17} color="#DCEAFF" />
                <Text style={styles.gameMenuText}>{menuCopy.home}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.gameMenuItem}
                onPress={() => {
                  closeMenu();
                  onOpenRoadmap();
                }}
              >
                <MaterialCommunityIcons name="map-outline" size={17} color="#DCEAFF" />
                <Text style={styles.gameMenuText}>
                  {menuCopy.storyMap}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.gameMenuItem}
                onPress={() => setShowLanguageOptions(previous => !previous)}
                accessibilityRole="button"
                accessibilityState={{ expanded: showLanguageOptions }}
              >
                <MaterialCommunityIcons name="translate" size={17} color="#8FC7FF" />
                <Text style={styles.gameMenuText}>{menuCopy.language}</Text>
                <Text style={styles.gameMenuValue}>
                  {language === 'ko' ? '한국어' : 'English'}
                </Text>
              </TouchableOpacity>
              {showLanguageOptions ? (['ko', 'en'] as const).map(option => (
                <TouchableOpacity
                  key={option}
                  style={[styles.gameMenuItem, styles.languageOption]}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: language === option }}
                  onPress={() => {
                    onSelectLanguage(option);
                    closeMenu();
                  }}
                >
                  <MaterialCommunityIcons
                    name={language === option ? 'radiobox-marked' : 'radiobox-blank'}
                    size={17}
                    color="#8FC7FF"
                  />
                  <Text style={styles.gameMenuText}>{option === 'ko' ? '한국어' : 'English'}</Text>
                </TouchableOpacity>
              )) : null}
              <View style={styles.gameMenuDivider} />
              <TouchableOpacity
                style={styles.gameMenuItem}
                onPress={closeMenu}
              >
                <MaterialCommunityIcons name="close" size={17} color="#B9C7D9" />
                <Text style={styles.gameMenuText}>{menuCopy.cancel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  gameMenu: {
    position: 'absolute',
    minWidth: 210,
    backgroundColor: 'rgba(7, 18, 38, 0.98)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(113, 175, 255, 0.42)',
    overflow: 'hidden',
    zIndex: 20,
    shadowColor: '#061121',
    shadowOpacity: 0.32,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  menuModalRoot: {
    flex: 1,
  },
  gameMenuItem: {
    minHeight: 44,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  gameMenuDivider: {
    height: 1,
    backgroundColor: 'rgba(207,226,255,0.12)',
  },
  gameMenuText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
    color: '#EAF2FF',
  },
  gameMenuValue: {
    marginLeft: 'auto',
    paddingLeft: 12,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
    color: '#8FC7FF',
  },
  languageOption: {
    paddingLeft: 26,
  },
});
