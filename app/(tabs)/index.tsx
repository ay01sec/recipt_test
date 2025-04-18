import React, { useCallback, useEffect, useState } from 'react';
import { View, TextInput, Text, Button, Image, Alert, Modal, ActivityIndicator, Pressable, SafeAreaView, Keyboard, Share } from 'react-native';
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
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';


interface SettingRow {
  storeName: string;
  address1: string;
  address2: string;
  phone: string;
  invoiceNumber: string;
  logoUri: string;
  sealUri: string;
  defaultNote: string;
}

const fallbackSettings: SettingRow = {
  storeName: '',
  address1: '',
  address2: '',
  phone: '',
  invoiceNumber: '',
  logoUri: '',
  sealUri: '',
  defaultNote: ''
};

export default function HomeScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<SettingRow>(fallbackSettings);
  const [recipientName, setRecipientName] = useState('');
  const [note, setNote] = useState('');
  const [amount, setAmount] = useState('');
  const [issuedDate] = useState(format(new Date(), 'yyyy年MM月dd日'));
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [receiptNo, setReceiptNo] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [defaultNote, setDefaultNote] = useState('');
  // // // AdMob 初期化（最初の一回のみ）
  // useEffect(() => {
  //   MobileAds()
  //     .initialize()
  //     .then(adapterStatuses => {
  //       console.log('✅ AdMob initialized', adapterStatuses);
  //     });
  // }, []);
  

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/(auth)/login');
    }
    
  }, [user, loading]);

  useFocusEffect(
    useCallback(() => {
      const fetchSettings = async () => {
        if (user) {
          const docRef = doc(db, 'users', user.uid, 'settings', 'info');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as SettingRow;
            setSettings(data);
            setNote(data.defaultNote || 'ご飲食代');
          }
        }
      };
      fetchSettings();
    }, [user])
  );

  const handleReceiptCreation = async () => {
    Keyboard.dismiss();
    if (!user) return;
    setIsCreating(true);

    const totalAmount = parseInt(amount.replace(/[^\d]/g, ''));
    if (isNaN(totalAmount)) {
      Alert.alert('エラー', '金額は数字で入力してください');
      setIsCreating(false);
      return;
    }

    const taxRate = 0.1;
    const numericAmount = Math.round(totalAmount / (taxRate+1));
    const taxAmount = totalAmount - numericAmount;
    // const numericAmount = parseInt(amount.replace(/[^\d]/g, ''));
    // if (isNaN(numericAmount)) {
    //   Alert.alert('エラー', '金額は数字で入力してください');
    //   setIsCreating(false);
    //   return;
    // }

    // const taxRate = 0.1;
    // const taxAmount = Math.round(numericAmount * taxRate);
    // const totalAmount = numericAmount + taxAmount;

    const dateKey = format(new Date(), 'yyyyMMdd');
    const receiptsRef = collection(db, 'users', user.uid, 'receipts');
    const q = query(receiptsRef, where('dateKey', '==', dateKey));
    const snapshot = await getDocs(q);
    const no = snapshot.size + 1;
    setReceiptNo(no);

    const fileName = `receipts/${user.uid}/receipt_${dateKey}_${no}.pdf`;

    const sealImageHtml = settings.sealUri
      ? `<img src="${settings.sealUri}" style="width: 60px; height: 60px; object-fit: contain; margin-left: 5px;" />`
      : '';

      const htmlContent = `
        <html>
          <head><meta charset="UTF-8" /></head>
          <body style="font-family: 'Arial', sans-serif; padding: 20px 30px; border: 1px solid #000; position: relative;">
            <h1 style="text-align: center; margin-bottom: 6px; font-size: 28px;">領 収 書</h1>
            <div style="text-align: right; margin-bottom: 12px;">
              <span style="font-size: 16px;">発行日：</span>
              <span style="font-size: 16px;">${issuedDate}</span>
            </div>

            <p style="border-bottom: 1px solid #000; padding-bottom: 4px; font-size: 20px; margin-bottom: 12px;">
              <span style="margin-right: 20px;">${recipientName}</span> 様
            </p>

            <div style="margin: 14px 0; border: 2px solid #000; padding: 16px; text-align: center; font-size: 32px;">
              ¥${totalAmount.toLocaleString()}-
            </div>

            <div style="text-align: center; font-size: 18px; margin-bottom: 8px;">
              但し、 <span style="border-bottom: 1px solid #000;">${note}</span> として
            </div>

            <div style="text-align: center; font-size: 16px; margin-bottom: 16px;">
              上記、正に領収いたしました
            </div>

            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
              <div style="border: 1px solid #000; width: 80px; height: 80px; text-align: center; line-height: 80px; font-size: 16px;">印紙</div>

              <div style="flex: 1; margin-left: 16px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; font-size: 16px; column-gap: 16px;">
                  <span>内訳</span><span style="text-align: right;">金額</span>
                  <span>税抜金額</span><span style="border-bottom: 1px solid #000; text-align: right;">¥${numericAmount}</span>
                  <span>消費税等</span><span style="border-bottom: 1px solid #000; text-align: right;">¥${taxAmount}</span>
                </div>
              </div>

              <div style="flex: 1; margin-left: 16px;">
                <div style="text-align: left; font-size: 14px;">
                  <span>${settings.storeName}</span><br>
                  <span>${settings.address1}</span><br>
                  <span>${settings.address2}</span><br>
                  <span>TEL: ${settings.phone}</span><br>
                  <span>インボイス番号: ${settings.invoiceNumber}</span>
                </div>
              </div>

              ${sealImageHtml}
            </div>
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
        status: '発行済み'
      });

      Alert.alert('成功', `領収書 No.${no} を保存しました`);
      setAmount('')
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
    <SafeAreaView  style={{ backgroundColor: '#A1CEDC', alignItems: 'center', margin:0, flex:1 }} >
        {/* <AdBanner /> */}
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
                placeholder="空欄可"
                placeholderTextColor="#666"
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
            <ThemedText type="subtitle">税込合計金額(必須)</ThemedText>
            <SafeAreaView style={styles.Input_container}>
              <TextInput
                style={styles.Input_input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
            </SafeAreaView>
          </ThemedView>
          
          <View style={styles.buttonContainer}>
            <Pressable style={styles.buttonStyle} onPress={handleReceiptCreation}>
              <Text style={styles.buttonText}>領収書作成</Text>
            </Pressable>
          </View>
    </SafeAreaView>
      

    <Modal visible={showModal} transparent animationType="slide">
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }}>
        <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 8, alignItems: 'center', width: '95%', height: '80%', position: 'relative' }}>
          
          {/* 閉じるアイコン（右上） */}
          <Pressable
            onPress={() => setShowModal(false)}
            style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}
          >
            <Ionicons name="close" size={28} color="black" />
          </Pressable>

          {pdfUrl ? (
            <>
              {/* QRコード */}
              <QRCode value={pdfUrl} size={70} />

              {/* <Text style={{ marginTop: 20 }}>QRコードを読み取ってPDFを開く</Text> */}

              <Pressable
                onPress={async () => {
                  try {
                    await Share.share({ message: `領収書はこちら:\n${pdfUrl}`, url: pdfUrl });
                  } catch (err) {
                    Alert.alert('共有に失敗しました');
                  }
                }}
                style={{ marginTop: 15, backgroundColor: '#007AFF', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 5 }}
              >
                <Text style={{ color: '#fff', fontSize: 16 }}>共有する</Text>
              </Pressable>
              
              {/* PDF表示 */}
              <View style={{ flex: 1, width: '110%', marginTop: 1 }}>
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