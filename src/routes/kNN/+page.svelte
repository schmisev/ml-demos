<script lang="ts">
	import { asset } from '$app/paths';
	import { euclid, rand, randint, weight } from '$lib';
	import { type Sample, type Category, generateNewCategories, generateNewData } from '$lib/data';
	import { buildDecisionTree, DT_inference, misclassification_rate, type DT_Node } from '$lib/dt';
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
	let category_colors = [
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
	let data: Sample[] = [];
	let test_data: Sample[] = [];
	let categories: Category[] = [];
	let decision_tree: DT_Node | undefined = $state<DT_Node>();
	let chosen_inference: 'kNN' | 'DT' = $state('DT');

	let n_categories: number = $state(3);
	let n_data: number = $state(50);
	let n_test_data: number = $state(10);

	let TP: number[] = $state([]);
	let TN: number[] = $state([]);
	let FP: number[] = $state([]);
	let FN: number[] = $state([]);
	let correctly_categorized: number = $state(0);

	const MAX_DATA: number = 300;
	const MAX_TEST_DATA: number = 200;

	let mix_colors: boolean = $state(false);
	let show_data: boolean = $state(true);

	let chosen_weight = $state(no_weight);
	let chosen_norm = $state(L2_norm);

	onMount(() => {
		makeUpData();
		drawData();
	});

	$effect(() => {
		drawData();
	});

	function update() {
		makeUpData();
		drawData();
	}

	function makeUpData() {
		categories = generateNewCategories(n_categories).categories;
		data = generateNewData(categories, MAX_DATA).data;
		test_data = generateNewData(categories, MAX_TEST_DATA).data;
	}

	function drawData() {
		const g = 4;
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

		const dec_tree = buildDecisionTree(Infinity, n_categories, used_data, misclassification_rate);

		console.log(dec_tree);
		decision_tree = dec_tree;

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
						const DT_result = DT_inference(dec_tree, { category: -1, x: cx, y: cy });
            result = DT_result;
						break;
				}

				if (result) {
					ctx.save();
					if (mix_colors) {
						for (let [catergory, count] of result.category_weights.entries()) {
							ctx.globalAlpha = Math.max(0, count / result.norm_factor);

							ctx.beginPath();
							ctx.fillStyle = category_colors[catergory][1];
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
				case 'kNN':
					test_results = test_inference(n_categories, used_test_data, (sample) =>
						kNN_inference(k, n_categories, sample, used_data, chosen_norm, chosen_weight)
					);
					break;
				case 'DT':
					test_results = test_inference(n_categories, used_test_data, (sample) =>
						DT_inference(dec_tree, sample)
					);
					break;
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
	<h1>kNN</h1>

	<canvas class="w-120 border" bind:this={cvs}> </canvas>

	<div class="flex flex-col gap-2">
		<div class="flex flex-row items-center gap-2">
			<button class="border" onclick={update}>Redraw</button>
			<label>Show datapoints <input type="checkbox" bind:checked={show_data} /></label>
		</div>

		<div class="flex flex-row items-center gap-2">
			<label>k = <input type="number" bind:value={k} min="1" max={n_data} /></label>
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
				>N = <input
					type="number"
					bind:value={n_data}
					max="200"
					min="1"
					onchange={drawData}
				/></label
			>
			<label
				>N_test = <input
					type="number"
					bind:value={n_test_data}
					max="200"
					min="1"
					onchange={drawData}
				/></label
			>
		</div>

		<div class="flex flex-row items-center gap-2">
			<label>mix colors <input type="checkbox" bind:checked={mix_colors} /></label>
			<select bind:value={chosen_inference}>
				<option value="kNN">kNN</option>
				<option value="DT">DT</option>
			</select>
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
	</div>

	<div>
		{correctly_categorized} / {n_test_data} = {(correctly_categorized / n_test_data).toFixed(4)}
	</div>
	<div>
		<table class="w-full">
			<thead>
				<tr>
					<th>*</th>
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
				<tr>
					<th class="w-40 bg-blue-200">f1 = </th>
					{#each TP.entries() as [i, corr]}
						<td class="text-center">{(corr / (corr + FN[i])).toFixed(3)}</td>
					{/each}
				</tr>
			</tbody>
		</table>
	</div>
</div>
