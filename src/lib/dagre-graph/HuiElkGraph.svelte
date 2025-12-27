<script lang="ts">
	import './hui-graph.css';
	import dagre, { graphlib } from '@dagrejs/dagre';
	import ELK, { type ElkExtendedEdge, type ElkNode } from 'elkjs/lib/elk.bundled.js';
	import {
		pick_edge_marker,
		generate_edge_d,
		set_edge,
		set_node,
		zip,
		type EdgeDef,
		type NodeDef,
		graphlib_to_elk_json,
		get_node_x,
		get_label_width,
		get_node_y,
		get_label_height,
		get_label_text,
		get_elk_edge_d,
		get_label_x,
		get_label_y
	} from './hui-graphs';
	import { onMount, untrack } from 'svelte';

	let {
		rankdir = 'DOWN',
    inline_labels = true,
		label_padding = 10,
		node_defs,
		edge_defs
	}: {
		rankdir?: 'DOWN' | 'UP' | 'LEFT' | 'RIGHT';
		inline_labels?: boolean;
    label_padding?: number;
		node_defs: NodeDef[];
		edge_defs: EdgeDef[];
	} = $props();

	let svg: SVGSVGElement;
	let all_elements: SVGGElement;
	let graph = $state(new graphlib.Graph());
	let graph_nodes: ElkNode[] = $state([]);
	let graph_edges: ElkExtendedEdge[] = $state([]);
	let vb_width: number = $state(100);
	let vb_height: number = $state(100);

	const elk = new ELK({
		defaultLayoutOptions: {
			'elk.edgeLabels.inline': "" + inline_labels,
			'elk.algorithm': 'layered',
			'elk.direction': rankdir,
      'elk.spacing.nodeSelfLoop': "30",
      'elk.spacing.edgeNode': "100",
      'elk.spacing.edgeEdge': "4",
      'elk.layered.nodePlacement.strategy': "BRANDES_KOEPF",
      'elk.layered.nodePlacement.favorStraightEdges': "true",
		}
	});

	function layout_graph() {
		graph = new graphlib.Graph({ directed: true, multigraph: true });
		graph.setDefaultEdgeLabel(() => {
			return {};
		});

		// graph_nodes = [];
		// graph_edges = [];
		for (const raw_node of node_defs) {
			set_node(graph, raw_node);
		}
		for (const raw_edge of edge_defs) {
			set_edge(graph, raw_edge);
		}

		const elk_graph = graphlib_to_elk_json(graph);
		elk.layout(elk_graph).then((layout) => {
			console.log(layout);

			graph_nodes = layout.children!;
			graph_edges = layout.edges!;
			vb_width = layout.width || 100;
			vb_height = layout.height || 100;
		});
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

<svg
	bind:this={svg}
	style="max-height: 100%; max-width: 100%;"
	viewBox="0 0 {vb_width} {vb_height}"
	xmlns="http://www.w3.org/2000/svg"
>
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
				d={get_elk_edge_d(graph_edge, edge_def.corner_radius)}
				marker-end={pick_edge_marker('end', edge_def)}
				marker-start={pick_edge_marker('start', edge_def)}
			>
			</path>
			{#if edge_def.label}
				<rect
					fill="rgba(255, 255, 255, 0.8)"
					x={get_label_x(graph_edge)}
					y={get_label_y(graph_edge)}
					width={get_label_width(graph_edge)}
					height={get_label_height(graph_edge)}
				></rect>
				<foreignObject
					xmlns="http://www.w3.org/1999/xhtml"
					x={get_label_x(graph_edge) - label_padding}
					y={get_label_y(graph_edge) - label_padding}
					width={get_label_width(graph_edge) + label_padding * 2}
					height={get_label_height(graph_edge) + label_padding * 2}
				>
					<div style="padding: {label_padding}px;">
						{@html get_label_text(graph_edge)}
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
					x={get_node_x(graph_node) - label_padding}
					y={get_node_y(graph_node) - label_padding}
					width={get_label_width(graph_node) + label_padding * 2}
					height={get_label_height(graph_node) + label_padding * 2}
				>
					<div style="padding: {label_padding}px;">
						{@html get_label_text(graph_node)}
					</div>
				</foreignObject>
			</g>
		{/each}
	</g>
</svg>
