<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import type { HuiGraph, HuiGraphDefinition } from './hui-core';
	import { layoutDagre } from './hui-dagre';
	import type { GraphLabel } from '@dagrejs/dagre';
	import HuiRenderer from './HuiRenderer.svelte';

	let {
		graphDef = { nodes: [], edges: [] },
		settings = {},
    name = "dragre",
	}: {
		graphDef?: HuiGraphDefinition;
		settings?: GraphLabel;
    name?: string;
	} = $props();

	let graph: HuiGraph | undefined = $state();

	let id = 0;
	function genId() {
		return '' + id++;
	}

	function layout() {
		id = 0;
		graph = layoutDagre(graphDef, settings, genId);
	}

	onMount(() => {
		layout();
	});

	$effect(() => {
		$state.snapshot(graphDef);
		untrack(layout);
	});
</script>

{#if graph}
	{#key graph}
		<HuiRenderer {name} {graph}></HuiRenderer>
	{/key}
{/if}
