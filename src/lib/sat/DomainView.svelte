<script lang="ts">
	import type { SAT_Assignment, SAT_Domain } from '$lib/sat.svelte';

	let {
    colormap,
		dom
	}: {
    colormap: string[],
		dom: SAT_Domain;
	} = $props();
</script>

<div class="border w-max flex flex-col gap-1 p-0 text-xs">
	{#each Object.keys(dom) as variable}
		<div
      class="w-full"
		>
			{variable} &in; &lcub;
      {#each dom[variable] as val}
        <span class="pl-1 pr-1 rounded-xs" style="background-color: {colormap[val]}">{val}</span>
      {/each}
      &rcub;
		</div>
	{/each}
</div>
