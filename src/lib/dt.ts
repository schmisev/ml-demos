import type { Sample } from './data';
import type { InferenceResult } from './ml';

type Feature = keyof Sample;

export type DT_Node = DT_Decision | DT_Choice;

export interface DT_Decision {
	kind: 'decision';
	feature: Feature;
	value: number; // < value or >= value;
	left: DT_Node;
	right: DT_Node;
}

export interface DT_Choice {
	kind: 'choice';
	chosen_category: number;
	category_weights: number[];
}

const DUMMY_CHOICE: DT_Choice = {
	kind: 'choice',
	chosen_category: -1,
	category_weights: []
};

export function buildDecisionTree(
	max_depth: number,
	n_categories: number,
	data: Sample[],
	heuristic: DT_heuristic
): DT_Node {
	const init_heuristic = heuristic(n_categories, data);
	return growDecisionTree(
		max_depth,
		0,
		{
			kind: 'choice',
			chosen_category: init_heuristic.chosen_category,
			category_weights: init_heuristic.category_weights
		},
		n_categories,
		data,
		heuristic,
		init_heuristic.heuristic
	);
}

export function growDecisionTree(
	max_depth: number,
	depth: number,
	node: DT_Node,
	n_categories: number,
	data: Sample[],
	heuristic: DT_heuristic,
	prev_heuristic: number
): DT_Node {
	console.log(`depth: ${depth} of ${max_depth}`);
	if (depth >= max_depth) {
		console.log('reached max depth');
		return node;
	}

	let candidate_result;

	for (const sample of data) {
		for (let feature of ['x', 'y'] satisfies Feature[]) {
			console.log(`Try split ${feature}: ${sample[feature]}`);
			const result = split_with_heuristic(
				n_categories,
				feature,
				sample[feature],
				data,
				prev_heuristic,
				heuristic
			);

			if (!candidate_result || result.delta_heuristic > candidate_result.delta_heuristic) {
				candidate_result = result;
			}
		}
	}

	if (candidate_result && candidate_result?.delta_heuristic > 0) {
		// we are splitting here!
		const new_dec: DT_Decision = {
			kind: 'decision',
			feature: candidate_result.feature,
			value: candidate_result.value,
			left: growDecisionTree(
				max_depth,
				depth + 1,
				{
					kind: 'choice',
					chosen_category: candidate_result.left_category,
					category_weights: candidate_result.left_category_weights
				},
				n_categories,
				candidate_result.left_data,
				heuristic,
				candidate_result.left_heuristic
			),
			right: growDecisionTree(
				max_depth,
				depth + 1,
				{
					kind: 'choice',
					chosen_category: candidate_result.right_category,
					category_weights: candidate_result.right_category_weights
				},
				n_categories,
				candidate_result.right_data,
				heuristic,
				candidate_result.right_heuristic
			)
		};
		return new_dec;
	}

	console.log(`No better split was found!`);
	return node;
}

export function DT_inference(sub_tree: DT_Node, sample: Sample): InferenceResult {
	switch (sub_tree.kind) {
		case 'decision':
			if (sample[sub_tree.feature] < sub_tree.value) {
				return DT_inference(sub_tree.left, sample);
			} else {
				return DT_inference(sub_tree.right, sample);
			}
		case 'choice':
			return {
        chosen_category: sub_tree.chosen_category,
        category_weights: sub_tree.category_weights,
        norm_factor: 1,
      };
	}
}

export type DT_heuristic = typeof misclassification_rate;

export function split_with_heuristic(
	n_categories: number,
	split_on_feature: Feature,
	split_on_value: number,
	data: Sample[],
	prev_heuristic: number,
	heuristic: DT_heuristic
) {
	const left_data: Sample[] = [];
	const right_data: Sample[] = [];

	// split the dataset
	for (const sample of data) {
		if (sample[split_on_feature] < split_on_value) {
			left_data.push(sample);
		} else {
			if (split_on_value === sample[split_on_feature]) {
				// filter out value
			} else {
				right_data.push(sample);
			}
		}
	}

	// calculate heuristic
	const left_heuristic = heuristic(n_categories, left_data);
	const right_heuristic = heuristic(n_categories, right_data);

	const left_p = left_data.length / data.length;
	const right_p = right_data.length / data.length;

	let delta_heuristic = 0;

	if (data.length === 0 || left_p === 0 || right_p === 0) {
		// the split produces empty arrays
		delta_heuristic = -Infinity;
	} else {
		delta_heuristic =
			prev_heuristic - left_p * left_heuristic.heuristic - right_p * right_heuristic.heuristic;
	}

	return {
		left_heuristic: left_heuristic.heuristic,
		left_category: left_heuristic.chosen_category,
		left_category_weights: left_heuristic.category_weights,
		right_heuristic: right_heuristic.heuristic,
		right_category: right_heuristic.chosen_category,
		right_category_weights: right_heuristic.category_weights,
		left_data,
		right_data,
		delta_heuristic,
		value: split_on_value,
		feature: split_on_feature
	};
}

export function misclassification_rate(n_categories: number, data: Sample[]) {
	const categories = new Array<number>(n_categories).fill(0);
	for (const sample of data) {
		categories[sample.category]++;
	}

	let max_count = 0;
	let chosen_category = -1;
	for (const [c, count] of categories.entries()) {
		if (count > max_count) {
			max_count = count;
			chosen_category = c;
		}
	}

	return {
		heuristic: 1 - max_count / data.length,
		chosen_category,
		category_weights: categories.map((c) => c / data.length)
	};
}
