export class Virus {
  initialHealth: number;

  constructor(private health: number) {
    this.initialHealth = health;
  }

  getHealth = () => this.health;
  getInitialHealth = () => this.initialHealth;

  getHealthPercentage() {
    return Math.round((this.health / this.initialHealth) * 100) / 100;
  }

  reduceHealth(reduceAmount: number) {
    this.health -= reduceAmount;
  }
}
