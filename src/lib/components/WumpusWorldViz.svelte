<script lang="ts">
	import type { WumpusWorld } from '$lib/wumpus.svelte';

	import wumpusImg from '$lib/images/monster.svg';
	import pitImg from '$lib/images/pit.svg';
	import goldImg from '$lib/images/gold.svg';
	import stenchImg from '$lib/images/smell.svg';
	import breezeImg from '$lib/images/breeze.svg';
	import glitterImg from '$lib/images/glitter.svg';
	import knightImg from '$lib/images/knight.svg';
	import deathImg from '$lib/images/skull.svg';
	import { randint } from '$lib';

	let {
		world
	}: {
		world: WumpusWorld;
	} = $props();

	let assignment = $derived(world.solution.assignment);

	let asg_grid = $derived.by(() => {
		let asg_grid: Record<string, string[]> = {};

		for (const a of assignment) {
			const full_name = world.ctx.resolve_name(a);
			const name = world.ctx.resolve_name(Math.abs(a));
			const location = name.slice(1);

			if (asg_grid[location] === undefined) asg_grid[location] = [];
			asg_grid[location].push(full_name);
		}

		return asg_grid;
	});
</script>

<div
	class="grid aspect-square w-full grid-flow-col border"
	style="grid-template-columns: repeat({world.size}, minmax(0, 1fr)); grid-template-rows: repeat({world.size}, minmax(0, 1fr));"
>
	{#each world.grid as col, x}
		{#each col as cell, y}
			<div class="relative flex flex-row items-center justify-center border-1">
				{#if cell.discovered}
					<div class="w-5/6">
						{#if cell.Wumpus}
							<img class="jitter drop-shadow-md" src={wumpusImg} alt="W" />
						{:else if cell.Pit}
							<img src={pitImg} alt="P" />
						{:else}
							<div class="grid grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
								{#if cell.Treasure}
									<img class="h-full w-full object-contain drop-shadow-md" src={goldImg} alt="P" />
								{/if}
								{#if cell.Glitter}
									<img class="glitter h-full w-full object-contain" src={glitterImg} alt="G" />
								{/if}
								{#if cell.Breeze}
									<img class="wiggle h-full w-full object-contain" src={breezeImg} alt="B" />
								{/if}
								{#if cell.Stench}
									<img class="waft h-full w-full object-contain" src={stenchImg} alt="S" />
								{/if}
							</div>
						{/if}
					</div>

					{#if x === world.hero.x1 && y === world.hero.x2}
						{#if world.is_dead}
							<div class="absolute flex h-full w-full flex-col items-center justify-center">
								<img
									class="w-1/2 drop-shadow-md"
									style="rotate: {randint(-25, 25)}deg;"
									src={deathImg}
									alt="K"
								/>
							</div>
						{:else}
							<div class="absolute flex h-full w-full flex-col items-center justify-center">
								<img
									class="w-1/2 drop-shadow-md"
									style="rotate: {randint(-25, 25)}deg;"
									src={knightImg}
									alt="K"
								/>
							</div>
						{/if}
					{/if}
				{:else}
					<div class="h-full w-full bg-gray-800 blur-md"></div>
					<div class="absolute font-bold text-white w-full">
						<svg class="w-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <text x="100" y="100" text-anchor="middle" fill="white" alignment-baseline="central" font-size="50" class="font-bold">{x}{y}</text>
						</svg>
					</div>
				{/if}
			</div>
		{/each}
	{/each}
</div>
