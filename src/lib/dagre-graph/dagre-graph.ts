import type { graphlib } from '@dagrejs/dagre';
import dagre from '@dagrejs/dagre';
import * as pkg from 'svg-round-corners';

const DEFAULT_CORNER_RADIUS = 10;

type Arrowhead = "none" | "arrow" | "dot";

const DEFAULT_END_MARKER: Arrowhead = "arrow";
const DEFAULT_START_MARKER: Arrowhead = "none";

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
export function *zip<A, B>(a: A[], b: B[]): Generator<[A, B]> {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    yield [a[i], b[i]];
  }
}

export function calculate_node_settings(raw_node: NodeDef): dagre.Label {
	const { rect, html } = measure_label(box_label(raw_node));
	return { label: html, width: rect.width, height: rect.height };
}

export function calculate_edge_settings(raw_edge: EdgeDef): dagre.Label {
	const { rect, html } = measure_label(box_label(raw_edge));
	return { label: html, width: rect.width, height: rect.height };
}

export function generate_edge_d(points: {x: number, y: number}[], corner_radius?: number) {
	let str = '';
	for (const [i, { x, y }] of points.entries()) {
		if (i === 0) str += `M ${x} ${y} `;
		else str += `L ${x} ${y} `;
	}
	const res = pkg.roundCorners(str, corner_radius || DEFAULT_CORNER_RADIUS, 3);
	return res.path;
}

export function pick_edge_marker(position: "start" | "end", raw_edge: EdgeDef) {
  let marker = "";
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
  return `url(#${marker})`
}

export function box_label(elem: EdgeDef | NodeDef): HTMLDivElement {
  const div = document.createElement('div');
  div.innerHTML = elem.label;
  div.style.width = "max-content";
  div.style.textAlign = "center";
  elem.style && (div.style.cssText += " " + elem.style);
  elem.cls && div.classList.add(...elem.cls);
  return div;
}

// dagre adapter
export function set_node(graph: graphlib.Graph, raw_node: NodeDef): dagre.Node {
	graph.setNode(raw_node.name, {
		...calculate_node_settings(raw_node)
	});
  return graph.node(raw_node.name);
}

export function set_edge(graph: graphlib.Graph, edge_def: EdgeDef) {
	const name = edge_def.name || "" + graph.edgeCount() + 1;
  graph.setEdge(edge_def.from, edge_def.to, {
		labelpos: 'c',
		...calculate_edge_settings(edge_def)
	}, name);
  return graph.edge(edge_def.from, edge_def.to, name);
}