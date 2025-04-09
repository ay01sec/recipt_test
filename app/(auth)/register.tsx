// app/(auth)/register.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/scripts/firebase';
import styles from '@/scripts/styles';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('入力エラー', 'すべての項目を入力してください');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('エラー', 'パスワードが一致しません');
      return;
    }

    try {
      setSubmitting(true);
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('登録成功', 'ログイン画面に移動します');
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('登録失敗:', error);
      if (error instanceof Error) {
        Alert.alert("登録エラー", error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>新規アカウント作成</Text>

      <TextInput
        style={styles.Input_input}
        placeholder="メールアドレス"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.Input_input}
        placeholder="パスワード"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.Input_input}
        placeholder="パスワード（確認）"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {submitting ? (
        <ActivityIndicator size="large" color="#999" style={{ marginTop: 20 }} />
      ) : (
        <Pressable style={styles.buttonStyle} onPress={handleRegister}>
          <Text style={styles.buttonText}>登録</Text>
        </Pressable>
      )}

      <Pressable onPress={() => router.replace('/(auth)/login')}>
        <Text style={{ marginTop: 20, color: '#007AFF' }}>ログイン画面に戻る</Text>
      </Pressable>
    </View>
  );
}
