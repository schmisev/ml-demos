<script lang="ts">
	import type { SAT_Assignment, SAT_Domain } from '$lib/sat.svelte';

	let {
		dom
	}: {
		dom: SAT_Domain;
	} = $props();

	const colormap = ['lightcoral', 'lightgreen', 'lightblue', 'orange'];
</script>

<div class="border w-max flex flex-col gap-1 p-0 text-xs">
	{#each Object.keys(dom) as variable}
		<div
      class="w-full"
		>
			{variable} &in; &lcub;
      {#each dom[variable] as val}
        <span class="pl-1 pr-1" style="background-color: {colormap[val]}">{val}</span>
      {/each}
      &rcub;
		</div>
	{/each}
</div>
