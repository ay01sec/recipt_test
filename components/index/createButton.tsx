import React from 'react';
import { View, StyleSheet, Button } from 'react-native';

const createReciept = () => {
    return(
        <View style={styles.container}>
            <Button
                title="Press me"
                onPress={ () => alert("ボタンが押されました！") }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    }
});

export default createReciept;
