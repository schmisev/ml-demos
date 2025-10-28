import { rand, rand_gauss } from '$lib';
import type { Vector2 } from './vector';

export type Sample2D = {
	X: Vector2;
	y: number;
};

export type Dataset2D = {
	samples: Sample2D[];
	b: number;
	delta: number;
  y_min: number;
  y_max: number;
};

export function generate_linear_2d_samples(
	N: number,
	a_max: number,
	b_max: number,
	noise_mean: number,
	noise_stdev: number
): Dataset2D {
	const a1 = rand(-a_max, a_max);
	const a2 = rand(-a_max, a_max);
	const b = rand(0, b_max);

  let y_max = -Infinity;
  let y_min = Infinity;

	const v: Sample2D[] = [...new Array(N)].map((i) => {
		const x1 = rand(-0.5, 0.5);
		const x2 = rand(-0.5, 0.5);
    const y = a1 * x1 + a2 * x2 + b + rand_gauss(noise_mean, noise_stdev);

    if (y > y_max) y_max = y;
    if (y < y_min) y_min = y;

		return {
			X: { x: x1, y: x2 },
			y: y
		} satisfies Sample2D;
	});

	return {
		samples: v,
		b,
    delta: y_max - y_min,
    y_min,
    y_max
	};
}
