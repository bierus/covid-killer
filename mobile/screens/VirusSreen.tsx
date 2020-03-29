import React from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import { Virus } from '../models/Virus';
import Bar from 'react-native-progress/Bar';

import {storeData, getData} from '../shared/asyncStorage';
import { getLocationAsync, distance } from '../shared/location';

export class VirusScreen<P> extends React.Component<P> {
  VIRUS_HEALTH = 360;

  virus = new Virus(this.VIRUS_HEALTH);
  previousVirusHealth = this.VIRUS_HEALTH;

  virusSpringValue = new Animated.Value(1);

  state = {
    virusHealth: this.VIRUS_HEALTH
  };

  constructor(props: P) {
    super(props);

    const virusIntervalId = setInterval(
      () =>
        this.virus.getHealth() > 0
          ? this.reduceVirusHealth()
          : clearInterval(virusIntervalId),
      1000
    );
  }

  reduceVirusHealth = async() => {
    // let location = await getLocationAsync();
    let mocklocation = {
      "coords": {
        "accuracy": 5,
        "altitude": 0,
        "altitudeAccuracy": -1,
        "heading": -1,
        "latitude": 40.7128, // New York
        "longitude": -74.00600,
        "speed": -1
      },
     "timestamp": 666
    };
    let homeLocationString = await getData("homeLocation");
    let homeLocation = JSON.parse(homeLocationString);
    console.log(distance(
      mocklocation.coords.latitude,
      mocklocation.coords.longitude,
      homeLocation.coords.latitude,
      homeLocation.coords.longitude,
      "K") + " KM"
    );
    this.virus.reduceHealth(1);
    this.setState({ virusHealth: this.virus.getHealth() });

    if (this.virus.getHealth() % 5 == 0) {

      console.log(homeLocation);
      console.log(mocklocation);
      this.animateVirus();
    }
  }

  animateVirus() {
    this.virusSpringValue.setValue(
      this.previousVirusHealth / this.virus.getInitialHealth()
    );

    Animated.spring(this.virusSpringValue,
       {
      toValue: this.virus.getHealthPercentage(),
      friction: 0.25
    }).start();

    this.previousVirusHealth = this.virus.getHealth();
  }

  render() {
    return (
      <>
        <View style={styles.container}>
          {this.virus.getHealth() > 0 ? (
            <>
              <Text style={styles.virusHpText}>
                HP: {this.state.virusHealth}
              </Text>
              <Bar
                progress={this.virus.getHealthPercentage()}
                width={200}
                color='red'
                style={styles.virusHpProgress}
              />
              <Animated.Image
                style={{
                  height: this.VIRUS_HEALTH,
                  width: this.VIRUS_HEALTH,
                  transform: [{ scale: this.virusSpringValue }]
                }}
                source={require('../resources/images/corona.webp')}
              />
            </>
          ) : (
            <Image
              source={require('../resources/images/trophy.png')}
              style={styles.trophyImage}
            />
          )}
        </View>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black'
  },
  virusHpText: {
    fontSize: 15,
    color: 'red'
  },
  virusHpProgress: {
    marginBottom: 10,
    marginTop: 5
  },
  trophyImage: {
    width: 200,
    height: 250
  }
});
