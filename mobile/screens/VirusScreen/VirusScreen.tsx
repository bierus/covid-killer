import React from 'react';
import { styles } from './VirusScreen.style';
import { View, Text, Image, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Virus } from '../../models/Virus';
import Bar from 'react-native-progress/Bar';
import { Button } from 'react-native-elements';
import { storeData, getData } from '../../shared/asyncStorage';
import { getDistanceFromHome, getLocationAsync } from '../../shared/location';
import * as Location from 'expo-location';
import covid from 'novelcovid';
import * as BackgroundFetch from 'expo-background-fetch';
import {
  VIRUS_TASK,
  MINUTE_INTERVAL as VIRUS_TASK_INTERVAL
} from '../../tasks/virusTask';

import {
  VIRUS_HEALTH,
  VERIFY_DISTANCE_INTERVAL,
  REDUCE_HEALTH_BY,
  INCREASE_HEALTH_BY,
} from 'react-native-dotenv'


export class VirusScreen<P> extends React.Component<P> {
  virus = new Virus(VIRUS_HEALTH, VIRUS_HEALTH);
  previousVirusHealth = VIRUS_HEALTH;
  virusSpringValue = new Animated.Value(1);
  intervalId: number = undefined;

  state = {
    distance: 1,
    country: [],
  };

  constructor(props: P) {
    super(props);
    this.setLocation();
    this.init();
  }
  
  setLocation = () => {
    getLocationAsync().then(async value => {
      try {
        let data = await Location.reverseGeocodeAsync(value.location.coords);
        if(data[0] === undefined){
          throw "Api did not return any address."
        }
        const specificCountry = await covid.getCountry({country: data[0].country});
        this.setState({country: data[0].country });
        this.loadVirus(specificCountry.active);
        this.init();
      } catch (error) {
        console.log(error)
      }
    })
  }
  
  cancelWorkers = async () => {
    try {
      await BackgroundFetch.unregisterTaskAsync(VIRUS_TASK);
      clearInterval(this.intervalId);
      this.intervalId = undefined
    } catch (error) {
      console.log(error)
    }
  };

  restart = async () => {
    let initialHealth = this.virus.getInitialHealth();
    this.virus = new Virus(initialHealth, initialHealth)
    storeData('Virus', this.virus);
    await this.cancelWorkers();
    this.init();
  };

  componentWillUnmount = async () => {
    await this.cancelWorkers();
  }

  loadVirus = (initialHealth: number) => {
    getData('Virus').then(value => {
      if (value === undefined) {
        this.virus = new Virus(initialHealth, initialHealth)
        storeData('Virus', this.virus);
      } else {
        this.virus = new Virus(value.initialHealth, value.health);
      }
    });
  }

  async init() {
    try {
      await BackgroundFetch.registerTaskAsync(VIRUS_TASK, {
        minimumInterval: VIRUS_TASK_INTERVAL
      });
    } catch (error) {
      console.log(error)
    }
    if(this.intervalId === undefined){
      this.intervalId = setInterval(this.loopFunction, VERIFY_DISTANCE_INTERVAL);
    }
  }

  loopFunction = async () => {
    if (this.virus.getHealth() >= 0) {
      let homeDistance: number = await getDistanceFromHome();

      if (homeDistance < 50) {
        this.virus.reduceHealth(REDUCE_HEALTH_BY);
      }
      else{
        this.virus.regenerateHealth(INCREASE_HEALTH_BY);
      }

      storeData('Virus', this.virus);
      this.setState({ distance: homeDistance });

      if (this.virus.getHealth() % 5 == 0) {
        this.animateVirus();
      }

      this.virus.updateTimeLeft();
    } else {
      await this.cancelWorkers();
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
          {this.virus.getHealth() > 0 ? (
            <>
              <Text style={styles.virusHpText}>
                <Icon name='home' size={20} /> 
                {Math.round(this.state.distance)}{' '}
                m
              </Text>
              <Text style={styles.virusHpText}>
                <Icon name='heart' size={20} /> {this.virus.getHealth()} / {this.virus.getInitialHealth()}
              </Text>
              <Bar
                progress={this.virus.getHealthPercentage()}
                width={200}
                color='#A92C2C'
                style={styles.virusHpProgress}
              />
              <Animated.Image
                style={{
                  height: 350,
                  width: 350,
                  maxHeight: 350,
                  maxWidth: 350,
                  transform: [{ scale: this.virusSpringValue }]
                }}
                source={require('../../resources/images/coronavirus.png')}
              />
            </>
          ) : (
            <Image
              source={require('../../resources/images/trophy.png')}
              style={styles.trophyImage}
            />
          )}
          {this.virus.timeLeft > 0 ? (
            <Text style={styles.timeLeft}>Your virus will die in {this.virus.formatTimeLeft()}.{'\n'}#StayHome</Text>
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


