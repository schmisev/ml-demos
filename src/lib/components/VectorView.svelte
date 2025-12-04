<script lang="ts">
	import type { Vec2D } from "$lib/vector";

  let {
    vec
  }: {
    vec: Vec2D
  } = $props();
</script>

<div class="inline-block rounded-xl border-r-2 border-l-2 pl-2 pr-2">
  <div>{vec.x1.toFixed(4)}</div>
  <div>{vec.x2.toFixed(4)}</div>
</div>