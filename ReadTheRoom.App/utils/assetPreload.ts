import { Asset } from 'expo-asset';
import type { ImageSourcePropType } from 'react-native';

const LAUNCH_VISUALS = [
  require('../assets/UI/main.png'),
  require('../assets/background/dream.png'),
];

const CORE_GAME_VISUALS = [
  require('../assets/background/adaptation.png'),
  require('../assets/background/airport.png'),
  require('../assets/background/office.png'),
  require('../assets/background/house.png'),
  require('../assets/background/cafe.png'),
  require('../assets/background/bank.png'),
  require('../assets/background/busstop.png'),
  require('../assets/background/night_street.png'),
  require('../assets/background/nightstreet_ppl.png'),
  require('../assets/background/city_night.png'),
  require('../assets/background/observatory_nature.png'),
  require('../assets/background/partyroom_lonely.png'),
  require('../assets/background/mart.png'),
  require('../assets/characters/ken.png'),
  require('../assets/characters/amy.png'),
  require('../assets/characters/sora.png'),
  require('../assets/characters/jun.png'),
  require('../assets/characters/jina.png'),
  require('../assets/characters/yoon.png'),
  require('../assets/characters/ken_card.png'),
  require('../assets/characters/amy_card.png'),
  require('../assets/characters/sora_card.png'),
  require('../assets/characters/jun_card.png'),
  require('../assets/characters/jina_card.png'),
  require('../assets/characters/yoon_card.png'),
];

let launchVisualPromise: Promise<void> | null = null;
let coreVisualPromise: Promise<void> | null = null;

export const preloadAssetSources = async (sources: ImageSourcePropType[]) => {
  await Promise.all(sources.map((source) => Asset.loadAsync(source as string | number)));
};

export const preloadLaunchVisualAssets = async () => {
  launchVisualPromise ??= preloadAssetSources(LAUNCH_VISUALS);
  await launchVisualPromise;
};

export const preloadCoreVisualAssets = async () => {
  coreVisualPromise ??= preloadAssetSources([...LAUNCH_VISUALS, ...CORE_GAME_VISUALS]);
  await coreVisualPromise;
};
