import React from 'react';
import { View, Text, Image, StyleSheet, Animated, Button } from 'react-native';
import { Virus } from '../models/Virus';
import Bar from 'react-native-progress/Bar';

import { storeData, getData } from '../shared/asyncStorage';
import { getLocationAsync, getDistance } from '../shared/location';
import { LocationData } from 'expo-location';

export class VirusScreen<P> extends React.Component<P> {
  VIRUS_HEALTH = 360;

  virus = new Virus(this.VIRUS_HEALTH, this.VIRUS_HEALTH);
  previousVirusHealth = this.VIRUS_HEALTH;

  virusSpringValue = new Animated.Value(1);

  state = {
    distance: 999,
    virusHealth: this.VIRUS_HEALTH
  };

  constructor(props: P) {
    super(props);
    this.init();
  }

  restart = () => {
    this.virus = new Virus(this.VIRUS_HEALTH, this.VIRUS_HEALTH);
    storeData('Virus', this.virus);
    this.init();
  };

  init() {
    getData('Virus').then(value => {
      if (value === undefined) {
        this.virus = new Virus(this.VIRUS_HEALTH, this.VIRUS_HEALTH);
        storeData('Virus', this.virus);
      } else {
        this.virus = new Virus(value.initialHealth, value.health);
      }

      const virusIntervalId = setInterval(() => {
        if (this.virus.getHealth() > 0) {
          this.reduceVirusHealth();
          storeData('Virus', this.virus);
        } else {
          clearInterval(virusIntervalId);
        }
      }, 1000);
    });
  }

  async calculateDistance() {
    const { location } = await getLocationAsync();
    const homeLocation: LocationData = await getData('homeLocation');

    return getDistance(
      location.coords.latitude,
      location.coords.longitude,
      homeLocation.coords.latitude,
      homeLocation.coords.longitude,
      'M'
    );
  }

  async reduceVirusHealth() {
    let currentDist = await this.calculateDistance();
    this.setState({ dist: currentDist });
    if (currentDist > 10) {
      return;
    }
    this.virus.reduceHealth(1);
    this.setState({ virusHealth: this.virus.getHealth() });

    if (this.virus.getHealth() % 5 == 0) {
      this.animateVirus();
    }
  }

  animateVirus() {
    this.virusSpringValue.setValue(
      this.previousVirusHealth / this.virus.getInitialHealth()
    );

    Animated.spring(this.virusSpringValue, {
      toValue: this.virus.getHealthPercentage(),
      friction: 0.25
    }).start();

    this.previousVirusHealth = this.virus.getHealth();
  }

  render() {
    return (
      <>
        <View style={styles.container}>
          <Text style={styles.virusHpText}>Dist: {this.state.distance} M</Text>

          {this.virus.getHealth() > 0 ? (
            <>
              <Text style={styles.virusHpText}>
                HP: {this.state.virusHealth}
              </Text>
              <Bar
                progress={this.virus.getHealthPercentage()}
                width={200}
                color='#A92C2C'
                style={styles.virusHpProgress}
              />
              <Animated.Image
                style={{
                  height: this.VIRUS_HEALTH,
                  width: this.VIRUS_HEALTH,
                  transform: [{ scale: this.virusSpringValue }]
                }}
                source={require('../resources/images/coronavirus.png')}
              />
            </>
          ) : (
            <Image
              source={require('../resources/images/trophy.png')}
              style={styles.trophyImage}
            />
          )}
          <Button title='Restart' onPress={this.restart} />
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
    backgroundColor: '#D8E2BB'
  },
  virusHpText: {
    padding: 10,
    fontSize: 15,
    color: 'black'
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
