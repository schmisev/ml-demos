<script lang="ts">
	import {
		AUSTRALIA_PROBLEM,
		csp_to_network,
		FOUR_ROOKS,
		SAT_FirstVarMode,
		SAT_InferenceMode,
		SAT_Result,
		SAT_Solver,
		SAT_ValueSelectionMode,
		SAT_VarSelectionMode,
		SIMPLE_PROBLEM,
		SORTING_LIST,
		SUDOKU_PUZZLE
	} from '$lib/sat.svelte';
	import AssignmentView from '$lib/sat/AssignmentView.svelte';
	import AustraliaView from '$lib/sat/AustraliaView.svelte';
	import DomainView from '$lib/sat/DomainView.svelte';
	import SudokuView from '$lib/sat/SudokuView.svelte';
	import FourQueensView from '$lib/sat/FourQueensView.svelte';
	import GraphView from '$lib/components/GraphView.svelte';
	import { NETWORK_ROMANIA } from '$lib/network';
	import ConstraintView from '$lib/components/ConstraintView.svelte';

	const colormap = [
		'lightcoral',
		'lightgreen',
		'lightblue',
		'orange',
		'lightgrey',
		'pink',
		'aquamarine',
		'beige'
	];
	let problem = $state.raw(AUSTRALIA_PROBLEM);

	let inference_mode = $state(SAT_InferenceMode.FORWARD_CHECKING);
	let var_selection = $state(SAT_VarSelectionMode.MRV);
	let first_var_selection = $state(SAT_FirstVarMode.DEGREE);
	let value_selection = $state(SAT_ValueSelectionMode.LEAST_CONSTRAINING);

	let solver = $state(
		new SAT_Solver(problem, inference_mode, var_selection, first_var_selection, value_selection)
	);

	function reload() {
		solver = new SAT_Solver(
			problem,
			inference_mode,
			var_selection,
			first_var_selection,
			value_selection
		);
	}
</script>

