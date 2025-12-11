<script lang="ts">
	import * as ag from '$lib/autograd';
	import GradDescentView from '$lib/components/GradDescentView.svelte';
	import VectorView from '$lib/components/VectorView.svelte';
	import {
		AdamGradientDescender,
		Descender,
		GradientDescender,
		MomentumGradientDescender,
		type ObjectiveFunction,
		type ObjectiveGradient
	} from '$lib/grad-descent.svelte';
	import { tex } from '$lib/mathjax';
	import type { Vec2D } from '$lib/vector';
	import { Mermaid } from '@friendofsvelte/mermaid';

	// example functions
	let available_functions: ag.Function2D[] = [
		(() => {
			const x1 = new ag.Input(-3, 'x_1');
			const x2 = new ag.Input(2, 'x_2');
			return new ag.Function2D(x1.pow(2).add(x2.pow(2)), x1, x2);
		})(),
		(() => {
			const x1 = new ag.Input(-3, 'x_1');
			const x2 = new ag.Input(2, 'x_2');
			return new ag.Function2D(
				x1.sub(2).pow(2).mul(0.5).add(x2.pow(2)).add(x1.mul(2)).add(x2.sin().mul(7)),
				x1,
				x2
			);
		})(),
		(() => {
			const x1 = new ag.Input(-3, 'x_1');
			const x2 = new ag.Input(2, 'x_2');
			return new ag.Function2D(x1.sin().mul(7).add(x2).add(x2.cos().mul(5)), x1, x2);
		})(),
    (() => {
			const x1 = new ag.Input(-3, 'x_1');
			const x2 = new ag.Input(2, 'x_2');
			return new ag.Function2D(x1.abs().add(x2.abs()).mul(3), x1, x2);
		})(),
    (() => {
			const x1 = new ag.Input(-3, 'x_1');
			const x2 = new ag.Input(2, 'x_2');
			return new ag.Function2D(ag.sum([x1, x2]), x1, x2);
		})(),
    (() => {
			const x1 = new ag.Input(-3, 'x_1');
			const x2 = new ag.Input(2, 'x_2');
			return new ag.Function2D(x1.abs().add(1).log().mul(10).add(x2.exp()), x1, x2);
		})(),
	];

	let view: GradDescentView;
	let chosen_descenter: new (
		fn: ObjectiveFunction,
		grad: ObjectiveGradient,
		init_point: Vec2D,
		max_steps: number,
    on_step: () => void,
	) => Descender = $state(GradientDescender);

	let chosen_autograd = $state(Object.values(available_functions)[1]);
	let obj_fn: ObjectiveFunction = $derived(chosen_autograd.get_bound_fn2d());
	let obj_grad: ObjectiveGradient = $derived(chosen_autograd.get_bound_grad2d());
  let graph_str: string = $state("");

  function update_graph() {
    graph_str = chosen_autograd.format_graph_for_mermaid();
  }

	let descenter = $derived(
		new chosen_descenter(
			obj_fn,
			obj_grad,
			{ x1: chosen_autograd.x1.value, x2: chosen_autograd.x2.value },
			100,
      update_graph
		)
	);

	// buttons
	function reset() {
		descenter.clear(descenter.init_point);
		view.update_route();
		stop_autostep();
	}

	function reload() {
		descenter = new chosen_descenter(obj_fn, obj_grad, descenter.init_point, 1000, update_graph);
		descenter.clear(descenter.init_point);
		view.update_route();
		stop_autostep();
	}

	function step() {
		descenter.step();
		view.update_route();
	}

	// autostepping
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

	function stop_autostep() {
		is_autostepping = false;
		if (autostep_timer) clearInterval(autostep_timer);
	}
</script>

<div class="flex flex-col gap-2 p-2">
	<h2>Gradient descent | <a href="..">back</a></h2>

	<div>Double-click the function surface to start a new gradient descent from that point!</div>

  <div class="flex flex-row gap-4 items-center">
	<label>
		Function:
		<select bind:value={chosen_autograd} onchange={reload}>
			{#each Object.entries(available_functions) as [name, fn]}
				<option value={fn}>{@html fn.result.to_expr()}</option>
			{/each}
		</select>
	</label>

  {@html tex('f(x_1, x_2) = ' + chosen_autograd.result.to_expr(true))}</div>


	<label
		>Method:
		<select bind:value={chosen_descenter} onchange={reload}>
			<option value={GradientDescender}>Fixed-&tau; Gradient Descent</option>
			<option value={MomentumGradientDescender}>Momentum-based Gradient Descent</option>
			<option value={AdamGradientDescender}>ADAM Gradient Descent</option>
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
			<div
				class="flex flex-col gap-2 border"
				class:inactive={chosen_descenter !== MomentumGradientDescender}
			>
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
				class:inactive={chosen_descenter !== AdamGradientDescender}
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
	<div class="flex flex-row gap-4">
		<div class="flex flex-row items-center gap-1">{@html tex(`\\mathbf{t} = ${descenter.t}`)}</div>
		<div class="flex flex-row items-center gap-1">
			{@html tex(`\\mathbf{x}_{${descenter.t}} =`)}
			<VectorView vec={descenter.p_curr}></VectorView>
		</div>
		<div class="flex flex-row items-center gap-1">
			{@html tex(`\\nabla_{\\mathbf{x}} f(\\mathbf{x}_{${descenter.t}}) =`)}
			<VectorView vec={descenter.grad_curr}></VectorView>
		</div>
		<div class="flex flex-row items-center gap-1">
			{@html tex(`\\mathbf{m}_{${descenter.t - 1}} =`)}
			<VectorView vec={descenter.m_curr}></VectorView>
		</div>
		<div class="flex flex-row items-center gap-1">
			{@html tex(`\\mathbf{v}_{${descenter.t - 1}} =`)}
			<VectorView vec={descenter.v_curr}></VectorView>
		</div>
	</div>

  <Mermaid string={graph_str} config={{fontFamily: "Consolas, monospace"}}></Mermaid>
</div>
