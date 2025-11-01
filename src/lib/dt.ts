import { rand, randint } from '$lib';
import type { Sample } from './data';
import { test_inference, type InferenceResult } from './ml';

type Feature = keyof Sample;
export type ComputedFeature = {
  signature: string;
  fn: (sample: Sample) => number;
}

export type DT_Node = DT_Decision | DT_Choice;

export interface DT_Decision {
	id: number;
	kind: 'decision';
	fallback_choice: DT_Choice;
	severed?: boolean;
	feature: ComputedFeature;
	value: number; // < value or >= value;
	left: DT_Node;
	right: DT_Node;
}

export interface DT_Choice {
	id: number;
	kind: 'choice';
	chosen_category: number;
	category_weights: number[];
	norm_factor: number;
}

const DUMMY_CHOICE: DT_Choice = {
	id: -1,
	kind: 'choice',
	chosen_category: -1,
	category_weights: [],
	norm_factor: 1
};

const DUMMY_DECISION: DT_Decision = {
	id: -2,
	kind: 'decision',
	fallback_choice: DUMMY_CHOICE,
	feature: {signature: "?", fn: (sample) => 0},
	value: 0,
	left: DUMMY_CHOICE,
	right: DUMMY_CHOICE
};

export enum SplitMode {
  DISCRETIZE,
  ON_DATA,
  RANDOM,
}

export function build_DT(
	max_depth: number,
	n_categories: number,
	data: Sample[],
	heuristic: DT_Heuristic,
	heuristic_threshold: number,
  allow_same_category_split: boolean,
  feature_candidates: ComputedFeature[],
  split_mode: SplitMode,
  grid_interval: number,
  rng_search_depth: number
): DT_Node {
	let id = 0;
	function generate_id() {
		return id++;
	}

	const init_heuristic = heuristic(n_categories, data);
	return grow_DT(
		max_depth,
		0,
		{
			id: generate_id(),
			kind: 'choice',
			chosen_category: init_heuristic.chosen_category,
			category_weights: init_heuristic.category_weights,
			norm_factor: init_heuristic.norm_factor
		},
		n_categories,
		data,
		heuristic,
		init_heuristic.heuristic,
		heuristic_threshold,
		generate_id,
    allow_same_category_split,
    feature_candidates,
    split_mode,
    grid_interval,
    rng_search_depth,
	);
}

export function grow_DT(
	max_depth: number,
	depth: number,
	node: DT_Choice,
	n_categories: number,
	data: Sample[],
	heuristic: DT_Heuristic,
	prev_heuristic: number,
	heuristic_threshold: number,
	generate_id: () => number,
	allow_same_category_split: boolean,
  feature_candidates: ComputedFeature[],
  split_mode: SplitMode,
  grid_interval: number,
  rng_search_depth: number,
): DT_Node {
	// console.log(`depth: ${depth} of ${max_depth}`);
	if (
		depth >= max_depth || // maximum depth reached
		prev_heuristic === 0 // pure node
	) {
		return node;
	}

	let candidate_result: ReturnType<typeof split_with_heuristic>;

  const collect_candidate = (feature: ComputedFeature, sample: Sample) => {
    // console.log(`Try split ${feature}: ${sample[feature]}`);
    const result = split_with_heuristic(
      n_categories,
      feature,
      feature.fn(sample),
      data,
      prev_heuristic,
      heuristic
    );

    if (
      (allow_same_category_split || result.left_category !== result.right_category) && // should actually categorize!)
      (!candidate_result || // if there is no result yet
        result.delta_heuristic > candidate_result.delta_heuristic) // should be a better split than before
    ) {
      candidate_result = result;
    }
  }

	// collect candidate results and store them
	// if they improve on previous result
  switch (split_mode) {
    case SplitMode.DISCRETIZE: {
      for (let x = 0; x <= 1; x += grid_interval) {
        for (let y = 0; y <= 1; y += grid_interval) {
          for (let feature of feature_candidates) {
            collect_candidate(feature, {category: -1, x, y});
          }
        }
      }
    }
    case SplitMode.ON_DATA: {
      for (const sample of data) {
        for (let feature of feature_candidates) {
          collect_candidate(feature, sample);
        }
      }
    }
    case SplitMode.RANDOM: {
      for (let i = 0; i < rng_search_depth; i++) {
        const feature = feature_candidates[randint(0, feature_candidates.length)];
        const sample: Sample = {category: -1, x: rand(0, 1), y: rand(0, 1)}
        collect_candidate(feature, sample);
      }
    }
  }

	// create a new split if candidate result meets heuristic threshold
  // @ts-ignore this is fine, WE WILL FIND AT LEAST ONE RESULT!
	if (candidate_result && candidate_result.delta_heuristic > heuristic_threshold) {
		// we are splitting here!
		const new_dec: DT_Decision = {
			id: generate_id(),
			kind: 'decision',
			feature: candidate_result.feature,
			value: candidate_result.value,
			fallback_choice: node,
			left: grow_DT(
				max_depth,
				depth + 1,
				{
					id: generate_id(),
					kind: 'choice',
					chosen_category: candidate_result.left_category,
					category_weights: candidate_result.left_category_weights,
					norm_factor: candidate_result.left_norm_factor
				},
				n_categories,
				candidate_result.left_data,
				heuristic,
				candidate_result.left_heuristic,
				heuristic_threshold,
				generate_id,
        allow_same_category_split,
        feature_candidates,
        split_mode,
        grid_interval,
        rng_search_depth
			),
			right: grow_DT(
				max_depth,
				depth + 1,
				{
					id: generate_id(),
					kind: 'choice',
					chosen_category: candidate_result.right_category,
					category_weights: candidate_result.right_category_weights,
					norm_factor: candidate_result.right_norm_factor
				},
				n_categories,
				candidate_result.right_data,
				heuristic,
				candidate_result.right_heuristic,
				heuristic_threshold,
				generate_id,
        allow_same_category_split,
        feature_candidates,
        split_mode,
        grid_interval,
        rng_search_depth
			)
		};
		return new_dec;
	}

	// console.log(`No better split was found!`);
	return node;
}

