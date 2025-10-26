export type NetworkNode = { id: number; name: string; meta?: MetaInfo };
export type NetworkLink = { id: number; source: number; target: number; weight: number };
export type Network2DNode = {
	node: NetworkNode;
	pos: { x: number; y: number };
	vel: { x: number; y: number };
	grabbed: boolean;
  hovered: boolean;
  discovered: boolean;
};

export type MetaInfo = {
	coord?: { lon: number; lat: number };
};

export type GraphNode = { node: NetworkNode; links: GraphLink[] };
export type GraphLink = { id: number; link_id: number; to: GraphNode; weight: number };

export type NetworkData = {
	nodes: NetworkNode[];
	links: NetworkLink[];
};

export function network_to_graph(network: NetworkData): GraphNode[] {
	let link_id = 0;
	const nodes: GraphNode[] = network.nodes.map((v) => {
		return { node: v, links: [], parent: undefined, cost: 0 };
	});

	for (const link of network.links) {
		const source = nodes[link.source];
		const target = nodes[link.target];

		source.links.push({ id: link_id++, link_id: link.id, to: target, weight: link.weight });
		target.links.push({ id: link_id++, link_id: link.id, to: source, weight: link.weight });
	}

	return nodes;
}

export const NETWORK_ROMANIA: NetworkData = {
	nodes: [
		{ id: 0, name: 'Arad', meta: { coord: { lat: 46.1667, lon: 21.3167 } } },
		{ id: 1, name: 'Zerind', meta: { coord: { lat: 46.6167, lon: 21.5167 } } },
		{ id: 2, name: 'Oradea', meta: { coord: { lat: 47.0722, lon: 21.9211 } } },
		{ id: 3, name: 'Sibiu', meta: { coord: { lat: 45.7928, lon: 24.1522 } } },
		{ id: 4, name: 'Timișoara', meta: { coord: { lat: 45.7489, lon: 21.2087 } } },
		{ id: 5, name: 'Lugoj', meta: { coord: { lat: 45.6886, lon: 21.9031 } } },
		{ id: 6, name: 'Mehadia', meta: { coord: { lat: 44.9, lon: 22.3667 } } },
		{ id: 7, name: 'Dobreta', meta: { coord: { lat: 44.6369, lon: 22.6597 } } },
		{ id: 8, name: 'Craiova', meta: { coord: { lat: 44.3167, lon: 23.8 } } },
		{ id: 9, name: 'Râmnicu Vâlcea', meta: { coord: { lat: 45.1, lon: 24.3667 } } },
		{ id: 10, name: 'Pitești', meta: { coord: { lat: 44.8565, lon: 24.8692 } } },
		{ id: 11, name: 'Bucharest', meta: { coord: { lat: 44.4325, lon: 26.1039 } } },
		{ id: 12, name: 'Făgăraș', meta: { coord: { lat: 45.8411, lon: 24.9739 } } },
		{ id: 13, name: 'Giurgiu', meta: { coord: { lat: 43.9, lon: 25.9667 } } },
		{ id: 14, name: 'Urziceni', meta: { coord: { lat: 44.7167, lon: 26.6333 } } },
		{ id: 15, name: 'Hârșova', meta: { coord: { lat: 44.6833, lon: 27.9333 } } },
		{ id: 16, name: 'Eforie', meta: { coord: { lat: 44.0667, lon: 28.6333 } } },
		{ id: 17, name: 'Vaslui', meta: { coord: { lat: 46.6333, lon: 27.7333 } } },
		{ id: 18, name: 'Iași', meta: { coord: { lat: 47.1622, lon: 27.5889 } } },
		{ id: 19, name: 'Neamț', meta: { coord: { lat: 46.9333, lon: 26.3667 } } }
	],
	links: [
		{ id: 0, source: 0, target: 1, weight: 75 },
		{ id: 1, source: 1, target: 2, weight: 71 },
		{ id: 2, source: 2, target: 3, weight: 151 },
		{ id: 3, source: 0, target: 4, weight: 118 },
		{ id: 4, source: 0, target: 3, weight: 140 },
		{ id: 5, source: 4, target: 5, weight: 111 },
		{ id: 6, source: 5, target: 6, weight: 70 },
		{ id: 7, source: 6, target: 7, weight: 75 },
		{ id: 8, source: 7, target: 8, weight: 120 },
		{ id: 9, source: 8, target: 9, weight: 146 },
		{ id: 10, source: 3, target: 9, weight: 80 },
		{ id: 11, source: 8, target: 10, weight: 138 },
		{ id: 12, source: 9, target: 10, weight: 97 },
		{ id: 13, source: 10, target: 11, weight: 101 },
		{ id: 14, source: 3, target: 12, weight: 99 },
		{ id: 15, source: 12, target: 11, weight: 211 },
		{ id: 16, source: 11, target: 13, weight: 90 },
		{ id: 17, source: 13, target: 14, weight: 85 },
		{ id: 18, source: 14, target: 15, weight: 98 },
		{ id: 19, source: 15, target: 16, weight: 86 },
		{ id: 20, source: 14, target: 17, weight: 142 },
		{ id: 21, source: 17, target: 18, weight: 92 },
		{ id: 22, source: 18, target: 19, weight: 87 }
	]
};
