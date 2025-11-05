<script lang="ts">
	import type { SAT_Assignment, SAT_Problem, SAT_Solver } from '$lib/sat.svelte';

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

<div class="w-full max-w-80 grid aspect-square grid-cols-4 grid-rows-4">
	{#each grid as row, i}
		{#each row as cell, j}
			<div
				style={cell !== undefined ? `background-color: ${colormap[cell]}` : ''}
				class="flex flex-row items-center justify-center border-1 text-center {j === 1
					? 'border-r-2'
					: ''} {i === 1 ? 'border-b-2' : ''}"
			>
				{cell}
			</div>
		{/each}
	{/each}
</div>
