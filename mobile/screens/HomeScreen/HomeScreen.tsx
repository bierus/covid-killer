import React from 'react';
import { NavigationInjectedProps } from 'react-navigation';
import { View, Text } from 'react-native';
import { storeData, getData } from '../../shared/asyncStorage';
import { getLocationAsync } from '../../shared/location';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-elements';
import { styles } from './HomeScreen.style'

export class HomeScreen extends React.Component<NavigationInjectedProps> {
  constructor(props: NavigationInjectedProps) {
    super(props);
  }

  componentDidMount() {
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
    const info = await getData('homeLocation');
    await this.setLocation();
    if (info) {
      this.props.navigation.navigate('Virus');
    }
  };

  setLocation = async () => {
    let { location, errorMessage } = await getLocationAsync();
    if (location) {
      this.setState({ location });
    } else {
      this.setState({ errorMessage });
    }
  };

  navigateToVirus = () => {
    storeData('homeLocation', this.state.location);
    this.props.navigation.navigate('Virus');
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
              <Text style={styles.prompt}>
                Is this your <Icon name='home' size={30} /> location?
              </Text>

              <Text style={styles.promptCords}>
                Latitude: {latitude}
                {'\n'}Longitude: {longitude}
              </Text>
              <View style={{ margin: 20 }}>
                <Button
                  title='Yes - save'
                  onPress={this.navigateToVirus}
                  type='outline'
                />
              </View>
              <Button
                title='No - reload'
                onPress={this.setLocation}
                type='outline'
              />
            </View>
          </>
        )}
      </>
    );
  }
}
 
