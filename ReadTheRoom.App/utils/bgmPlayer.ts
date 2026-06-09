import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
  type AudioSource,
} from 'expo-audio';
import { Platform } from 'react-native';

export type BgmTrack = 'main' | 'title' | 'play' | 'summary' | 'good' | 'mid' | 'sad';

const TRACKS: Record<BgmTrack, AudioSource> = {
  main: require('../assets/bgm/main.mp3'),
  title: require('../assets/bgm/title.mp3'),
  play: require('../assets/bgm/play.mp3'),
  summary: require('../assets/bgm/summary.mp3'),
  good: require('../assets/bgm/good.mp3'),
  mid: require('../assets/bgm/mid.mp3'),
  sad: require('../assets/bgm/sad.mp3'),
};

const TRACK_VOLUMES: Record<BgmTrack, number> = {
  main: 0.5,
  title: 0.42,
  play: 0.26,
  summary: 0.34,
  good: 0.4,
  mid: 0.36,
  sad: 0.32,
};

let currentPlayer: AudioPlayer | null = null;
let currentTrack: BgmTrack | null = null;
let currentVolume = 0;
let isConfigured = false;
let transitionToken = 0;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const ensureAudioMode = async () => {
  if (isConfigured) return;

  if (Platform.OS === 'ios') {
    await setAudioModeAsync({
      allowsRecording: false,
      shouldPlayInBackground: false,
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
      shouldRouteThroughEarpiece: false,
    });
  } else {
    await setAudioModeAsync({
      shouldPlayInBackground: false,
      shouldRouteThroughEarpiece: false,
    });
  }

  isConfigured = true;
};

const createLoopingPlayer = (source: AudioSource) => {
  const player = createAudioPlayer(source, {
    updateInterval: 500,
    keepAudioSessionActive: true,
  });

  player.loop = true;
  player.volume = 0;

  return player;
};

const fadeVolume = async (player: AudioPlayer, from: number, to: number, durationMs: number, token: number) => {
  const stepCount = Math.max(1, Math.round(durationMs / 50));

  for (let step = 0; step <= stepCount; step += 1) {
    if (token !== transitionToken) return;

    const progress = step / stepCount;
    player.volume = from + (to - from) * progress;
    if (step < stepCount) {
      await wait(50);
    }
  }
};

export const playBgm = async (track: BgmTrack, fadeDurationMs = 700) => {
  transitionToken += 1;
  const token = transitionToken;
  const targetVolume = TRACK_VOLUMES[track] ?? 1;

  await ensureAudioMode();

  if (currentTrack === track && currentPlayer) {
    currentPlayer.volume = targetVolume;
    if (!currentPlayer.playing) {
      currentPlayer.play();
    }
    currentVolume = targetVolume;
    return;
  }

  const nextPlayer = createLoopingPlayer(TRACKS[track]);
  nextPlayer.play();

  const previousPlayer = currentPlayer;
  currentPlayer = nextPlayer;
  currentTrack = track;

  await Promise.all([
    fadeVolume(nextPlayer, 0, targetVolume, fadeDurationMs, token),
    previousPlayer ? fadeVolume(previousPlayer, currentVolume, 0, fadeDurationMs, token) : Promise.resolve(),
  ]);

  currentVolume = targetVolume;

  if (previousPlayer) {
    previousPlayer.pause();
    previousPlayer.remove();
  }
};

export const stopBgm = async (fadeDurationMs = 500) => {
  if (!currentPlayer) return;

  transitionToken += 1;
  const token = transitionToken;
  const playerToStop = currentPlayer;

  currentPlayer = null;
  currentTrack = null;

  await fadeVolume(playerToStop, currentVolume, 0, fadeDurationMs, token);
  currentVolume = 0;

  playerToStop.pause();
  playerToStop.remove();
};

export const getCurrentBgmTrack = () => currentTrack;
