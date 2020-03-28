import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Virus } from '../models/Virus';

export class VirusScreen<P> extends React.Component<P> {
  virusIntervalId: number;

  state = {
    virus: new Virus(
      'https://cdn.pixabay.com/photo/2020/03/10/17/30/corona-4919644_960_720.png',
      450
    )
  };

  constructor(props: P) {
    super(props);

    this.virusIntervalId = setInterval(() => {
      this.state.virus.reduceHealth(1);
      this.setState({ virus: this.state.virus });

      if (this.state.virus.getHealth() <= 0) {
        clearInterval(this.virusIntervalId);
      }
    }, 100);
  }

  render() {
    return (
      <>
        <View style={styles.container}>
          {this.state.virus.getHealth() > 0 ? (
            <>
              <Text style={styles.virusHpText}>
                HP: {this.state.virus.getHealth()}
              </Text>
              <Image
                style={{
                  height: this.state.virus.getHealth(),
                  width: this.state.virus.getHealth()
                }}
                source={{
                  uri: this.state.virus.getImageUrl()
                }}
              />
            </>
          ) : (
            <Image
              source={{
                uri:
                  'https://pluspng.com/img-png/trophy-hd-png-trophy-free-png-image-png-808.png'
              }}
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
    color: 'green'
  },
  trophyImage: {
    width: 200,
    height: 250
  }
});
