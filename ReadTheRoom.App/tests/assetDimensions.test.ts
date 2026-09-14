import { beforeEach, describe, expect, test, vi } from 'vitest';

const assetMocks = vi.hoisted(() => ({
  fromModule: vi.fn(),
}));

vi.mock('expo-asset', () => ({
  Asset: {
    fromModule: assetMocks.fromModule,
  },
}));

import { getAssetDimensions } from '../utils/assetDimensions';

describe('platform-safe asset dimensions', () => {
  beforeEach(() => {
    assetMocks.fromModule.mockReset();
    assetMocks.fromModule.mockImplementation((source: unknown) => source);
  });

  test('reads dimensions from a web image source object', () => {
    expect(
      getAssetDimensions({ uri: '/asset.png', width: 1684, height: 2528 }),
    ).toEqual({ width: 1684, height: 2528 });
  });

  test('resolves dimensions from a native numeric asset module', () => {
    assetMocks.fromModule.mockReturnValue({ width: 1024, height: 1536 });

    expect(getAssetDimensions(42)).toEqual({ width: 1024, height: 1536 });
    expect(assetMocks.fromModule).toHaveBeenCalledWith(42);
  });

  test('returns null when dimensions are unavailable', () => {
    expect(getAssetDimensions(null)).toBeNull();
    expect(getAssetDimensions({ uri: '/asset.png' })).toBeNull();
  });

  test('does not attempt to resolve an image source array', () => {
    expect(
      getAssetDimensions([
        { uri: '/small.png', width: 100, height: 150 },
        { uri: '/large.png', width: 200, height: 300 },
      ]),
    ).toBeNull();
    expect(assetMocks.fromModule).not.toHaveBeenCalled();
  });

  test('returns null when Expo cannot resolve the asset', () => {
    assetMocks.fromModule.mockImplementation(() => {
      throw new Error('Invalid asset module');
    });

    expect(getAssetDimensions(99)).toBeNull();
  });
});
