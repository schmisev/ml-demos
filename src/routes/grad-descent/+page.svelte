<script lang="ts">
	import GradDescentView from '$lib/components/GradDescentView.svelte';
	import VectorView from '$lib/components/VectorView.svelte';
	import {
	AdamGradientDescenter,
	Descenter,
	GradientDescenter,
		MomentumGradientDescenter,
		type ObjectiveFunction,
		type ObjectiveGradient
	} from '$lib/grad-descent.svelte';
	import type { Vector2 } from '$lib/vector';

	let view: GradDescentView;
  let chosen_descenter: new (fn: ObjectiveFunction, grad: ObjectiveGradient, init_point: Vector2, max_steps: number) => Descenter = $state(GradientDescenter);

	const obj_fn: ObjectiveFunction = (v) => 0.5 * v.x ** 2 + v.y ** 2 + 2 * v.x + v.y + 0.3;

	const obj_grad: ObjectiveGradient = (v) => {
		return {
			x: v.x + 2,
			y: 2 * v.y + 1
		};
	};

	let descenter = $state(new MomentumGradientDescenter(
		obj_fn,
		obj_grad,
		{ x: 3, y: -1 },
		100,
	));

  function reset() {
    descenter.clear(descenter.init_point);
    view.update_route();
  }

  function reload() {
    descenter = new chosen_descenter(obj_fn, obj_grad, descenter.init_point, 1000);
    descenter.clear(descenter.init_point);
    view.update_route();
  }
</script>

<div class="flex flex-col gap-2 p-2">
	<h2>Gradient descent | <a href="..">back</a></h2>

  <div>Double-click the function surface to start a new gradient descent from that point!</div>

  <label>Method: 
    <select bind:value={chosen_descenter} onchange={reload}>
      <option value={GradientDescenter}>Fixed-&tau; Gradient Descent</option>
      <option value={MomentumGradientDescenter}>Momentum-based Gradient Descent</option>
      <option value={AdamGradientDescenter}>ADAM Gradient Descent</option>
    </select>
  </label>

  <div class="flex flex-row gap-2">
    {#key descenter}
      <GradDescentView bind:this={view} w={500} h={500} squeeze_z={0.15} {descenter}></GradDescentView>
    {/key}

    <div class="flex flex-col gap-2">
    <label>Learning rate <b>&tau;</b> = <input class="w-20" type="number" step="0.01" bind:value={descenter.tau} onchange={reset}></label>
    <label>Momentum boost <b>&gamma;</b> = <input class="w-20" type="number" step="0.01" bind:value={descenter.gamma} onchange={reset}></label>
    <label>Momentum mixture <b>&beta;<sub>1</sub></b> = <input class="w-20" type="number" step="0.01" bind:value={descenter.beta_1} onchange={reset}></label>
    <label>Energy mixture <b>&beta;<sub>2</sub></b> = <input class="w-20" type="number" step="0.01" bind:value={descenter.beta_2} onchange={reset}></label>
  </div>
  </div>

	
	<div>
		<button
			class="border"
			onclick={() => {
				descenter.step();
				view.update_route();
			}}>Step!</button
		>
	</div>

  <div class="flex flex-row gap-4">
    <div class="flex flex-row items-center gap-1">t = {descenter.t}</div>
    <div class="flex flex-row items-center gap-1">&theta;<sub>t</sub> = <VectorView vec={descenter.p_curr}></VectorView></div>
    <div class="flex flex-row items-center gap-1">&nabla;f( &theta;<sub>t</sub> ) = <VectorView vec={descenter.g}></VectorView></div>
    <div class="flex flex-row items-center gap-1">m<sub>t</sub> = <VectorView vec={descenter.m_curr}></VectorView></div>
    <div class="flex flex-row items-center gap-1">v<sub>t</sub> = <VectorView vec={descenter.v_curr}></VectorView></div>
  </div>

  
</div>
