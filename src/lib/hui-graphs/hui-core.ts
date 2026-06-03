import { vec_add, vec_filter, vec_norm, vec_norm2, vec_normalize2, vec_scale, vec_to } from '$lib/vec';
import * as roundedCorners from 'svg-round-corners';

// defaults
export const DEFAULT_CORNER_RADIUS = 10;
export const DEFAULT_END_MARKER: HuiArrowhead = 'arrow';
export const DEFAULT_START_MARKER: HuiArrowhead = 'none';
export const DEFAULT_SMOOTHING: HuiSmoothing = 'smooth';

// smoothing
export type HuiSmoothing = 'linear' | 'rounded' | 'bezier' | 'smooth';

// label
type HuiLabel = HTMLElement | string;

// arrowheads
type HuiArrowhead = 'none' | 'arrow' | 'dot';

// graph
export interface HuiGraphDefinition {
	nodes: HuiNodeDefinition[];
	edges: HuiEdgeDefinition[];
}

export interface HuiGraph {
	width: number;
	height: number;
	nodes: HuiNode[];
	edges: HuiEdge[];
}

// nodes
export interface HuiNodeDefinition {
	id: string;
	label: HuiLabel;
	labelClasses?: string[];
	labelStyle?: { [attr: string]: string };
	labelOnClick?: (ev: PointerEvent) => void;
}

export interface HuiNode {
	def: HuiNodeDefinition;
	width: number;
	height: number;
	x: number;
	y: number;
}

// edges
export interface HuiEdgeDefinition {
	id?: string;
	fromId: string;
	toId: string;
	label?: HuiLabel;
	labelClasses?: string[];
	labelStyle?: { [attr: string]: string };
	labelOnClick?: (ev: PointerEvent) => void;
	arrowStart?: HuiArrowhead;
	arrowEnd?: HuiArrowhead;
	arrowStyle?: { [attr: string]: string };
	cornerRadius?: number;
	arrowWidth?: number;
	arrowStroke?: string;
  smoothing?: HuiSmoothing;
  filterPoints?: boolean;
}

export interface HuiEdge {
	id: string;
	def: HuiEdgeDefinition;
	width: number;
	height: number;
	x: number;
	y: number;
	points: { x: number; y: number }[];
}

// utils
export function measureElement(div: HTMLDivElement) {
	document.body.appendChild(div);
	const rect = div.getBoundingClientRect();
	document.body.removeChild(div);

	return {
		rect
	};
}

export function makeLabel(elem: HuiEdgeDefinition | HuiNodeDefinition): HTMLDivElement {
	const div = document.createElement('div');

	if (!elem.label) {
	} else if (typeof elem.label === 'string') div.innerHTML = elem.label;
	else div.appendChild(elem.label);

	div.style.width = 'max-content';
	div.style.textAlign = 'center';

	if (elem.labelOnClick) div.onclick = elem.labelOnClick;
	if (elem.labelClasses) div.classList.add(...elem.labelClasses);
	if (elem.labelStyle) {
		for (const attr in elem.labelStyle) {
			div.style.setProperty(attr, elem.labelStyle[attr]);
		}
	}

	return div;
}

export function stringifyStyle(style?: { [attr: string]: string }) {
	if (!style) return '';
	return Object.entries(style)
		.map((k, v) => `${k}: ${v};`)
		.join(' ');
}

export function dFromPoints(
	points: { x: number; y: number }[],
	mode: HuiSmoothing,
	corner_radius: number,
  filter_points?: boolean
) {
  if (filter_points || filter_points === undefined) 
    points = vec_filter(points, corner_radius);

	switch (mode) {
    case 'linear': {
      let str = '';
			for (const [i, { x, y }] of points.entries()) {
				if (i === 0) str += `M ${x} ${y} `;
				else str += `L ${x} ${y} `;
			}
			return str;
    }
		case 'rounded': {
			let str = '';
			for (const [i, { x, y }] of points.entries()) {
				if (i === 0) str += `M ${x} ${y} `;
				else str += `L ${x} ${y} `;
			}
			const res = roundedCorners.roundCorners(str, corner_radius, 3);
			return res.path;
		}
		case 'bezier': {
			let str = '';
      str += `M ${points[0].x} ${points[0].y} `;
			for (let i = 0; i < points.length; i += 2) {
        const end = points[i];
        const after_end = points[i+1] || end;
        const start = points[i-1] || end;
        const before_start = points[i-2] || start;

        const next = vec_normalize2(vec_to(end, after_end));
        const prev = vec_normalize2(vec_to(start, end));
        const F =  1000 *Math.min(vec_norm(next), vec_norm(prev));

        const ctrl = vec_add(end, vec_scale(vec_add(next, prev), F));

				str += `S ${ctrl.x} ${ctrl.y}, ${end.x} ${end.y} `;
			}
			// const res = roundedCorners.roundCorners(str, corner_radius || DEFAULT_CORNER_RADIUS, 3);
			return str;
		}
    case 'smooth': {
			let str = '';

      function F(n: number, s: number, c: number) {
        return s * (1 - (1 / (1+(n-c))));
      }

			for (let i = 0; i <= points.length; i += 1) {
        const end = points[i] || points[i-1];
        const mid = points[i-1] || end;
        const start = points[i-2] || mid;

        const p0 = vec_scale(vec_add(start, mid), 0.5);
        const p1 = vec_scale(vec_add(mid, end), 0.5);

        const v0 = vec_to(mid, p0);
        const v1 = vec_to(mid, p1);

        const n0 = vec_norm(v0);
        const n1 = vec_norm(v1);

        const F0 = F(n0, 0.2, 200);
        const F1 = F(n1, 0.2, 200);
        const c0 = vec_add(mid, vec_scale(v0, -F0));
        const c1 = vec_add(mid, vec_scale(v1, -F1));

        if (i == 0) {
          str += `M ${p1.x} ${p1.y} `;
          continue;
        }
        if (i == points.length) {
          str += `T ${p1.x} ${p1.y}`;
          continue;
        }

				str += `C ${c0.x} ${c0.y}, ${c1.x} ${c1.y}, ${p1.x} ${p1.y} `;
				// str += `L ${end.x} ${end.y} `;
			}
			// const res = roundedCorners.roundCorners(str, corner_radius || DEFAULT_CORNER_RADIUS, 3);
			return str;
		}
	}
}

export function urlArrowEnd(end?: string) {
	return `url(#${end || DEFAULT_END_MARKER})`;
}

export function urlArrowStart(start?: string) {
	return `url(#${start || DEFAULT_START_MARKER})`;
}
