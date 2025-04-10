import * as RNIap from 'react-native-iap';

export const itemSkus = [
  'receipt.sub.monthly.withads',
  'receipt.sub.yearly.withads',
  'receipt.sub.monthly.noads',
  'receipt.sub.yearly.noads',
];

export const initIAP = async () => {
  try {
    await RNIap.initConnection();
  } catch (err) {
    console.warn('IAP接続エラー:', err);
  }
};

export const getSubscriptions = async () => {
  try {
    const subscriptions = await RNIap.getSubscriptions({ skus: itemSkus });
    return subscriptions;
  } catch (err) {
    console.warn('サブスクリプション取得エラー:', err);
    return [];
  }
};

export const purchaseSubscription = async (sku: string) => {
  try {
    await RNIap.requestSubscription({ sku });
  } catch (err) {
    console.warn('購入エラー:', err);
  }
};
