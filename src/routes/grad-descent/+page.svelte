<script lang="ts">
	import * as ag from '$lib/autograd';
  import {Math} from 'mathjax-svelte';
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
	import type { Vec2D } from '$lib/vector';



	let view: GradDescentView;
	let chosen_descenter: new (
		fn: ObjectiveFunction,
		grad: ObjectiveGradient,
		init_point: Vec2D,
		max_steps: number
	) => Descenter = $state(GradientDescenter);

	const x1 = new ag.Input(3, 'x_1');
	const x2 = new ag.Input(-1, 'x_2');
	const obj_autograd_fn = $state(new ag.Function2D(
    x1.pow(2).mul(0.5).add(x2.pow(2)).add(x1.mul(2)).add(x2.sin().mul(7)).add(0.3),
		x1,
		x2
	));

	const obj_fn: ObjectiveFunction = obj_autograd_fn.get_bound_fn2d();
	const obj_grad: ObjectiveGradient = obj_autograd_fn.get_bound_grad2d();

	let descenter = $state(
		new MomentumGradientDescenter(obj_fn, obj_grad, { x1: x1.data, x2: x2.data }, 100)
	);

	function reset() {
		descenter.clear(descenter.init_point);
		view.update_route();
	}

	function reload() {
		descenter = new chosen_descenter(obj_fn, obj_grad, descenter.init_point, 1000);
		descenter.clear(descenter.init_point);
		view.update_route();
	}

	function step() {
		descenter.step();
		view.update_route();
	}

	let is_autostepping = $state(false);
	let autostep_timer: number | undefined = undefined;

	function autostep() {
		is_autostepping = !is_autostepping;

		if (is_autostepping) {
			autostep_timer = setInterval(step, 100);
		} else if (autostep_timer !== undefined) {
			clearInterval(autostep_timer);
		}
	}
</script>

<div class="flex flex-col gap-2 p-2">
	<h2>Gradient descent | <a href="..">back</a></h2>

	<div>Double-click the function surface to start a new gradient descent from that point!</div>

	<label
		>Method:
		<select bind:value={chosen_descenter} onchange={reload}>
			<option value={GradientDescenter}>Fixed-&tau; Gradient Descent</option>
			<option value={MomentumGradientDescenter}>Momentum-based Gradient Descent</option>
			<option value={AdamGradientDescenter}>ADAM Gradient Descent</option>
		</select>
	</label>

	<div class="flex flex-row gap-2">
		<div class="border">
			{#key descenter}
				<GradDescentView bind:this={view} w={500} h={500} squeeze_z={0.15} {descenter}
				></GradDescentView>
			{/key}
		</div>

		<div class="flex flex-col gap-2">
			<label class="border"
				>Learning rate <b>&tau;</b> =
				<input
					class="w-20"
					type="number"
					step="0.01"
					bind:value={descenter.tau}
					onchange={reset}
				/></label
			>
			<div class="border flex flex-col gap-2" class:inactive={chosen_descenter !== MomentumGradientDescenter}>
				<div class="light-border">Momentum-based parameters</div>
				<label
					>Momentum boost <b>&gamma;</b> =
					<input
						class="w-20"
						type="number"
						step="0.01"
						bind:value={descenter.gamma}
						onchange={reset}
					/></label
				>
			</div>
			<div
				class="flex flex-col gap-2 border"
				class:inactive={chosen_descenter !== AdamGradientDescenter}
			>
				<div class="light-border">ADAM parameters</div>
				<label
					>Moment coeff <b>&beta;<sub>1</sub></b> =
					<input
						class="w-20"
						type="number"
						step="0.01"
						bind:value={descenter.beta_1}
						onchange={reset}
					/></label
				>
				<label
					>Second moment coeff <b>&beta;<sub>2</sub></b> =
					<input
						class="w-20"
						type="number"
						step="0.01"
						bind:value={descenter.beta_2}
						onchange={reset}
					/></label
				>
			</div>
		</div>
	</div>

	<div>
		<button class="border" onclick={step}>Step</button>
		<button class:negative={is_autostepping} class="border" onclick={autostep}>Autostep</button>
	</div>

  <div>
    Objective function: <Math t={obj_autograd_fn.y.toExpr(true)}></Math>
  </div>

	<div class="flex flex-row gap-4">
		<div class="flex flex-row items-center gap-1">t = {descenter.t}</div>
		<div class="flex flex-row items-center gap-1">
			&theta;<sub>t</sub> = <VectorView vec={descenter.p_curr}></VectorView>
		</div>
		<div class="flex flex-row items-center gap-1">
			&nabla;f( &theta;<sub>t</sub> ) = <VectorView vec={descenter.grad_curr}></VectorView>
		</div>
		<div class="flex flex-row items-center gap-1">
			m<sub>t</sub> = <VectorView vec={descenter.m_curr}></VectorView>
		</div>
		<div class="flex flex-row items-center gap-1">
			v<sub>t</sub> = <VectorView vec={descenter.v_curr}></VectorView>
		</div>
	</div>
</div>
