// app/(auth)/login.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/scripts/firebase';
import styles from '@/scripts/styles';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/');
    }
  }, [user, loading]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('入力エラー', 'メールアドレスとパスワードを入力してください。');
      return;
    }

    try {
      setSubmitting(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('ログインエラー:', error);
      Alert.alert('ログイン失敗', 'メールアドレスまたはパスワードが正しくありません。');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || submitting) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#999" />
        <Text style={{ marginTop: 12 }}>ログイン中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ログイン</Text>

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

      <Pressable style={styles.buttonStyle} onPress={handleLogin}>
        <Text style={styles.buttonText}>ログイン</Text>
      </Pressable>

      <Pressable onPress={() => router.push('/(auth)/register')}>
        <Text style={{ marginTop: 20, color: '#007AFF' }}>アカウントを作成</Text>
      </Pressable>
    </View>
  );
}
