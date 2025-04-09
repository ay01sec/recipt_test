import * as ImagePicker from 'expo-image-picker';
import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Text, Image, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { GlobalStyles } from '@/scripts/styles';
import Button1 from '@/components/settings/Button1';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import styles from '@/scripts/styles';
import Logo from '@/components/settings/logo';
import Seal from '@/components/settings/seal';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/context/AuthContext';
import { db, storage } from '@/scripts/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, getDoc } from 'firebase/firestore';



type SettingRow = {
  storeName: string;
  address1: string;
  address2: string;
  phone: string;
  invoiceNumber: string;
  logoUri: string;
  sealUri: string;
};

type RootStackParamList = {
  index: { settings: SettingRow };
};

const SettingScreen = () => {
  const [dbState, setDb] = useState<SQLiteDatabase | null>(null);
  const [storeName, setStoreName] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [phone, setPhone] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [logoUri, setLogoUri] = useState('');
  const [sealUri, setSealUri] = useState('');
  const [noteOptions, setNoteOptions] = useState<string[]>([]);
  const [newNoteOption, setNewNoteOption] = useState('');

  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const init = async () => {
      const database = await openDatabaseAsync('settings.db');
      setDb(database);
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY NOT NULL,
          storeName TEXT,
          address1 TEXT,
          address2 TEXT,
          phone TEXT,
          invoiceNumber TEXT,
          logoUri TEXT,
          sealUri TEXT
        );
      `);

      const results = await database.getAllAsync('SELECT * FROM settings WHERE id = 1') as SettingRow[];
      if (results.length > 0) {
        const data = results[0];
        setStoreName(data.storeName);
        setAddress1(data.address1);
        setAddress2(data.address2);
        setPhone(data.phone);
        setInvoiceNumber(data.invoiceNumber);
        setLogoUri(data.logoUri);
        setSealUri(data.sealUri);
      }

      // Firestoreから但し書き候補を取得
      if (user) {
        const ref = doc(db, 'users', user.uid, 'settings', 'notes');
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setNoteOptions(snap.data().options || []);
        }
      }
    };
    init();
  }, [user]);

  const saveNoteOptions = async () => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'settings', 'notes');
    await setDoc(ref, { options: noteOptions });
    alert('但し書き候補を保存しました');
  };

  const pickFile = async (setter: (uri: string) => void) => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    if (result.assets && result.assets.length > 0) {
      setter(result.assets[0].uri);
    }
  };

  const saveSettings = async () => {
    if (!dbState || !user) return;

    try {
      await dbState.runAsync(
        `INSERT OR REPLACE INTO settings
          (id, storeName, address1, address2, phone, invoiceNumber, logoUri, sealUri)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [1, storeName, address1, address2, phone, invoiceNumber, logoUri, sealUri]
      );

      const docRef = doc(db, 'users', user.uid, 'settings', 'info');
      await setDoc(docRef, {
        storeName,
        address1,
        address2,
        phone,
        invoiceNumber,
        logoUri,
        sealUri
      });

      alert('設定が保存されました');
      navigation.navigate('index', {
        settings: { storeName, address1, address2, phone, invoiceNumber, logoUri, sealUri }
      });
    } catch (error) {
      console.error('設定保存に失敗しました:', error);
      alert('設定保存に失敗しました');
    }
  };

  return (
    <ParallaxScrollView headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">領収書設定</ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">店名</ThemedText>
        <TextInput value={storeName} onChangeText={setStoreName} style={GlobalStyles.input} />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">住所1</ThemedText>
        <TextInput value={address1} onChangeText={setAddress1} style={GlobalStyles.input} />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">住所2</ThemedText>
        <TextInput value={address2} onChangeText={setAddress2} style={GlobalStyles.input} />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">電話番号</ThemedText>
        <TextInput value={phone} onChangeText={setPhone} style={GlobalStyles.input} />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">インボイス番号</ThemedText>
        <TextInput value={invoiceNumber} onChangeText={setInvoiceNumber} style={GlobalStyles.input} />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">ロゴ</ThemedText>
        <Button1 title="ロゴを選択" onPress={() => pickFile(setLogoUri)} />
        {logoUri ? <Image source={{ uri: logoUri }} style={{ width: 100, height: 100 }} /> : null}
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">電子印鑑</ThemedText>
        <Button1 title="電子印鑑を選択" onPress={() => pickFile(setSealUri)} />
        {sealUri ? <Image source={{ uri: sealUri }} style={{ width: 100, height: 100 }} /> : null}
      </ThemedView>

      {/* <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">但し書き候補</ThemedText>
        {noteOptions.map((item, idx) => (
          <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ flex: 1 }}>{item}</Text>
            <TouchableOpacity onPress={() => {
              const updated = [...noteOptions];
              updated.splice(idx, 1);
              setNoteOptions(updated);
            }}>
              <Text style={{ color: 'red' }}>削除</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TextInput
          style={GlobalStyles.input}
          value={newNoteOption}
          onChangeText={setNewNoteOption}
          placeholder="新しい但し書きを追加"
        />
        <Pressable
          style={styles.buttonStyle}
          onPress={() => {
            if (newNoteOption && !noteOptions.includes(newNoteOption)) {
              setNoteOptions([...noteOptions, newNoteOption]);
              setNewNoteOption('');
            }
          }}
        >
          <Text style={styles.buttonText}>追加</Text>
        </Pressable>

        <Pressable
          style={[styles.buttonStyle, { backgroundColor: '#888' }]}
          onPress={saveNoteOptions}
        >
          <Text style={styles.buttonText}>但し書き候補を保存</Text>
        </Pressable>
      </ThemedView> */}

      <View style={{ marginTop: 10 }}>
        <Button1 title="保存" onPress={saveSettings} />
      </View>
    </ParallaxScrollView>
  );
};

export default SettingScreen;
