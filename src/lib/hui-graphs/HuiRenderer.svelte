<script lang="ts">
    import "./hui-graph.css";
	import { dFromPoints, stringifyStyle, urlArrowEnd, urlArrowStart, type HuiGraph } from "./hui-core";
	import HuiLabel from "./HuiLabel.svelte";
    let {
        graph
    }: {
        graph: HuiGraph
    } = $props();

    const labelPadding = 20;
</script>

<svg style="max-height: 100%; max-width: 100%;" viewBox="0 0 {graph.width} {graph.height}" xmlns="http://www.w3.org/2000/svg">
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

	{#each graph.edges as edge}
		<g>
			<path
				fill="transparent"
				stroke={edge.def.arrowStroke || 'black'}
				stroke-width={edge.def.arrowWidth || 2}
				style={stringifyStyle(edge.def.arrowStyle)}
				d={dFromPoints(edge.points, edge.def.cornerRadius)}
				marker-end={urlArrowEnd(edge.def.arrowEnd)}
				marker-start={urlArrowStart(edge.def.arrowStart)}
			>
			</path>
			{#if edge.def.label}
				<rect
					fill="rgba(255, 255, 255, 0.8)"
					x={edge.x - edge.width / 2}
					y={edge.y - edge.height / 2}
					width={edge.width}
					height={edge.height}
				></rect>
				<foreignObject
					xmlns="http://www.w3.org/1999/xhtml"
					x={edge.x - edge.width / 2 - labelPadding}
					y={edge.y - edge.height / 2 - labelPadding}
					width={edge.width + labelPadding * 2}
					height={edge.height + labelPadding * 2}
				>
					<HuiLabel elem={edge} {labelPadding}></HuiLabel>
				</foreignObject>
			{/if}
		</g>
	{/each}

    {#each graph.nodes as node}
        <g>
            <foreignObject
                style="overflow: visible;"
                xmlns="http://www.w3.org/1999/xhtml"
                x={node.x - node.width / 2 - labelPadding}
                y={node.y - node.height / 2 - labelPadding}
                width={node.width + labelPadding * 2}
                height={node.height + labelPadding * 2}
            >
                <HuiLabel elem={node} {labelPadding}></HuiLabel>
            </foreignObject>
        </g>
    {/each}
</svg>