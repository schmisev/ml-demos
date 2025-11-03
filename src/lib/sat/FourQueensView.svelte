<script lang="ts">
	import type { SAT_Assignment, SAT_Problem } from '$lib/sat.svelte';
  import ChessQueenImg from "$lib/images/chess-queen.svg";
  import CrossImg from "$lib/images/simple-cross.svg";

	let { asg, colormap }: { asg: SAT_Assignment; colormap: string[] } = $props();

	let grid = $derived.by(() => {
		const inner_grid: (number | undefined)[][] = [
			[undefined, undefined, undefined, undefined],
			[undefined, undefined, undefined, undefined],
			[undefined, undefined, undefined, undefined],
			[undefined, undefined, undefined, undefined]
		];

		for (const variable in asg) {
			const value = asg[variable];
			if (value === undefined) continue;

			const [F, r, c] = variable.split('');
			const ri = parseInt(r) - 1;
			const ci = parseInt(c) - 1;

			inner_grid[ri][ci] = value;
		}
		return inner_grid;
	});
</script>

<div class="light-border">
	<div class="w-full aspect-square grid grid-cols-4 grid-rows-4">
		{#each grid as row, i}
			{#each row as cell, j}
				<div
					class="flex flex-row items-center justify-center text-center {(i + j) % 2 === 1
						? 'bg-gray-200'
						: 'bg-white'}"
				>
          {#if cell !== undefined}
            {#if cell}
              <img class="w-6/7" src={ChessQueenImg} alt="♛">
            {:else}
              <img class="w-6/7" src={CrossImg} alt="×">
            {/if}
          {/if}
				</div>
			{/each}
		{/each}
	</div>
</div>
