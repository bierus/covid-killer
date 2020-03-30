export class Virus {
  constructor(private initialHealth: number, private health: number) {}

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
}
