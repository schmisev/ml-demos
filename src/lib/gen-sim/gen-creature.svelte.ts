import { type Genome } from "./gen-sim";


export class Creature {
  genome: Genome;

  constructor(g: Genome) {
    this.genome = g;
  }
}

