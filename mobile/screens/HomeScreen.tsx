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
    console.log("GET LOCATION")
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied'
      });
    }
    let currentLocation = await Location.getCurrentPositionAsync({});
    console.log(currentLocation)
    this.setState({ location: currentLocation});
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

              <Text style={styles.gameTitle}>Covid Killer</Text>
              <Text style={styles.prompt}>Is this your home location?</Text>
              <Text style={styles.promptCords}>
                Latitude: {latitude}
                {'\n'}Longitude: {longitude}
              </Text>
              <Button
                title='Save'
                onPress={() => this.props.navigation.navigate('Virus')}
              />
              <Button
                title='Try again'
                onPress={() => this.getLocationAsync()}
              />
            </View>
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
  },
  gameTitle:{
    color: '#555',
    fontSize: 50,
    padding: 20
  },
  prompt:{
    
    color: '#555',
    fontSize: 15,
    padding: 8
  },
  promptCords:{
    
    color: '#555',
    fontSize: 15,
    paddingTop: 8,
    paddingBottom: 20
  },

});
