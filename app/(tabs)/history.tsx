import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, SafeAreaView, Button, Modal, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/scripts/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import styles from '@/scripts/styles';
import { format } from 'date-fns';
import QRCode from 'react-native-qrcode-svg';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

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
  const [receipts, setReceipts] = useState<ReceiptMeta[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<ReceiptMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchDate, setSearchDate] = useState<Date | null>(null);
  const [searchName, setSearchName] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);

  const fetchReceipts = async () => {
    if (!user) return;
    try {
      const ref = collection(db, 'users', user.uid, 'receipts');
      const q = query(ref, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => doc.data() as ReceiptMeta);
      setReceipts(data);
      setFilteredReceipts(data);
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

  const applyFilters = () => {
    let filtered = receipts;

    if (searchDate) {
      const formattedDate = format(searchDate, 'yyyy年MM月dd日');
      filtered = filtered.filter(r => r.issuedDate.includes(formattedDate));
    }
    if (searchName) {
      filtered = filtered.filter(r => r.recipientName.includes(searchName));
    }
    if (minAmount) {
      filtered = filtered.filter(r => r.totalAmount >= parseInt(minAmount));
    }
    if (maxAmount) {
      filtered = filtered.filter(r => r.totalAmount <= parseInt(maxAmount));
    }

    if (sortOrder === 'asc') {
      filtered = [...filtered].sort((a, b) => a.totalAmount - b.totalAmount);
    } else {
      filtered = [...filtered].sort((a, b) => b.totalAmount - a.totalAmount);
    }

    setFilteredReceipts(filtered);
  };

  const resetFilters = () => {
    setSearchDate(null);
    setSearchName('');
    setMinAmount('');
    setMaxAmount('');
    setSortOrder('desc');
    setFilteredReceipts(receipts);
  };

  const renderItem = ({ item }: { item: ReceiptMeta }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        setSelectedPdfUrl(item.downloadUrl);
        setShowModal(true);
      }}>
      <Text style={styles.cardTitle}>領収書 No.{item.no ?? '-'} - {item.recipientName}様</Text>
      <Text>金額: ¥{item.totalAmount.toLocaleString()}</Text>
      <Text>日付: {item.issuedDate}</Text>
    </TouchableOpacity>
  );

  const handleShare = async (url: string) => {
    if (!(await Sharing.isAvailableAsync())) {
      alert('このデバイスでは共有できません');
      return;
    }
    await Sharing.shareAsync(url);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#999" style={{ marginTop: 20 }} />;
  }

  return (
    <SafeAreaView style={{ backgroundColor: '#A1CEDC', flex: 1 }}>
      <FlatList
        data={filteredReceipts}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16 }}
        ListHeaderComponent={
          <>
            <Pressable onPress={() => setShowSearch(prev => !prev)} style={{ padding: 10, backgroundColor: '#fff', borderRadius: 8, marginTop: 16 }}>
              <Text style={{ fontSize: 16 }}>{showSearch ? '▲ 絞り込みを閉じる' : '▼ 絞り込みを開く'}</Text>
            </Pressable>

            {showSearch && (
              <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 8, marginTop: 10 }}>
                <ThemedText type="subtitle">検索・フィルター</ThemedText>

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                  <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.input, { flex: 1, justifyContent: 'center' }]}>
                    <Text>{searchDate ? format(searchDate, 'yyyy年MM月dd日') : '日付を選択'}</Text>
                  </TouchableOpacity>
                  <TextInput placeholder="宛名" value={searchName} onChangeText={setSearchName} style={[styles.input, { flex: 1 }]} />
                </View>

                {showDatePicker && (
                  <DateTimePicker
                    value={searchDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event: any, selectedDate: Date | undefined) => {
                      setShowDatePicker(false);
                      if (selectedDate) setSearchDate(selectedDate);
                    }}
                  />
                )}

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                  <TextInput placeholder="最低金額" value={minAmount} onChangeText={setMinAmount} keyboardType="numeric" style={[styles.input, { flex: 1 }]} />
                  <TextInput placeholder="最高金額" value={maxAmount} onChangeText={setMaxAmount} keyboardType="numeric" style={[styles.input, { flex: 1 }]} />
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 }}>
                  <Button title="リセット" onPress={resetFilters} color="red" />
                  <Button title="昇順" onPress={() => setSortOrder('asc')} color={sortOrder === 'asc' ? 'blue' : 'gray'} />
                  <Button title="降順" onPress={() => setSortOrder('desc')} color={sortOrder === 'desc' ? 'blue' : 'gray'} />
                  <Button title="検索" onPress={applyFilters} />
                </View>
              </View>
            )}

            <ThemedView style={{ marginTop: 20, marginBottom: 20 }}>
              <ThemedText type="title" style={{ backgroundColor: '#A1CEDC', textAlign: 'center', padding: 5 }}>作成済み領収書</ThemedText>
            </ThemedView>
          </>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={{ padding: 20 }}>領収書が見つかりません</Text>}
      />

      <Modal visible={showModal} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 8, width: '90%', height: '80%', position: 'relative' }}>
            <Pressable onPress={() => setShowModal(false)} style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
              <Ionicons name="close" size={28} color="black" />
            </Pressable>
            <View style={{ alignItems: 'center', marginTop: 40, flex: 1 }}>
              {selectedPdfUrl ? (
                <>
                  <QRCode value={selectedPdfUrl} size={100} />
                  <Text style={{ marginTop: 10 }}>QRコードを読み取ってPDFを開く</Text>

                  <Pressable
                    onPress={() => handleShare(selectedPdfUrl)}
                    style={{ marginTop: 15, backgroundColor: '#007AFF', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 5 }}
                  >
                    <Text style={{ color: '#fff', fontSize: 16 }}>共有する</Text>
                  </Pressable>

                  <View style={{ flex: 1, width: '100%', marginTop: 20 }}>
                    <WebView
                      source={{ uri: selectedPdfUrl }}
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
        </View>
      </Modal>
    </SafeAreaView>
  );
}
