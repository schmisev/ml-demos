<script lang="ts">
	import type { SAT_Problem, SAT_Solver } from '$lib/sat.svelte';

	let { solver, colormap }: { solver: SAT_Solver, colormap: string[] } = $props();

	let grid = $derived.by(() => {
		const inner_grid: (number | undefined)[][] = [
			[undefined, undefined, undefined, undefined],
      [undefined, undefined, undefined, undefined],
      [undefined, undefined, undefined, undefined],
      [undefined, undefined, undefined, undefined],
		];

		const asg = solver.current_asg || solver.csp.init_asg;

    console.log(asg);
		for (const variable in asg) {
			console.log(variable);
      const value = asg[variable];
			if (value === undefined) continue;

			const [F, r, c] = variable.split('');
			const ri = parseInt(r) - 1;
			const ci = parseInt(c) - 1;

      console.log(ri, ci, r, c);
			inner_grid[ri][ci] = value;
		}
		return inner_grid;
	});
</script>

<div class="light-border">
  <h2>sudoku view</h2>
  <div class="grid grid-cols-4 grid-rows-4">
    {#each grid as row, i}
      {#each row as cell, j}
        <div style="{cell !== undefined ? `background-color: ${colormap[cell]}` : ""}" class="flex h-10 w-10 flex-row items-center justify-center text-center border-1 {(j === 1 ? "border-r-2" : "")} {(i === 1 ? "border-b-2" : "")}">{cell}</div>
      {/each}
    {/each}
  </div>
</div>
