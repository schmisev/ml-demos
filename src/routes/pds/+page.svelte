<script lang="ts">
	import { Splitpanes, Pane } from 'svelte-splitpanes';
	import HuiDagre from '$lib/hui-graphs/HuiDagre.svelte';
	import { MA, PDS, tex_stack_regex } from '$lib/pushdown-verification/pds.svelte';
	import HuiElk from '$lib/hui-graphs/HuiElk.svelte';
	import { tex } from '$lib/mathjax';
	import { cat, char, choice, format_regex, seq, star } from '$lib/regex/regex';

	const pds = new PDS(
		[
			{ loc: '1', w: ['5'] },
			{ loc: '2', w: ['4'] }
		],
		[
			['2', '4', '2', ['1', '2']],
			['1', '5', '2', ['4', '3']],
			['1', '6', '1', []]
		]
	);

	const ma = new MA([
    { loc: '2', w: seq(char("1"), choice(char("2"), char("6")), star(char("3"))) },
    { loc: '2', w: seq(char("1")) }
    ], pds);
</script>

<head>
	<title>Pushdown Verification</title>
</head>

<div class="flex h-dvh flex-col gap-2 p-2">
	<div class="flex flex-row items-center gap-5">
		<h1 class="grow">Pushdown Verification | <a href="../">back</a></h1>
	</div>

	<Splitpanes class="min-h-0 grow">
		<Pane>
			<Splitpanes horizontal>
				<Pane class="relative p-2 flex flex-col gap-2">
          <h2 class="absolute bottom-2 left-2">{@html tex(`\\mathcal{P}`)}</h2>
          
          <div class="flex flex-col gap-2">
          {@html tex(`P = \\{ ${[...pds.locs.values().map(l => `p^${l}`)].toSorted().join(",")} \\}`)}
          {@html tex(`\\Gamma = \\{ ${[...pds.alphabet.values().map(l => `\\gamma_${l}`)].toSorted().join(",")} \\}`)}
          {@html tex(`\\Delta = \\{`)}
          {#each pds.rules as [from, popped, to, pushed]}
            <span class="pl-3">{@html tex(`(p^${from}, \\gamma_${popped}) \\hookrightarrow (p^${to}, ${pushed.map(v => `\\gamma_${v}`).join("") || "\\epsilon"}),`)}</span>
          {/each}
          {@html tex(`\\}`)}
          </div>
        </Pane>

				<Pane class="relative flex flex-col gap-2 p-2">
					<div class="flex flex-row flex-wrap items-center gap-2">
						<button class="border" onclick={() => pds.step()}>Step</button>
						<button class="border bg-red-400" onclick={() => pds.reset()}>Reset</button>
					</div>

					<h2 class="absolute bottom-2 left-2">Run history</h2>

					<HuiDagre settings={{ rankdir: 'LR' }} graphDef={pds.graph_history()}></HuiDagre>
				</Pane>
			</Splitpanes>
		</Pane>

		<Pane>
			<Splitpanes horizontal>
				<Pane class="relative flex flex-col gap-2 p-2">
					<div class="flex flex-row flex-wrap items-center gap-2">
						<button class="border" onclick={() => ma.extend()}>Extend</button>
						<button class="border bg-red-400" onclick={() => ma.reset()}>Reset</button>
            <div>Finding {@html tex(`Pre^*(C);  C = \\{ ${ma.targets.map(t => `\\langle p^${t.loc}, ${tex_stack_regex(t.w)}`)} \\}`)} </div>
          </div>
					<h2 class="absolute bottom-2 left-2">{@html tex(`\\mathcal{A}_${ma.index}`)}</h2>
					<HuiDagre settings={{ rankdir: 'LR' }} graphDef={ma.graph()}></HuiDagre>
				</Pane>
				<Pane class="relative">
					<h2 class="absolute bottom-2 left-2">PDS graph</h2>
					<HuiElk graphDef={pds.graph()}></HuiElk>
				</Pane>
			</Splitpanes>
		</Pane>
	</Splitpanes>
</div>
