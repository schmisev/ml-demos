import { rand, randint } from '$lib';

export interface Sample {
	category: number;
	x: number;
	y: number;
}

export interface TestedSample extends Sample {
  chosen_category: number;
}

export interface Category {
	dx: number;
	dy: number;
	ax: number;
	ay: number;
	tilt: number;
}

export function generateNewCategories(n_categories: number) {
	let categories: Category[] = [];
	for (let i = 0; i < n_categories; i++) {
		categories.push({
			dx: rand(0, 1),
			dy: rand(0, 1),
			ax: rand(0, 0.5),
			ay: rand(0, 0.5),
			tilt: rand(0, Math.PI * 2)
		});
	}

	return {
		categories
	};
}

export function generateNewData(categories: Category[], n_data: number) {
	let data: Sample[] = [];

	for (let i = 0; i < n_data; i++) {
		let category = randint(0, categories.length);
		let props = categories[category];
		const { dx, dy, ax, ay, tilt } = props;

		const offx = ax * rand(-1, 1);
		const offy = ay * rand(-1, 1);

		data.push({
			category,
			x: dx + Math.cos(tilt) * offx + Math.sin(tilt) * offy,
			y: dy + Math.sin(tilt) * offx + Math.cos(tilt) * offy
		});
	}

	return {
		data
	};
}
