export class Virus {
  constructor(private health: number) {}

  getHealth = () => this.health;

  reduceHealth(reduceAmount: number) {
    this.health -= reduceAmount;
  }
}
