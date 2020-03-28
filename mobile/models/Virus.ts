export class Virus {
  constructor(private imageUrl: string, private health: number) {}

  getImageUrl = () => this.imageUrl;
  getHealth = () => this.health;

  reduceHealth(reduceAmount: number) {
    this.health -= reduceAmount;
  }
}
