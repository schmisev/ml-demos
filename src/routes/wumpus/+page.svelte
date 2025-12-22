<script lang="ts">
	import { randint } from '$lib';
	import WumpusWorldViz from '$lib/components/WumpusWorldViz.svelte';
	import type { CNF } from '$lib/resolution';
	import { WumpusWorld } from '$lib/wumpus.svelte';

	let world = $state(new WumpusWorld(4));
  let query = $state("W00");
  let last_query = $state(world.ctx.lit(query));
  let last_query_result: { result: boolean, cnf: CNF } = $state({result: false, cnf: {kind: "CNF", clauses: []}});

	function reset() {
		world = new WumpusWorld(randint(4, 8));
	}

  function ask() {
    let negated = false;
    let name = query;
    if (query[0] === "~") {
      negated = true;
      name = name.slice(1);
    }
    last_query = world.ctx.lit(name, negated);
    last_query_result = world.ask(last_query);
  }
</script>

<div class="grid grid-cols-2 gap-5 p-2">
	<div class="flex flex-col gap-2">
		<h1>Wumpus world | <a href="../">back</a></h1>
		<div class="flex flex-row gap-2">
			<div class="light-border">
				{world.is_dead ? '💀' : '♥️'}
				{world.fell_in_hole ? 'Fell into pit' : world.died_to_wumpus ? 'Died to Wumpus' : 'Alive'}
			</div>
			<div class="light-border">
				{world.treasure_collected ? '🪙 Treasure found!' : '❓ Find the treasure!'}
			</div>
		</div>
		<div class="flex flex-row">
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
		<div class="flex flex-row items-center flex-wrap gap-2">
			<button class="border" onclick={reset}>reset</button>
      <label class="light-border flex flex-row items-center gap-2">Query:<input bind:value={query}></label>
      <button class="border" onclick={ask}>query!</button>
      <div>{last_query_result.result ? `${world.ctx.format(last_query)} is TRUE` : `${world.ctx.format(last_query)} could not be decided!` }</div>
    </div>
		<table>
			<tbody>
				<tr>
					<th>Local rules</th><td>{@html world.ctx.format(world.local_cell.rules)}</td>
				</tr>
				<tr>
					<th>Current observation</th><td>{@html world.ctx.format(world.local_cell.state)}</td>
				</tr>
			</tbody>
		</table>

		<div class="flex flex-row gap-2">
			<div class="light-border grow">
				<h2>CNF</h2>
				{@html world.ctx.format(world.full_cnf, '<br>')}
			</div>
		</div>
	</div>

	<div class="flex flex-col items-center gap-2">
		<div class="w-8/9">
			<WumpusWorldViz {world}></WumpusWorldViz>
		</div>
	</div>
</div>
