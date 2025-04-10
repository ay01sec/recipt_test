import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, SafeAreaView, ScrollView} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/scripts/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import styles from '@/scripts/styles';

interface ReceiptMeta {
  recipientName: string;
  note: string;
  amount: number;
  totalAmount: number;
  taxAmount: number;
  issuedDate: string;
  downloadUrl: string;
  createdAt?: { seconds: number; nanoseconds: number };
  no?: number;
  category?: string;
  status?: string;
}

export default function HistoryScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [receipts, setReceipts] = useState<ReceiptMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReceipts = async () => {
    if (!user) return;
    try {
      const ref = collection(db, 'users', user.uid, 'receipts');
      const q = query(ref, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => doc.data() as ReceiptMeta);
      setReceipts(data);
    } catch (error) {
      console.error('履歴取得エラー:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReceipts();
  };

  const renderItem = ({ item }: { item: ReceiptMeta }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: '/pdfview', params: { url: item.downloadUrl } })}>
      <Text style={styles.cardTitle}>領収書 No.{item.no ?? '-'} - {item.recipientName}様</Text>
      <Text>金額: ¥{item.totalAmount.toLocaleString()}</Text>
      <Text>日付: {item.issuedDate}</Text>
      {/* <Text>カテゴリ: {item.category ?? '未分類'} / ステータス: {item.status ?? '発行済み'}</Text> */}
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#999" style={{ marginTop: 20 }} />;
  }

  return (
    <SafeAreaView style={{ backgroundColor: '#A1CEDC' }}>
      {loading ? (
        <ActivityIndicator size="large" color="#999" style={{ marginTop: 20 }} />
      ) : (
          <FlatList
            data={receipts}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingHorizontal: 50, paddingBottom: 100 }}
            ListHeaderComponent={
              <ThemedView style={{ marginTop: 20, marginBottom: 20 }}>
                <ThemedText type="title" style={{ backgroundColor: '#A1CEDC', textAlign: 'center',  padding: 5}}>作成済み領収書</ThemedText>
              </ThemedView>
            }
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={<Text style={{ padding: 20 }}>領収書が見つかりません</Text>}
          />
      )}
    </SafeAreaView>


    // <SafeAreaView style={{ height: 100, flex: 1, backgroundColor: '#A1CEDC', paddingTop: 30 }}>
      
    // </SafeAreaView>
  );
}
