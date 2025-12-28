import { makeLabel, measureElement, type HuiEdge, type HuiEdgeDefinition, type HuiGraph, type HuiGraphDefinition, type HuiNode } from "./hui-core";
import dagre, { type GraphLabel, type Label, graphlib } from "@dagrejs/dagre";

export function layoutDagre(graphDef: HuiGraphDefinition, settings: GraphLabel, genId: () => string): HuiGraph {
    const { nodes: nodeDefs, edges: edgeDefs } = graphDef;
    
    // constructing the graph
    const workingGraph = new graphlib.Graph({
        directed: true,
        multigraph: true,
    });
    workingGraph.setGraph(settings);

    for (const node of nodeDefs) {
        const label = makeLabel(node);
        const { rect } = measureElement(label)
        workingGraph.setNode(
            node.id,
            {
                width: rect.width,
                height: rect.height
            } satisfies Label
        )
    }

    for (const edge of edgeDefs) {
        const label = makeLabel(edge);
        const { rect } = measureElement(label)
        edge.id = edge.id || genId(); // make sure every edge has an id
        workingGraph.setEdge(
            { v: edge.fromId, w: edge.toId, name: edge.id },
            { labelpos: 'c', width: rect.width, height: rect.height }
        )
    }

    // layouting
    dagre.layout(workingGraph);

    // extracting the layout
    const graph: HuiGraph = {
        width: workingGraph.graph().width || 0,
        height: workingGraph.graph().height || 0,
        nodes: [],
        edges: [],
    };

    for (const def of nodeDefs) {
        const dagreNode = workingGraph.node(def.id);
        const newNode: HuiNode = {
            def,
            height: dagreNode.height,
            width: dagreNode.width,
            x: dagreNode.x,
            y: dagreNode.y
        }
        graph.nodes.push(newNode);
    }

    for (const def of edgeDefs) {
        const dagreEdge = workingGraph.edge({v: def.fromId, w: def.toId, name: def.id});
        const newEdge: HuiEdge = {
            id: dagreEdge.name,
            def,
            x: dagreEdge.x,
            y: dagreEdge.y,
            width: dagreEdge.width,
            height: dagreEdge.height,
            points: dagreEdge.points,
        }
        graph.edges.push(newEdge);
    }

    return graph;
}