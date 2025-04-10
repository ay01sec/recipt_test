import React, { createContext, useContext, useEffect, useState } from 'react';
import * as RNIap from 'react-native-iap';
import { itemSkus } from '@/scripts/iap';

type IAPContextType = {
  isSubscribed: boolean;
  loading: boolean;
};

const IAPContext = createContext<IAPContextType>({ isSubscribed: false, loading: true });

export const IAPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        await RNIap.initConnection();
        const purchases = await RNIap.getAvailablePurchases();

        const valid = purchases.some(purchase =>
          itemSkus.includes(purchase.productId)
        );

        setIsSubscribed(valid);
      } catch (e) {
        console.warn('課金チェック失敗:', e);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, []);

  return (
    <IAPContext.Provider value={{ isSubscribed, loading }}>
      {children}
    </IAPContext.Provider>
  );
};

export const useIAP = () => useContext(IAPContext);
