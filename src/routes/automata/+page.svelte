<script lang="ts">
	import { BuechiAutomaton, BuechiState } from '$lib/buechi.svelte';
	import HuiDagre from '$lib/hui-graphs/HuiDagre.svelte';
	import HuiElk from '$lib/hui-graphs/HuiElk.svelte';
	import { char_alias } from '$lib/regex/character-alias';
	import { delambla_pdfl, find_pdfl, make_pdfl_automaton } from '$lib/regex/glushkov';
	import { re_alias, make_regex_graph, regex_optimize, format_regex, regex_parse, regex_tokenize, type RegexCharSet, type RegexEmpty, type RegexNode } from '$lib/regex/regex';

  let optimize: boolean = $state(false);
	let regex_input: string = $state('(a.?b)+');
	let [regex_ast, regex_charset_map, regex_error] = $derived.by(() => {
    try {
      let [ast, charset_map] = regex_parse(regex_tokenize(regex_input));
      if (optimize) [ast, charset_map] = re_alias(regex_optimize(ast));
      return [ast, charset_map, "Parsing successful!"];
    } catch(e) {
      console.error(e);
      const ast: RegexEmpty = {
        kind: "EMPTY"
      };
      return [ast, new Map<string, RegexCharSet>(), "" + e];
    }
  });
  let pdfl = $derived(delambla_pdfl(find_pdfl(regex_ast)));
	let regex_graph = $derived.by(() => {
    const graph = make_regex_graph(regex_ast)
    return graph;
  });
  let [automaton, automaton_error] = $derived.by(() => {
    try {
      const automaton = make_pdfl_automaton(regex_charset_map, pdfl);
      return [automaton, "Automaton initialized!"];
    } catch(e) {
      return [new BuechiAutomaton(["init"], ["end"], ["init", "x", "end"]), "" + e]
    }
  });

	let input_word: string = $state('abba');

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

<head>
	<title>Regex</title>
</head>

<div class="grid h-dvh grid-cols-2 gap-2 p-2">
	<div class="flex flex-col gap-2 min-h-0">
		<div class="flex flex-col gap-2">
			<h1>Regex via Glushkov | <a href="../">back</a></h1>
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
								<div><b>'{single_char}'</b> → S<sub>{[...to_node.values()]}</sub></div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
		
    <div class="grow min-h-0">
      <HuiDagre graphDef={graph} settings={{rankdir: "LR"}}></HuiDagre>
    </div>
  </div>

	<div class="flex flex-col gap-2 min-h-0">
    <div>
			<h2>Current word</h2>
			<div class="light-border min-h-11 wrap-anywhere">{automaton.current_word}</div>
		</div>

		<div class="flex flex-row flex-wrap gap-2">
			<button class="border" title="Generate letter!" onclick={() => automaton.gen_char()}> → <b class="inline-block rotate-10">A</b> </button>
			<button class="border" title="Consume letter!" onclick={consume_from_input}> 👄 ← <b class="inline-block rotate-340">C</b> </button>
			<input bind:value={input_word} />
		</div>

		<div>
      <h2>Regex</h2>
			<div class="flex flex-row flex-wrap items-center gap-2">
        <input bind:value={regex_input} />
        <div class="light-border">{regex_error}</div>
        <label class="light-border"><input class="font-mono" type="checkbox" bind:checked={optimize}> optimize </label>
        {#if optimize}
          <button onclick={() => regex_input = format_regex(regex_ast)} class="border">Replace with: <code>{format_regex(regex_ast)}</code></button>
        {/if}
      </div>
    </div>
    
    <div class="grow min-h-0">
		  <HuiDagre graphDef={regex_graph}></HuiDagre>
    </div>
    <div class="light-border">
    <table>
      <tbody>
        <tr><td><b>begins with</b></td> <td><b>P</b> = {@render print_set(pdfl.P, regex_charset_map)}</td></tr>
        <tr><td><b>ends with</b></td>   <td><b>D</b> = {@render print_set(pdfl.D, regex_charset_map)}</td></tr>
        <tr><td><b>2-factors</b></td>   <td><b>F</b> = {@render print_joined_set(pdfl.F, regex_charset_map)}</td></tr>
        <tr><td><b>contains ε?</b></td> <td><b>Λ</b> = {@render print_set(pdfl.L, regex_charset_map)}</td></tr>
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
      {@const c = M.get(s)?.trigger || "ε" }
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
      {@const descr = comps.map((c) => M.get(c)?.trigger || "ε") }

      {i > 0 ? "," : ""}
      <span class="inline-flex flex-row gap-0.5">
        {#each comps as c, j}
          {@const d = descr[j]}
          {@const isClass = d[0] === "\\"}
          <span class="{isClass ? "bg-blue-200 rounded pl-1 pr-1 font-bold" : ""}">
            {char_alias(d)}<sub class="font-normal">{c}</sub>
          </span>
        {/each}
      </span>
    {/each}
    &rcub;
  </span>
{/snippet}