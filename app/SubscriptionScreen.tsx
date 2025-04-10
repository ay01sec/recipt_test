import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import { getSubscriptions, purchaseSubscription, initIAP } from '@/scripts/iap';

export default function SubscriptionScreen() {
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    const setup = async () => {
      await initIAP();
      const subs = await getSubscriptions();
      setPlans(subs);
    };
    setup();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 10 }}>サブスクリプションプラン</Text>
      <FlatList
        data={plans}
        keyExtractor={(item) => item.productId}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 16 }}>
            <Text>{item.title}</Text>
            <Text>{item.description}</Text>
            <Text>{item.localizedPrice}</Text>
            <Button title="このプランに加入" onPress={() => purchaseSubscription(item.productId)} />
          </View>
        )}
      />
    </View>
  );
}
