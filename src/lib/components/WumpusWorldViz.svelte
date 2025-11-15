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

					{#if x === world.hero.x && y === world.hero.y}
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
				{/if}
			</div>
		{/each}
	{/each}
</div>
