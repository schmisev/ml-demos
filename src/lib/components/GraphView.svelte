<script lang="ts">
	import { get_mouse_on_canvas, rand, randint } from '$lib';
	import {
		network_to_graph,
		type GraphNode,
		type Network2DNode,
		type NetworkData,
		type NetworkLink,
		type NetworkPhysics
	} from '$lib/network';
	import { Search } from '$lib/search.svelte';
	import { vaddto, vlen, vlendiff, vscale, vscaleby, vsub, vv, type Vector2 } from '$lib/vector';
	import { onMount } from 'svelte';

	let {
		dataset = $bindable(),
		show_undiscovered = true,
		w = 700,
		h = 700,
		search_algo
	}: {
		dataset: NetworkData;
		show_undiscovered?: boolean;
		w?: number;
		h?: number;
		search_algo?: Search;
	} = $props();

	let graph_canvas: HTMLCanvasElement;
	let physics: NetworkPhysics;
	let nodes_2d: Network2DNode[];
	let links: NetworkLink[];
	let graph: GraphNode[] = $state(network_to_graph(dataset));

	$effect(() => {
		physics = dataset.physics;
		nodes_2d = dataset.nodes.map((n) => {
			return {
				node: n,
				pos: vv(rand(w / 4, (3 * w) / 4), rand(h / 4, (3 * h) / 4)),
				vel: vv(0, 0),
				grabbed: false,
				hovered: false,
				discovered: false
			};
		});
		links = dataset.links.map((v) => v);
		graph = network_to_graph(dataset);
    undiscover();
	});

	function undiscover() {
		for (const node of nodes_2d) {
			node.discovered = false;
		}
	}

	onMount(() => {
		let mouse: Vector2 = vv();
		let mouse_just_down: boolean = false;
		let mouse_down: boolean = false;

		graph_canvas.onpointermove = (ev) => {
			mouse = get_mouse_on_canvas(graph_canvas, ev);
		};

		graph_canvas.onpointerdown = (ev) => {
			graph_canvas.setPointerCapture(ev.pointerId);
			mouse_just_down = true;
			mouse_down = true;
		};

		graph_canvas.onpointerup = (ev) => {
			graph_canvas.releasePointerCapture(ev.pointerId);
			mouse_down = false;
		};

		graph_canvas.width = w;
		graph_canvas.height = h;
		const ctx = graph_canvas.getContext('2d')!;

		function isInNode(mouse: Vector2, node: Network2DNode) {
			return vlendiff(mouse, node.pos) < physics.node_radius * 2;
		}

		function run() {
			let last_time: number | undefined = undefined;
			let dt: number = 0;

			function sim(timestamp: DOMHighResTimeStamp) {
				if (last_time) {
					dt = Math.min(0.02, (timestamp - last_time) / 1000);
				}
				last_time = timestamp;
				// do sim
				const forces: { x: number; y: number }[] = nodes_2d.map((n) => {
					return { x: 0, y: 0 };
				});

				for (const link of links) {
					const dv = vsub(nodes_2d[link.source].pos, nodes_2d[link.target].pos);
					const L = vlen(dv);
					const dL = (link.weight * physics.zoom - L) * physics.spring_stiffness; // negative --> push apart

					vaddto(forces[link.source], vscale(dv, dL / vlen(dv)));
					vaddto(forces[link.target], vscale(dv, -dL / vlen(dv)));
				}

				for (const [i, node_1] of nodes_2d.entries()) {
					// check if discovered
					if (!node_1.discovered && search_algo && search_algo.discovered.has(node_1.node.id)) {
						node_1.discovered = true;
					}

					// central force
					const c = vv(w / 2, h / 2);
					const dc = vsub(c, node_1.pos);

					vaddto(forces[i], vscale(dc, physics.center_pull));

					// force between points
					for (const [j, node_2] of nodes_2d.entries()) {
						if (i < j) {
							const dv = vsub(node_1.pos, node_2.pos);
							const L = vlen(dv);
							const dL = physics.node_charge / (1 + L) ** 2;

							vaddto(forces[i], vscale(dv, dL));
							vaddto(forces[j], vscale(dv, -dL));
						}
					}
				}

				let already_hovered = false;
				for (const [i, node_1] of nodes_2d.entries()) {
					// grabbing
					if (!already_hovered && isInNode(mouse, node_1)) {
						if (mouse_just_down) node_1.grabbed = true;
						node_1.hovered = true;
						already_hovered = true;
					} else {
						node_1.hovered = false;
					}
					if (!mouse_down) {
						node_1.grabbed = false;
					}

					if ((show_undiscovered || node_1.discovered) && node_1.grabbed && mouse_down) {
						/*
            const dv = vsub(mouse, node_1.pos);
            const L = vlen(dv);
            vaddto(forces[node_1.node.id], vscale(dv, L * physics.spring_stiffness));
            */
						node_1.pos = mouse;
					} else {
						vscaleby(node_1.vel, 1 - physics.drag);
						vaddto(node_1.vel, vscale(forces[i], dt));
						vaddto(node_1.pos, vscale(node_1.vel, dt * physics.speed));
					}
				}

				// do drawing
				ctx.clearRect(0, 0, w, h);

				// draw links
				for (const link of links) {
					const n1 = nodes_2d[link.source];
					const n2 = nodes_2d[link.target];

					ctx.save();
					if (show_undiscovered || (n1.discovered && n2.discovered)) {
						if (search_algo && search_algo.link_path.includes(link.id)) {
							ctx.strokeStyle = 'lightcoral';
							ctx.lineWidth = 4;
						}

						ctx.beginPath();
						ctx.moveTo(n1.pos.x, n1.pos.y);
						ctx.lineTo(n2.pos.x, n2.pos.y);
						ctx.stroke();
					}
					ctx.restore();
				}

				ctx.save();
				ctx.shadowBlur = 5;
				ctx.shadowOffsetX = 2;
				ctx.shadowOffsetY = 2;
				ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';

				// draw nodes
				for (const node of nodes_2d) {
					ctx.fillStyle = 'white';
					// discover nodes
					if (search_algo) {
						const in_frontier = search_algo.is_in_frontier(node.node.id);

						if (search_algo.current && search_algo.current.state.node.id === node.node.id) {
							if (search_algo.goal && search_algo.goal.node.id === node.node.id) {
								ctx.fillStyle = 'green';
							} else ctx.fillStyle = 'red';
						} else if (search_algo.node_path.includes(node.node.id)) {
							ctx.fillStyle = 'lightcoral';
						} else if (search_algo.goal && search_algo.goal.node.id === node.node.id) {
							ctx.fillStyle = 'lightgreen';
						} else if (in_frontier) {
							ctx.fillStyle = 'lightblue';
						} else if (search_algo.reached.has(node.node.id)) {
							ctx.fillStyle = 'black';
						} else if (search_algo.branch_roots.has(node.node.id)) {
							ctx.fillStyle = 'orange';
						}
					}

					if (show_undiscovered || node.discovered) {
						ctx.beginPath();
						ctx.ellipse(
							node.pos.x,
							node.pos.y,
							physics.node_radius,
							physics.node_radius,
							0,
							0,
							Math.PI * 2
						);
						ctx.stroke();
						ctx.fill();

						if (node.grabbed) {
							ctx.beginPath();
							ctx.ellipse(
								node.pos.x,
								node.pos.y,
								physics.node_radius * 2,
								physics.node_radius * 2,
								0,
								0,
								Math.PI * 2
							);
							ctx.stroke();
						}

						ctx.save();
						if (node.hovered || node.grabbed) {
							ctx.beginPath();
							ctx.fillStyle = 'yellow';
							ctx.ellipse(
								node.pos.x,
								node.pos.y,
								physics.node_radius,
								physics.node_radius,
								0,
								0,
								Math.PI * 2
							);
							ctx.fill();
						}
						ctx.restore();
					}
				}
				ctx.restore();

				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';

				ctx.save();
				for (const node of nodes_2d) {
					if (show_undiscovered || node.discovered) {
						ctx.fillText(node.node.name, node.pos.x, node.pos.y - physics.node_radius * 2);
					}
				}

				ctx.restore();

				// reset mouse down
				mouse_just_down = false;

				// next frame
				requestAnimationFrame(sim);
			}

			sim(0);
		}
		run();
	});
</script>

<canvas bind:this={graph_canvas} class="w-full"></canvas>
