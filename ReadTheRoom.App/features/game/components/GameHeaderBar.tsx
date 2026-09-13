import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
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
    characterSelect: string;
    language: string;
    cancel: string;
  };
  onOpenRoadmap: () => void;
  onToggleGameMenu: () => void;
  onCloseGameMenu: () => void;
  onGoToCharacterSelect: () => void;
  onToggleLanguage: () => void;
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
  onToggleLanguage,
  onShowFullTitle,
}: Props) {
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
          onRequestClose={onCloseGameMenu}
        >
          <View style={styles.menuModalRoot}>
            <Pressable style={StyleSheet.absoluteFill} onPress={onCloseGameMenu} />
            <View
              style={[
                styles.gameMenu,
                { top: menuTop, left: horizontalPadding },
              ]}
            >
              <TouchableOpacity
                style={styles.gameMenuItem}
                onPress={() => {
                  onCloseGameMenu();
                  onOpenRoadmap();
                }}
              >
                <MaterialCommunityIcons name="map-outline" size={17} color="#DCEAFF" />
                <Text style={styles.gameMenuText}>{menuCopy.storyMap}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.gameMenuItem}
                onPress={() => {
                  onCloseGameMenu();
                  onGoToCharacterSelect();
                }}
              >
                <MaterialCommunityIcons name="account-switch-outline" size={17} color="#F6CD6D" />
                <Text style={[styles.gameMenuText, styles.gameMenuExitText]}>
                  {menuCopy.characterSelect}
                </Text>
              </TouchableOpacity>
              <View style={styles.gameMenuDivider} />
              <TouchableOpacity
                style={styles.gameMenuItem}
                onPress={() => {
                  onCloseGameMenu();
                  onToggleLanguage();
                }}
              >
                <MaterialCommunityIcons name="translate" size={17} color="#8FC7FF" />
                <Text style={styles.gameMenuText}>{menuCopy.language}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.gameMenuItem}
                onPress={onCloseGameMenu}
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
    minWidth: 168,
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
  gameMenuExitText: {
    color: '#FFE1A0',
  },
});
