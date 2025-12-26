<script lang="ts">
	import {
		BN_Graph,
		BURGLAR_BN_GRAPH,
		CLOUDY_BN_GRAPH,
		format_linked_query,
		strip_linked_query,
		TOOTHACHE_BN_GRAPH,
		type BN_LinkedQuery
	} from '$lib/bayesian-networks';
	import ChartView from '$lib/components/ChartView.svelte';
	import { tex } from '$lib/mathjax';
  import * as fmt from '$lib/fmt';
	import DagreGraph from '$lib/dagre-graph/DagreGraph.svelte';

  let early_out = $state(false);

	let chosen_graph_generator = $state(CLOUDY_BN_GRAPH);
	let chosen_graph: BN_Graph = $state(chosen_graph_generator());
	let query_settings = $derived(chosen_graph.get_query_settings());
	let evidence_settings = $derived(chosen_graph.get_query_settings());

	let chart: ChartView;
	// let mermaid_str = $state(chosen_graph.format_graph_for_mermaid());
  let { node_defs, edge_defs } = $state(chosen_graph.format_graph_for_dagre());

	let N = $state(0);
	let W = $state(0);
	let W_query = $state(0);
  let dW = $state(0);
  let dW_Query = $state(0);
  let fulfilled = $state(false);
	let current_query: BN_LinkedQuery = $state(chosen_graph.get_linked_query());
	let current_evidence: BN_LinkedQuery = $state(chosen_graph.get_linked_query());
	let current_query_str: string = $derived(format_linked_query(current_query, current_evidence));

	function reload() {
		chosen_graph = chosen_graph_generator();
		current_query = chosen_graph.get_linked_query();
		current_evidence = chosen_graph.get_linked_query();
		reset();
		update_diagram();
	}

	function reset() {
		chosen_graph.clear();
		N = 0;
		W = 0;
		W_query = 0;
    dW = 0;
    dW_Query = 0;
    fulfilled = false;
		update_diagram();
		chart.reset_chart();
		chart.update_title(current_query_str);
	}

	function step(count: number = 1) {
		const labels = [];
		const data = [];
		for (let t = 0; t < count; t++) {
			chosen_graph.clear();
			const r = chosen_graph.query(
				strip_linked_query(current_query),
				strip_linked_query(current_evidence),
        early_out
			);

			if (r.fulfilled) dW_Query = r.weight;
      else dW_Query = 0;
      dW = r.weight;

      W_query += dW_Query;
			W += dW;
      

      fulfilled = r.fulfilled;
			N++;
			labels.push(N);
			data.push(W_query / W);
		}

		update_diagram();
		chart.update_chart(true, labels, [data]);
	}

	function update_diagram() {
    ({ node_defs, edge_defs } = chosen_graph.format_graph_for_dagre(N));
	}
</script>

<head>
  <title>Bayesian Network</title>
</head>

<div class="flex flex-col gap-2 p-2">
	<div class="grid grid-cols-2 gap-2">
		<div class="flex flex-row gap-5">
			<h1>Bayesian Networks | <a href="../">back</a></h1>
		</div>
		<label class="light-border"
			>Network: <select bind:value={chosen_graph_generator} onchange={reload}>
				<option value={CLOUDY_BN_GRAPH}>Wet grass</option>
				<option value={BURGLAR_BN_GRAPH}>Burglar-Alarm</option>
				<option value={TOOTHACHE_BN_GRAPH}>Toothache</option>
			</select></label
		>
	</div>

	<div class="light-border flex flex-row flex-wrap gap-4 text-2xl">
		<div class="flex flex-row flex-wrap items-center gap-0.5">
			{@html tex(`P`)}
			<div
				class="mr-1 ml-1 flex w-min flex-row flex-wrap gap-2 rounded-2xl border-r-2 border-l-2 p-2"
			>
				<div class="inline-flex flex-row flex-wrap">
					{#each query_settings as opt, i}
						<select
							style="background-color: {current_query[opt.name].value >= 0
								? 'lightblue'
								: 'white'};"
							bind:value={current_query[opt.name].value}
							onchange={reset}
						>
							{#each opt.values as val}
								<option value={val}>{opt.name} = {opt.node.format_value(val)}</option>
							{/each}
						</select>
						{#if i < query_settings.length - 1}
							<!--div>,</div-->
						{/if}
					{/each}
				</div>
				<div class="inline-flex flex-row border-l-2 pl-2">
					{#each evidence_settings as opt, i}
						<select
							style="background-color: {current_evidence[opt.name].value >= 0
								? 'lightblue'
								: 'white'};"
							bind:value={current_evidence[opt.name].value}
							onchange={reset}
						>
							{#each opt.values as val}
								<option value={val}>{opt.name} = {opt.node.format_value(val)}</option>
							{/each}
						</select>
						{#if i < evidence_settings.length - 1}
							<!--div>,</div-->
						{/if}
					{/each}
				</div>
			</div>
		</div>

		<div class="flex flex-row flex-wrap items-center gap-2">
			{@html tex(`= ${current_query_str} = \\frac{W_{query}}{W}`)}
			{@html tex(
				`= \\frac{${fmt.num(W_query - dW_Query)}${dW_Query ? "+" + fmt.num(dW_Query) : ""}}{${fmt.num(W - dW)}${dW ? "+" + fmt.num(dW) : ""}}`
			)}
      {@html tex(
				`= \\frac{${fmt.num(W_query)}}{${fmt.num(W)}} = {${(W_query / W).toFixed(3)}}`
			)}
		</div>
	</div>

	<div class="grid grid-cols-2 gap-4">
		<div class="flex flex-col gap-2">
			<div class="flex flex-row flex-wrap gap-2">
				<button onclick={() => step()} class="border special">Random draw!</button>
				<button onclick={() => step(10)} class="border">Draw 10 times!</button>
				<button onclick={() => step(100)} class="border">Draw 100 times!</button>
				<button onclick={() => step(1000)} class="border">Draw 1000 times!</button>
				<button onclick={reset} class="border negative">Reset</button>
        <button onclick={reload} class="border negative">Empty query</button>
        <label class="light-border">Early out? <input type="checkbox" bind:checked={early_out}></label>
			</div>

			<!--Mermaid config={{ htmlLabels: true, theme: 'neutral' }} string={mermaid_str}></Mermaid-->
      <DagreGraph rankdir="LR" {edge_defs} {node_defs}></DagreGraph>
		</div>

		<div>
			<ChartView
				bind:this={chart}
				title={current_query_str}
				datasets={[
					{ label: 'Monte-Carlo estimation', data: [], pointRadius: 0, borderJoinStyle: 'round' }
				]}
				labels={[]}
				aspect_ratio={1}
				y_scale={{ min: 0, max: 1 }}
			></ChartView>
		</div>
	</div>
</div>
