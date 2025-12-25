import type { graphlib } from '@dagrejs/dagre';
import dagre from '@dagrejs/dagre';
import * as pkg from "svg-round-corners";

export interface RawNode {
	name: string;
	label: string;
}

export interface RawEdge {
	from: string;
	to: string;
	label: string;
}

function measure_html(html: string): DOMRect {
	const dummy_div = document.createElement('div');
	dummy_div.innerHTML = html;
	dummy_div.style.width = 'min-content';
	document.body.appendChild(dummy_div);
	const dummy_rect = dummy_div.getBoundingClientRect();
	document.body.removeChild(dummy_div);
	return dummy_rect;
}

export function calculate_node_settings(raw_node: RawNode): dagre.Label {
	const dummy_rect = measure_html(raw_node.label);
	return { label: raw_node.label, width: dummy_rect.width, height: dummy_rect.height };
}

export function calculate_edge_settings(raw_edge: RawEdge): dagre.Label {
	const dummy_rect = measure_html(raw_edge.label);
	return { label: raw_edge.label, width: dummy_rect.width, height: dummy_rect.height };
}

export function generate_edge_d(edge: dagre.GraphEdge) {
	let str = '';
	for (const [i, { x, y }] of edge.points.entries()) {
		if (i === 0) str += `M ${x} ${y} `;
		else str += `L ${x} ${y} `;
	}
  const res = pkg.roundCorners(str, 20, 2);
	return res.path;
}

export function set_node(graph: graphlib.Graph, raw_node: RawNode) {
	graph.setNode(raw_node.name, {
		...calculate_node_settings(raw_node)
	});
}

export function set_edge(graph: graphlib.Graph, raw_edge: RawEdge) {
	graph.setEdge(raw_edge.from, raw_edge.to, {
    labelpos: "c", 
		...calculate_edge_settings(raw_edge)
	});
}
