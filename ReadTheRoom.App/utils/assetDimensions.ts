import { Asset } from 'expo-asset';
import type { ImageSourcePropType } from 'react-native';

export type AssetDimensions = {
  width: number;
  height: number;
};

export const getAssetDimensions = (
  source: ImageSourcePropType | null | undefined,
): AssetDimensions | null => {
  if (!source || Array.isArray(source)) return null;

  try {
    const asset = Asset.fromModule(
      source as number | string | { uri: string; width: number; height: number },
    );

    return asset.width && asset.height
      ? { width: asset.width, height: asset.height }
      : null;
  } catch {
    return null;
  }
};

