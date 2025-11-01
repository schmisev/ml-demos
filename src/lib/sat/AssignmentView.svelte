<script lang="ts">
	import type { SAT_Assignment } from '$lib/sat.svelte';
	import { flip } from 'svelte/animate';

	let {
		asg
	}: {
		asg: SAT_Assignment;
	} = $props();

	const colormap = ['lightcoral', 'lightgreen', 'lightblue', 'orange'];
</script>

<div class="border w-max flex flex-col gap-1 p-0 text-xs">
	{#each Object.keys(asg) as variable}
		<div
      class="w-full"
			style="background-color: {asg[variable] !== undefined ? colormap[asg[variable]] : 'white'}"
		>
			{variable} = {asg[variable] !== undefined ? asg[variable] : "..."}
		</div>
	{/each}
</div>