export function DT_inference(
	sub_tree: DT_Node,
	sample: Sample,
	use_pruned_tree: boolean,
	prune_at?: DT_Decision
): InferenceResult {
	switch (sub_tree.kind) {
		case 'decision':
			if (prune_at && sub_tree.id === prune_at.id) {
				console.log(`stopped at prune stop ${sub_tree.id}`);
				return sub_tree.fallback_choice;
			}

			if (use_pruned_tree && sub_tree.severed) {
				return sub_tree.fallback_choice;
			}

			if (sub_tree.feature.fn(sample) < sub_tree.value) {
				return DT_inference(sub_tree.left, sample, use_pruned_tree, prune_at);
			} else {
				return DT_inference(sub_tree.right, sample, use_pruned_tree, prune_at);
			}
		case 'choice':
			return sub_tree;
	}
}

export type DT_Heuristic = typeof misclassification_impurity;

export function split_with_heuristic(
	n_categories: number,
	split_on_feature: ComputedFeature,
	split_on_value: number,
	data: Sample[],
	prev_heuristic: number,
	heuristic: DT_Heuristic
) {
	const left_data: Sample[] = [];
	const right_data: Sample[] = [];

	// split the dataset
	for (const sample of data) {
		if (split_on_feature.fn(sample) < split_on_value) {
			left_data.push(sample);
		} else {
			if (split_on_value === split_on_feature.fn(sample)) {
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
		left_norm_factor: left_heuristic.norm_factor,

		right_heuristic: right_heuristic.heuristic,
		right_category: right_heuristic.chosen_category,
		right_category_weights: right_heuristic.category_weights,
		right_norm_factor: right_heuristic.norm_factor,

		left_data,
		right_data,
		delta_heuristic,
		value: split_on_value,
		feature: split_on_feature
	};
}

export function count_categories(n_categories: number, data: Sample[]) {
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
		n_data: data.length,
		max_count,
		chosen_category,
		categories
	};
}

export const misclassification_impurity = (n_categories: number, data: Sample[]) => {
	const result = count_categories(n_categories, data);

	return {
		heuristic: 1 - result.max_count / result.n_data,
		chosen_category: result.chosen_category,
		category_weights: result.categories,
		norm_factor: result.n_data
	};
};

export const entropy_impurity: DT_Heuristic = (n_categories: number, data: Sample[]) => {
	const result = count_categories(n_categories, data);

	let entropy = 0;
	for (const [c, count] of result.categories.entries()) {
		const pi = count / result.n_data;
		const add = pi === 0 ? 0 : pi * Math.log2(pi);
		entropy += add;
	}

	return {
		heuristic: -entropy,
		chosen_category: result.chosen_category,
		category_weights: result.categories,
		norm_factor: result.n_data
	};
};

export const gini_impurity: DT_Heuristic = (n_categories: number, data: Sample[]) => {
	const result = count_categories(n_categories, data);

	let gini = 0;
	for (const [c, count] of result.categories.entries()) {
		const pi = count / result.n_data;
		const add = pi * (1 - pi);
		gini += add;
	}

	return {
		heuristic: gini,
		chosen_category: result.chosen_category,
		category_weights: result.categories,
		norm_factor: result.n_data
	};
};

export const step_impurity: DT_Heuristic = (n_categories: number, data: Sample[]) => {
	const result = count_categories(n_categories, data);

	let step = 0;
	for (const [c, count] of result.categories.entries()) {
		const pi = count / result.n_data;
		const add = (pi < 0.8) ? 1 : 0;
		step += add;
	}

	return {
		heuristic: step,
		chosen_category: result.chosen_category,
		category_weights: result.categories,
		norm_factor: result.n_data
	};
};

export function prune_tree(sub_tree: DT_Node, n_categories: number, validation_data: Sample[]) {
	// idea: step through every node, try to prune everywhere
	const first_result = test_inference(n_categories, validation_data, (sample) =>
		DT_inference(sub_tree, sample, false)
	);

	console.log(`==> Correctly categorized: ${first_result.correctly_categorized}`);

	let node_candidates: DT_Decision[] = [];
	let most_matches: number[] = [first_result.correctly_categorized];

	function prune_recursively(prune_at: DT_Node) {
		if (prune_at.kind === 'choice') {
			return;
		}

		let result = test_inference(n_categories, validation_data, (sample) =>
			DT_inference(sub_tree, sample, false, prune_at)
		);

		console.log(`@ ${prune_at.id} => ${result.correctly_categorized}`);

		// TODO: this should be some sort of error function
		if (result.correctly_categorized >= most_matches[0]) {
			node_candidates.splice(0, 0, prune_at);
			most_matches.splice(0, 0, result.correctly_categorized);
		}

		prune_recursively(prune_at.left);
		prune_recursively(prune_at.right);
	}

	// finally, do the pruning
	prune_recursively(sub_tree);

	// mark all candidates for severing
	if (node_candidates.length >= 0) {
		for (const candidate of node_candidates) {
			candidate.severed = true;
			console.log(`Pruned at: ${candidate.id}`);
		}
	}
}
