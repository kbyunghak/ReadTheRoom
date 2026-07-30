import Constants from 'expo-constants';
import { Platform } from 'react-native';

export type RewardedAdResult =
  | { status: 'rewarded' }
  | { status: 'test-rewarded'; reason: string }
  | { status: 'closed' }
  | { status: 'unavailable'; reason: string }
  | { status: 'error'; error: unknown };

const AD_LOAD_TIMEOUT_MS = 20000;

const getRewardedAdUnitId = (testRewardedId: string) => {
  if (__DEV__) {
    return testRewardedId;
  }

  return Platform.select({
    android: process.env.EXPO_PUBLIC_ADMOB_REWARDED_ANDROID,
    ios: process.env.EXPO_PUBLIC_ADMOB_REWARDED_IOS,
    default: undefined,
  });
};

const isExpoGo = () => Constants.appOwnership === 'expo';

export async function showRewardedRecoveryAd(): Promise<RewardedAdResult> {
  if (Platform.OS === 'web') {
    return { status: 'unavailable', reason: 'Rewarded ads are not available on web.' };
  }

  if (isExpoGo()) {
    return {
      status: __DEV__ ? 'test-rewarded' : 'unavailable',
      reason: 'Rewarded ads require a native development or preview build.',
    };
  }

  try {
    const {
      default: mobileAds,
      AdEventType,
      RewardedAd,
      RewardedAdEventType,
      TestIds,
    } = await import('react-native-google-mobile-ads');

    const adUnitId = getRewardedAdUnitId(TestIds.REWARDED);

    if (!adUnitId) {
      return {
        status: 'unavailable',
        reason: 'Rewarded ad unit ID is not configured for this platform.',
      };
    }

    await mobileAds().initialize();

    return await new Promise<RewardedAdResult>((resolve) => {
      const rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: true,
      });
      const unsubscribers: Array<() => void> = [];
      let settled = false;
      let earnedReward = false;

      const settle = (result: RewardedAdResult) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        unsubscribers.forEach((unsubscribe) => unsubscribe());
        resolve(result);
      };

      const timeoutId = setTimeout(() => {
        settle({ status: 'unavailable', reason: 'Rewarded ad load timed out.' });
      }, AD_LOAD_TIMEOUT_MS);

      unsubscribers.push(
        rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
          rewardedAd.show().catch((error: unknown) => {
            settle({ status: 'error', error });
          });
        }),
        rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
          earnedReward = true;
        }),
        rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
          settle(earnedReward ? { status: 'rewarded' } : { status: 'closed' });
        }),
        rewardedAd.addAdEventListener(AdEventType.ERROR, (error) => {
          settle({ status: 'error', error });
        }),
      );

      rewardedAd.load();
    });
  } catch (error) {
    if (__DEV__) {
      return {
        status: 'test-rewarded',
        reason: 'Rewarded ad native module is unavailable in this test environment.',
      };
    }

    return { status: 'error', error };
  }
}
