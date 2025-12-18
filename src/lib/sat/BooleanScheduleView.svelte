<script lang="ts">
	import type { DPLL } from "$lib/dpll.svelte";
	import type { SchedulingContext } from "$lib/scheduling";

  let {
    ctx,
    split_asg
  }: {
    ctx: SchedulingContext,
    split_asg: { pos_asg: number[], neg_asg: number[] },
  } = $props();

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

  let grid = $derived.by(() => {
    let inside_grid: number[][] = Array.from({length: ctx.time_slots}, () => new Array(ctx.rooms).fill(-1) );

    for (const id of split_asg.pos_asg) {
      if (id < 0) continue; // NOT-assigment
      const { person, room, time_slot } = ctx.recover_field_values(id);

      if (inside_grid[time_slot] === undefined) inside_grid[time_slot] = [];
      inside_grid[time_slot][room] = person;
    }

    return inside_grid;
  })
</script>

<div>
  <table>
    <tbody>
      <tr>
        <td class="h1">Time</td>
      {#each grid[0] as slot, r}
        <th class="h1">Room {r}</th>
      {/each}
      </tr>
      {#each grid as room, r}
        <tr>
          <th class="h2">{r+1}</th>
          {#each room as person, t}
            <td class="text-center">{person >= 0 ? names[person] ? names[person] : "Person" + person : "*"}</td>
          {/each}
        </tr>
      {/each}
  </tbody>
  </table>
</div>