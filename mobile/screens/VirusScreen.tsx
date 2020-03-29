import moment from 'moment';
import React from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Virus } from '../models/Virus';
import Bar from 'react-native-progress/Bar';
import { LocationData } from 'expo-location';
import { Button } from 'react-native-elements';

import { storeData, getData } from '../shared/asyncStorage';
import { getLocationAsync, getDistance } from '../shared/location';

export class VirusScreen<P> extends React.Component<P> {
  VIRUS_HEALTH = 360;

  // interval for which we're checking the distance changes
  VERIFY_DISTANCE_INTERVAL = 1000;

  // value by which we're reducing the HP each time
  REDUCE_HEALTH_BY = 1;

  virus = new Virus(this.VIRUS_HEALTH, this.VIRUS_HEALTH);
  previousVirusHealth = this.VIRUS_HEALTH;

  virusSpringValue = new Animated.Value(1);

  state = {
    distance: 999,
    virusHealth: this.VIRUS_HEALTH,
    timeLeft: this.VERIFY_DISTANCE_INTERVAL * this.VIRUS_HEALTH / this.REDUCE_HEALTH_BY
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
      }, this.VERIFY_DISTANCE_INTERVAL);
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
    this.setState({ distance: currentDist });
    if (currentDist > 10) {
      return;
    }
    this.virus.reduceHealth(this.REDUCE_HEALTH_BY);
    this.setState({ virusHealth: this.virus.getHealth() });

    if (this.virus.getHealth() % 5 == 0) {
      this.animateVirus();
    }
    this.updateTimeLeft();
  }

  updateTimeLeft() {
    const updatesLeft = this.virus.getHealth() / this.REDUCE_HEALTH_BY;
    const millisecondsLeft = this.VERIFY_DISTANCE_INTERVAL * updatesLeft;
    this.setState({ timeLeft: millisecondsLeft });
  }

  formatTimeLeft() {
    const timeLeft = moment.duration(this.state.timeLeft);
    let valuesToDisplay = [];
    if (valuesToDisplay.length || timeLeft.months()) {
      valuesToDisplay.push(`${timeLeft.months()} months`);
    }
    if (valuesToDisplay.length || timeLeft.hours()) {
      valuesToDisplay.push(`${timeLeft.hours()} hours`);
    }
    if (valuesToDisplay.length || timeLeft.minutes()) {
      valuesToDisplay.push(`${timeLeft.minutes()} minutes`);
    }
    if (valuesToDisplay.length || timeLeft.seconds()) {
      valuesToDisplay.push(`${timeLeft.seconds()} seconds`);
    }
    return valuesToDisplay.join(' ');
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
          {this.virus.getHealth() > 0 ? (
            <>
              <Text style={styles.virusHpText}>
                <Icon name='home' size={20} /> {Math.round(this.state.distance)}{' '}
                m
              </Text>
              <Text style={styles.virusHpText}>
                <Icon name='heart' size={20} /> {this.state.virusHealth}
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
          {this.state.timeLeft > 0 ? (
            <Text style={styles.timeLeft}>Your virus will die in {this.formatTimeLeft()}.{'\n'}#StayHome</Text>
          ) :  (
            <Text style={styles.timeLeft}>You killed the virus!{'\n'}#StayHome</Text>
          )}
          <View style={{ margin: 15 }}>
            <Button title='Restart' onPress={this.restart} type='outline' />
          </View>
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
    backgroundColor: '#fff'
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
  },
  timeLeft: {
    textAlign: 'center'
  }
});
