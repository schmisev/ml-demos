<script lang="ts">
	import GradDescentView from "$lib/components/GradDescentView.svelte";
	import type { ObjectiveFunction, ObjectiveGradient } from "$lib/grad-descent";

  const obj_fn: ObjectiveFunction = $state(
    (v) => (0.5 * v.x**2 + v.y**2 + 2 * v.x + v.y + 0.3)
  )

  const obj_grad: ObjectiveGradient = $state(
    (v) => {return {
      x: v.x + 2,
      y: 2 * v.y + 1,
    }}
  )
  
</script>

<GradDescentView w={500} h={500} {obj_fn} {obj_grad} init_point={{x: 3, y: -1}}>

</GradDescentView>