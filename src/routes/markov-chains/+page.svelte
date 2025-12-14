<script lang="ts">
	import { HiddenMarkovModel, HMM_Builder } from '$lib/hmm.svelte';
	import { col_vec, matrix } from '$lib/matrix2';
	import { Mermaid } from '@friendofsvelte/mermaid';
	import * as fmt from '$lib/fmt';
	import MatrixView from '$lib/components/MatrixView.svelte';

	const builder = new HMM_Builder(
		[
			{ name: 'Rain', domain: [true, false] },
			{ name: 'T', domain: ['cold', 'hot'] }
		],
		[{ name: 'Umbrella', domain: [true, false] }]
	);

	console.log(builder.bin_hidden_vars);

	// testing
	const hmm = new HiddenMarkovModel(
		col_vec([0.4, 0.2, 0.3, 0.1]),
		builder.bin_hidden_vars,
		matrix(4, 4, [0.4, 0.1, 0.3, 0.2, 0.6, 0.1, 0, 0.3, 0.7, 0.1, 0.1, 0.1, 0, 0, 0.1, 0.9]),
		matrix(2, 4, [0.9, 0.2, 0.1, 0.8]),
		builder.bin_evidence_vars
	);

	let graph_str = $state(hmm.format_graph_for_mermaid('filter'));

	function step() {
		hmm.filter([1, 0]);
		graph_str = hmm.format_graph_for_mermaid('filter');
	}
</script>

<div class="flex flex-col gap-2 p-2">
	<div class="flex flex-row gap-5">
		<h1>Hidden Markov Models | <a href="../">back</a></h1>
	</div>
	<div class="flex flex-col items-center">
		<Mermaid class="w-full" config={{layout: "elk", flowchart: {curve: "basis", layout: "elk"}} as any} string={graph_str}></Mermaid>
	</div>
	<div class="flex flex-row flex-wrap gap-2">
		<button class="border" onclick={step}>Step</button>
	</div>
	<div class="flex flex-row items-center gap-3">
    <MatrixView name="T" matrix={hmm.T}></MatrixView>
    <MatrixView name="f" matrix={hmm.f}></MatrixView>
  </div>
</div>
