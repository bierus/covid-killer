export class Virus {
  initialHealth: number;
  health: number;

  constructor(initialHealth: number, health: number) {
    this.initialHealth = initialHealth; 
    this.health = health;
  }

  getHealth = () => this.health;
  getInitialHealth = () => this.initialHealth;
  setHealth = (value: number) => this.health = value;
  getHealthPercentage() {
    return Math.round((this.health / this.initialHealth) * 100) / 100;
  }

  reduceHealth(reduceAmount: number) {
    this.health -= reduceAmount;
  }
}
