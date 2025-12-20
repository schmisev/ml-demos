<script lang="ts">
	import { DPLL, DPLL_Result, split_assigment } from '$lib/dpll.svelte';
	import { and } from '$lib/resolution';
	import BooleanScheduleView from '$lib/sat/BooleanScheduleView.svelte';
	import { SchedulingContext } from '$lib/scheduling';

	let people = $state(4);
	let rooms = $state(2);
	let time_slots = $state(4);

	let activate_unique = $state(true);
	let activate_single_visit = $state(true);
	let activate_not_simul = $state(true);
	let activate_ordering_A_C = $state(true);
  let activate_problem_5_schedule = $state(true);

  let show_cnf = $state(false);
  let show_kb = $state(false);

	let ctx = $derived(new SchedulingContext(people, rooms, time_slots));

	let unique = $derived(ctx.unique_slot_constraint());
	let single_visit = $derived(ctx.single_visit_constraint());
	let not_simul = $derived(ctx.not_simul_constraint());
	let problem5_schedule = $derived(
		ctx.initial_schedule([
			[0,0,0],
      [1,0,3],
      [0,1,1],
      [1,1,2]
		])
	);
	let ordering_A_C = $derived(ctx.ordering_constraint(0, 2));

	let raw_kb = $derived([
		...(activate_unique ? unique : []),
		...(activate_single_visit ? single_visit : []),
		...(activate_not_simul ? not_simul : []),
		...(activate_ordering_A_C ? ordering_A_C : []),
    ...(activate_problem_5_schedule ? problem5_schedule : []),
	]);
	let kb = $derived(ctx.expand_to_CNF(and(...raw_kb)));
	let cnf = $derived(ctx.convert_to_CNF(kb));
	let dpll = $derived(new DPLL(cnf, []));
	let split_asg = $derived(split_assigment(dpll.current_asg));

	function step() {
    if (dpll.last_result !== DPLL_Result.UNDECIDED) {
      stop_autostep();
      return;
    }

		dpll.step();
	}

	function reset() {
		dpll.reset();
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
	<div class="flex flex-row gap-5">
		<h1>Scheduling via DPLL | <a href="../">back</a></h1>
	</div>

	<div class="flex flex-row gap-2">
		<label
			>People:
			<input class="w-20" min="1" max="5" type="number" bind:value={people} />
		</label>
		<label
			>Rooms:
			<input class="w-20" min="1" max="5" type="number" bind:value={rooms} />
		</label>
		<label
			>Time slots:
			<input class="w-20" min="1" max="10" type="number" bind:value={time_slots} />
		</label>
	</div>
	<div class="flex flex-row gap-2">
		<label class="light-border"
			>Unique slot:
			<input type="checkbox" bind:checked={activate_unique} />
		</label>
		<label class="light-border"
			>Single visit:
			<input type="checkbox" bind:checked={activate_single_visit} />
		</label>
		<label class="light-border"
			>Not simultaneous:
			<input type="checkbox" bind:checked={activate_not_simul} />
		</label>
		<label class="light-border"
			>Albert before Carlos:
			<input type="checkbox" bind:checked={activate_ordering_A_C} />
		</label>
    <label class="light-border"
			>Problem 5 schedule:
			<input type="checkbox" bind:checked={activate_problem_5_schedule} />
		</label>
	</div>

	<div class="flex flex-row items-start gap-2">
		<div class="border">
			<BooleanScheduleView {split_asg} {ctx}></BooleanScheduleView>
		</div>
		<div class="light-border flex grow flex-col">
			<h2>Knowledge base: {raw_kb.length} rules</h2>
			<h2>Working CNF: {dpll.current_cnf.clauses.length} clauses</h2>
			<h3>{dpll.cnf_stack.length} alternative(s) to consider</h3>
		</div>
	</div>

	<div class="flex flex-row gap-2">
		<button class="border" onclick={step}>Step</button>
    <button class="border" class:negative={is_autostepping} onclick={autostep}>Autostep</button>
		<button class="negative border" onclick={reset}>Reset</button>
	</div>

	<div>Status: <b>{dpll.last_result}</b></div>
	<div class="gap-2 border">
		<h2>Set to TRUE</h2>
		<div class="flex flex-row flex-wrap gap-2">
			{#each split_asg.pos_asg as pos_asg, i}
				<div class="positive border">{ctx.resolve_name(pos_asg)}</div>
			{/each}
		</div>
	</div>
	<div class="border">
		<h2>Set to FALSE</h2>
		<div class="flex flex-row flex-wrap gap-2">
			{#each split_asg.neg_asg as neg_asg, i}
				<div class="negative border">{ctx.resolve_name(-neg_asg)}</div>
			{/each}
		</div>
	</div>

  <div class="flex flex-col gap-2">
    <div class="flex flex-row gap-2 items-center">
      <button class="border" onclick={() => show_kb = !show_kb}>{show_kb ? "△" : "▽"}</button>
      <h2>Knowledge base</h2>
    </div>
    
    {#if show_kb}
    <div class="flex flex-col gap-2">
    {#each raw_kb as rule, i}
      <div class="light-border"><b>({i+1})</b> {ctx.format(rule)}</div>
    {/each}
    </div>
    {/if}
    
  </div>

  <div class="flex flex-col gap-2">
    <div class="flex flex-row gap-2 items-center">
      <button class="border" onclick={() => show_cnf = !show_cnf}>{show_cnf ? "△" : "▽"}</button>
      <h2>Current CNF</h2>
    </div>

    {#if show_cnf}
    <div class="flex flex-col gap-2 light-border">
      {@html ctx.format(dpll.current_cnf, "<br>")}
    </div>
    {/if}
  </div>
</div>
