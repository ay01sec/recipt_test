import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const Logo = ({ logoUri }: { logoUri: string }) => {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: logoUri }} // ここでURIを指定
        style={styles.logo}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center', // ロゴを中央に配置
  },
  logo: {
    width: 150,   // ロゴの幅
    height: 150,  // ロゴの高さ
    resizeMode: 'contain', // 画像のリサイズ方法（アスペクト比を保つ）
  },
});

export default Logo;
