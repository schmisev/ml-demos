import type { graphlib } from '@dagrejs/dagre';
import dagre from '@dagrejs/dagre';
import type {
	ElkExtendedEdge,
	ElkLayoutOptionDescription,
	ElkNode,
  ElkEdgeSection
} from 'elkjs/lib/elk.bundled.js';
import * as pkg from 'svg-round-corners';

const DEFAULT_CORNER_RADIUS = 10;

type Arrowhead = 'none' | 'arrow' | 'dot';

const DEFAULT_END_MARKER: Arrowhead = 'arrow';
const DEFAULT_START_MARKER: Arrowhead = 'none';

export interface NodeDef {
	name: string;
	label: string;
	cls?: string[];
	style?: string;
}

export interface EdgeDef {
	from: string;
	to: string;
	label: string;
	name?: string;
	cls?: string[];
	style?: string;
	// additional style
	arrow_style?: string;
	arrow_start?: Arrowhead;
	arrow_end?: Arrowhead;
	corner_radius?: number;
	width?: number;
	stroke?: string;
}

function measure_label(div: HTMLDivElement): { rect: DOMRect; html: string } {
	document.body.appendChild(div);
	const rect = div.getBoundingClientRect();
	document.body.removeChild(div);
	return {
		rect: rect,
		html: div.outerHTML
	};
}

// utils
export function* zip<A, B>(a: A[], b: B[]): Generator<[A, B]> {
	for (let i = 0; i < Math.min(a.length, b.length); i++) {
		yield [a[i], b[i]];
	}
}

export function calculate_node_settings(node_def: NodeDef): dagre.Label {
	const { rect, html } = measure_label(box_label(node_def));
	return { label: html, width: rect.width, height: rect.height };
}

export function calculate_edge_settings(edge_def: EdgeDef): dagre.Label {
	const { rect, html } = measure_label(box_label(edge_def));
	return { label: html, width: rect.width, height: rect.height };
}

export function generate_edge_d(points: { x: number; y: number }[], corner_radius?: number) {
	let str = '';
	for (const [i, { x, y }] of points.entries()) {
		if (i === 0) str += `M ${x} ${y} `;
		else str += `L ${x} ${y} `;
	}
	const res = pkg.roundCorners(str, corner_radius || DEFAULT_CORNER_RADIUS, 3);
	return res.path;
}

export function pick_edge_marker(position: 'start' | 'end', raw_edge: EdgeDef) {
	let marker = '';
	switch (position) {
		case 'start':
			if (!raw_edge.arrow_start) marker = DEFAULT_START_MARKER;
			else marker = raw_edge.arrow_start;
			break;
		case 'end':
			if (!raw_edge.arrow_end) marker = DEFAULT_END_MARKER;
			else marker = raw_edge.arrow_end;
			break;
	}
	return `url(#${marker})`;
}

export function box_label(elem: EdgeDef | NodeDef): HTMLDivElement {
	const div = document.createElement('div');
	div.innerHTML = elem.label;
	div.style.width = 'max-content';
	div.style.textAlign = 'center';
	elem.style && (div.style.cssText += ' ' + elem.style);
	elem.cls && div.classList.add(...elem.cls);
	return div;
}

// dagre adapter
export function set_node(graph: graphlib.Graph, node_def: NodeDef): dagre.Node {
	graph.setNode(node_def.name, {
		...calculate_node_settings(node_def)
	});
	return graph.node(node_def.name);
}

export function set_edge(graph: graphlib.Graph, edge_def: EdgeDef) {
	const name = edge_def.name || '' + graph.edgeCount() + 1;
	graph.setEdge(
		edge_def.from,
		edge_def.to,
		{
			labelpos: 'c',
			...calculate_edge_settings(edge_def)
		},
		name
	);
	return graph.edge(edge_def.from, edge_def.to, name);
}

// elk adapter
export function graphlib_to_elk_json(graph: graphlib.Graph): ElkNode {
	const node: ElkNode = {
		id: '',
		children: graph
			.nodes()
			.map((n) => {
				return { n, c: graph.node(n) };
			})
			.map(({ n, c }) => {
				return {
					id: n,
					labels: [{ height: c.height, width: c.width, text: c.label }],
					width: c.width,
					height: c.height
				};
			}),
		edges: graph
			.edges()
			.map((e) => {
				return { e, d: graph.edge(e) };
			})
			.map(({ e, d }) => {
				return {
					id: e.name!,
					sources: [e.v],
					targets: [e.w],
					labels: [{ height: d.height, width: d.width, text: d.label }]
				};
			})
	};
	return node;
}

export function get_label_width(elem: ElkNode | ElkExtendedEdge): number {
  return elem.labels?.[0]?.width || 0;
}

export function get_label_height(elem: ElkNode | ElkExtendedEdge): number {
  return elem.labels?.[0]?.height || 0;
}

export function get_label_x(elem: ElkNode | ElkExtendedEdge): number {
  return elem.labels?.[0]?.x || 0;
}

export function get_label_y(elem: ElkNode | ElkExtendedEdge): number {
  return elem.labels?.[0]?.y || 0;
}

export function get_node_x(elem: ElkNode): number {
  return elem.x || 0;
}

export function get_node_y(elem: ElkNode): number {
  return elem.y || 0;
}

export function get_label_text(elem: ElkNode | ElkExtendedEdge): string {
  return elem.labels?.[0].text || "";
}

export function get_elk_edge_d(edge: ElkExtendedEdge, corner_radius?: number): string {
  return edge.sections?.[0] ? generate_section_d(edge.sections[0], corner_radius) : ""; 
}

export function generate_section_d(section: ElkEdgeSection, corner_radius?: number): string {
  const all_points = [ section.startPoint, ...(section.bendPoints || []), section.endPoint ];
  return generate_edge_d(all_points, corner_radius);
}