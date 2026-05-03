<script lang="ts">
	import { alternative_caution, caution, emv, full_risk, hurwicz, laplace, make_risky, type DecisionTable } from '$lib/decisions/decisions';

	let tb: DecisionTable = $state({
    state_probs: [0.2, 0.5, 0.3],
		action_labels: ['Bonds', 'Stocks', 'Mutual Funds'],
		state_labels: ['growing', 'stable', 'declining'],
		table: [
			[40, 45, 5],
			[70, 30, -13],
			[53, 45, -5]
		]
	});

  let risk_tb = $derived(make_risky(tb));

	let max_min = $derived(caution(tb));
	let max_max = $derived(full_risk(tb));
	let alt_max_min = $derived(alternative_caution(risk_tb));
	let laplace_choice = $derived(laplace(tb));
	let alpha = $state(0.5);
  let realism_choice = $derived(hurwicz(tb, alpha));
  let emv_choice = $derived(emv(tb));
</script>

<head>
	<title>Decisions</title>
</head>

{#snippet format_table(tb: DecisionTable, allow_input: boolean)}
  <table>
    <tbody>
      <tr>
        <th>*</th>
        {#each tb.state_labels as state}
          <th>{state}</th>
        {/each}
      </tr>
      {#each tb.table as states, action_id}
        <tr>
          <th>{tb.action_labels[action_id]}</th>
          {#each states as payoff, state_id}
          {#if allow_input}
            <td><input class="w-20" type="number" bind:value={states[state_id]} /></td>
          {:else}
            <td>{payoff}</td>
          {/if}
          {/each}
        </tr>
      {/each}
      <tr class="h-1"></tr>
      <tr>
        <th>Probability</th>
        {#each tb.state_probs as prob}
          <td>{prob}</td>
        {/each}
      </tr>
    </tbody>
  </table>
{/snippet}

<div class="flex h-dvh flex-col p-2">
	<div class="flex min-h-0 flex-col gap-2">
		<div class="flex flex-col gap-2">
			<h1>Decisions | <a href="../">back</a></h1>
		</div>

		<div class="flex flex-row gap-2">
      <div>
        <h2>Payoff table</h2>
        {@render format_table(tb, true)}
      </div>

      <div>
        <h2>Risk table</h2>
        {@render format_table(risk_tb, false)}
      </div>
		</div>

		<div class="flex flex-row gap-2 flex-wrap">

			<div class="light-border">
        <h3>Max-min / caution strategy</h3>
        <hr>
        <div><b>Best action:</b> {max_min.best_actions.map(a => tb.action_labels[a]).join(", ")}</div>
        <div><b>in state:</b> {max_min.best_states.map(a => tb.state_labels[a]).join(", ")}</div>
        <div><b>Payoff:</b> {max_min.best_payoff}</div>
      </div>

      <div class="light-border">
        <h3>Max-max / full risk strategy</h3>
        <hr>
        <div><b>Best action:</b> {max_max.best_actions.map(a => tb.action_labels[a]).join(", ")}</div>
        <div><b>in state:</b> {max_max.best_states.map(a => tb.state_labels[a]).join(", ")}</div>
        <div><b>Payoff:</b> {max_max.best_payoff}</div>
      </div>

      <div class="light-border">
        <h3>Alternative caution strategy</h3>
        <hr>
        <div><b>Best action:</b> {alt_max_min.best_actions.map(a => tb.action_labels[a]).join(", ")}</div>
        <div><b>in state:</b> {alt_max_min.best_states.map(a => tb.state_labels[a]).join(", ")}</div>
        <div><b>Payoff:</b> {alt_max_min.best_payoff}</div>
      </div>

      <div class="light-border">
        <h3>Laplace strategy</h3>
        <hr>
        <div><b>Best action:</b> {laplace_choice.best_actions.map(a => tb.action_labels[a]).join(", ")}</div>
        <div><b>Average payoff:</b> {laplace_choice.best_payoff.toFixed(2)}</div>
      </div>

      <div class="light-border">
        <h3>Realism strategy</h3>
        <hr>
          <div class="flex flex-row gap-2">
            <div class="w-8">{alpha}</div><input class="grow" bind:value={alpha} type="range" min="0" max="1" step="0.001">
          </div>
        <hr>
        <div><b>Best action:</b> {realism_choice.best_actions.map(a => tb.action_labels[a]).join(", ")}</div>
        <div><b>Weighted Payoff:</b> {realism_choice.best_payoff.toFixed(2)}</div>
      </div>

      <div class="light-border">
        <h3>Expected value</h3>
        <hr>
        <div><b>Best action:</b> {emv_choice.best_actions.map(a => tb.action_labels[a]).join(", ")}</div>
        <div><b>Weighted Payoff:</b> {emv_choice.best_payoff.toFixed(2)}</div>
      </div>

		</div>
	</div>
</div>
