// components/AdBanner.tsx

import React, { useEffect } from 'react';
import { Platform, View, Text } from 'react-native';
import Constants from 'expo-constants';
import type { AppOwnership } from 'expo-constants';

let BannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;
let mobileAds: any = null;

const isNativeBuild = Constants.executionEnvironment === 'standalone';


if (isNativeBuild && Platform.OS !== 'web') {
  const googleAds = require('react-native-google-mobile-ads');
  BannerAd = googleAds.BannerAd;
  BannerAdSize = googleAds.BannerAdSize;
  TestIds = googleAds.TestIds;
  mobileAds = googleAds.default;

  mobileAds().initialize();
}

export default function AdBanner() {
  
  if (!isNativeBuild || !BannerAd) {
    return (
      <View style={{ height: 50, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 12, color: '#888' }}>広告は本番ビルドで表示されます</Text>
      </View>
    );
  }

  return (
    
    <BannerAd
      unitId={TestIds.BANNER}
      size={BannerAdSize.FULL_BANNER}
      requestOptions={{ requestNonPersonalizedAdsOnly: true }}
    />
  );
}
