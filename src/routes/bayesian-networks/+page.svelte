<script lang="ts">
	import { BURGLAR_BN_GRAPH, CLOUDY_BN_GRAPH, TOOTHACHE_BN_GRAPH } from '$lib/bayesian-networks';
	import Tex from '$lib/components/Tex.svelte';
	import { tex } from '$lib/mathjax';
	import { Mermaid } from '@friendofsvelte/mermaid';

  let early_out = $state(true);
  let chosen_graph_generator = $state(CLOUDY_BN_GRAPH);
	let chosen_graph = $derived(chosen_graph_generator());
	let query_settings = $derived(
		chosen_graph.topo.map((v) => {
			return { node: v, name: v.name, values: v.materialize_domain() };
		})
	);

	let mermaid_str = $state(chosen_graph.format_graph_for_mermaid());

	let N = $state(0);
	let N_query = $state(0);
	let current_query: Record<string, number> = $state({});

  function fill_query() {
    current_query = {};
    for (const node of chosen_graph.topo) {
      current_query[node.name] = -1;
    }
  }

  function reload() {
    fill_query();
    reset();
    update_diagram();
  }

	function reset() {
    chosen_graph.clear();
		N = 0;
		N_query = 0;
    update_diagram();
	}

	function step(count: number = 1) {
		for (let t = 0; t < count; t++) {
      chosen_graph.clear();
			const v = chosen_graph.query(current_query, early_out);
			if (v) {
				N_query++;
			}
			N++;
		}
		
    update_diagram();
	}

  function update_diagram() {
    mermaid_str = chosen_graph.format_graph_for_mermaid(N);
  }
</script>

<div class="flex flex-col gap-2 p-2">
  <label class="light-border">Network: <select bind:value={chosen_graph_generator} onchange={reload}>
    <option value={CLOUDY_BN_GRAPH}>Wet grass</option>
    <option value={BURGLAR_BN_GRAPH}>Burglar-Alarm</option>
    <option value={TOOTHACHE_BN_GRAPH}>Toothache</option>
  </select></label>

	<div class="light-border flex flex-col gap-4 text-3xl">
		<div class="flex flex-row items-center">
			<div>P(</div>
			{#each query_settings as opt, i}
				<div>{opt.name}</div>
				<div>=</div>
				<select bind:value={current_query[opt.name]} onchange={reset}>
					{#each opt.values as val}
						<option value={val}>{opt.node.format_label(val)}</option>
					{/each}
				</select>
				{#if i < query_settings.length - 1}
					<div>,</div>
				{/if}
			{/each}
			<div>)</div>
		</div>

		{@html tex(`= P(${Object.entries(current_query).filter(v => v[1] >= 0).map((q, i) => q[0].toLowerCase() + "_" + q[1])}) = \\frac{N_{query}}{N} = \\frac{${N_query}}{${N}} = {${(N_query / N).toFixed(3)}}`)}
	</div>

	<div class="flex flex-row gap-2">
		<button onclick={() => step()} class="border">Random draw!</button>
		<button onclick={() => step(1000)} class="border">Draw 1000 times!</button>
    <button onclick={reset} class="border">Reset</button>
    <label class="light-border flex flex-row items-center gap-2">early out: <input type="checkbox" bind:checked={early_out}></label>
	</div>

	<Mermaid config={{ htmlLabels: true, theme: "neutral" }} string={mermaid_str}></Mermaid>
</div>
