import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, Button, Image, Alert, Modal, ActivityIndicator, Pressable, SafeAreaView } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { db, storage } from '@/scripts/firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import QRCode from 'react-native-qrcode-svg';
import * as Print from 'expo-print';
import { format } from 'date-fns';
import styles from '@/scripts/styles';
import { WebView } from 'react-native-webview'; // 冒頭に追加

interface SettingRow {
  storeName: string;
  address1: string;
  address2: string;
  phone: string;
  invoiceNumber: string;
  logoUri: string;
  sealUri: string;
}

const fallbackSettings: SettingRow = {
  storeName: '',
  address1: '',
  address2: '',
  phone: '',
  invoiceNumber: '',
  logoUri: '',
  sealUri: '',
};

export default function HomeScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<SettingRow>(fallbackSettings);
  const [recipientName, setRecipientName] = useState('');
  const [note, setNote] = useState('ご飲食代');
  const [amount, setAmount] = useState('');
  const [issuedDate] = useState(format(new Date(), 'yyyy年MM月dd日'));
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [receiptNo, setReceiptNo] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/(auth)/login');
    }
  }, [user, loading]);

  useEffect(() => {
    const fetchSettings = async () => {
      if (user) {
        const docRef = doc(db, 'users', user.uid, 'settings', 'info');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data() as SettingRow);
        }
      }
    };
    fetchSettings();
  }, [user]);

  const handleReceiptCreation = async () => {
    if (!user) return;

    setIsCreating(true);

    const numericAmount = parseInt(amount.replace(/[^\d]/g, ''));
    if (isNaN(numericAmount)) {
      Alert.alert('エラー', '金額は数字で入力してください');
      setIsCreating(false);
      return;
    }

    const taxRate = 0.1;
    const taxAmount = Math.round(numericAmount * taxRate);
    const totalAmount = numericAmount + taxAmount;

    const dateKey = format(new Date(), 'yyyyMMdd');
    const receiptsRef = collection(db, 'users', user.uid, 'receipts');

    const q = query(receiptsRef, where('dateKey', '==', dateKey));
    const snapshot = await getDocs(q);
    const no = snapshot.size + 1;
    setReceiptNo(no);

    const fileName = `receipts/${user.uid}/receipt_${dateKey}_${no}.pdf`;

    const htmlContent = `
      <html>
        <head><meta charset="UTF-8" /></head>
        <body style="font-family: sans-serif; padding: 40px; border: 1px solid #000; position: relative;">
          <h1 style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px;">領収書</h1>
          <div style="display: flex; justify-content: flex-start; align-items: flex-start; gap: 40px; margin-top: 40px;">
            <div style="font-size: 14px; text-align: left; min-width: 200px;">
              <p style="margin-top: 30px;">宛名：<span style="border-bottom: 1px solid #000; padding-right: 120px;"><strong>${recipientName}</strong></span> 様</p>
              <p style="margin-top: 20px;">但し書き：<span style="border-bottom: 1px solid #000; padding-right: 180px;">${note}として</span></p>
              <p style="margin-top: 20px;"><strong>金額：¥${totalAmount.toLocaleString()}-（内税 ¥${taxAmount.toLocaleString()}）</strong></p>
              <p style="margin-top: 40px;">${issuedDate} 上記の通り領収いたしました。</p>
            </div>
            ${settings.sealUri ? `<div style="border: 2px solid #000; width: 120px; height: 120px; display: flex; align-items: center; justify-content: center;"><img src="${settings.sealUri}" style="max-width: 100%; max-height: 100%; object-fit: contain;" /></div>` : ''}
          </div>
          <hr style="margin: 40px 0;" />
          <div style="display: flex; justify-content: flex-start; align-items: flex-start; gap: 40px; margin-top: 40px;">
            <div style="font-size: 14px; text-align: left; min-width: 200px;">
              <p><strong>${settings.storeName}</strong></p>
              <p>住所：${settings.address1} ${settings.address2}</p>
              <p>電話番号：${settings.phone}</p>
              <p>インボイス番号：${settings.invoiceNumber}</p>
            </div>
            ${settings.logoUri ? `<div style="border: 2px solid #000; width: 120px; height: 120px; display: flex; align-items: center; justify-content: center;"><img src="${settings.logoUri}" style="max-width: 100%; max-height: 100%; object-fit: contain;" /></div>` : ''}
          </div>
          <p style="font-size: 10px; position: absolute; bottom: 20px; right: 20px;">※収入印紙は省略しています</p>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      setPdfUrl(downloadUrl);

      await addDoc(receiptsRef, {
        recipientName,
        note,
        amount: numericAmount,
        totalAmount,
        taxAmount,
        issuedDate,
        downloadUrl,
        dateKey,
        no,
        createdAt: serverTimestamp(),
        category: '飲食',
        status: '発行済み',
      });

      Alert.alert('成功', `領収書 No.${no} を保存しました`);
      setShowModal(true);
    } catch (error) {
      console.error('エラー:', error);
      Alert.alert('エラー', '保存に失敗しました');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <ParallaxScrollView headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">領収書作成</ThemedText>
        </ThemedView>

        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">宛名</ThemedText>
          <SafeAreaView style={styles.Input_container}>
            <TextInput
              style={styles.Input_input}
              value={recipientName}
              onChangeText={setRecipientName}
            />
          </SafeAreaView>
        </ThemedView>

        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">但し書き</ThemedText>
          <SafeAreaView style={styles.Input_container}>
            <TextInput
              style={styles.Input_input}
              value={note}
              onChangeText={setNote}
            />
          </SafeAreaView>
        </ThemedView>

        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">金額</ThemedText>
          <SafeAreaView style={styles.Input_container}>
            <TextInput
              style={styles.Input_input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </SafeAreaView>
        </ThemedView>

        <View style={styles.container}>
          <Pressable style={styles.buttonStyle} onPress={handleReceiptCreation}>
            <Text style={styles.buttonText}>領収書作成</Text>
          </Pressable>
        </View>
      </ParallaxScrollView>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 8, alignItems: 'center', width: '90%', height: '80%' }}>
            {pdfUrl ? (
              <>
                <QRCode value={pdfUrl} size={150} />
                <Text style={{ marginTop: 20 }}>QRコードを読み取ってPDFを開く</Text>
                <View style={{ flex: 1, width: '100%', marginTop: 20 }}>
                  <WebView
                    source={{ uri: pdfUrl }}
                    style={{ flex: 1 }}
                    originWhitelist={['*']}
                    allowsInlineMediaPlayback
                  />
                </View>
              </>
            ) : (
              <Text>PDFの読み込みに失敗しました</Text>
            )}
            <Pressable onPress={() => setShowModal(false)} style={{ marginTop: 20 }}>
              <Text style={{ color: 'blue' }}>閉じる</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {isCreating && (
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
        }}>
          <Text style={{ color: 'white', fontSize: 18 }}>作成中です...</Text>
          <ActivityIndicator size="large" color="#fff" style={{ marginTop: 10 }} />
        </View>
      )}
    </>
  );
}