<script lang="ts">
	import type { RawEdge, RawNode } from '$lib/dagre-graph/dagre-graph';
	import DagreGraph from '$lib/dagre-graph/DagreGraph.svelte';
	import dagre from '@dagrejs/dagre';
	import { onMount } from 'svelte';

	// Create a new directed graph
	var g = new dagre.graphlib.Graph();

	// Set an object for the graph label
	g.setGraph({});

	// Default to assigning a new object as a label for each new edge.
	g.setDefaultEdgeLabel(function () {
		return {};
	});

	// Add nodes to the graph. The first argument is the node id. The second is
	// metadata about the node. In this case we're going to add labels to each of
	// our nodes.
	const raw_nodes: RawNode[] = [
		{ name: 'kspacey', label: 'Kevin Spacey' },
		{ name: 'swilliams', label: 'Saul Williams' },
		{ name: 'bpitt', label: 'Brad Pitt' },
		{ name: 'hford', label: 'Harrison Ford' },
		{ name: 'lwilson', label: 'Luke Wilson' },
		{ name: 'kbacon', label: 'Kevin Bacon' }
	];

  const raw_edges: RawEdge[] = [
    { from: 'kspacey', to: 'swilliams', label: '1' },
    { from: 'swilliams', to: 'kbacon', label: '' },
    { from: 'bpitt', to: 'kbacon', label: '3' },
    { from: 'hford', to: 'lwilson', label: '4' },
    { from: 'lwilson', to: 'kbacon', label: '5' },
  ]
</script>

<div class="w-1/2">
  <DagreGraph raw_nodes={raw_nodes} raw_edges={raw_edges}>
  </DagreGraph>
</div>