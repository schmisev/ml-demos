<script lang="ts">
	import { AUSTRALIA_PROBLEM, FOUR_ROOKS, SAT_Solver, SIMPLE_PROBLEM, SORTING_LIST, SUDOKU_PUZZLE } from '$lib/sat.svelte';
	import AssignmentView from '$lib/sat/AssignmentView.svelte';
	import AustraliaView from '$lib/sat/AustraliaView.svelte';
	import DomainView from '$lib/sat/DomainView.svelte';
	import SudokuView from '$lib/sat/SudokuView.svelte';
	import FourQueensView from '$lib/sat/FourQueensView.svelte';

	const colormap = ['lightcoral', 'lightgreen', 'lightblue', 'orange', 'lightgrey', 'pink', 'aquamarine', 'beige'];
	let problem = $state.raw(AUSTRALIA_PROBLEM);
	let solver = $state(new SAT_Solver(problem));
</script>

<div class="flex flex-col gap-2 p-2">
	<div class="flex flex-row gap-2">
		<button class="border" onclick={() => solver.step()}>step</button>
		<button
			class="border"
			onclick={() => {
				solver = new SAT_Solver(problem);
			}}>reset</button
		>
    <select bind:value={problem} onchange={() => {solver = new SAT_Solver(problem)}}>
      <option value={AUSTRALIA_PROBLEM}>3-coloring Australia</option>
      <option value={SIMPLE_PROBLEM}>Simple cycle</option>
      <option value={SUDOKU_PUZZLE}>4x4 Sudoku</option>
      <option value={SORTING_LIST}>Sorting a list</option>
      <option value={FOUR_ROOKS}>4-Rooks</option>
    </select>
	</div>

	<div class="light-border flex flex-col gap-2">
		<h2>CSP</h2>
		<div class="flex flex-row flex-wrap gap-2">
			{#each solver.csp.constraints as c}
				<div class="border">
					{#each c.vars as v, i (v)}
						{i !== 0 ? c.op : ''}&nbsp;{v}&nbsp;
					{/each}
				</div>
			{/each}
		</div>
	</div>

	<div class="flex flex-row">
		<div class="light-border flex grow flex-col gap-2">
			<h2>current step</h2>
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
							: 'white'}; font-weight: {(solver.assignments.length > 0 && solver.assignments.at(-1)![solver.current_variable] === value) ? 'bold' : 'unset'}"
					>
						{value}
					</div>
				{/each}
				<div>&rcub;</div>
			</div>
		</div>
	</div>

	<div class="flex flex-row items-start gap-2">
		<div>
			{#if solver.csp === SUDOKU_PUZZLE}
				<SudokuView {colormap} {solver}></SudokuView>
      {:else if solver.csp === FOUR_ROOKS}
        <FourQueensView {solver} {colormap}></FourQueensView>
			{:else if solver.csp === AUSTRALIA_PROBLEM}
      <AustraliaView {solver} {colormap}></AustraliaView>
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
			<div class="light-border flex flex-col gap-2">
				<h2>LIFO assignments</h2>
				<div class="flex flex-col gap-2">
					{#each solver.assignments as asg, i (asg)}
						<div class="flex flex-row gap-1">
							<AssignmentView asg={solver.assignments.toReversed()[i]} {colormap}></AssignmentView>
							<DomainView dom={solver.domains.toReversed()[i]} {colormap}></DomainView>
						</div>
					{/each}
				</div>
			</div>
		</div>
		<div class="light-border flex flex-col gap-2">
			<h2>rejected</h2>
			<div class="flex flex-col gap-2">
				{#each solver.rejected as asg, i}
					<div class="flex flex-row gap-1">
						<AssignmentView asg={solver.rejected[i]} {colormap}></AssignmentView>
						<DomainView dom={solver.rejected_domains[i]} {colormap}></DomainView>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
