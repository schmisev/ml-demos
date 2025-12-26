<script lang="ts">
	import { randint } from '$lib';
	import WumpusWorldViz from '$lib/components/WumpusWorldViz.svelte';
	import { pl_compiler } from '$lib/fol/pl-compiler';
	import { and, type CNF, type Literal, type LogicExpr } from '$lib/prop-logic';
	import { WumpusWorld } from '$lib/wumpus.svelte';

	const var_pattern = '^(~?)([WSTGPB][0-9][0-9])$';
	const var_regex = RegExp(var_pattern);
  const NO_ERROR = "no error";

	let world = $state(new WumpusWorld(4));
	let query_str: string = $state('');
	let last_query_result = $state(false);
	let query_expr: LogicExpr = $state(and());
  let error_string: string = $state(NO_ERROR);

	function reset() {
		world = new WumpusWorld(randint(3, 7));
	}

	function ask() {
		last_query_result = world.ask(query_expr).result;

		if (last_query_result) {
			world.add_to_kb(query_expr);
		}
	}

	function compile_query() {
    // invalidate last result
    last_query_result = false;
		try {
			query_expr = pl_compiler(world.ctx, query_str);
      error_string = NO_ERROR;
		} catch (e) {
			error_string = "" + e;
		}
	}
</script>

<head>
  <title>Wumpus</title>
</head>

<div class="grid h-dvh min-h-0 grid-cols-2 gap-5 p-2">
	<div class="flex h-full min-h-0 flex-col gap-2">
		<h1>Wumpus World | <a href="../">back</a></h1>
		<div class="flex flex-row flex-wrap gap-2">
			<div class="light-border">
				{world.is_dead ? '💀' : '♥️'}
				{world.fell_in_hole ? 'Fell into pit' : world.died_to_wumpus ? 'Died to Wumpus' : 'Alive'}
			</div>
			<div class="light-border">
				{world.treasure_collected ? '🪙 Treasure found!' : 'Find the treasure!'}
			</div>
			<button class="border" onclick={reset}>Generate new world!</button>
		</div>
		<div class="flex flex-col items-center">
			<div class="grid grid-cols-3 grid-rows-3">
				<div></div>
				<button class="border" onclick={() => world.move_up()}>up</button>
				<div></div>
				<button class="border" onclick={() => world.move_left()}>left</button>
				<div></div>
				<button class="border" onclick={() => world.move_right()}>right</button>
				<div></div>
				<button class="border" onclick={() => world.move_down()}>down</button>
				<div></div>
			</div>
		</div>
		<div class="light-border">
			<h2>Local rules</h2>
			<div>
				{@html world.ctx.format(world.local_cell.rules)}
			</div>
		</div>

		<div class="light-border">
			<h2>Current observation</h2>
			<div>
				{@html world.ctx.format(world.local_cell.state)}
			</div>
		</div>

		<div class="light-border grow overflow-auto">
			<h2>CNF ({world.full_cnf.clauses.length} clauses)</h2>
			{@html world.ctx.format(world.full_cnf, '<br>')}
		</div>
	</div>

	<div class="flex flex-col items-center gap-2">
		<div class="flex flex-row flex-wrap items-center gap-2 text-2xl">
			<label class="flex flex-row items-center gap-2"
				>Query:<input bind:value={query_str} oninput={compile_query} onchange={ask} /></label
			>
		</div>
		<div>
			<b>{@html world.ctx.format(query_expr)}</b>
			{#if last_query_result}
				is TRUE
			{/if}
		</div>
    <div class="text-red-600 font-bold">{error_string}</div>
		<div class="w-8/9 max-w-200">
			<WumpusWorldViz {world}></WumpusWorldViz>
		</div>
		<div class="flex flex-col gap-2">
			<div class="light-border">
				<h2>Variable types</h2>
				<div class="grid grid-cols-2 gap-2">
					<div>W = Wumpus</div>
					<div>S = Stench</div>
					<div>T = Treasure</div>
					<div>G = Glitter</div>
					<div>P = Pit</div>
					<div>B = Breeze</div>
				</div>
			</div>
		</div>
	</div>
</div>
