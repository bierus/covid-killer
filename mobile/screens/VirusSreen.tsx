import React from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import { Virus } from '../models/Virus';

export class VirusScreen<P> extends React.Component<P> {
  virus = new Virus(360);
  virusSpringValue = new Animated.Value(1);

  virusIntialHealth = this.virus.getHealth();
  previousVirusHealth = this.virusIntialHealth;

  state = {
    virusHealth: this.virusIntialHealth
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

  reduceVirusHealth() {
    this.virus.reduceHealth(1);
    this.setState({ virusHealth: this.virus.getHealth() });

    if (this.virus.getHealth() % 5 == 0) {
      this.virusSpringValue.setValue(
        this.previousVirusHealth / this.virusIntialHealth
      );

      Animated.spring(this.virusSpringValue, {
        toValue: this.virus.getHealth() / this.virusIntialHealth,
        friction: 1
      }).start();

      this.previousVirusHealth = this.virus.getHealth();
    }
  }

  render() {
    debugger;
    return (
      <>
        <View style={styles.container}>
          {this.state.virusHealth > 0 ? (
            <>
              <Text style={styles.virusHpText}>
                HP: {this.state.virusHealth}
              </Text>
              <Animated.Image
                style={{
                  height: this.virusIntialHealth,
                  width: this.virusIntialHealth,
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
    fontSize: 30,
    marginBottom: 10,
    color: 'green'
  },
  trophyImage: {
    width: 200,
    height: 250
  }
});
