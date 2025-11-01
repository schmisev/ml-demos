<script lang="ts">
	import { AUSTRALIA_PROBLEM, SAT_Solver, SIMPLE_PROBLEM } from '$lib/sat.svelte';
	import AssignmentView from '$lib/sat/AssignmentView.svelte';
	import DomainView from '$lib/sat/DomainView.svelte';
	import { flip } from 'svelte/animate';

	const problem = AUSTRALIA_PROBLEM;
	const solver = new SAT_Solver(problem);
</script>

<div class="flex flex-col gap-2 p-2">
	<div class="flex flex-row gap-2">
		<button class="border" onclick={() => solver.step()}>step</button>
	</div>

	<div class="flex flex-row items-start gap-2">
		<div class="light-border">
			<h2>current</h2>
			<AssignmentView asg={solver.current_asg!}></AssignmentView>
		</div>

		<div>
			<div class="light-border">
				<h2>LIFO assignments</h2>
				<div class="flex flex-col gap-2">
					{#each solver.assignments.toReversed() as asg, i}
						<div class="flex flex-row gap-1">
							<AssignmentView {asg}></AssignmentView>
              <DomainView dom={solver.domains.toReversed()[i]}></DomainView>
						</div>
					{/each}
				</div>
			</div>
			</div>
      <div class="light-border">
				<h2>rejected</h2>
				<div class="flex flex-col gap-2">
					{#each solver.rejected as asg}
						<AssignmentView {asg}></AssignmentView>
					{/each}
				</div>
		</div>
	</div>
</div>
