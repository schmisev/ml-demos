import ELK, { type ELKConstructorArguments, type ElkEdgeSection, type ElkLayoutArguments, type ElkNode } from 'elkjs/lib/elk.bundled.js';
import { makeLabel, measureElement, type HuiEdge, type HuiGraph, type HuiGraphDefinition, type HuiNode } from "./hui-core";


export async function layoutELK(graphDef: HuiGraphDefinition, settings: ELKConstructorArguments, layoutSettings: ElkLayoutArguments, genId: () => string) {
    const { nodes: nodeDefs, edges: edgeDefs } = graphDef;

    // constructing the graph
    const elkJSON: ElkNode = {
        id: "",
        children: [],
        edges: [],
    }

    for (const node of nodeDefs) {
        const label = makeLabel(node);
        const { rect } = measureElement(label);
        elkJSON.children!.push({
            id: node.id,
            width: rect.width,
            height: rect.height,
        })
    }

    for (const edge of edgeDefs) {
        edge.id = edge.id || genId();
        const label = makeLabel(edge);
        const { rect } = measureElement(label);
        elkJSON.edges!.push({
            id: edge.id,
            sources: [ edge.fromId ],
            targets: [ edge.toId ],
            labels: [ { height: rect.height, width: rect.width, text: edge.id } ],
        })
    }

    // layouting
    const elk = new ELK(settings);
    const layout = await elk.layout(elkJSON, layoutSettings);

    // extracting the layout
    const graph: HuiGraph = {
        width: layout.width || 0,
        height: layout.height || 0,
        nodes: [],
        edges: [],
    };

    for (const def of nodeDefs) {
        const elkNode = layout.children!.find((n) => n.id === def.id);
        if (!elkNode) continue;

        const x = elkNode.x || 0;
        const y = elkNode.y || 0;
        const width = elkNode.width || 0;
        const height = elkNode.height || 0;

        const newNode: HuiNode = {
            def,
            height,
            width,
            x: x + width/2,
            y: y + height/2
        }
        graph.nodes.push(newNode);
    }

    for (const def of edgeDefs) {
        const elkEdge = layout.edges!.find((e) => e.id === def.id);
        if (!elkEdge) continue;

        const x = elkEdge.labels?.[0]?.x || 0;
        const y = elkEdge.labels?.[0]?.y || 0;
        const width = elkEdge.labels?.[0]?.width || 0;
        const height = elkEdge.labels?.[0]?.height || 0;

        const newEdge: HuiEdge = {
            id: elkEdge.id,
            def,
            x: x + width/2,
            y: y + height/2,
            width,
            height,
            points: extractSectionPoints(elkEdge.sections?.[0])
        }
        graph.edges.push(newEdge);
    }

    return graph;
}

function extractSectionPoints(section?: ElkEdgeSection) {
    if (!section) return [];
    return [section.startPoint, ...(section.bendPoints || []), section.endPoint];
}