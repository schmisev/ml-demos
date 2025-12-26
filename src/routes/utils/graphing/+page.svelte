<script lang="ts">
	import type { EdgeDef, NodeDef } from '$lib/dagre-graph/dagre-graph';
	import DagreGraph from '$lib/dagre-graph/DagreGraph.svelte';

	const node_defs: NodeDef[] = $state([
		{ name: 'kspacey', label: 'Kevin Spacey', cls: ["hui", "node", "negative"]},
		{ name: 'swilliams', label: 'Saul Williams', cls: ["hui", "node", "rect", "positive"] },
		{ name: 'bpitt', label: 'Brad Pitt', cls: ["hui", "node", "pill"] },
		{ name: 'hford', label: 'Harrison Ford', cls: ["hui", "node", "ellipse", "special", "no-border"] },
		{ name: 'lwilson', label: 'Luke Wilson', cls: ["hui", "node", "special-2", "dashed"] },
		{ name: 'kbacon', label: 'Kevin Bacon', cls: ["hui", "node", "dotted"] }
	]);

  const edge_defs: EdgeDef[] = $state([
    { from: 'kspacey', to: 'swilliams', label: '', arrow_end: "dot", arrow_start: "arrow" },
    { from: 'kspacey', to: 'swilliams', label: '1' },
    { from: 'swilliams', to: 'kbacon', label: 'X' },
    { from: 'bpitt', to: 'kbacon', label: '3' },
    { from: 'hford', to: 'lwilson', label: '4' },
    { from: 'lwilson', to: 'kbacon', label: '5', width: 5, stroke: "red" },
  ]);
</script>

<head>
  <title>Utils : Dagre Graphs</title>
</head>

<div class="w-1/2 p-10">
  <DagreGraph rankdir="BT" ranker="longest-path" {node_defs} {edge_defs}>
  </DagreGraph>
</div>