<div class="flex flex-col gap-2 p-2">
	<div class="flex flex-row gap-2">
		<button class="border" onclick={() => solver.step()}>step</button>
		<button class="border" onclick={reload}>reset</button>
		<select bind:value={problem} onchange={reload}>
			<option value={AUSTRALIA_PROBLEM}>3-coloring Australia</option>
			<option value={SIMPLE_PROBLEM}>Simple cycle</option>
			<option value={SUDOKU_PUZZLE}>4x4 Sudoku</option>
			<option value={SORTING_LIST}>Sorting a list</option>
			<option value={FOUR_ROOKS}>4-Queens</option>
		</select>

		<select bind:value={inference_mode} onchange={reload}>
			<option value={SAT_InferenceMode.NO_INFERENCE}>no inference</option>
			<option value={SAT_InferenceMode.FORWARD_CHECKING}>forward checking</option>
		</select>

		<select bind:value={first_var_selection} onchange={reload}>
			<option value={SAT_FirstVarMode.ANY}>any</option>
			<option value={SAT_FirstVarMode.DEGREE}>degree heuristic</option>
		</select>

		<select bind:value={var_selection} onchange={reload}>
			<option value={SAT_VarSelectionMode.ANY}>any</option>
			<option value={SAT_VarSelectionMode.MRV}>minimum remaining values</option>
		</select>

		<select bind:value={value_selection} onchange={reload}>
			<option value={SAT_ValueSelectionMode.ANY}>any</option>
			<option value={SAT_ValueSelectionMode.LEAST_CONSTRAINING}>least constraining values</option>
		</select>
	</div>

	<div class="light-border flex flex-col gap-2">
		<h2>CSP</h2>
		<div class="flex flex-row flex-wrap gap-2">
			{#each solver.csp.constraints as c}
				<ConstraintView constraint={c}></ConstraintView>
			{/each}
		</div>
	</div>

	<div class="flex flex-row">
		<div class="light-border flex grow flex-col gap-2">
			<h2>current step</h2>
			<div class="flex flex-row items-center gap-1">
        <div class="pr-2 w-50">
        <div
          class="pl-2 pr-2 rounded-xl text-center font-bold"
					style="background-color: {solver.last_result === SAT_Result.FAILURE
						? 'lightcoral'
						: solver.last_result === SAT_Result.SUCCESS
							? 'lightgreen'
							: 'lightblue'};"
				>
					{solver.last_result}
				</div>
        </div>
				<div class="border-l-2 pl-2">Steps: {solver.steps}</div>
			</div>
			<div class="flex flex-row items-center gap-1">
				<div>Try <b>{solver.current_variable}</b> &in; &lcub;</div>
				{#each solver.choice_values.toReversed() as value, i (value)}
					{#if i !== 0}
						<div>&rarr;</div>
					{/if}
					<div
						class="rounded-xs pr-2 pl-2"
						style="background-color: {colormap[value] !== undefined
							? colormap[value]
							: 'white'}; font-weight: {solver.assignments.length > 0 &&
						solver.assignments.at(-1)![solver.current_variable] === value
							? 'bold'
							: 'unset'}"
					>
						{value}
					</div>
				{/each}
				<div>&rcub;</div>
			</div>
		</div>
	</div>

	<div class="flex flex-row items-start gap-2">
		<div class="w-100">
			{#if solver.csp === SUDOKU_PUZZLE}
				<SudokuView {colormap} asg={solver.current_asg || solver.csp.init_asg}></SudokuView>
			{:else if solver.csp === FOUR_ROOKS}
				<FourQueensView asg={solver.current_asg || solver.csp.init_asg} {colormap}></FourQueensView>
			{:else if solver.csp === AUSTRALIA_PROBLEM}
				<AustraliaView asg={solver.current_asg || solver.csp.init_asg} {colormap}></AustraliaView>
			{:else}
				<div class="light-border">
					<h2>no viz</h2>
				</div>
			{/if}
		</div>
		<div class="light-border flex flex-col gap-2">
			<h2>current</h2>
			{#if solver.current_asg && solver.current_dom}
				<div class="flex flex-row gap-1">
					<AssignmentView asg={solver.current_asg} {colormap}></AssignmentView>
					<DomainView dom={solver.current_dom} {colormap}></DomainView>
				</div>
			{/if}
		</div>

		<div>
			<div class="light-border flex flex-col items-center gap-2">
				<h2>LIFO assignments</h2>
				<div class="flex flex-col gap-2">
					{#each solver.assignments as asg, i (asg)}
						{#if solver.csp === FOUR_ROOKS}
							<div class="w-30">
								<FourQueensView asg={solver.assignments.toReversed()[i]} {colormap}
								></FourQueensView>
							</div>
						{:else}
							<div class="flex flex-row gap-1">
								<AssignmentView asg={solver.assignments.toReversed()[i]} {colormap}
								></AssignmentView>
								<DomainView dom={solver.domains.toReversed()[i]} {colormap}></DomainView>
							</div>
						{/if}
					{/each}
				</div>
			</div>
		</div>
		<div class="light-border flex flex-col gap-2">
			<h2>rejected</h2>
			<div class="flex flex-col gap-2">
				{#each solver.rejected as asg, i}
					{#if solver.csp === FOUR_ROOKS}
						<div class="w-30">
							<FourQueensView asg={solver.rejected.toReversed()[i]} {colormap}></FourQueensView>
						</div>
					{:else}
						<div class="flex flex-row gap-1">
							<AssignmentView asg={solver.rejected.toReversed()[i]} {colormap}></AssignmentView>
							<DomainView dom={solver.rejected_domains.toReversed()[i]} {colormap}></DomainView>
						</div>
					{/if}
				{/each}
			</div>
		</div>
		<div class="light-border">
			{#if solver}
				<GraphView w={300} h={300} dataset={csp_to_network(problem)}></GraphView>
			{/if}
		</div>
	</div>
</div>
