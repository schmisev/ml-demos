<script lang="ts">
	import { build_hmm, evidence_to_1_hot, HiddenMarkovModel, RAIN_TEMP_UMBRELLA_TSHIRT_HMM, RAIN_UMBRELLA_HMM, SLEEPY_STUDENTS_HMM, TRIP_PLANNING_HMM } from '$lib/hmm.svelte';
	import { col_vec, matrix, MatrixND, row_vec } from '$lib/matrix2';
	import { Mermaid } from '@friendofsvelte/mermaid';
	import * as fmt from '$lib/fmt';
	import MatrixView from '$lib/components/MatrixView.svelte';
	import { tex } from '$lib/mathjax';
	import TraceView from '$lib/components/TraceView.svelte';
  import { browser } from "$app/environment";
	import { onMount } from 'svelte';

  let show_evidence = $state(true);
  let chosen_model = $state(TRIP_PLANNING_HMM);

	let { model: hmm, evidence_templates } = $state(
		chosen_model()
	);

	let { one_hot: one_hot_evidence, index: index_evidence } = $derived(
		evidence_to_1_hot(evidence_templates)
	);

	let graph_str = $state(hmm.format_graph_for_mermaid('filter', show_evidence));

	function update_graphs() {
		graph_str = hmm.format_graph_for_mermaid('filter', show_evidence);
	}

	function filter() {
		hmm.filter(one_hot_evidence);
		update_graphs();
	}

	function predict() {
		hmm.predict();
		update_graphs();
	}

	function backward() {
		hmm.backward();
		update_graphs();
	}

	function reset() {
    ({model: hmm, evidence_templates} = chosen_model());
    let { one_hot, index } = evidence_to_1_hot(evidence_templates);
    one_hot_evidence = one_hot;
    index_evidence = index;
		hmm.clear();
		update_graphs();
	}
</script>

<head>
  <title>Markov Chains</title>
</head>

<div class="flex flex-col gap-2 p-2">
	<div class="flex flex-row gap-5 items-center">
		<h1 class="grow">Hidden Markov Models | <a href="../">back</a></h1>
    <label class="light-border">
      Model: 
      <select bind:value={chosen_model} onchange={reset}>
        <option value={TRIP_PLANNING_HMM}>Trip planning</option>
        <option value={SLEEPY_STUDENTS_HMM}>Sleepy Students</option>
        <option value={RAIN_UMBRELLA_HMM}>Rain & Umbrellas</option>
        <option value={RAIN_TEMP_UMBRELLA_TSHIRT_HMM}>Rain, Temperature, Umbrellas & T-Shirts</option>
      </select>
    </label>
	</div>
	<div class="flex flex-row">
    <div class="flex flex-col grow">
		<Mermaid
			class="w-full"
			config={{ flowchart: { curve: 'catmullRom' }, theme: 'neutral' }}
			string={graph_str}
		></Mermaid>
    <div class="flex flex-row flex-wrap gap-2">
      <button class="negative border" onclick={reset}>Reset</button>
      <button class="border" onclick={predict}>Predict ▷</button>
      <button class="border positive" onclick={filter}>Filter ▷</button>
      <button class="border special" onclick={backward}>Backward ◁</button>
    </div>
    </div>

    <div class="light-border flex flex-col flex-wrap gap-2">
      <h2>Sensors</h2>
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
      <div class="flex flex-row items-center gap-2">
        {@html tex(`e_${index_evidence} ≙`)}
        <MatrixView matrix={row_vec(one_hot_evidence)}></MatrixView>
      </div>
      <label class="light-border">Show evidence in graph: <input type="checkbox" bind:checked={show_evidence} onchange={update_graphs}></label>
    </div>
	</div>
  <h2>Timeline</h2>
  <TraceView model={hmm}></TraceView>
  <h2>Model matrices</h2>
  <div class="flex flex-row gap-3">
		<MatrixView title="evidence" name="e" row_label="e" col_label="p(E|X)" matrix={hmm.e}
		></MatrixView>
		<MatrixView title="sensor model" name="H" row_label="e" col_label="x" matrix={hmm.H}
		></MatrixView>
		<MatrixView
			title="transition model"
			name="T"
			row_label="x"
			col_label="x"
			step_label="t"
			matrix={hmm.T}
		></MatrixView>
		<MatrixView title="state" name="f" row_label="x" col_label="p(X|E)" matrix={hmm.f}></MatrixView>
	</div>
</div>
