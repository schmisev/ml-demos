<script lang="ts">
	import { euclid, rand } from '$lib';
	import { type Sample, type Category, generateNewCategories, generateNewData } from '$lib/data';
	import {
		build_DT,
		DT_inference,
		entropy_impurity,
		gini_impurity,
		misclassification_impurity,
		prune_tree,
		type ComputedFeature,
		type DT_Heuristic,
		type DT_Node
	} from '$lib/dt';
	import { render_DT } from '$lib/dt_mermaid';
	import {
		inv_weight,
		kNN_inference,
		L1_norm,
		L2_norm,
		LInf_norm,
		no_weight,
		test_inference
	} from '$lib/ml';
	import { onMount } from 'svelte';

	let cvs: HTMLCanvasElement;

	// viz stuff
	let category_colors: [string, string][] = [
		['red', 'lightcoral'],
		['blue', 'lightblue'],
		['green', 'lightgreen'],
		['orange', 'yellow'],
		['gray', 'whitesmoke'],
		['pink', 'lightpink'],
		['black', 'gray']
	];

	// hyperparams
	let k = $state(1);

	// data & categories
  let cell_size = $state(4);
	let data: Sample[] = [];
	let test_data: Sample[] = [];
	let categories: Category[] = [];
	let decision_tree: DT_Node | undefined = $state<DT_Node>();
	let diagram_svg: string = $state('');
	let pruned_diagram_svg: string = $state('');
	let chosen_inference: 'kNN' | 'DT' = $state('DT');
	let chosen_impurity_measure: DT_Heuristic = $state(misclassification_impurity);
	let impurity_threshold = $state(0.1);
	let allow_same_category_split = $state(false);
  let split_on_training_data = $state(true);
  let test_grid_exp = $state(2);
	let use_pruned_tree = $state(false);
	let n_categories: number = $state(4);
	let n_data: number = $state(100);
	let n_test_data: number = $state(150);
  let feature_tilt: number = $state(0);

	let TP: number[] = $state([]);
	let TN: number[] = $state([]);
	let FP: number[] = $state([]);
	let FN: number[] = $state([]);
	let correctly_categorized: number = $state(0);

	// computed feature sets
	let feature_sets: Record<string, ComputedFeature[]> = {
		'x & y': [
			{signature: "x", fn: (sample) => sample.x},
			{signature: "y", fn: (sample) => sample.y},
		],
		'4-way': [
			{signature: "x", fn: (sample) => sample.x},
			{signature: "y", fn: (sample) => sample.y},
			{signature: "(x - y)", fn: (sample) => sample.x - sample.y},
			{signature: "(x + y)", fn: (sample) => sample.x + sample.y}
		],
    'distance from center': [
			{signature: "||[x, y] - [0.5, 0.5]||", fn: (sample) => euclid(sample.x, sample.y, 0.5, 0.5)},
		],
    'x & y with noise': [
      {signature: "(x ∓ 0.05)", fn: (sample) => sample.x + rand(-0.05, 0.05)},
      {signature: "(y ∓ 0.05)", fn: (sample) => sample.y + rand(-0.05, 0.05)},
    ],
    'x * y': [
      {signature: "x * y", fn: (sample) => sample.x * sample.y},
      {signature: "(1-x) * y", fn: (sample) => (1-sample.x) * sample.y},
      {signature: "x * (1-y)", fn: (sample) => sample.x * (1-sample.y)},
      {signature: "(1-x) * (1-y)", fn: (sample) => (1-sample.x) * (1-sample.y)},
    ],
    'distance from corners': [
      {signature: "||[x, y] - [0, 1]||", fn: (sample) => euclid(sample.x, sample.y, 0, 1)},
      {signature: "||[x, y] - [1, 0]||", fn: (sample) => euclid(sample.x, sample.y, 1, 0)},
      {signature: "||[x, y] - [0, 0]||", fn: (sample) => euclid(sample.x, sample.y, 0, 0)},
      {signature: "||[x, y] - [1, 1]||", fn: (sample) => euclid(sample.x, sample.y, 1, 1)},
    ],
    'tilted': [
      {signature: "cos(θ) * x + sin(θ) * y", fn: (sample) => Math.cos(feature_tilt) * sample.x + Math.sin(feature_tilt) * sample.y},
      {signature: "sin(θ) * x + cos(θ) * y", fn: (sample) => Math.sin(feature_tilt) * sample.x - Math.cos(feature_tilt) * sample.y},
    ]
	};

	let chosen_feature_set = $state(feature_sets["axis-aligned"]);

	const MAX_DATA: number = 300;
	const MAX_TEST_DATA: number = 200;

	let mix_colors: boolean = $state(false);
	let show_data: boolean = $state(true);

	let chosen_weight = $state(no_weight);
	let chosen_norm = $state(L2_norm);

	onMount(update);

	$effect(() => {
		doTraining();
	});

	$effect(() => {
		drawData();
	});

	$effect(renderTrees);

	function renderTrees() {
		if (!decision_tree) return;
		render_DT('diagram', decision_tree, category_colors, false).then((v) => {
			diagram_svg = v;
			// console.log(v);
		});

		render_DT('diagram-pruned', decision_tree, category_colors, true).then((v) => {
			pruned_diagram_svg = v;
			// console.log(v);
		});
	}

	function update() {
		makeUpData();
		doTraining();
		drawData();
	}

	function makeUpData() {
		categories = generateNewCategories(n_categories).categories;
		data = generateNewData(categories, MAX_DATA).data;
		test_data = generateNewData(categories, MAX_TEST_DATA).data;
	}

	function doTraining() {
		const used_data = data.slice(0, n_data);
		const used_test_data = test_data.slice(0, n_test_data);

		const dec_tree = build_DT(
			Infinity,
			n_categories,
			used_data,
			chosen_impurity_measure,
			impurity_threshold,
			allow_same_category_split,
			chosen_feature_set,
      split_on_training_data,
      2**(-test_grid_exp)
		);
		prune_tree(dec_tree, n_categories, used_test_data);

		decision_tree = dec_tree;
	}

	function drawData() {
		const g = cell_size;
		const w = 500;
		const h = 500;

		cvs.width = w;
		cvs.height = h;

		const ctx = cvs.getContext('2d')!;
		ctx.clearRect(0, 0, w, h);
		// ctx.fillStyle = 'black';
		// ctx.fillRect(0, 0, w, h);
		ctx.save();

		const used_data = data.slice(0, n_data);
		const used_test_data = test_data.slice(0, n_test_data);

		// draw colored grid
		for (let x = 0; x < w; x += g) {
			for (let y = 0; y < h; y += g) {
				const cx = (x + g / 2) / w;
				const cy = (y + g / 2) / h;

				let result;

				switch (chosen_inference) {
					case 'kNN':
						const kNN_result = kNN_inference(
							k,
							n_categories,
							{ category: -1, x: cx, y: cy },
							used_data,
							chosen_norm,
							chosen_weight
						);
						result = kNN_result;
						break;
					case 'DT':
						const DT_result = DT_inference(
							decision_tree!,
							{ category: -1, x: cx, y: cy },
							use_pruned_tree
						);
						result = DT_result;
						break;
					default:
						const NEVER: never = chosen_inference;
				}

				if (result) {
					ctx.save();
					if (mix_colors) {
						for (let [c, count] of result.category_weights.entries()) {
							ctx.globalAlpha = Math.max(0, count / result.norm_factor);

							ctx.beginPath();
							ctx.fillStyle = category_colors[c][1];
							ctx.rect(x, y, g, g);
							ctx.fill();
						}
					} else {
						if (result.chosen_category >= 0) {
							ctx.beginPath();
							ctx.fillStyle = category_colors[result.chosen_category][1];
							ctx.rect(x, y, g, g);
							ctx.fill();
						}
					}
					ctx.restore();
				}
			}
		}

		if (show_data) {
			// draw data
			ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
			ctx.shadowOffsetX = 2;
			ctx.shadowOffsetY = 2;
			ctx.shadowBlur = 2;
			for (const sample of used_data) {
				ctx.beginPath();
				ctx.ellipse(sample.x * w, sample.y * h, 3, 3, 0, 0, Math.PI * 2);
				ctx.fillStyle = category_colors[sample.category][0];
				ctx.fill();
			}

			// draw test data
			let test_results;

			switch (chosen_inference) {
				case 'kNN': {
					test_results = test_inference(n_categories, used_test_data, (sample) =>
						kNN_inference(k, n_categories, sample, used_data, chosen_norm, chosen_weight)
					);
					break;
				}
				case 'DT': {
					test_results = test_inference(n_categories, used_test_data, (sample) =>
						DT_inference(decision_tree!, sample, use_pruned_tree)
					);
					break;
				}
				default:
					const NEVER: never = chosen_inference;
			}

			if (!test_results) return;

			TP = test_results.TP;
			TN = test_results.TN;
			FP = test_results.FP;
			FN = test_results.FN;
			correctly_categorized = test_results.correctly_categorized;

			for (const sample of test_results.checked_samples) {
				const cx = sample.x * w;
				const cy = sample.y * h;

				ctx.strokeStyle = category_colors[sample.chosen_category][0];
				//ctx.strokeRect(cx - 3, cy - 3, 6, 6);
				ctx.strokeStyle = category_colors[sample.category][0];

				if (sample.chosen_category === sample.category) {
					ctx.beginPath();
					ctx.ellipse(cx, cy, 3, 3, 0, 0, Math.PI * 2);
					ctx.stroke();
				} else {
					ctx.beginPath();
					ctx.moveTo(cx - 3, cy - 3);
					ctx.lineTo(cx + 3, cy + 3);
					ctx.stroke();
					ctx.beginPath();
					ctx.moveTo(cx - 3, cy + 3);
					ctx.lineTo(cx + 3, cy - 3);
					ctx.stroke();
				}
			}
		}
		ctx.restore();
	}
