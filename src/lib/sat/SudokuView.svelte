<script lang="ts">
	import type { SAT_Assignment, SAT_Domain, SAT_Problem, SAT_Solver } from '$lib/sat.svelte';

	let { asg, dom, colormap }: { asg: SAT_Assignment; dom: SAT_Domain; colormap: string[] } =
		$props();

	let N = $derived(Object.keys(asg).length);
	let L = $derived(Math.round(Math.sqrt(N)));
	let M = $derived(Math.round(Math.sqrt(L)));

	let grid = $derived.by(() => {
		const asg_grid: [(number | undefined), number[]][][] = [...new Array(L)].map((v) => [...new Array(L).fill(undefined)]);

		for (let i = 0; i < L; i++) {
			for (let j = 0; j < L; j++) {
				asg_grid[i][j] = [asg[`F${i + 1}${j + 1}`], dom[`F${i + 1}${j + 1}`]];
			}
		}

		return asg_grid;
	});
</script>

<div
	class="grid aspect-square w-full max-w-80 border"
	style="grid-template-columns: repeat({L}, minmax(0, 1fr)); grid-template-rows: repeat({L}, minmax(0, 1fr));"
>
	{#each grid as row, i}
		{#each row as cell, j}
			<!-- cell container -->
			<div
				class="flex flex-row aspect-square items-center justify-center overflow-hidden border-1 text-center {j %
					M ===
				M - 1
					? 'border-r-2'
					: ''} {i % M === M - 1 ? 'border-b-2' : ''}"
			>
				{#if cell[0] === undefined}
        <!-- value is unclear -->
					<div class="grid h-full w-full" style="grid-template-columns: repeat({M}, minmax(0, 1fr));">
						{#each [...new Array(L)].map((v, i ) => i+1) as val}
							<div class="text-xs w-full h-full border-1 border-white" style="background-color: {cell[1].includes(val) ? colormap[val] : "white"};">
                
              </div>
						{/each}
					</div>
				{:else}
        <!-- value is fixed -->
					<div class="flex flex-row font-bold items-center justify-center h-full w-full" style="font-size: {4 / M}rem" >
						{cell[0]}
					</div>
				{/if}
			</div>
		{/each}
	{/each}
</div>
