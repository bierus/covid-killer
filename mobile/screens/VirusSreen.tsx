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

  virusIntervalId;

  state = {
    dist: 9999999,
    virusHealth: this.VIRUS_HEALTH
  };

  constructor(props: P) {
    super(props);

    this.virusIntervalId = setInterval(
      () =>
        this.virus.getHealth() > 0
          ? this.reduceVirusHealth()
          : clearInterval(this.virusIntervalId),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.virusIntervalId);
  }

  calculateDist = async () => {
    let location = await getLocationAsync(); 
    let homeLocationString = await getData("homeLocation");
    let homeLocation = JSON.parse(homeLocationString);
    return distance(
      location.coords.latitude,
      location.coords.longitude,
      homeLocation.coords.latitude,
      homeLocation.coords.longitude,
      "M"
    );
  }

  reduceVirusHealth = async () => {
    let currentDist = await this.calculateDist()

    this.virus.reduceHealth(1);
    this.setState({ dist: currentDist ,virusHealth: this.virus.getHealth() });

    if (this.virus.getHealth() % 5 == 0) {
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

          <Text style={styles.virusHpText}>
            Dist: {this.state.dist} M
          </Text>

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
