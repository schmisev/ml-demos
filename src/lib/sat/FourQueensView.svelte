<script lang="ts">
	import type { SAT_Assignment, SAT_Problem } from '$lib/sat.svelte';
	import ChessQueenImg from '$lib/images/chess-queen.svg';
	import CrossImg from '$lib/images/simple-cross.svg';

	let { asg, colormap }: { asg: SAT_Assignment; colormap: string[] } = $props();

  let N = $derived(Object.keys(asg).length);
  let L = $derived(Math.round(Math.sqrt(N)));

	let grid = $derived.by(() => {
		const inner_grid: (number | undefined)[][] = [...new Array(L)].map((v) => [...new Array(L).fill(undefined)]);

		for (let i = 0; i < L; i++) {
      for (let j = 0; j < L; j++) {
        inner_grid[i][j] = asg[`F${i+1}${j+1}`];
      }
    }

    console.log(inner_grid);

		return inner_grid;
	});
</script>

<div class="w-full max-w-80 border grid aspect-square w-full" style="grid-template-columns: repeat({L}, minmax(0, 1fr)); grid-template-rows: repeat({L}, minmax(0, 1fr));">
	{#each grid as row, i}
		{#each row as cell, j}
			<div
				class="flex flex-row items-center justify-center text-center {(i + j) % 2 === 1
					? 'bg-gray-200'
					: 'bg-white'}"
			>
				{#if cell !== undefined}
					{#if cell}
						<img class="w-6/7" src={ChessQueenImg} alt="♛" />
					{:else}
						<img class="w-6/7" src={CrossImg} alt="×" />
					{/if}
				{/if}
			</div>
		{/each}
	{/each}
</div>
