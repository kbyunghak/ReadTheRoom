export type RewardedAdResult =
  | { status: 'rewarded' }
  | { status: 'test-rewarded'; reason: string }
  | { status: 'closed' }
  | { status: 'unavailable'; reason: string }
  | { status: 'error'; error: unknown };

export async function showRewardedRecoveryAd(): Promise<RewardedAdResult> {
  return {
    status: 'unavailable',
    reason: 'Rewarded ads are not available on web.',
  };
}
