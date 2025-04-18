import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, User } from 'firebase/auth';
import * as SecureStore from 'expo-secure-store';
import { auth } from '@/scripts/firebase';
import { signOut } from 'firebase/auth';

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [shouldAutoLogin, setShouldAutoLogin] = useState(true);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setLoading(false);
      } else {
        // 自動ログイン処理
        if (shouldAutoLogin) {
          const savedEmail = await SecureStore.getItemAsync('email');
          const savedPassword = await SecureStore.getItemAsync('password');
          if (savedEmail && savedPassword) {
            try {
              const credential = await signInWithEmailAndPassword(auth, savedEmail, savedPassword);
              setUser(credential.user);
            } catch (e) {
              console.log('自動ログイン失敗:', e);
            }
          }
        }
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    setUser(credential.user);
    await SecureStore.setItemAsync('email', email);
    await SecureStore.setItemAsync('password', password);
  };
  const logout = async () => {
  setShouldAutoLogin(false); // ← 自動ログインを一時停止
  await signOut(auth);
  await SecureStore.deleteItemAsync('email');
  await SecureStore.deleteItemAsync('password');
  setUser(null); // ← 明示的に状態を更新！
};


  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};



export const useAuth = () => useContext(AuthContext);

