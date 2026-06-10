import { Asset } from 'expo-asset';
import type { ImageSourcePropType } from 'react-native';

const LAUNCH_VISUALS = [
  require('../assets/images/main.png'),
  require('../assets/images/background/dream.png'),
];

const CORE_GAME_VISUALS = [
  require('../assets/images/background/adaptation.png'),
  require('../assets/images/background/airport.png'),
  require('../assets/images/background/office.png'),
  require('../assets/images/background/house.png'),
  require('../assets/images/background/cafe.png'),
  require('../assets/images/background/bank.png'),
  require('../assets/images/background/busstop.png'),
  require('../assets/images/background/night_street.png'),
  require('../assets/images/background/nightstreet_ppl.png'),
  require('../assets/images/background/city_night.png'),
  require('../assets/images/background/observatory_nature.png'),
  require('../assets/images/background/partyroom_lonely.png'),
  require('../assets/images/background/mart.png'),
  require('../assets/images/paper.png'),
  require('../assets/images/characters/ken.png'),
  require('../assets/images/characters/amy.png'),
  require('../assets/images/characters/sora.png'),
  require('../assets/images/characters/jun.png'),
  require('../assets/images/characters/jina.png'),
  require('../assets/images/characters/yoon.png'),
  require('../assets/images/characters/ken_card.png'),
  require('../assets/images/characters/amy_card.png'),
  require('../assets/images/characters/sora_card.png'),
  require('../assets/images/characters/jun_card.png'),
  require('../assets/images/characters/jina_card.png'),
  require('../assets/images/characters/yoon_card.png'),
];

let launchVisualPromise: Promise<void> | null = null;
let coreVisualPromise: Promise<void> | null = null;

export const preloadAssetSources = async (sources: ImageSourcePropType[]) => {
  await Promise.all(
    sources.map((source) => Asset.loadAsync(source as string | number)),
  );
};

export const preloadLaunchVisualAssets = async () => {
  launchVisualPromise ??= preloadAssetSources(LAUNCH_VISUALS);
  await launchVisualPromise;
};

export const preloadCoreVisualAssets = async () => {
  coreVisualPromise ??= preloadAssetSources([
    ...LAUNCH_VISUALS,
    ...CORE_GAME_VISUALS,
  ]);
  await coreVisualPromise;
};
