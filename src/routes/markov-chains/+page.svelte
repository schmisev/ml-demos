<script lang="ts">
	import { build_hmm, HiddenMarkovModel } from '$lib/hmm.svelte';
	import { col_vec, matrix } from '$lib/matrix2';
	import { Mermaid } from '@friendofsvelte/mermaid';
	import * as fmt from '$lib/fmt';
	import MatrixView from '$lib/components/MatrixView.svelte';

	const hmm = build_hmm(
		[
			{ name: 'Rain', domain: [true, false] },
			{ name: 'T', domain: ['cold', 'hot'] }
		],
    [ 1, 0, 0, 0 ],
    [
      0.4, 0.1, 0.3, 0.2, 
      0.6, 0.1, 0.0, 0.3, 
      0.7, 0.1, 0.1, 0.1, 
      0.0, 0.0, 0.1, 0.9
    ],
		[{ name: 'Umbrella', domain: [true, false] }],
    [
      0.9, 0.2, 0.1, 0.7, 
      0.1, 0.8, 0.9, 0.3
    ]
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
		<Mermaid class="w-full" config={{flowchart: {curve: "catmullRom"}} as any} string={graph_str}></Mermaid>
	</div>
	<div class="flex flex-row flex-wrap gap-2">
		<button class="border" onclick={step}>Step</button>
	</div>
	<div class="flex flex-row items-center gap-3">
    <MatrixView name="T" matrix={hmm.T}></MatrixView>
    <MatrixView name="f" matrix={hmm.f}></MatrixView>
  </div>
</div>
