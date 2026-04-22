<script lang="ts">
	import HuiElk from '$lib/hui-graphs/HuiElk.svelte';
	import { NPDA } from '$lib/pda/pda.svelte';

  let input_value = $state("000111");

	const pda = new NPDA(
		['p'],
		'Z',
		[
			['p', '0', 'Z', 'p', ['Z', 'A']],
			['p', '0', 'A', 'p', ['A', 'A']],
			['p', '', 'A', 'q', ['A']],
			['p', '', 'Z', 'q', ['Z']],
			['q', '1', 'A', 'q', []],
			['q', '', 'Z', 'r', ['Z']]
		],
		['r']
	);
</script>

<head>
	<title>NPDA</title>
</head>

<div class="flex flex-col p-2">
	<div class="flex flex-col gap-2">
		<h1>Nondeterministic Pushdown Automata | <a href="../">back</a></h1>
	</div>

	<div class="flex flex-col gap-2">
    <div class="light-border flex flex-row gap-2">
      <div class="light-border">{pda.status}</div>
      <input bind:value={input_value}>
      <button class="border" onclick={() => {
        let char = input_value.at(0);
        if (!char) return;
        input_value = input_value.slice(1);
        pda.comsumeSymbol(char);
      }}>Consume</button>
    </div>
    <div class="flex flex-row gap-2">
      {#each pda.state.entries() as [state, stack]}
        <div class="light-border flex flex-col gap-2">
          <div class="bg-green-300 border text-center font-black">
            {state}
          </div>
          <div class="shadow-xl flex flex-col light-border">
            {#each stack as options, o}
              <div class="flex flex-row items-center gap-2">
              <div class="font-bold">{o}</div>
              <div class="bg-white shadow-md border-2 rounded p-2 flex flex-row gap-0">
              {#each options as sym}
                <div>{sym}</div>
              {/each}
              </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
    <div>
      <HuiElk graphDef={pda.graph()}></HuiElk>
    </div>
  </div>
</div>
