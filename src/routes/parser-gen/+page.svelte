<script>
	import HuiDagre from "$lib/hui-graphs/HuiDagre.svelte";
	import HuiElk from "$lib/hui-graphs/HuiElk.svelte";
	import { EXAMPLE_GRAMMAR, graph_grammar } from "$lib/parser-gen/parser-gen";
	import { parse, tokenize } from "$lib/parser-gen/parser-parser";
	import { Pane, Splitpanes } from "svelte-splitpanes";

  let src = $state(`<int> -> <digit> <int> | <digit> | 0 ;
<digit> -> 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
<expr> -> <int> * <int> | <int> + <int> | <int> | ident ;
<stmt> -> <expr> | ident = <expr>;`);

  const [grammar, error] = $derived.by(() => {
    try {
      const tokens = tokenize(src);
      console.log(tokens);
      const grammar = parse(tokens);
      return [grammar, "No errors found!"];
    } catch (e) {
      return [EXAMPLE_GRAMMAR, "" + e];
    }
  })

  let no_terminals = $state(false);
</script>


<head>
	<title>Parser Generator</title>
</head>

<div class="flex h-dvh flex-col gap-2 p-2">
	<div class="flex flex-row items-center gap-5">
		<h1 class="grow">Parser Generator | <a href="../">back</a></h1>
	</div>

  <textarea class="h-50 font-mono" bind:value={src}>
  </textarea>

  <div>{error}</div>

	<Splitpanes class="min-h-0 grow">
    <Pane class="flex flex-col">
      <div class="flex flex-row flex-wrap">
        <label class="light-border flex flex-row items-center gap-2"><input type="checkbox" bind:checked={no_terminals}> Don't show tokens</label>
      </div>
      
      <div class="grow min-h-0">
        <HuiElk graphDef={graph_grammar(grammar, {no_terminals})}></HuiElk>
      </div>
    </Pane>
  </Splitpanes>
</div>