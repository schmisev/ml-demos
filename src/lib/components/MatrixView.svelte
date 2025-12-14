<script lang="ts">
	import { tex } from "$lib/mathjax";
	import type { MatrixNxM } from "$lib/matrix2";

  let {
    name,
    row_label,
    matrix
  }: {
    name?: string,
    row_label?: string,
    matrix: MatrixNxM
  } = $props();

</script>

<div class="flex flex-row items-center">

{#if name}
  {@html tex(name + "=")}
{/if}

<div class="border-r-2 border-l-2 rounded-xl w-max">
  <div class="grid" style="grid-template-rows: repeat({matrix.rows}, minmax(0, 1fr)); grid-template-columns: repeat({matrix.cols}, minmax(0, 1fr));">
    {#each matrix.values as value}
      <div class="p-2">{value}</div>
    {/each}
  </div>
</div>

</div>