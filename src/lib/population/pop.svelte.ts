export interface Population {
	birth_rate: number;
	birth_penalty: number;
	death_rate: number;
	death_penalty: number;
  type: "prey" | "predator";
  name: string;
}

export interface PopModel {
	history: number[][];
	pops: Population[];
	times: number[];
}

export type PopRule = (last_pops: number[], pops: Population[], dt: number) => number[];

export function simulate_timestep(model: PopModel, rule: PopRule, dt: number): void {
	let pops = model.pops;
	let last_pops = model.history.at(-1);
	if (!last_pops) last_pops = new Array(model.pops.length).fill(0);

	let new_pops = rule(last_pops, pops, dt);
  model.history.push(new_pops);
  model.times.push((model.times.at(-1) || 0) + dt);
}

export const malthus: PopRule = (last_pops, pops, dt) => {
	return last_pops.map((p, i) => p + p * (pops[i].birth_rate - pops[i].death_rate) * dt);
};

export const verhulstian: PopRule = (last_pops, pops, dt) => {
	return last_pops.map((p, i) => {
		let m = pops[i].birth_penalty + pops[i].death_penalty;
		let K = (pops[i].birth_rate - pops[i].death_rate) / m;
		return p + -m * (p - K) * dt;
	});
};

export const logistic: PopRule = (last_pops, pops, dt) => {
	return last_pops.map((p, i) => {
		let a = pops[i].birth_rate - pops[i].death_rate;
		let b = pops[i].birth_penalty + pops[i].death_penalty;
		return p + (a - b * p) * p * dt;
	});
};

export const lotka_volterra: PopRule = (last_pops, pops, dt) => {
	let pred_p = 0;
  let prey_p = 0;

  for (const [i, p] of pops.entries()) {
    switch (p.type) {
      case "prey":
        prey_p += last_pops[i];
        break;
      case "predator":
        pred_p += last_pops[i];
        break;
    }
  }

	return last_pops.map((p, i) => {
    let eps = 0;
    let gamma = 0;
    switch (pops[i].type) {
      case "prey":
        eps = pops[i].birth_rate;
        gamma = pops[i].death_rate * pred_p;
        break;
      case "predator":
        eps = -pops[i].death_rate;
        gamma = -pops[i].birth_rate * prey_p;
        break;
    }
    const new_p = p + (eps - gamma) * p * dt;
		return new_p > 0 ? new_p : 0;
	});
};
