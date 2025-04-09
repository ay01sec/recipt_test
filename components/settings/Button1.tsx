import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const Button1 = ({ title, onPress }: { title: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    fontSize: 26, // ← フォントサイズここ！
    color: '#fff',
    textAlign: 'center',
  },
});

export default Button1