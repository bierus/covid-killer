import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export const VirusScreen = () => (
  <View style={styles.container}>
    <Image
      style={styles.coronaImage}
      source={{
        uri:
          'https://cdn.pixabay.com/photo/2020/03/10/17/30/corona-4919644_960_720.png'
      }}
    />
    <Text style={styles.text}>Watch our for Coronavirus</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1E1E'
  },
  coronaImage: {
    width: 300,
    height: 300
  },
  text: {
    paddingTop: 30,
    color: 'white',
    fontSize: 15
  }
});
