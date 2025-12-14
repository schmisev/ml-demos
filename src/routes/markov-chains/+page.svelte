<script lang="ts">
	import { build_hmm, evidence_to_1_hot, HiddenMarkovModel } from '$lib/hmm.svelte';
	import { col_vec, matrix, MatrixND, row_vec } from '$lib/matrix2';
	import { Mermaid } from '@friendofsvelte/mermaid';
	import * as fmt from '$lib/fmt';
	import MatrixView from '$lib/components/MatrixView.svelte';
	import { tex } from '$lib/mathjax';

	let { model: hmm, evidence_templates } = $state(build_hmm(
		[
			{ name: 'Rain', domain: [true, false] },
			{ name: 'T', domain: ['cold', 'hot'] }
		],
    [ 0.25, 0.25, 0.25, 0.25 ],
    [
      0.4, 0.6, 0.7, 0.0,
      0.1, 0.1, 0.1, 0.1,
      0.3, 0.0, 0.1, 0.0,
      0.2, 0.3, 0.1, 0.9,
    ],
		[
      { name: 'Umbrella', domain: [true, false] },
      { name: 'T-Shirt', domain: [true, false] }
    ],
    [
      0.5, 0.1, 0.0, 0.1, 
      0.1, 0.5, 0.7, 0.9,
      0.2, 0.2, 0.2, 0.0, 
      0.2, 0.2, 0.1, 0.0,
    ]
	));

  let {one_hot: one_hot_evidence, index: index_evidence} = $derived(evidence_to_1_hot(evidence_templates));

	let graph_str = $state(hmm.format_graph_for_mermaid('filter'));

	function filter() {
		hmm.filter(one_hot_evidence);
		graph_str = hmm.format_graph_for_mermaid('filter');
	}

  function predict() {
		hmm.predict();
		graph_str = hmm.format_graph_for_mermaid('filter');
	}

  function reset() {
    hmm.clear();
		graph_str = hmm.format_graph_for_mermaid('filter');
  }
</script>

<div class="flex flex-col gap-2 p-2">
	<div class="flex flex-row gap-5">
		<h1>Hidden Markov Models | <a href="../">back</a></h1>
	</div>
	<div class="flex flex-col items-center">
		<Mermaid class="w-full" config={{flowchart: {curve: "catmullRom"}, theme: "neutral"}} string={graph_str}></Mermaid>
	</div>
	<div class="flex flex-row flex-wrap gap-2">
    <button class="border negative" onclick={reset}>Reset</button>
    <button class="border" onclick={predict}>Predict</button>
		<button class="border" onclick={filter}>Filter</button>
	</div>
  <div class="flex flex-row flex-wrap gap-2">
    {#each evidence_templates as template}
      <label class="flex flex-row items-center gap-2">
        {template.name}
        <select bind:value={template.value}>
          {#each template.domain as value}
            <option>{value}</option>
          {/each}
        </select>
      </label>
    {/each}
    <div class="flex flex-row flex-wrap items-center gap-2">
      {@html tex(`e_${index_evidence} ≙`)} <MatrixView matrix={row_vec(one_hot_evidence)}></MatrixView>
    </div>
  </div>
	<div class="flex flex-row gap-3">
    <MatrixView title="evidence" name="e" row_label="e" col_label="p(E|X)" matrix={hmm.e}></MatrixView>
    <MatrixView title="sensor model" name="H" row_label="e" col_label="x" matrix={hmm.H}></MatrixView>
    <MatrixView title="transition model" name="T" row_label="x" col_label="x" step_label="t" matrix={hmm.T}></MatrixView>
    <MatrixView title="variable probabilities" name="f" row_label="x" col_label="p(X|E)" matrix={hmm.f}></MatrixView>
  </div>
</div>
