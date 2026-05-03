<script>
	import HuiDagre from "$lib/hui-graphs/HuiDagre.svelte";
	import HuiElk from "$lib/hui-graphs/HuiElk.svelte";
	import { EXAMPLE_GRAMMAR, graph_grammar } from "$lib/parser-gen/parser-gen";
	import { Pane, Splitpanes } from "svelte-splitpanes";

  const grammar = $state(EXAMPLE_GRAMMAR);

  let no_terminals = $state(false);
</script>


<head>
	<title>Pushdown Verification</title>
</head>

<div class="flex h-dvh flex-col gap-2 p-2">
	<div class="flex flex-row items-center gap-5">
		<h1 class="grow">Parser Generator | <a href="../">back</a></h1>
	</div>

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