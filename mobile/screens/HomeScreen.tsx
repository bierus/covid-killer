import React from 'react';
import { NavigationInjectedProps } from 'react-navigation';
import { Button, View, Text, StyleSheet } from 'react-native';
import {storeData, getData} from '../shared/asyncStorage.ts'
import { getLocationAsync } from '../shared/location.ts'

export class HomeScreen extends React.Component<
  NavigationInjectedProps
> {
  constructor(props: NavigationInjectedProps) {
    super(props);
  }

  componentDidMount(){
    this.init();
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

  init = async () => {
    // if info === undefined, load homeView... This process should be done before component Init
    let info = await getData("homeLocation");
    await this.setLocation()
    if(info){
        this.props.navigation.navigate('Virus')
    } 
  }

  setLocation = async () => {
    let location = await getLocationAsync();
    if(!location.error){
      this.setState({ location: location});
    }
    else{
      this.setState({ errorMessage: location.error});
    }
  }

  navigateToVirus = () => {
    storeData("homeLocation", JSON.stringify(this.state.location));
    this.props.navigation.navigate('Virus')
  } 

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
                onPress={() => this.navigateToVirus()}
              />
              <Button
                title='Try again'
                onPress={() => this.setLocation()}
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
