<script lang="ts">
	import { BuechiAutomaton, BuechiState } from '$lib/buechi.svelte';
	import HuiDagre from '$lib/hui-graphs/HuiDagre.svelte';
	import HuiElk from '$lib/hui-graphs/HuiElk.svelte';
	import { find_pdfl, make_pdfl_automaton } from '$lib/regex/grushkov';
	import { make_regex_graph, regex_parse, regex_tokenize, type RegexCharSet, type RegexEmpty, type RegexNode } from '$lib/regex/regex';

	let regex_input: string = $state('(a|b)*');
	let [regex_ast, regex_charset_map, regex_error] = $derived.by(() => {
    try {
      const [ast, charset_map] = regex_parse(regex_tokenize(regex_input));
      return [ast, charset_map, "Parsing successful!"];
    } catch(e) {
      console.error(e);
      const ast: RegexEmpty = {
        kind: "EMPTY"
      };
      return [ast, new Map<string, RegexCharSet>(), "" + e];
    }
  });
  let {P, D, F, L} = $derived(find_pdfl(regex_ast));
	let regex_graph = $derived.by(() => {
    const graph = make_regex_graph(regex_ast)
    return graph;
  });
  let [automaton, automaton_error] = $derived.by(() => {
    try {
      const automaton = make_pdfl_automaton(regex_charset_map, P, D, F, L);
      return [automaton, "Automaton initialized!"];
    } catch(e) {
      return [new BuechiAutomaton("init", ["end"], ["init", "x", "end"]), "" + e]
    }
  });

	let input_word: string = $state('abba');

	// let automaton = $state(
	// 	new BuechiAutomaton(
	// 		'1',
	// 		['2'],
	// 		['1', { 'a,b': '1', b: '2', c: '3' }],
	// 		['2', { b: '2' }],
	// 		['3', { c: '1' }]
	// 	)
	// );

	let graph = $derived.by(() => {
    const graph = automaton.graph();
    return graph;
  });

	function consume_from_input() {
		if (input_word.length <= 0) return;
		if (automaton.eat_char(input_word[0])) {
			input_word = input_word.slice(1);
		}
	}
</script>

<div class="grid h-dvh grid-cols-2 gap-2 p-2">
	<div class="flex flex-col gap-2 min-h-0">
		<div class="flex flex-col gap-2">
			<h1>Büchi-Automata | <a href="../">back</a></h1>
			<div class="flex flex-row flex-wrap items-center gap-2"></div>

			<div>
				<h2>Possible states</h2>
				<div class="flex flex-row gap-2 flex-wrap">
					<button class="border negative" onclick={() => automaton.reset()}>RESET</button>
          <div
						class="border {automaton.state === BuechiState.REJECTED
							? 'negative'
							: automaton.state === BuechiState.ACCEPTED
								? 'positive'
								: 'special'}"
					>
						{automaton.state}
					</div>
					{#each automaton.current_state as state}
						<div class="border">S<sub>{state}</sub></div>
					{/each}
				</div>
			</div>

      <div class="flex flex-row gap-2 items-center">
        <h2>Rules</h2>
        <div class="light-border">{automaton_error}</div>
      </div>

			<div class="flex flex-row gap-2 flex-wrap">
				{#each automaton.def.entries() as [node, actions]}
					<div class="flex flex-row gap-2">
						<div class="border-2 rounded-xl p-2 border-gray-200 bg-gray-100">
              <div class="content-center text-center border {automaton.current_state.has(node) ? 'special' : ''}">
                S<sub>{node}</sub>
                {automaton.accept_states.has(node) ? "✓" : ""}
              </div>
							{#each actions.entries() as [single_char, to_node]}
								<div>{single_char} → {[...to_node.values()]}</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
		
    <div class="grow min-h-0">
      <HuiElk graphDef={graph} settings={ {defaultLayoutOptions: {"elk.direction": "RIGHT"}} }></HuiElk>
    </div>
  </div>

	<div class="flex flex-col gap-2 min-h-0">
    <div>
			<h2>Current word</h2>
			<div class="light-border min-h-11 wrap-anywhere">{automaton.current_word}</div>
		</div>

		<div class="flex flex-row gap-2">
			<button class="border" title="Generate letter!" onclick={() => automaton.gen_char()}> → <b class="inline-block rotate-10">A</b> </button>
			<button class="border" title="Consume letter!" onclick={consume_from_input}> 👄 ← <b class="inline-block rotate-340">C</b> </button>
			<input bind:value={input_word} />
		</div>

		<div>
      <h2>Regex</h2>
			<div class="flex flex-row items-center gap-2">
        <input bind:value={regex_input} />
        <div class="light-border">{regex_error}</div>
      </div>
    </div>
    
    <div class="grow min-h-0">
		  <HuiDagre graphDef={regex_graph}></HuiDagre>
    </div>
    <div class="light-border">
    <table>
      <tbody>
        <tr><td><b>begins with</b></td> <td><b>P</b> = {@render print_set(P, regex_charset_map)}</td></tr>
        <tr><td><b>ends with</b></td>   <td><b>D</b> = {@render print_set(D, regex_charset_map)}</td></tr>
        <tr><td><b>2-factors</b></td>   <td><b>F</b> = {@render print_joined_set(F, regex_charset_map)}</td></tr>
        <tr><td><b>contains ε?</b></td> <td><b>Λ</b> = {@render print_set(L, regex_charset_map)}</td></tr>
      </tbody>
    </table>
    </div>
	</div>
</div>

{#snippet print_set(S: Set<string>, M: Map<string, RegexCharSet>)}
  <span>
    &lcub;
    {#each S as s, i}
      {@const v = s || ""}
      {@const c = M.get(s)?.descriptor || "ε" }
      <span>
        {i > 0 ? ", " : ""}{c}<sub>{v}</sub>
      </span>
    {/each}
    &rcub;
  </span>
{/snippet}

{#snippet print_joined_set(S: Set<string>, M: Map<string, RegexCharSet>)}
  <span>
    &lcub;
    {#each S as s, i}
      {@const comps = s.split(":")}
      {@const descr = comps.map((c) => M.get(c)?.descriptor || "ε") }

      {i > 0 ? "," : ""}
      <span>
        {#each comps as c, j}
          {descr[j]}<sub>{c}</sub>
        {/each}
      </span>
    {/each}
    &rcub;
  </span>
{/snippet}