import { rand, randint } from '$lib';
import { m_add, m_cholesky, m_dot, m_gauss, m_mat, m_mult, m_uniform, m_vec, T, type Matrix } from './matrix';

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

export class ClassND {
  y: number;
  mean: Matrix;
  covar: Matrix;
  L: Matrix;

  constructor(y: number, mean: number[], covar: number[][]) {
    this.y = y;
    if (mean.length !== covar.length) throw `Uneven dimensions!`;
    this.mean = m_vec(mean);
    this.covar = m_mat(covar);
    this.L = m_cholesky(this.covar);
  }

  draw_sample() {
    const random_vec = m_gauss(this.mean.r, 1, 0, 1);
    const transformed_vec = m_mult(this.L, random_vec);
    const data_vector = m_add(this.mean, transformed_vec);
    return new SampleND(this.y, data_vector);
  }
}

export class SampleND {
  y: number;
  X: Matrix;

  constructor(y: number, X: Matrix) {
    this.y = y;
    this.X = X;
  }

  x(index: number): number {
    while (index < 0) {
      index += this.X.c;
    }
    if (index >= this.X.r) return 0;
    return this.X.$[index][0];
  }
} 

export class PlaneND {
  w0: number;
  w: Matrix;
  normal_y: number;

  constructor(y: number, w0: number, w: number[]) {
    this.w0 = w0;
    this.w = m_vec(w);
    this.normal_y = y;
  }

  on_side_of_normal(x: Matrix) {
    const d = m_mult(T(this.w), x).$[0][0] + this.w0;
    const distance = m_dot(this.w, this.w);

    return {
      result: d > 0,
      distance: Math.sqrt(distance)
    }
  }

  classify(samples: SampleND[]) {
    let classified = 0;
    let misclassified = 0;
    for (const sample of samples) {

    }
  }
}