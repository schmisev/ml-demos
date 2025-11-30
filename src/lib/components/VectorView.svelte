<script lang="ts">
	import type { Vector2 } from "$lib/vector";

  let {
    vec
  }: {
    vec: Vector2
  } = $props();
</script>

<div class="inline-block rounded-xl border-r-2 border-l-2 pl-2 pr-2">
  <div>{vec.x.toFixed(4)}</div>
  <div>{vec.y.toFixed(4)}</div>
</div>