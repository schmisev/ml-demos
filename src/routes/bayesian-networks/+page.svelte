<script lang="ts">
	import { BN_Graph, BURGLAR_BN_GRAPH, CLOUDY_BN_GRAPH, format_linked_query, strip_linked_query, TOOTHACHE_BN_GRAPH, type BN_LinkedQuery } from '$lib/bayesian-networks';
	import ChartView from '$lib/components/ChartView.svelte';
	import { tex } from '$lib/mathjax';
	import { Mermaid } from '@friendofsvelte/mermaid';

  let early_out = $state(true);
  let chosen_graph_generator = $state(CLOUDY_BN_GRAPH);
	let chosen_graph = $state(chosen_graph_generator());
	let query_settings = $derived(
		chosen_graph.topo.map((v) => {
			return { node: v, name: v.name, values: v.materialize_domain() };
		})
	);

  let chart: ChartView;
	let mermaid_str = $state(chosen_graph.format_graph_for_mermaid());

	let N = $state(0);
	let N_query = $state(0);
	let current_query: BN_LinkedQuery = $state(chosen_graph.get_linked_query());
  let current_query_str: string = $derived(format_linked_query(current_query));

  function fill_query() {
    current_query = chosen_graph.get_linked_query();
  }

  function reload() {
    chosen_graph = chosen_graph_generator();
    fill_query();
    reset();
    update_diagram();
  }

	function reset() {
    chosen_graph.clear();
		N = 0;
		N_query = 0;
    update_diagram();
    chart.reset_chart();
    chart.update_title(current_query_str);
	}

	function step(count: number = 1) {
    const labels = [];
    const data = [];
		for (let t = 0; t < count; t++) {
      chosen_graph.clear();
			const v = chosen_graph.query(strip_linked_query(current_query), early_out);
			if (v) {
				N_query++;
			}
			N++;
      labels.push(N);
      data.push(N_query/N);
		}
		
    update_diagram();
    chart.update_chart(true, labels, [data]);
	}

  function update_diagram() {
    mermaid_str = chosen_graph.format_graph_for_mermaid(N);
  }
</script>

<div class="grid grid-cols-2">

<div class="flex flex-col gap-2 p-2">
  <label class="light-border">Network: <select bind:value={chosen_graph_generator} onchange={reload}>
    <option value={CLOUDY_BN_GRAPH}>Wet grass</option>
    <option value={BURGLAR_BN_GRAPH}>Burglar-Alarm</option>
    <option value={TOOTHACHE_BN_GRAPH}>Toothache</option>
  </select></label>

	<div class="light-border flex flex-col flex-wrap gap-4 text-3xl">
		<div class="flex flex-row items-center">
			<div>P(</div>
			{#each query_settings as opt, i}
				<div>{opt.name}</div>
				<div>=</div>
				<select bind:value={current_query[opt.name].value} onchange={reset}>
					{#each opt.values as val}
						<option value={val}>{opt.node.format_value(val)}</option>
					{/each}
				</select>
				{#if i < query_settings.length - 1}
					<div>,</div>
				{/if}
			{/each}
			<div>)</div>
		</div>

    <div class="flex flex-row flex-wrap items-center">
		{@html tex(`= ${current_query_str} = \\frac{N_{query}}{N}`)}
    {@html tex(`= \\frac{${N_query}}{${N}} = {${(N_query / N).toFixed(3)}}`)}
    </div>
	</div>

	<div class="flex flex-row gap-2 flex-wrap">
		<button onclick={() => step()} class="border">Random draw!</button>
    <button onclick={() => step(10)} class="border">Draw 10 times!</button>
    <button onclick={() => step(100)} class="border">Draw 100 times!</button>
		<button onclick={() => step(1000)} class="border">Draw 1000 times!</button>
    <button onclick={reset} class="border">Reset</button>
    <label class="light-border flex flex-row items-center gap-2">early out: <input type="checkbox" bind:checked={early_out}></label>
	</div>

	<Mermaid config={{ htmlLabels: true, theme: "neutral" }} string={mermaid_str}></Mermaid>
</div>

  <div>
    <ChartView bind:this={chart} title={current_query_str} datasets={[{label: "Joint probability", data: [], pointRadius: 0, borderJoinStyle: "round"}]} labels={[]} aspect_ratio={1} y_scale={{min: 0, max: 1}}></ChartView>
  </div>

</div>