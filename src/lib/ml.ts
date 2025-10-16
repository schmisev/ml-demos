import { euclid } from '$lib';
import type { Sample, TestedSample } from './data';

const DUMMY_SAMPLE: Sample = {
	category: -1,
	x: 0,
	y: 0
};

export interface kNN_Neighbor {
	sample: Sample;
	weight: number;
	distance: number;
}

export interface InferenceResult {
	category_weights: number[];
	chosen_category: number;
  norm_factor: number;
}

export interface kNN_Result extends InferenceResult {
	neighbors: kNN_Neighbor[];
}

// norms
export function L2_norm(a: Sample, b: Sample): number {
	return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function L1_norm(a: Sample, b: Sample): number {
	return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function LInf_norm(a: Sample, b: Sample): number {
	return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

// weighting
export function no_weight(distance: number): number {
	return 1;
}

export function inv_weight(distance: number): number {
	return 1 / distance;
}

// inference
export function kNN_inference(
	k: number,
	n_categories: number,
	sample: Sample,
	data: Sample[],
	norm: (a: Sample, b: Sample) => number = L2_norm,
	weight_fn: (distance: number) => number = no_weight
): kNN_Result {
	// find nearest (weighted) neighbors
	const neighbors = new Array<kNN_Neighbor>(k).fill({
		sample: DUMMY_SAMPLE,
		weight: -Infinity,
		distance: Infinity
	});
	for (let other_sample of data) {
		const distance = norm(sample, other_sample);
		const weight = weight_fn(distance);

		for (let i = 0; i < neighbors.length; i++) {
			if (neighbors[i].distance > distance) {
				neighbors.splice(i, 0, { sample: other_sample, weight: weight, distance });
				break;
			}
		}
		if (neighbors.length > k) neighbors.pop();
	}

	// count up categories
	let category_weights = new Array<number>(n_categories).fill(0);
	for (let n of neighbors) {
		category_weights[n.sample.category] += n.weight;
	}
	let norm_factor = category_weights.reduce((a, b) => a + b);

	// find chosen (top) category
	let max_w = 0;
	let chosen_category = -1;
	for (let [c, w] of category_weights.entries()) {
		if (w > max_w) {
			max_w = w;
			chosen_category = c;
		}
	}

	return {
		neighbors,
		category_weights,
		norm_factor,
		chosen_category
	};
}

// testing
export function test_inference<Result extends InferenceResult>(
	n_categories: number,
	test_data: Sample[],
	headless_kNN: (sample: Sample) => Result
) {
	const checked_samples: TestedSample[] = [];
  let correctly_categorized = 0;
	let TP = new Array<number>(n_categories).fill(0);
	let TN = new Array<number>(n_categories).fill(0);
	let FP = new Array<number>(n_categories).fill(0);
	let FN = new Array<number>(n_categories).fill(0);

	for (const sample of test_data) {
		const result = headless_kNN(sample);

		checked_samples.push({
			...sample,
			chosen_category: result.chosen_category
		});

		// stats
		for (let c = 0; c < n_categories; c++) {
			if (result.chosen_category === c) {
				// POSITIVE
				if (result.chosen_category === sample.category) {
          TP[c]++;
          correctly_categorized++;
        }
				else FN[c]++;
			} else {
				// NEGATIVE
        if (result.chosen_category === sample.category) TN[c]++;
				else FP[c]++;
			}
		}
	}

	return {
    correctly_categorized,
		checked_samples,
    TP, FP, TN, FN,
	};
}
