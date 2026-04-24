<script lang="ts">
	import HuiDagre from '$lib/hui-graphs/HuiDagre.svelte';
	import HuiElk from '$lib/hui-graphs/HuiElk.svelte';
	import { EMPTY_DEF, parse_pda } from '$lib/pda/pda-parser';
	import { EMPTY, NPDA } from '$lib/pda/pda.svelte';

	let input_value = $state('000111');

	let def_str = $state(
		`> Note: stack grows to right
q_0 = p
# = Z
F = { r }
(p, 0, Z, p, Z A)
(p, 0, A, p, A A)
(p, ~, ~, q, ~)
(q, 1, A, q, ~)
(q, ~, Z, r, Z)
`
	);
	let [def, error] = $derived.by(() => {
		try {
			const def = parse_pda(def_str);
			return [def, 'No error found!'];
		} catch (e) {
			return [EMPTY_DEF(), '' + e];
		}
	});

	let pda = $derived(new NPDA(def));

	const example_def = {
		q_0: ['p'],
		Z: 'Z',
		delta: [
			['p', '0', 'Z', 'p', ['Z', 'A']],
			['p', '0', 'A', 'p', ['A', 'A']],
			['p', '', EMPTY, 'q', []],
			['q', '1', 'A', 'q', []],
			['q', '', 'Z', 'r', ['Z']]
		],
		F: ['r']
	};
</script>

<head>
	<title>NPDA</title>
</head>

<div class="flex flex-col p-2 h-dvh">
	<div class="flex flex-col gap-2">
		<h1>Nondeterministic Pushdown Automata | <a href="../">back</a></h1>
	</div>

	<div class="flex flex-col gap-2 grow">
		<div class="light-border flex flex-row flex-wrap gap-2">
			<div class="light-border">{pda.status}</div>
			<input bind:value={input_value} />
			<button
				class="border"
				onclick={() => {
					let char = input_value.at(0);
					if (!char) return;
          pda.comsumeSymbol(char);
          if (pda.status === "REJECTED") return;
					input_value = input_value.slice(1);
				}}>Consume</button
			>
      <button class="border bg-red-300" onclick={() => pda.reset()}>
        Reset
      </button>
		</div>

		<div class="grid grid-cols-2 gap-2 grow">
			<div class="flex flex-col gap-2">
				<textarea class="w-full grow font-mono" bind:value={def_str}></textarea>
				<div class="light-border">{error}</div>
			</div>

			<div class="flex flex-col">
        <div class="shrink">
				  <HuiDagre settings={{rankdir: "LR"}} graphDef={pda.graph()}></HuiDagre>
        </div>
				<div class="flex flex-row flex-wrap gap-2">
					{#each pda.state.entries() as [state, stack]}
						<div class="light-border flex flex-col gap-1">
							<div class="border bg-green-300 text-center font-black">
								{state}
							</div>
							<div class="light-border flex flex-col shadow-xl">
								{#each stack as options, o}
									<div class="flex flex-row items-center gap-1">
										<div class="font-bold">{o}</div>
										<div class="flex flex-row gap-0 rounded border-2 bg-white p-1 shadow-md">
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
        
      </div>
		</div>
	</div>
</div>
