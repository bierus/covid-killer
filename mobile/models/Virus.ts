import {
  VERIFY_DISTANCE_INTERVAL,
  REDUCE_HEALTH_BY,
} from '../env'
import moment from 'moment';

export class Virus {
  timeLeft: number = 0;
  constructor(private initialHealth: number, private health: number) {
    this.timeLeft = VERIFY_DISTANCE_INTERVAL * this.health / REDUCE_HEALTH_BY;
  }

  getHealth = () => this.health;
  getInitialHealth = () => this.initialHealth;
  getHealthPercentage() {
    return Math.round((this.health / this.initialHealth) * 100) / 100;
  }

  reduceHealth(reduceAmount: number) {
    this.health -= reduceAmount;
  }

  regenerateHealth(reduceAmount: number) {
    if(this.health < this.initialHealth) { 
      this.health += reduceAmount; 
    }
  }

  updateTimeLeft() {
    const updatesLeft = this.health / REDUCE_HEALTH_BY;
    const millisecondsLeft = VERIFY_DISTANCE_INTERVAL * updatesLeft;
    this.timeLeft = millisecondsLeft;
  }

  formatTimeLeft() {
    const timeLeft = moment.duration(this.timeLeft);
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
  
}
