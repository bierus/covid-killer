import React from 'react';
import { NavigationInjectedProps } from 'react-navigation';
import { Button, View, Text, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import { LocationData } from 'expo-location';

type State = {
  location: LocationData;
  errorMessage: string;
};

export class HomeScreen extends React.Component<
  NavigationInjectedProps,
  State
> {
  constructor(props: NavigationInjectedProps) {
    super(props);
    this.getLocationAsync();
  }

  state = {
    location: {
      coords: {
        latitude: 0,
        longitude: 0,
        altitude: 0,
        accuracy: 0,
        heading: 0,
        speed: 0
      },
      timestamp: 0
    },
    errorMessage: null
  };

  getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied'
      });
    }
    this.setState({ location: await Location.getCurrentPositionAsync({}) });
  };

  render() {
    const { latitude, longitude } = this.state.location.coords;

    return (
      <>
        {this.state.errorMessage ? (
          <Text children={this.state.errorMessage} />
        ) : (
          <>
            <View style={styles.container}>
              <Text>Is this your home location?</Text>
              <Text>
                Latitude: {latitude}
                {'\n'}Longitude: {longitude}
              </Text>
            </View>
            <Button
              title='Go to virus page'
              onPress={() => this.props.navigation.navigate('Virus')}
            />
          </>
        )}
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
