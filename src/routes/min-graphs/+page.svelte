<script lang="ts">
	import { BuechiState } from '$lib/buechi.svelte';
	import HuiDagre from '$lib/hui-graphs/HuiDagre.svelte';
	import HuiElk from '$lib/hui-graphs/HuiElk.svelte';
	import { min_automaton, min_graph, min_hui_graph, type Transition } from '$lib/minimal-graphs';

	let src: string = $state(`# Example automaton
*0; 0 b 2; 0 a 1; 1 c 3; 3 e 1; 1 d 2; 2 f 3; +2;`);

	let { error, I, Q, S, T } = $derived.by(() => {
		try {
			const ret = min_graph(src);
			return { ...ret, error: '' };
		} catch (e) {
			return {
				error: e + '',
				I: new Set<string>(),
				Q: new Set<string>(),
				S: new Set<string>(),
				T: []
			};
		}
	});

	let automaton = $derived(min_automaton({ I, Q, S, T }));
  let powered = $derived(automaton.to_DFA());
  let collapsed = $derived(powered.collapse_equal_nodes());
	let input_str = $state('abc');
</script>

<head>
	<title>Min-Graphs</title>
</head>

<div class="flex flex-col gap-2 p-2">
	<div class="flex flex-row items-center gap-5">
		<h1 class="grow">Minimal Automaton Markup | <a href="../">back</a></h1>
	</div>

	<div class="grid grid-cols-2 grid-rows-2 gap-2">
		<div class="flex flex-col">
			<div class="{!error ? "text-black" : "text-red-500"} font-bold">{error || 'No error found!'}</div>
			<textarea class="rounded w-full grow font-mono text-sm" bind:value={src}></textarea>
      <div class="text-xs">
        <b>*</b>initial node,
        <b>+</b>teminal node,
        <b>[0-9]+</b> for nodes, 
        <b>[a-zA-Z]?</b> for transitions
      </div>
    </div>

		<table>
			<tbody>
				<tr>
					<th>states</th><td>{[...S.values()].toSorted()}</td>
				</tr>
				<tr>
					<th>initial states</th><td>{[...I.values()].toSorted()}</td>
				</tr>
				<tr>
					<th>terminals</th><td>{[...Q.values()].toSorted()}</td>
				</tr>
				<tr>
					<th>transitions</th>
					<td>
						<div>
							{#each T.values() as t}
								<div class="flex flex-row items-center gap-1">
									<div>{t.from}</div>
									<div>→<sup>{[...t.on.values()].join()}</sup></div>
									<div>{t.to}</div>
								</div>
							{/each}
						</div>
					</td>
				</tr>
			</tbody>
		</table>

		<div class="grow">
      <h2>Graph</h2>
      <div class="flex flex-row gap-1">
			<HuiElk graphDef={automaton.graph()}></HuiElk>
			<HuiElk graphDef={powered.graph()}></HuiElk>
			<HuiElk graphDef={collapsed.graph()}></HuiElk>
      </div>
		</div>

		<div class="flex flex-col gap-2">
      <h2>Automaton</h2>

      <div
				class="border {automaton.state === BuechiState.REJECTED
					? 'negative'
					: automaton.state === BuechiState.ACCEPTED
						? 'positive'
						: 'special'}"
			>
				{automaton.state}
			</div>
			<div class="flex flex-row flex-wrap gap-1">
				<button class="negative border" onclick={() => automaton.reset()}>Reset</button>
				<button
					class="border"
					onclick={() => {
						if (input_str.length <= 0) return;
						const ch = input_str[0];
						if (automaton.eat_char(ch)) {
							input_str = input_str.slice(1);
						}
					}}>Step</button
				>
				<input bind:value={input_str} />
			</div>
			<div>In states: {[...automaton.current_state.values()]}</div>
		</div>
	</div>
</div>
