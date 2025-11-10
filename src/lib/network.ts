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

export type NetworkPhysics = {
	zoom: number;
	speed: number;
	spring_stiffness: number;
	node_charge: number;
	center_pull: number;
	drag: number;
	node_radius: number;
};

export const STANDARD_PHYSICS: NetworkPhysics = {
	zoom: 0.5,
	speed: 1.5,
	spring_stiffness: 100,
	node_charge: 5000,
	center_pull: 0.5,
	drag: 0.08,
	node_radius: 7
};

export type MetaInfo = {
	coord?: { lon: number; lat: number };
};

export type GraphNode = { node: NetworkNode; links: GraphLink[] };
export type GraphLink = { id: number; link_id: number; to: GraphNode; weight: number };

export type NetworkData = {
	nodes: NetworkNode[];
	links: NetworkLink[];
	physics: NetworkPhysics;
};

export function network_to_graph(network: NetworkData): GraphNode[] {
	let link_id = 0;
	const nodes: GraphNode[] = network.nodes.map(function (v): GraphNode {
		return { node: v, links: [] };
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
	physics: STANDARD_PHYSICS,
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

export const NETWORK_GERMANY: NetworkData = {
	physics: {...STANDARD_PHYSICS, node_charge: 5000, spring_stiffness: 7.0, zoom: 0.2},
	nodes: [
		{ id: 0, name: 'Berlin', meta: { coord: { lat: 52.5200, lon: 13.4050 } } },
		{ id: 1, name: 'Hamburg', meta: { coord: { lat: 53.5511, lon: 9.9937 } } },
		{ id: 2, name: 'Munich', meta: { coord: { lat: 48.1351, lon: 11.5820 } } },
		{ id: 3, name: 'Cologne', meta: { coord: { lat: 50.9375, lon: 6.9603 } } },
		{ id: 4, name: 'Frankfurt am Main', meta: { coord: { lat: 50.1109, lon: 8.6821 } } },
		{ id: 5, name: 'Stuttgart', meta: { coord: { lat: 48.7758, lon: 9.1829 } } },
		{ id: 6, name: 'Düsseldorf', meta: { coord: { lat: 51.2277, lon: 6.7735 } } },
		{ id: 7, name: 'Dortmund', meta: { coord: { lat: 51.5136, lon: 7.4653 } } },
		{ id: 8, name: 'Leipzig', meta: { coord: { lat: 51.3397, lon: 12.3731 } } },
		{ id: 9, name: 'Bremen', meta: { coord: { lat: 53.0793, lon: 8.8017 } } },
		{ id: 10, name: 'Dresden', meta: { coord: { lat: 51.0504, lon: 13.7373 } } },
		{ id: 11, name: 'Hanover', meta: { coord: { lat: 52.3759, lon: 9.7320 } } },
		{ id: 12, name: 'Nuremberg', meta: { coord: { lat: 49.4521, lon: 11.0767 } } },
		{ id: 13, name: 'Essen', meta: { coord: { lat: 51.4556, lon: 7.0116 } } },
		{ id: 14, name: 'Bonn', meta: { coord: { lat: 50.7374, lon: 7.0982 } } },
		{ id: 15, name: 'Mannheim', meta: { coord: { lat: 49.4875, lon: 8.4660 } } },
		{ id: 16, name: 'Karlsruhe', meta: { coord: { lat: 49.0069, lon: 8.4037 } } },
		{ id: 17, name: 'Freiburg', meta: { coord: { lat: 47.9990, lon: 7.8421 } } },
		{ id: 18, name: 'Kiel', meta: { coord: { lat: 54.3233, lon: 10.1228 } } },
		{ id: 19, name: 'Rostock', meta: { coord: { lat: 54.0924, lon: 12.0991 } } },
		{ id: 20, name: 'Magdeburg', meta: { coord: { lat: 52.1205, lon: 11.6276 } } },
		{ id: 21, name: 'Erfurt', meta: { coord: { lat: 50.9848, lon: 11.0299 } } },
		{ id: 22, name: 'Wiesbaden', meta: { coord: { lat: 50.0826, lon: 8.2493 } } },
		{ id: 23, name: 'Lübeck', meta: { coord: { lat: 53.8655, lon: 10.6866 } } },
		{ id: 24, name: 'Chemnitz', meta: { coord: { lat: 50.8278, lon: 12.9214 } } }
	],
	links: [
		// Northern connections
		{ id: 0, source: 1, target: 9, weight: 120 },
		{ id: 1, source: 1, target: 11, weight: 150 },
		{ id: 2, source: 1, target: 18, weight: 90 },
		{ id: 3, source: 1, target: 23, weight: 70 },
		{ id: 4, source: 18, target: 23, weight: 80 },
		{ id: 5, source: 19, target: 23, weight: 160 },
		{ id: 6, source: 19, target: 0, weight: 230 },
		{ id: 7, source: 11, target: 20, weight: 110 },
		{ id: 8, source: 11, target: 9, weight: 110 },

		// Central & east
		{ id: 9, source: 0, target: 8, weight: 190 },
		{ id: 10, source: 0, target: 10, weight: 190 },
		{ id: 11, source: 0, target: 20, weight: 130 },
		{ id: 12, source: 8, target: 10, weight: 115 },
		{ id: 13, source: 8, target: 20, weight: 110 },
		{ id: 14, source: 8, target: 21, weight: 180 },
		{ id: 15, source: 10, target: 24, weight: 80 },
		{ id: 16, source: 24, target: 21, weight: 150 },

		// West & Rhine-Ruhr
		{ id: 17, source: 3, target: 6, weight: 40 },
		{ id: 18, source: 6, target: 7, weight: 50 },
		{ id: 19, source: 7, target: 13, weight: 20 },
		{ id: 20, source: 13, target: 14, weight: 25 },
		{ id: 21, source: 14, target: 3, weight: 30 },
		{ id: 22, source: 3, target: 4, weight: 190 },
		{ id: 23, source: 4, target: 22, weight: 30 },

		// South & west
		{ id: 24, source: 4, target: 15, weight: 85 },
		{ id: 25, source: 15, target: 16, weight: 55 },
		{ id: 26, source: 16, target: 17, weight: 130 },
		{ id: 27, source: 16, target: 5, weight: 80 },
		{ id: 28, source: 5, target: 12, weight: 215 },
		{ id: 29, source: 12, target: 2, weight: 170 },
		{ id: 30, source: 12, target: 21, weight: 160 },
		{ id: 31, source: 5, target: 2, weight: 220 },
		{ id: 32, source: 2, target: 17, weight: 270 },

		// Extra cross-links for density
		{ id: 33, source: 3, target: 7, weight: 70 },
		{ id: 34, source: 11, target: 7, weight: 160 },
		{ id: 35, source: 20, target: 21, weight: 130 },
		{ id: 36, source: 8, target: 12, weight: 230 },
		{ id: 37, source: 21, target: 4, weight: 200 },
		{ id: 38, source: 0, target: 11, weight: 250 },
		{ id: 39, source: 9, target: 23, weight: 90 }
	]
};

export const NETWORK_MUNICH: NetworkData = {
	physics: {...STANDARD_PHYSICS, node_charge: 7000, spring_stiffness: 10.0, zoom: 0.2},
	nodes: [
		{ id: 0, name: 'Munich Center', meta: { coord: { lat: 48.1372, lon: 11.5756 } } },
		{ id: 1, name: 'Maxvorstadt', meta: { coord: { lat: 48.1500, lon: 11.5670 } } },
		{ id: 2, name: 'Schwabing', meta: { coord: { lat: 48.1630, lon: 11.5810 } } },
		{ id: 3, name: 'Garching Forschungszentrum', meta: { coord: { lat: 48.2670, lon: 11.6740 } } },
		{ id: 4, name: 'Garching', meta: { coord: { lat: 48.2500, lon: 11.6500 } } },
		{ id: 5, name: 'Freimann', meta: { coord: { lat: 48.2000, lon: 11.6200 } } },
		{ id: 6, name: 'Milbertshofen', meta: { coord: { lat: 48.1850, lon: 11.5720 } } },
		{ id: 7, name: 'Olympiapark', meta: { coord: { lat: 48.1745, lon: 11.5510 } } },
		{ id: 8, name: 'Sendling', meta: { coord: { lat: 48.1170, lon: 11.5400 } } },
		{ id: 9, name: 'Thalkirchen', meta: { coord: { lat: 48.0990, lon: 11.5540 } } },
		{ id: 10, name: 'Haidhausen', meta: { coord: { lat: 48.1310, lon: 11.6000 } } },
		{ id: 11, name: 'Bogenhausen', meta: { coord: { lat: 48.1520, lon: 11.6170 } } },
		{ id: 12, name: 'Trudering', meta: { coord: { lat: 48.1250, lon: 11.6500 } } },
		{ id: 13, name: 'Riem', meta: { coord: { lat: 48.1350, lon: 11.6900 } } },
		{ id: 14, name: 'Neuperlach', meta: { coord: { lat: 48.0900, lon: 11.6500 } } },
		{ id: 15, name: 'Perlach', meta: { coord: { lat: 48.0850, lon: 11.6100 } } },
		{ id: 16, name: 'Obersendling', meta: { coord: { lat: 48.0970, lon: 11.5200 } } },
		{ id: 17, name: 'Pasing', meta: { coord: { lat: 48.1470, lon: 11.4500 } } },
		{ id: 18, name: 'Aubing', meta: { coord: { lat: 48.1630, lon: 11.4100 } } },
		{ id: 19, name: 'Moosach', meta: { coord: { lat: 48.1800, lon: 11.5200 } } },
		{ id: 20, name: 'Allach', meta: { coord: { lat: 48.1900, lon: 11.4700 } } },
		{ id: 21, name: 'Feldmoching', meta: { coord: { lat: 48.2160, lon: 11.5500 } } },
		{ id: 22, name: 'Eching', meta: { coord: { lat: 48.3000, lon: 11.6200 } } },
		{ id: 23, name: 'Ismaning', meta: { coord: { lat: 48.2300, lon: 11.6800 } } },
		{ id: 24, name: 'Taufkirchen', meta: { coord: { lat: 48.0500, lon: 11.6200 } } }
	],
	links: [
		// Core Munich
		{ id: 0, source: 0, target: 1, weight: 2 },
		{ id: 1, source: 1, target: 2, weight: 2 },
		{ id: 2, source: 0, target: 10, weight: 3 },
		{ id: 3, source: 1, target: 7, weight: 3 },
		{ id: 4, source: 2, target: 5, weight: 4 },
		{ id: 5, source: 7, target: 6, weight: 2 },
		{ id: 6, source: 6, target: 5, weight: 2 },
		{ id: 7, source: 7, target: 0, weight: 3 },
		{ id: 8, source: 8, target: 0, weight: 4 },
		{ id: 9, source: 8, target: 9, weight: 2 },
		{ id: 10, source: 9, target: 16, weight: 3 },
		{ id: 11, source: 16, target: 17, weight: 7 },
		{ id: 12, source: 17, target: 18, weight: 4 },
		{ id: 13, source: 18, target: 20, weight: 4 },
		{ id: 14, source: 20, target: 19, weight: 3 },
		{ id: 15, source: 19, target: 6, weight: 3 },
		{ id: 16, source: 19, target: 7, weight: 2 },
		{ id: 17, source: 21, target: 5, weight: 5 },
		{ id: 18, source: 21, target: 4, weight: 4 },
		{ id: 19, source: 4, target: 3, weight: 3 },
		{ id: 20, source: 3, target: 22, weight: 4 },
		{ id: 21, source: 22, target: 23, weight: 5 },
		{ id: 22, source: 23, target: 4, weight: 3 },
		{ id: 23, source: 23, target: 11, weight: 7 },
		{ id: 24, source: 11, target: 10, weight: 3 },
		{ id: 25, source: 10, target: 12, weight: 5 },
		{ id: 26, source: 12, target: 13, weight: 3 },
		{ id: 27, source: 13, target: 14, weight: 4 },
		{ id: 28, source: 14, target: 15, weight: 3 },
		{ id: 29, source: 15, target: 9, weight: 3 },
		{ id: 30, source: 15, target: 24, weight: 6 },
		{ id: 31, source: 24, target: 14, weight: 4 },
		{ id: 32, source: 0, target: 6, weight: 3 },
		{ id: 33, source: 7, target: 19, weight: 2 },
		{ id: 34, source: 5, target: 11, weight: 4 },
		{ id: 35, source: 12, target: 11, weight: 3 },
		{ id: 36, source: 13, target: 23, weight: 6 },
		{ id: 37, source: 2, target: 11, weight: 3 },
		{ id: 38, source: 4, target: 5, weight: 5 },
		{ id: 39, source: 20, target: 17, weight: 5 }
	]
};

export const NETWORK_LEFT_HEAVY: NetworkData = (() => {
	const network: NetworkData = {
		physics: { ...STANDARD_PHYSICS, node_charge: 3000, zoom: 25, center_pull: 5 },
		nodes: [{ id: 0, name: 'root' }],
		links: []
	};

	let link_id = 0;
	let node_id = 0;

	const deepen = (depth: number, at: number) => {
		if (depth <= 0) return;

		const left_id = node_id + 1;
		const right_id = node_id + 2;
		node_id += 2;

		network.nodes.push(
			{ id: left_id, name: `L${left_id}` },
			{ id: right_id, name: `R${right_id}` }
		);
		network.links.push(
			{ id: link_id++, source: at, target: left_id, weight: 1 },
			{ id: link_id++, source: at, target: right_id, weight: 1 }
		);
		deepen(depth - 1, left_id);
		deepen(depth - 1, right_id);
	};

	deepen(6, 0);

	return network;
})();
