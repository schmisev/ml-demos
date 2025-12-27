<script lang="ts">
	import './hui-graph.css';
	import dagre, { graphlib } from '@dagrejs/dagre';
	import {
		pick_edge_marker,
		generate_edge_d,
		set_edge,
		set_node,
		zip,
		type EdgeDef,
		type NodeDef
	} from './hui-graphs';
	import { onMount, untrack } from 'svelte';

	let {
		rankdir = 'TB',
		ranker = 'network-simplex',
		align = undefined,
		label_padding = 10,
		node_defs,
		edge_defs
	}: {
		rankdir?: 'TB' | 'BT' | 'LR' | 'RL';
		ranker?: 'network-simplex' | 'tight-tree' | 'longest-path';
		align?: 'UL' | 'UR' | 'DL' | 'DR';
		label_padding?: number;
		node_defs: NodeDef[];
		edge_defs: EdgeDef[];
	} = $props();

	let svg: SVGSVGElement;
	let all_elements: SVGGElement;
	let graph = $state(new graphlib.Graph());
	let graph_nodes: dagre.Node[] = $state([]);
	let graph_edges: dagre.GraphEdge[] = $state([]);
	let vb_width: number = $state(100);
	let vb_height: number = $state(100);

	function layout_graph() {
		graph = new graphlib.Graph({ directed: true, multigraph: true });
		graph.setGraph({ rankdir, ranker, align, marginx: 10, marginy: 10 });
		graph.setDefaultEdgeLabel(() => {
			return {};
		});
		graph_nodes = [];
		graph_edges = [];
		for (const raw_node of node_defs) {
			set_node(graph, raw_node);
		}
		for (const raw_edge of edge_defs) {
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

	// update graph automatically
	$effect(() => {
		// TODO: find a better way to do this
		$state.snapshot(node_defs);
		$state.snapshot(edge_defs);
		untrack(layout_graph);
	});
</script>

<svg bind:this={svg} style="max-height: 100%; max-width: 100%;" viewBox="0 0 {vb_width} {vb_height}" xmlns="http://www.w3.org/2000/svg">
	<defs>
		<marker
			id="arrow"
			viewBox="0 0 10 10"
			refX="8"
			refY="5"
			markerWidth="5"
			markerHeight="5"
			fill="context-stroke"
			orient="auto-start-reverse"
			vector-effect="non-scaling-stroke"
		>
			<path d="M 0 0 L 10 5 L 0 10 z" />
		</marker>
	</defs>

	<defs>
		<marker
			id="dot"
			viewBox="0 0 10 10"
			refX="5"
			refY="5"
			markerWidth="4"
			markerHeight="4"
			fill="context-stroke"
			orient="auto-start-reverse"
		>
			<circle cx="5" cy="5" r="5"></circle>
		</marker>
	</defs>

	{#each zip(edge_defs, graph_edges) as [edge_def, graph_edge]}
		<g>
			<path
				fill="transparent"
				stroke={edge_def.stroke || 'black'}
				stroke-width={edge_def.width || 2}
				style={edge_def.arrow_style || ''}
				d={generate_edge_d(graph_edge.points, edge_def.corner_radius)}
				marker-end={pick_edge_marker('end', edge_def)}
				marker-start={pick_edge_marker('start', edge_def)}
			>
			</path>
			{#if edge_def.label}
				<rect
					fill="rgba(255, 255, 255, 0.8)"
					x={graph_edge.x - graph_edge.width / 2}
					y={graph_edge.y - graph_edge.height / 2}
					width={graph_edge.width}
					height={graph_edge.height}
				></rect>
				<foreignObject
					xmlns="http://www.w3.org/1999/xhtml"
					x={graph_edge.x - graph_edge.width / 2 - label_padding}
					y={graph_edge.y - graph_edge.height / 2 - label_padding}
					width={graph_edge.width + label_padding * 2}
					height={graph_edge.height + label_padding * 2}
				>
					<div style="padding: {label_padding}px;">
						{@html graph_edge.label}
					</div>
				</foreignObject>
			{/if}
		</g>
	{/each}

	<g bind:this={all_elements}>
		{#each zip(node_defs, graph_nodes) as [node_def, graph_node]}
			<g>
				<foreignObject
					style="overflow: visible;"
					xmlns="http://www.w3.org/1999/xhtml"
					x={graph_node.x - graph_node.width / 2 - label_padding}
					y={graph_node.y - graph_node.height / 2 - label_padding}
					width={graph_node.width + label_padding * 2}
					height={graph_node.height + label_padding * 2}
				>
					<div style="padding: {label_padding}px;">
						{@html graph_node.label}
					</div>
				</foreignObject>
			</g>
		{/each}
	</g>
</svg>
