import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput,Button, Image, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { db, storage } from '@/scripts/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';



export default function SettingScreen() {
  const { user } = useAuth();
  const [storeName, setStoreName] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [phone, setPhone] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [logoUri, setLogoUri] = useState('');
  const [sealUri, setSealUri] = useState('');
  const [defaultNote, setDefaultNote] = useState('');


  useEffect(() => {
    const fetchSettings = async () => {
      if (user) {
        const docRef = doc(db, 'users', user.uid, 'settings', 'info');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setStoreName(data.storeName);
          setAddress1(data.address1);
          setAddress2(data.address2);
          setPhone(data.phone);
          setInvoiceNumber(data.invoiceNumber);
          setLogoUri(data.logoUri);
          setSealUri(data.sealUri);
          setDefaultNote(data.defaultNote || 'ご飲食代');
        }
      }
    };
    fetchSettings();
  }, [user]);

  const handleImagePick = async (setter: (url: string) => void, path: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1 });
    if (!result.canceled && user) {
      const imageUri = result.assets[0].uri;
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const fileRef = ref(storage, `users/${user.uid}/settings/${path}`);
      await uploadBytes(fileRef, blob);
      const downloadUrl = await getDownloadURL(fileRef);
      setter(downloadUrl);
    }
  };

  const handleSave = async () => {
    if (user) {
      const docRef = doc(db, 'users', user.uid, 'settings', 'info');
      await setDoc(docRef, {
        storeName,
        address1,
        address2,
        phone,
        invoiceNumber,
        logoUri,
        sealUri,
        defaultNote 
      });
      alert('保存しました');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView>
      {/* <AdBanner />   */}
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading1}>設定画面</Text>
        <Text style={styles.label}>店舗名</Text>
        <TextInput style={styles.input} value={storeName} onChangeText={setStoreName} />

        <Text style={styles.label}>住所1</Text>
        <TextInput style={styles.input} value={address1} onChangeText={setAddress1} />

        <Text style={styles.label}>住所2</Text>
        <TextInput style={styles.input} value={address2} onChangeText={setAddress2} />
        
        <View style={styles.imageRow}>
          <View style={styles.imageBlock}>
            <Text style={styles.label}>電話番号</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <Text style={styles.label}>インボイス番号</Text>
            <TextInput style={styles.input} value={invoiceNumber} onChangeText={setInvoiceNumber} />
            <Text style={styles.label}>但し書きのデフォルト値</Text>
            <TextInput style={styles.input} value={defaultNote} onChangeText={setDefaultNote} />
          </View>

          <View style={styles.imageBlock}>
          <Text style={styles.label}>電子印鑑</Text>
            <TouchableOpacity onPress={() => handleImagePick(setSealUri, 'seal.png')} style={styles.imagePicker}>
              <Text style={styles.imagePickerText}>印鑑を選択</Text>
            </TouchableOpacity>
            {sealUri ? <Image source={{ uri: sealUri }} style={styles.previewImage} /> : null}
          </View>
        </View>

        <View style={styles.saveContainer}>
          <Button title="保存" onPress={handleSave} />
        </View>
      </ScrollView>
      
    </KeyboardAvoidingView>
    
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    padding: 20,
    backgroundColor: '#fff'
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    fontWeight: 'bold'
  },
  heading1: {
    fontSize: 24,
    marginBottom: 12,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  imageBlock: {
    flex: 1,
    marginRight: 10
  },
  imagePicker: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 8
  },
  imagePickerText: {
    color: '#333'
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 20,
    alignSelf: 'center'
  },
  saveContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    // marginBottom: 16,
    textAlign: 'center',
    padding: 10
  },
});
