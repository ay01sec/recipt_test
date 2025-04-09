import React from 'react';
import { View, Text, Pressable, Modal, Linking, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';

export default function PdfViewScreen() {
  const { url } = useLocalSearchParams<{ url: string }>();
  const router = useRouter();

  // Firebase Storage のパス部分を %2F に変換（/o/ 以降の部分のみ）
  const encodeFirebaseStoragePath = (urlStr: string) => {
    try {
      const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/';
      const indexOfO = urlStr.indexOf('/o/');
      if (indexOfO === -1) return urlStr;
      const prefix = urlStr.slice(0, indexOfO + 3); // '/o/' まで
      const suffix = urlStr.slice(indexOfO + 3);
      const [pathPart, queryPart] = suffix.split('?');
      const encodedPath = encodeURIComponent(pathPart);
      return `${prefix}${encodedPath}${queryPart ? '?' + queryPart : ''}`;
    } catch (err) {
      console.warn('URL変換失敗:', err);
      return urlStr;
    }
  };

  const encodedUrl = url ? encodeFirebaseStoragePath(url) : '';

  const handleOpenPdf = async () => {
    if (encodedUrl) {
      const supported = await Linking.canOpenURL(encodedUrl);
      if (supported) {
        await Linking.openURL(encodedUrl);
      } else {
        Alert.alert('エラー', 'PDFを開けませんでした');
      }
    }
  };

  return (
    <Modal visible animationType="slide" transparent>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' }}>
        <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 12, width: '90%', alignItems: 'center' }}>
          {encodedUrl ? (
            <>
              <QRCode value={encodedUrl} size={120} />
              <Text style={{ marginTop: 12 }}>QRコードを読み取ってPDFを開く</Text>
              <Pressable onPress={handleOpenPdf} style={{ marginTop: 16 }}>
                <Text style={{ color: 'blue' }}>PDFをブラウザで開く</Text>
              </Pressable>
            </>
          ) : (
            <Text>PDFのURLが見つかりません</Text>
          )}

          <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
            <Text style={{ color: 'blue' }}>閉じる</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
