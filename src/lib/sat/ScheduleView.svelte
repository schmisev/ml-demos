<script lang="ts">
	import type { SAT_Assignment, SAT_Domain } from "$lib/sat.svelte";

	let { asg, dom, colormap }: { asg: SAT_Assignment; dom: SAT_Domain; colormap: string[] } =
		$props();

	let grid = $derived.by(() => {
		const inner_grid: [number | undefined, number[]][][] = [];

		for (const v in dom) {
			const [txt_room, txt_time] = v.split('_');
			const r = parseInt(txt_room.slice(1));
			const t = parseInt(txt_time.slice(1));

			if (!inner_grid[t]) inner_grid[t] = [];
			inner_grid[t][r] = [asg[v], dom[v]];
		}

		return inner_grid;
	});

  let names = [
    "Albert",
    "Brenda",
    "Carlos",
    "Dana",
    "Eric",
    "Frieda",
    "George",
    "Hilary",
    "Igor",
    "Jenna",
    "Kenny"
  ]

  let shortened_name = names.map((n) => n[0]);
</script>

<div class="border">
	<table>
		<tbody>
      <tr>
        <td>Time</td>
      {#each grid[0] as slot, r}
        <th>Room {r}</th>
      {/each}
      </tr>
			{#each grid as room, r}
				<tr>
          <th>{r+1}</th>
					{#each room as slot}
            {#if slot[0] === undefined}
              <td class="max-w-4 overflow-clip text-center">
                {#each slot[1] as s}
                  <span class="font-bold text-xs">{shortened_name[s]}</span>
                {/each}
              </td>
            {:else}
              <td class="max-w-4 overflow-clip" style="background-color: {colormap[slot[0]]};">
                {names[slot[0]]}
              </td>
            {/if}
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
