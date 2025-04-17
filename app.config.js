const appJson = require('./app.json');

export default ({ config }) => {
  return {
    ...config,
    ...appJson.expo, // app.json の expo 設定をベースに

    name: 'recipt_test',
    slug: 'recipt_test',
    scheme: 'receiptmaker',
    icon: './assets/icon.png',

    ios: {
      ...appJson.expo?.ios,
      bundleIdentifier: 'com.improvebiz.receiptmaker',
    },

    splash: {
      image: './assets/icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },

    plugins: [
      [
        'expo-build-properties',
        {
          ios: {
            useModularHeaders: true,
          },
          experiments: {
            newArchEnabled: true,
          },
        },
      ],
      [
        'react-native-google-mobile-ads',
        {
          iosAppId: 'ca-app-pub-1824309517034681~6657523639',
          androidAppId: 'ca-app-pub-1824309517034681~8472210325',
          // iosAppId: 'ca-app-pub-3940256099942544/6300978111',
          // androidAppId: 'ca-app-pub-3940256099942544/6300978111',
        },
      ],
    ],

    extra: {
      ...appJson.expo?.extra,
      eas: {
        projectId: 'ccae15d2-2e58-4193-98a3-1218216d7443',
      },
    },
  };
};