</script>

<div class="flex flex-col gap-2 p-2">
	<h1>kNN & DT | <a href="../">back</a></h1>

	<div class="flex flex-row gap-5 p-2">
		<canvas class="h-120 w-120 border" bind:this={cvs}> </canvas>
		{#if decision_tree && chosen_inference === 'DT'}
			<div class="flex max-h-120 flex-col items-center">
				<div><h1>DT</h1></div>
				{@html diagram_svg}
			</div>
			<div class="flex max-h-120 flex-col items-center">
				<div><h1>DT pruned</h1></div>
				{@html pruned_diagram_svg}
			</div>
		{/if}
	</div>

	<hr />

	<div class="flex flex-col gap-2">
		<div class="flex flex-row items-center gap-2">
			<button class="border" onclick={update}>Redraw</button>
			<label class="light-border flex flex-row items-center gap-2"
				>Show datapoints
				<input type="checkbox" bind:checked={show_data} />
			</label>
			<label
				>Method:
				<select bind:value={chosen_inference}>
					<option value="kNN">kNN</option>
					<option value="DT">DT</option>
				</select>
			</label>
      <label>Cell size: <input type="number" class="w-20" bind:value={cell_size} min="1" step="1"> (keep &geq; 4)</label>
		</div>

		<div class="flex flex-row items-center gap-4">
			<label
				>c = <input
					type="number"
					bind:value={n_categories}
					max="7"
					min="2"
					onchange={update}
				/></label
			>
			<label
				>N = <input type="number" bind:value={n_data} max="200" min="1" onchange={drawData} /> / {MAX_DATA}</label
			>
			<label
				>N<sub>val</sub> = <input
					type="number"
					bind:value={n_test_data}
					max="200"
					min="1"
					onchange={drawData}
				/>
				/ {MAX_TEST_DATA}</label
			>
		</div>

		<div class="flex flex-row items-center gap-2">
			<label class="light-border flex flex-row items-center gap-2"
				>mix colors <input type="checkbox" bind:checked={mix_colors} /></label
			>
		</div>

		<!-- kNN stuff -->
		{#if chosen_inference === 'kNN'}
			<div class="flex flex-row items-center gap-2">
				<label>k = <input type="number" bind:value={k} min="1" max={n_data} /></label>
				<select bind:value={chosen_norm}>
					<option value={L2_norm}>L2-norm</option>
					<option value={L1_norm}>L1-norm</option>
					<option value={LInf_norm}>LInf-norm</option>
				</select>
				<select bind:value={chosen_weight}>
					<option value={no_weight}>by occurence</option>
					<option value={inv_weight}>by inverse distance</option>
				</select>
			</div>
			<!-- DT stuff -->
		{:else if chosen_inference === 'DT'}
			<div class="flex flex-row items-center gap-2">
				<label
					>impurity measure:
					<select bind:value={chosen_impurity_measure}>
						<option value={misclassification_impurity}>misclassification</option>
						<option value={entropy_impurity}>entropy</option>
						<option value={gini_impurity}>gini</option>
					</select>
				</label>
				<label
					>threshold:
					<input
						type="number"
						class="w-20"
						bind:value={impurity_threshold}
						min="-0.5"
						step="0.01"
					/>
				</label>
			</div>
			<div class="flex flex-row items-center gap-2">
				<label class="light-border flex flex-row items-center gap-2">
					use pruned
					<input type="checkbox" bind:checked={use_pruned_tree} />
				</label>
				<label class="light-border flex flex-row items-center gap-2">
					allow split on same category
					<input type="checkbox" bind:checked={allow_same_category_split} />
				</label>
        <label>
          feature set:
          <select bind:value={chosen_feature_set}>
            {#each Object.entries(feature_sets) as [name, set]}
              <option value={set}>{name}</option>
            {/each}
          </select>
        </label>
        {#if chosen_feature_set === feature_sets['tilted']}
          <label>θ =
            <input bind:value={feature_tilt} class="w-30" type="number" min="0" max={Math.PI} step={Math.PI / 36}>
          </label>
        {/if}
			</div>
      <div class="flex flex-row items-center gap-2">
        <label class="light-border flex flex-row items-center gap-2">
					split on training data
					<input type="checkbox" bind:checked={split_on_training_data} />
				</label>
        {#if !split_on_training_data}
          <label class="flex flex-row items-center gap-2">
            test inverval
            2^-<input type="number" min="1" max="8" step="1" bind:value={test_grid_exp} />
            = {2**(-test_grid_exp)}
          </label>
        {/if}
      </div>
		{/if}
	</div>

	<hr />

	<!-- statistics -->
	<div>
		<table class="w-full">
			<thead>
				<tr>
					<th rowspan="100"
						>{correctly_categorized} / {n_test_data} = {(
							correctly_categorized / n_test_data
						).toFixed(4)}</th
					>
					{#each TP.entries() as [i, corr]}
						<th style="background-color: {category_colors[i][1]};">Category {i}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				<tr>
					<th class="bg-green-200">TP</th>
					{#each TP.entries() as [i, corr]}
						<td class="text-center">{corr}</td>
					{/each}
				</tr>
				<tr>
					<th class="bg-green-200">TN</th>
					{#each TN.entries() as [i, corr]}
						<td class="text-center">{corr}</td>
					{/each}
				</tr>
				<tr>
					<th class="bg-red-200">FP</th>
					{#each FP.entries() as [i, corr]}
						<td class="text-center">{corr}</td>
					{/each}
				</tr>
				<tr>
					<th class="bg-red-200">FN</th>
					{#each FN.entries() as [i, corr]}
						<td class="text-center">{corr}</td>
					{/each}
				</tr>
				<tr>
					<th class="w-40 bg-blue-200">prec = TP/(TP+FP)</th>
					{#each TP.entries() as [i, corr]}
						<td class="text-center">{(corr / (corr + FP[i])).toFixed(3)}</td>
					{/each}
				</tr>
				<tr>
					<th class="w-40 bg-blue-200">rec = TP/(TP+FN)</th>
					{#each TP.entries() as [i, corr]}
						<td class="text-center">{(corr / (corr + FN[i])).toFixed(3)}</td>
					{/each}
				</tr>
			</tbody>
		</table>
	</div>
</div>
