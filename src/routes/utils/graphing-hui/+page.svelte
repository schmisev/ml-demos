<script lang="ts">
	import type {
		HuiEdgeDefinition,
		HuiGraphDefinition,
		HuiNodeDefinition
	} from '$lib/hui-graphs/hui-core';
	import HuiDagre from '$lib/hui-graphs/HuiDagre.svelte';
	import HuiElk from '$lib/hui-graphs/HuiElk.svelte';

	const graph_def: HuiGraphDefinition = $state({
		nodes: [
			{
				id: 'kspacey',
				label: 'Kevin Spacey',
				labelClasses: ['hui', 'node', 'negative'],
			},
			{
				id: 'swilliams',
				label: 'Saul Williams',
				labelClasses: ['hui', 'node', 'rect', 'positive']
			},
			{ id: 'bpitt', label: 'Brad Pitt', labelClasses: ['hui', 'node', 'pill'] },
			{
				id: 'hford',
				label: 'Harrison Ford',
				labelClasses: ['hui', 'node', 'ellipse', 'special', 'no-border']
			},
			{ id: 'lwilson', label: 'Luke Wilson', labelClasses: ['hui', 'node', 'special-2', 'dashed'] },
			{ id: 'kbacon', label: 'Kevin Bacon', labelClasses: ['hui', 'node', 'dotted'] }
		],
		edges: [
			{ fromId: 'kspacey', toId: 'swilliams', label: '', arrowEnd: 'dot', arrowStart: 'arrow' },
			{ fromId: 'kspacey', toId: 'swilliams', label: '1' },
			{ fromId: 'swilliams', toId: 'kbacon', label: 'Label' },
			{ fromId: 'bpitt', toId: 'kbacon', label: '3' },
			{ fromId: 'hford', toId: 'lwilson', label: '4' },
			{ fromId: 'lwilson', toId: 'kbacon', label: '5', arrowWidth: 3, arrowStroke: 'red' }
		]
	});
</script>

<head>
	<title>Utils : Hui Graphs</title>
</head>

<div class="w-1/2 p-10">
	<HuiDagre graphDef={graph_def}></HuiDagre>
	<HuiElk graphDef={graph_def}></HuiElk>
</div>
