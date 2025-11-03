<script lang="ts">
	import type { SAT_Constraint } from '$lib/sat.svelte';

	let { constraint }: { constraint: SAT_Constraint } = $props();
  let constraint_txt = $derived(constraint.vars.join(" " + constraint.op + " "));
</script>

<div class="border flex flex-row">
  {#if constraint.op === "+"}
    ( {constraint_txt} ) &leq; 1
  {:else}
    {constraint_txt}
  {/if}
</div>
