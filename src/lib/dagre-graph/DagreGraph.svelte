<script lang="ts">
	import dagre, { graphlib } from '@dagrejs/dagre';
	import { generate_edge_d, set_edge, set_node, type RawEdge, type RawNode } from './dagre-graph';
	import { onMount } from 'svelte';
	import { updated } from '$app/state';
	import type { SVGGroup } from 'mermaid';

	let {
		raw_nodes,
		raw_edges
	}: {
		raw_nodes: RawNode[];
		raw_edges: RawEdge[];
	} = $props();

	let svg: SVGSVGElement;
	let all_elements: SVGGElement;
	let graph = $state(new graphlib.Graph());
	let graph_nodes: dagre.Node[] = $state([]);
	let graph_edges: dagre.GraphEdge[] = $state([]);
	let vb_width: number = $state(100);
	let vb_height: number = $state(100);

	function layout_graph() {
		graph = new graphlib.Graph();
		graph.setGraph({});
		graph.setDefaultEdgeLabel(() => {
			return {};
		});
		graph_nodes = [];
		graph_edges = [];
		for (const raw_node of raw_nodes) {
			set_node(graph, raw_node);
		}
		for (const raw_edge of raw_edges) {
			set_edge(graph, raw_edge);
		}

		dagre.layout(graph);

		const { width, height } = graph.graph();
		vb_width = width || 100;
		vb_height = height || 100;

		graph_nodes = graph.nodes().map((n) => graph!.node(n));
		graph_edges = graph.edges().map((e) => graph!.edge(e));
	}

	onMount(() => {
		layout_graph();
	});

	export function update() {
		layout_graph();
	}
</script>

<svg bind:this={svg} viewBox="0 0 {vb_width} {vb_height}" xmlns="http://www.w3.org/2000/svg">
	<g bind:this={all_elements}>
		{#each graph_nodes as node}
			<g>
				<foreignObject
					xmlns="http://www.w3.org/1999/xhtml"
					x={node.x - node.width / 2}
					y={node.y - node.height / 2}
					width={node.width}
					height={node.height}
				>
					<div class="text-center">
						{@html node.label}
					</div>
				</foreignObject>
			</g>
		{/each}
		{#each graph_edges as edge}
			<g>
				<path fill="transparent" stroke="black" d={generate_edge_d(edge)}></path>
				<rect
					fill="white"
					x={edge.x - edge.width / 2}
					y={edge.y - edge.height / 2}
					width={edge.width}
					height={edge.height}
				></rect>
				<foreignObject
					xmlns="http://www.w3.org/1999/xhtml"
					x={edge.x - edge.width / 2}
					y={edge.y - edge.height / 2}
					width={edge.width}
					height={edge.height}
				>
					<div class="text-center">
						{@html edge.label}
					</div>
				</foreignObject>
			</g>
		{/each}
	</g>
</svg>
