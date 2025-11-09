<script lang="ts">
	import type { WumpusWorld } from '$lib/wumpus.svelte';

	import wumpusImg from '$lib/images/monster.svg';
	import pitImg from '$lib/images/pit.svg';
	import goldImg from '$lib/images/gold.svg';
	import stenchImg from '$lib/images/smell.svg';
	import breezeImg from '$lib/images/breeze.svg';
	import glitterImg from '$lib/images/glitter.svg';
  import knightImg from '$lib/images/knight.svg';
	import { randint } from '$lib';

	let {
		world
	}: {
		world: WumpusWorld;
	} = $props();
</script>

<div
	class="grid aspect-square w-1/3 grid-flow-col border"
	style="grid-template-columns: repeat({world.size}, minmax(0, 1fr)); grid-template-rows: repeat({world.size}, minmax(0, 1fr));"
>
	{#each world.grid as col, x}
		{#each col as cell, y}
			<div class="flex flex-row items-center justify-center border-1 relative">
				{#if cell.discovered}
        <div class="w-5/6">
        {#if cell.Wumpus}
					<img class="drop-shadow-md jitter" src={wumpusImg} alt="W" />
				{:else if cell.Pit}
					<img src={pitImg} alt="P" />
				{:else}
					<div class="grid grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
						{#if cell.Treasure}
							<img class="drop-shadow-md w-full h-full object-contain" src={goldImg} alt="P" />
						{/if}
						{#if cell.Glitter}
							<img class="w-full h-full object-contain" src={glitterImg} alt="G" />
						{/if}
						{#if cell.Breeze}
							<img class="w-full h-full object-contain wiggle" src={breezeImg} alt="B" />
						{/if}
            {#if cell.Stench}
							<img class="w-full h-full object-contain waft" src={stenchImg} alt="S" />
						{/if}
					</div>
				{/if}
        </div>

        {#if x === world.hero.x && y === world.hero.y}
        <div class="absolute w-full h-full flex flex-col items-center justify-center">
          <img class="w-1/2 drop-shadow-md" style="rotate: {randint(-25, 25)}deg;" src={knightImg} alt="K">
        </div>
        {/if}

        {:else}
          <div class="bg-gray-800 w-full h-full blur-md"></div>
        {/if}
			</div>
		{/each}
	{/each}
</div>