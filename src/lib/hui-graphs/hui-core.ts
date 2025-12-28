import * as roundedCorners from 'svg-round-corners';

// defaults
const DEFAULT_CORNER_RADIUS = 10;
const DEFAULT_END_MARKER: HuiArrowhead = 'arrow';
const DEFAULT_START_MARKER: HuiArrowhead = 'none';

// label
type HuiLabel = HTMLElement | string;

// arrowheads
type HuiArrowhead = "none" | "arrow" | "dot";

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
}

export interface HuiEdge {
    id: string;
    def: HuiEdgeDefinition;
    width: number;
    height: number
    x: number;
    y: number;
    points: {x: number, y: number}[];
}

// utils
export function measureElement(div: HTMLDivElement) {
    document.body.appendChild(div);
    const rect = div.getBoundingClientRect();
    document.body.removeChild(div);

    return {
        rect
    }
}

export function makeLabel(elem: HuiEdgeDefinition | HuiNodeDefinition): HTMLDivElement {
    const div = document.createElement('div');
    
    if (!elem.label) {}
    else if (typeof elem.label === "string") div.innerHTML = elem.label;
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

export function stringifyStyle(style?: {[attr: string]: string}) {
    if (!style) return "";
    return Object.entries(style).map((k, v) => `${k}: ${v};`).join(" ");
}

export function dFromPoints(points: { x: number; y: number }[], corner_radius?: number) {
    let str = '';
    for (const [i, { x, y }] of points.entries()) {
        if (i === 0) str += `M ${x} ${y} `;
        else str += `L ${x} ${y} `;
    }
    const res = roundedCorners.roundCorners(str, corner_radius || DEFAULT_CORNER_RADIUS, 3);
    return res.path;
}

export function urlArrowEnd(end?: string) {
    return `url(#${end || DEFAULT_END_MARKER})`;
}

export function urlArrowStart(start?: string) {
    return `url(#${start || DEFAULT_START_MARKER})`;
}