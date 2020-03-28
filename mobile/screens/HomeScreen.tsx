import React from 'react';
import { NavigationInjectedProps } from 'react-navigation';
import { Button, View, Text, StyleSheet } from 'react-native';

export class HomeScreen extends React.Component<NavigationInjectedProps> {
  render() {
    return (
      <>
        <View style={styles.container}>
          <Text>Hello, register your home location to continue.</Text>
        </View>
        <Button
          title='Go to virus page'
          onPress={() => this.props.navigation.navigate('Virus')}
        />
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff'
  }
});
