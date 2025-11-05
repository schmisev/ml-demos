<script lang="ts">
	import type { SAT_Assignment, SAT_Domain, SAT_Solver } from "$lib/sat.svelte";
	import AssignmentView from "$lib/sat/AssignmentView.svelte";
	import AustraliaView from "$lib/sat/AustraliaView.svelte";
	import DomainView from "$lib/sat/DomainView.svelte";
	import FourQueensView from "$lib/sat/FourQueensView.svelte";
	import SudokuView from "$lib/sat/SudokuView.svelte";


  let {
    asg,
    dom,
    colormap,
    solver,
    in_list = false
  }: {
    asg?: SAT_Assignment
    dom?: SAT_Domain
    colormap: string[]
    solver: SAT_Solver
    in_list: boolean
  } = $props()

  let used_asg = $derived(asg || solver.current_asg || solver.csp.init_asg);
  let used_dom = $derived(dom || solver.current_dom || solver.csp.init_domains);
</script>

<div class="flex flex-col flex-wrap items-center">
  {#if solver.csp.name === "4x4 sudoku"}
    <SudokuView asg={used_asg} {colormap}></SudokuView>
  {:else if solver.csp.name === "N queens"}
    <FourQueensView asg={used_asg} {colormap}></FourQueensView>
  {:else if solver.csp.name === "australia" && !in_list}
    <AustraliaView asg={used_asg} {colormap}></AustraliaView>
  {:else}
    <div class="flex flex-row gap-1">
      <AssignmentView asg={used_asg} {colormap}></AssignmentView>
      <DomainView dom={used_dom} {colormap}></DomainView>
    </div>
  {/if}
</div>

