const appJson = require('./app.json');

export default ({ config }) => {
  return {
    ...config,
    ...appJson.expo, // app.json の expo 設定をベースに

    name: 'receiptQR-領収書作成アプリ',
    slug: 'recipt_test',
    scheme: 'receiptmaker',
    icon: './assets/icon.png',

    ios: {
      ...appJson.expo?.ios,
      bundleIdentifier: 'com.improvebiz.receiptmaker',
    },
    android: {
      package: "com.improvebiz.receiptmaker",
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#FFFFFF"
      },
      permissions: []
    },
    splash: {
      image: './assets/icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },

    plugins: [
      "expo-secure-store",
      [
        'expo-build-properties',
        {
          ios: {
            useModularHeaders: true,
          },
          android: {
            kotlinVersion: '1.8.10',
          },
          experiments: {
            newArchEnabled: true,
          },
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
