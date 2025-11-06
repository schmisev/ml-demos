<script lang="ts">
	import type { SAT_Assignment, SAT_Problem, SAT_Solver } from '$lib/sat.svelte';

	let { asg, colormap }: { asg: SAT_Assignment; colormap: string[] } = $props();

	let N = $derived(Object.keys(asg).length);
	let L = $derived(Math.round(Math.sqrt(N)));
  let M = $derived(Math.round(Math.sqrt(L)));

	let grid = $derived.by(() => {
		const inner_grid: (number | undefined)[][] = [...new Array(L)].map((v) => [
			...new Array(L).fill(undefined)
		]);

		for (let i = 0; i < L; i++) {
			for (let j = 0; j < L; j++) {
				inner_grid[i][j] = asg[`F${i + 1}${j + 1}`];
			}
		}

		console.log(inner_grid);

		return inner_grid;
	});
</script>

<div
	class="grid aspect-square w-full max-w-80 border"
	style="grid-template-columns: repeat({L}, minmax(0, 1fr)); grid-template-rows: repeat({L}, minmax(0, 1fr));"
>
	{#each grid as row, i}
		{#each row as cell, j}
			<div
				style={cell !== undefined ? `background-color: ${colormap[cell]}` : ''}
				class="flex flex-row items-center justify-center border-1 text-center aspect-square overflow-hidden {j % M === M-1
					? 'border-r-2'
					: ''} {i % M === M-1 ? 'border-b-2' : ''}"
			>
				{cell}
			</div>
		{/each}
	{/each}
</div>
