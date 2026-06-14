import { Asset } from 'expo-asset';
import type { ImageSourcePropType } from 'react-native';
import {
  CORE_VISUAL_ASSETS,
  LAUNCH_IMAGES,
} from '../shared/assets/registry';

let launchVisualPromise: Promise<void> | null = null;
let coreVisualPromise: Promise<void> | null = null;

export const preloadAssetSources = async (sources: ImageSourcePropType[]) => {
  await Promise.all(
    sources.map((source) => Asset.loadAsync(source as string | number)),
  );
};

export const preloadLaunchVisualAssets = async () => {
  launchVisualPromise ??= preloadAssetSources(Object.values(LAUNCH_IMAGES));
  await launchVisualPromise;
};

export const preloadCoreVisualAssets = async () => {
  coreVisualPromise ??= preloadAssetSources(CORE_VISUAL_ASSETS);
  await coreVisualPromise;
};
