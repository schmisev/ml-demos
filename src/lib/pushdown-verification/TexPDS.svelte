<script lang="ts">
	import { tex } from '$lib/mathjax';
	import { tex_loc, tex_stack_sequence, tex_stack_symbol, type PDS } from './pds.svelte';

	let { pds }: { pds: PDS } = $props();
</script>

<div class="flex flex-col gap-2">
	{@html tex(`P = \\{ ${[...pds.locs.values().map((l) => tex_loc(l))].toSorted().join(',')} \\}`)}
	{@html tex(
		`\\Gamma = \\{ ${[...pds.alphabet.values().map((l) => tex_stack_symbol(l))].toSorted().join(',')} \\}`
	)}
	{@html tex(`\\Delta = \\{`)}
	{#each pds.rules as [from, popped, to, pushed]}
		<span class="pl-3"
			>{@html tex(
				`(${tex_loc(from)}, ${tex_stack_symbol(popped)}, ${tex_loc(to)}, ${tex_stack_sequence(pushed)}),`
			)}</span
		>
	{/each}
	{@html tex(`\\}`)}
</div>
