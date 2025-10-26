<script lang="ts">
	import { rand, randint } from '$lib';
	import {
		NETWORK_ROMANIA,
		network_to_graph,
		type Network2DNode,
		type NetworkLink
	} from '$lib/network';
	import {
		AStarSearch,
		BestFirstSearch,
		BreadthFirstSearch,
		DeadBranchPruningSearch,
		DepthFirstSearch,
		IterativeDeepeningSearch,
		OptimisticHeuristicSearch,
		OptimisticLookaheadSearch,
		Search,
		SearchResult
	} from '$lib/search.svelte';
	import {
		vadd,
		vaddto,
		vdiff,
		vlen,
		vlendiff,
		vscale,
		vscaleby,
		vset,
		vsub,
		vv
	} from '$lib/vector';
	import { drag, min, zoom } from 'd3';
	import { onMount } from 'svelte';

	let graph_canvas: HTMLCanvasElement;

	let physics = $state({
		zoom: 0.2,
		speed: 1.5,
		spring_stiffness: 0.15,
		node_charge: 1500,
		center_pull: 0.5,
		drag: 0.05
	});

	let w = 700;
	let h = 700;

	let start_id: number = $state(0);
	let goal_id: number = $state(10);

	const raw_data = NETWORK_ROMANIA;
	const nodes_2d: Network2DNode[] = raw_data.nodes.map((n) => {
		return { node: n, pos: vv(rand(w / 4, (3 * w) / 4), rand(h / 4, (3 * h) / 4)), vel: vv(0, 0) };
	});
	const links: NetworkLink[] = raw_data.links.map((v) => v);

	const graph = network_to_graph(raw_data);
	let chosen_algo: new () => Search = $state(OptimisticLookaheadSearch);
	let search_algo = $state(new chosen_algo());

	function random_restart() {
		start_id = randint(0, graph.length);
		goal_id = randint(0, graph.length);
		restart();
	}

	function restart() {
		search_algo = new chosen_algo();
		search_algo.start(graph[start_id], graph[goal_id]);
	}

	function step() {
		const res = search_algo.step();
		search_algo.trace_path();

		if (res === SearchResult.SUCCESS || res === SearchResult.FAILURE) {
			if (is_autostepping) autostep();
		}
	}

	function solve() {
		const rest = search_algo.solve();
		search_algo.trace_path();
	}

	let is_autostepping = $state(false);
	let autostep_timer: number | undefined = undefined;

	function autostep() {
		is_autostepping = !is_autostepping;

		if (is_autostepping) {
			autostep_timer = setInterval(step, 100);
		} else if (autostep_timer !== undefined) {
			clearInterval(autostep_timer);
		}
	}

	onMount(() => {
		graph_canvas.width = w;
		graph_canvas.height = h;
		const ctx = graph_canvas.getContext('2d')!;

		function run() {
			let last_time: number | undefined = undefined;
			let dt: number = 0;

			function sim(timestamp: DOMHighResTimeStamp) {
				if (last_time) {
					dt = Math.min(1, (timestamp - last_time) / 1000);
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

					vaddto(forces[link.source], vscale(dv, dL));
					vaddto(forces[link.target], vscale(dv, -dL));
				}

				for (const [i, node_1] of nodes_2d.entries()) {
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

				for (const [i, node_1] of nodes_2d.entries()) {
					vscaleby(node_1.vel, 1 - physics.drag);
					vaddto(node_1.vel, vscale(forces[i], dt));
					vaddto(node_1.pos, vscale(node_1.vel, dt * physics.speed));
				}

				// do drawing
				ctx.clearRect(0, 0, w, h);

				// draw links
				for (const link of links) {
					const n1 = nodes_2d[link.source];
					const n2 = nodes_2d[link.target];

					ctx.save();
					if (search_algo.link_path.includes(link.id)) {
						ctx.strokeStyle = 'lightcoral';
						ctx.lineWidth = 4;
					}

					ctx.beginPath();
					ctx.moveTo(n1.pos.x, n1.pos.y);
					ctx.lineTo(n2.pos.x, n2.pos.y);
					ctx.stroke();
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
					if (search_algo.current && search_algo.current.state.node.id === node.node.id) {
						if (search_algo.goal && search_algo.goal.node.id === node.node.id) {
							ctx.fillStyle = 'green';
						} else ctx.fillStyle = 'red';
					} else if (search_algo.node_path.includes(node.node.id)) {
						ctx.fillStyle = 'lightcoral';
					} else if (search_algo.goal && search_algo.goal.node.id === node.node.id) {
						ctx.fillStyle = 'lightgreen';
					} else if (search_algo.is_in_frontier(node.node.id)) {
						ctx.fillStyle = 'lightblue';
					} else if (search_algo.reached.has(node.node.id)) {
						ctx.fillStyle = 'black';
					} else if (search_algo.branch_roots.has(node.node.id)) {
						ctx.fillStyle = 'orange';
					}

					ctx.beginPath();
					ctx.ellipse(node.pos.x, node.pos.y, 5, 5, 0, 0, Math.PI * 2);
					ctx.stroke();
					ctx.fill();
				}
				ctx.restore();

				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';

				ctx.save();
				for (const node of nodes_2d) {
					ctx.fillText(node.node.name, node.pos.x, node.pos.y - 11);
				}

				ctx.restore();

				// next frame
				requestAnimationFrame(sim);
			}

			sim(0);
		}
		run();
	});

	random_restart();
</script>

<div class="grid grid-cols-2 gap-2 p-2">
	<canvas bind:this={graph_canvas} class="w-full"></canvas>
	<div class="flex flex-col gap-2">
		<div class="flex flex-row gap-2">
			<button class="border" onclick={random_restart}>Random restart</button>
			<button
				class="border"
				onclick={() => {
					random_restart();
					solve();
				}}>Random solve</button
			>
			<button
				class="border"
				onclick={() => {
					random_restart();
					autostep();
				}}>Random autostep</button
			>
		</div>
		<div class="flex flex-row gap-2">
			<button class="border" onclick={restart}>Restart</button>

			<button class="border" onclick={step}>Step</button>
			<button class="border" onclick={solve}>Solve</button>
			<button
				class="border"
				style="{is_autostepping ? 'background-color: lightcoral' : ''};"
				onclick={autostep}>Autostep</button
			>
			<input
				type="number"
				min="0"
				max={graph.length - 1}
				bind:value={start_id}
				onchange={restart}
			/>
			<input type="number" min="0" max={graph.length - 1} bind:value={goal_id} onchange={restart} />
			<select bind:value={chosen_algo} onchange={restart}>
				<optgroup label="Breadth first">
					<option value={BreadthFirstSearch}>naive breadth first</option>
				</optgroup>
				<optgroup label="Best first">
					<option value={BestFirstSearch}>best first (Dijkstra)</option>
					<option value={AStarSearch}>A* geo distance</option>
				</optgroup>
				<optgroup label="Depth first">
					<option value={DepthFirstSearch}>naive depth first</option>
				</optgroup>
				<optgroup label="Iterative deepening">
					<option value={IterativeDeepeningSearch}>iterative deepening</option>
					<option value={OptimisticLookaheadSearch}>optimistic lookahead</option>
					<option value={DeadBranchPruningSearch}>dead branch pruning</option>
					<option value={OptimisticHeuristicSearch}>optimistic heuristic</option>
				</optgroup>
			</select>
		</div>
		<div class="light-border flex flex-row gap-2">
			<div class="border-r-2 pr-2">Steps: <b>{search_algo.step_count}</b></div>
			<div class="border-r-2 pr-2">Maximal frontier size: <b>{search_algo.frontier_size}</b></div>
			<div>Reached size: <b>{search_algo.reached_size}</b></div>
		</div>
		<div class="flex flex-row justify-evenly gap-2">
			<div class="light-border flex h-full w-1/3 flex-col gap-2">
				<h2>frontier</h2>
				<table>
					<tbody>
						{#each search_algo.frontier as state}
							<tr>
								<td class="w-4" style="color: {'lightblue'}">●</td>
								<td> {state.state.node.name}</td>
								<td><b style="color: lightcoral;">{state.path_cost}</b>+<b style="color: blueviolet;">{state.heuristic.toFixed(1)}</b></td>
								<td>=</td><td> {(state.path_cost + state.heuristic).toFixed(1)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<div class="light-border flex h-full w-1/3 flex-col gap-2">
				<h2>reached</h2>
				<table>
					<tbody>
						{#each search_algo.reached.values() as node}
							<tr><td class="w-4">●</td><td>{node.state.node.name}</td><td>{node.path_cost}</td></tr>
						{/each}
					</tbody>
				</table>
			</div>
			<div class="light-border flex h-full w-1/3 flex-col gap-2">
				<h2>current path</h2>
				<div class="flex grow flex-col">
					{#if search_algo.current?.state.node.id !== search_algo.goal?.node.id}
						<div>
							<b style="color: {'lightgreen'}">GOAL ●</b>
							{search_algo.goal?.node.name}
						</div>
						<div class="flex flex-row items-center bg-gray-100 pl-4 rounded-xl">↑ ···</div>
					{/if}
					{#each search_algo.full_path.entries() as [i, node]}
						<div class="flex flex-col">
							{#if i === search_algo.full_path.length - 1}
								<!-- first node -->
								<div>
									<b style="color: {i === 0 ? 'red' : 'lightcoral'}">START ●</b>
									{node.state.node.name}
								</div>
							{:else if i === 0 && search_algo.goal?.node.id === search_algo.current?.state.node.id}
								<div>
									<b style="color: {'green'}">GOAL REACHED ●</b>
									{node.state.node.name}
								</div>
								<div class="flex flex-row items-center bg-gray-100 pl-4 rounded-xl">
									↑ <span class="text-xs"
										>+{node.action?.weight || 0} = <b>{node.path_cost}</b></span
									>
								</div>
							{:else}
								<div>
									<b style="color: {i === 0 ? 'red' : 'lightcoral'}">{i === 0 ? 'CURRENT' : ''} ●</b
									>
									{node.state.node.name}
								</div>
								<div class="flex flex-row items-center bg-gray-100 pl-4 rounded-xl">
									↑ <span class="text-xs"
										>+{node.action?.weight || 0} = <b>{node.path_cost}</b></span
									>
								</div>
							{/if}
						</div>
					{/each}
					{#if search_algo.full_path.length === 0}
						<div>
							<b style="color: {'red'}">START ●</b>
							{search_algo.current?.state.node.name || 'no start node'}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
