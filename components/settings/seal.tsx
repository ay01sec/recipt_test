import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const Seal = ({ sealUri }: { sealUri: string }) => {
    return (
      <View style={styles.container}>
        <Image
          source={{ uri: sealUri }} // ここで電子印鑑のURIを指定
          style={styles.seal}
        />
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      alignItems: 'center', 
    },
    seal: {
      width: 100,  // 印鑑の幅
      height: 100, // 印鑑の高さ
      resizeMode: 'contain', 
    },
  });
  export default Seal;