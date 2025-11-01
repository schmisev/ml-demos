<script lang="ts">
	import type { SAT_Assignment } from '$lib/sat.svelte';
	import { flip } from 'svelte/animate';

	let {
    colormap,
		asg
	}: {
    colormap: string[],
		asg: SAT_Assignment;
	} = $props();
</script>

<div class="border w-max flex flex-col gap-1 p-0 text-xs">
	{#each Object.keys(asg) as variable}
		<div
      class="w-full rounded-xs pl-2 pr-2"
			style="background-color: {asg[variable] !== undefined ? colormap[asg[variable]] : 'white'}"
		>
			{variable} = {asg[variable] !== undefined ? asg[variable] : "..."}
		</div>
	{/each}
</div>
