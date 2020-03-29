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
import { getDistanceFromHome } from '../shared/location';

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
      getData('Virus').then(value => {
        this.virus = new Virus(value.initialHealth, value.health);

        if (this.virus.getHealth() >= 0) {
          this.virus.reduceHealth(1);
          storeData('Virus', this.virus);
          this.updateVirusStateData();

          if (this.virus.getHealth() % 5 == 0) {
            this.animateVirus();
          }
        } else {
          BackgroundFetch.unregisterTaskAsync(VIRUS_TASK);
          clearInterval(intervalId);
        }
      });
    }, 1000);
  }

  async updateVirusStateData() {
    this.setState({
      distance: await getDistanceFromHome(),
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
  }
});
