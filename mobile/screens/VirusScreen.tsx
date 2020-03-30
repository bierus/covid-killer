import moment from 'moment';
import React from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Virus } from '../models/Virus';
import Bar from 'react-native-progress/Bar';
import { Button } from 'react-native-elements';

import { storeData, getData } from '../shared/asyncStorage';

import * as BackgroundFetch from 'expo-background-fetch';
import {
  VIRUS_TASK,
  MINUTE_INTERVAL as VIRUS_TASK_INTERVAL
} from '../tasks/virusTask';

import { getDistanceFromHome, getLocationAsync } from '../shared/location';
import * as Location from 'expo-location';
import covid from 'novelcovid';

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
    timeLeft: this.VERIFY_DISTANCE_INTERVAL * this.VIRUS_HEALTH / this.REDUCE_HEALTH_BY,
    country: [],
  };

  constructor(props: P) {
    super(props);
    getLocationAsync().then(async value => {
      try {
        const data = await Location.reverseGeocodeAsync(value.location.coords);
        const specificCountry = await covid.getCountry({country: data[0].country});
        this.VIRUS_HEALTH = Math.floor( specificCountry.active );
        this.setState({country: data[0].country, virusHealth: this.VIRUS_HEALTH});
        this.restart();
      } catch (error) {
        console.log(error)
      }
    })
    this.init();
  }

  restart = () => {
    this.virus = new Virus(this.VIRUS_HEALTH, this.VIRUS_HEALTH);
    storeData('Virus', this.virus);
    this.init();
  };

  async init() {
    BackgroundFetch.registerTaskAsync(VIRUS_TASK, {
      minimumInterval: VIRUS_TASK_INTERVAL
    });

    getData('Virus').then(value => {
      if (value === undefined) {
        this.virus = new Virus(this.VIRUS_HEALTH, this.VIRUS_HEALTH);
        storeData('Virus', this.virus);
      } else {
        this.virus = new Virus(value.initialHealth, value.health);
      }
    });

    const intervalId = setInterval(() => {
      getData('Virus').then(async value => {
        if (this.virus.getHealth() >= 0) {
          let homeDistance: number = await getDistanceFromHome();

          if (homeDistance < 50) {
            this.virus.reduceHealth(this.REDUCE_HEALTH_BY);
          }
          else{
            this.virus.regenerateHealth(this.REDUCE_HEALTH_BY);
          }

          storeData('Virus', this.virus);
          this.updateVirusStateData(homeDistance);

          if (this.virus.getHealth() % 5 == 0) {
            this.animateVirus();
          }

          this.updateTimeLeft();
        } else {
          BackgroundFetch.unregisterTaskAsync(VIRUS_TASK);
          clearInterval(intervalId);
        }
      });
    }, this.VERIFY_DISTANCE_INTERVAL);
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
    if (valuesToDisplay.length || timeLeft.days()) {
      valuesToDisplay.push(`${timeLeft.days()} days`);
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

  async updateVirusStateData(homeDistance: number) {
    this.setState({
      distance: homeDistance,
      virusHealth: this.virus.getHealth()
    });
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
                <Icon name='home' size={20} /> 
                {Math.round(this.state.distance)}{' '}
                m
              </Text>
              <Text style={styles.virusHpText}>
                <Icon name='heart' size={20} /> {this.state.virusHealth} / {this.state.virusHealth}
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
                  maxHeight: 350,
                  maxWidth: 350,
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
            <Text>{JSON.stringify(this.state.country)}</Text>
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
