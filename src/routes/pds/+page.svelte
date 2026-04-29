<script lang="ts">
	import { Splitpanes, Pane } from 'svelte-splitpanes';
	import HuiDagre from '$lib/hui-graphs/HuiDagre.svelte';
	import { MA, PDS } from '$lib/pushdown-verification/pds.svelte';
	import HuiElk from '$lib/hui-graphs/HuiElk.svelte';

	const pds = new PDS(
		[
			{ loc: '1', stack: ['5'] },
			{ loc: '2', stack: ['4'] }
		],
		[
			['2', '4', '2', ['1', '2']],
			['1', '5', '2', ['4', '3']],
			['1', '6', '1', []]
		]
	);

  const ma = new MA(
    [{loc: "2", stack: ["1", "2", "3"]}],
    pds
  )
</script>

<head>
	<title>Pushdown Verification</title>
</head>

<div class="flex h-dvh flex-col gap-2 p-2">
	<div class="flex flex-row items-center gap-5">
		<h1 class="grow">Pushdown Verification | <a href="../">back</a></h1>
	</div>

	<Splitpanes class="min-h-0 grow">
		<Pane class="relative flex flex-col gap-2 p-2">
			<div class="flex flex-row flex-wrap items-center gap-2">
				<button class="border" onclick={() => pds.step()}>Step</button>
				<button class="border bg-red-400" onclick={() => pds.reset()}>Reset</button>
			</div>

			<h2 class="absolute bottom-2 left-2">Run history</h2>

			<HuiDagre settings={{ rankdir: 'LR' }} graphDef={pds.graph_history()}></HuiDagre>
		</Pane>

		<Pane >
			<Splitpanes horizontal>
        <Pane class="relative flex flex-col gap-2 p-2">
          <div class="flex flex-row flex-wrap items-center gap-2">
            <button class="border" onclick={() => ma.extend()}>Extend</button>
            <button class="border bg-red-400" onclick={() => ma.reset()}>Reset</button>
          </div>
          <h2 class="absolute bottom-2 left-2">A<sub>{ma.index}</sub></h2>
          <HuiDagre settings={{rankdir: "LR"}} graphDef={ma.graph()}></HuiDagre>
        </Pane>
				<Pane class="relative">
					<h2 class="absolute bottom-2 left-2">PDS graph</h2>
					<HuiElk graphDef={pds.graph()}></HuiElk>
				</Pane>
			</Splitpanes>
		</Pane>
	</Splitpanes>
</div>
