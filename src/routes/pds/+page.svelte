<script lang="ts">
	import { Splitpanes, Pane } from 'svelte-splitpanes';
	import HuiDagre from '$lib/hui-graphs/HuiDagre.svelte';
	import {
		EMPTY,
		MA,
		PDS,
		tex_config,
		tex_loc,
		tex_reg_config,
		tex_stack_regex,
		tex_stack_symbol
	} from '$lib/pushdown-verification/pds.svelte';
	import HuiElk from '$lib/hui-graphs/HuiElk.svelte';
	import { tex } from '$lib/mathjax';
	import { cat, char, choice, format_regex, seq, star } from '$lib/regex/regex';
	import { paper_1, PDS_EXAMPLES, PROGRAM_EXAMPLES } from '$lib/pushdown-verification/configs';
	import { EMPTY_DEF, parse_pds } from '$lib/pushdown-verification/pds-parser';
	import { nnf_neg, tex_ltl_expr } from '$lib/pushdown-verification/pds-ltl';
	import TexPDS from '$lib/pushdown-verification/TexPDS.svelte';
	import {
		graph_mini,
		MiniKind,
		parse_mini,
		type MiniProgram
	} from '$lib/pushdown-verification/minilang-parser';
	import { generate_cfg, graph_cfg, type CFG_Node } from '$lib/pushdown-verification/minilang-cfg';
	import { cfg_to_pds } from '$lib/pushdown-verification/minilang-pds';
	import CodeMirror from 'svelte-codemirror-editor';
	import { miniLanguageSupport, miniHighlightStyle } from '$lib/pushdown-verification/minilang-ext';
	import { syntaxHighlighting } from '@codemirror/language';
	import { basicSetup } from 'codemirror';

  let flags = $state({ color: true, ltl: false, tex: false, from_mini_lang: false, show_parser_info: false });
	let mini_src = $state(PROGRAM_EXAMPLES['error & work']);


	let [mini_def, mini_error]: [MiniProgram, string] = $derived(
		await (async () => {
			try {
				const def = parse_mini(mini_src);
				return [def, 'No error found!'];
			} catch (e) {
				return [{ kind: MiniKind.Program, func_defs: [], loc: '0' }, '' + e];
			}
		})()
	);

	const [cfg_def, cfg_error]: [Record<string, CFG_Node>, string] = $derived(
		await (async () => {
			try {
				const def = generate_cfg(mini_def);
				return [def, 'No error found!'];
			} catch (e) {
				const def: Record<string, CFG_Node> = {};
				return [def, '' + e];
			}
		})()
	);

	let src = $state(PDS_EXAMPLES['match brackets']);
	let mode: { structure?: boolean; pre?: boolean; history?: boolean } = $state({
		structure: true,
		history: true,
		pre: false
	});

	const [pds_def, error] = $derived(
		await (async () => {
			try {
				if (flags.from_mini_lang) {
					const def = cfg_to_pds(cfg_def);
					return [def, 'No error found!'];
				} else {
					const def = parse_pds(src);
					return [def, 'No error found!'];
				}
			} catch (e) {
				return [EMPTY_DEF(), '' + e];
			}
		})()
	);
	const nnf_phi = $derived(nnf_neg(pds_def.phi));
	const pds = $derived(new PDS(pds_def.initial_configs, pds_def.rules));

	const ma = $derived(new MA(pds_def.target_configs, pds));
</script>

<head>
	<title>Pushdown Verification</title>
</head>

<div class="flex h-dvh flex-col gap-2 p-2">
	<div class="flex flex-row items-center gap-5">
		<h1 class="grow">Pushdown Verification | <a href="../">back</a></h1>
	</div>

	<div class="flex flex-row flex-wrap gap-1">
		<label class="light-border flex flex-row items-center gap-2"
			><input type="checkbox" bind:checked={mode.pre} /> Pre*</label
		>
		<label class="light-border flex flex-row items-center gap-2"
			><input type="checkbox" bind:checked={mode.history} /> History</label
		>
		<label class="light-border flex flex-row items-center gap-2"
			><input type="checkbox" bind:checked={mode.structure} /> Structure</label
		>
		<label class="light-border flex flex-row items-center gap-2"
			><input type="checkbox" bind:checked={flags.from_mini_lang} /> Use mini-lang</label
		>
		{#if flags.from_mini_lang}
			<label class="light-border flex flex-row items-center gap-2"
				><input type="checkbox" bind:checked={flags.show_parser_info} /> Parser info</label
			>
		{/if}
	</div>

	<Splitpanes class="min-h-0 grow">
		<Pane size={30}>
			<Splitpanes horizontal>
				<Pane class="relative flex flex-col gap-2 p-2">
					{#if flags.from_mini_lang}
						<div class="flex flex-row gap-2">
							<select class="grow" onchange={(ev) => (mini_src = ev.currentTarget.value)}>
								{#each Object.entries(PROGRAM_EXAMPLES) as example}
									<option value={example[1]}>{example[0]}</option>
								{/each}
							</select>
						</div>
						<CodeMirror
							extensions={[
								basicSetup,
								miniLanguageSupport(),
								syntaxHighlighting(miniHighlightStyle)
							]}
							class="grow"
							foldGutter={false}
							indentOnInput={true}
							bind:value={mini_src}
						></CodeMirror>
						<div>{mini_error}</div>
					{:else}
						<div class="flex flex-row gap-2">
							<select class="grow" onchange={(ev) => (src = ev.currentTarget.value)}>
								{#each Object.entries(PDS_EXAMPLES) as example}
									<option value={example[1]}>{example[0]}</option>
								{/each}
							</select>
						</div>
						<textarea class="h-full resize-none font-mono" bind:value={src}></textarea>
					{/if}
				</Pane>
				<Pane class="relative flex flex-col gap-2 p-2">
					<h2 class="absolute bottom-2 left-2">{@html tex(`\\mathcal{P}`)}</h2>
					<TexPDS {pds}></TexPDS>
					<div>{error}</div>
				</Pane>
			</Splitpanes>
		</Pane>

		<Pane>
			<Splitpanes horizontal>
				{#if mode.structure}
					<Pane class="relative">
						<h2 class="absolute bottom-2 left-2">PDS graph</h2>
						<HuiDagre settings={{ rankdir: 'LR', marginx: 10 }} graphDef={await pds.graph()}></HuiDagre>
					</Pane>
				{/if}
				{#if mode.history}
					<Pane class="relative flex flex-col gap-2 p-2">
						<div class="flex flex-row flex-wrap items-center gap-2">
							<button class="border" onclick={() => pds.step()}>Step</button>
							<button class="border bg-red-400" onclick={() => pds.reset()}>Reset</button>
							<label class="light-border flex flex-row items-center gap-2">
								<input type="checkbox" bind:checked={flags.tex} />
								Tex?
							</label>
							<label class="light-border flex flex-row items-center gap-2"
								><input bind:value={pds.until_time} type="range" min={0} max={pds.time} />
								{pds.until_time} / {pds.time}</label
							>
						</div>

						<div class="min-h-0 grow p-1">
							<HuiDagre
								name={'history'}
								settings={{ rankdir: 'LR', ranker: 'network-simplex' }}
								graphDef={await pds.graph_history(flags.tex, flags.color)}
							></HuiDagre>
						</div>
					</Pane>
				{/if}
				{#if flags.show_parser_info}
					{#if flags.from_mini_lang}
						<Pane class="relative flex flex-col gap-2 p-2">
							<HuiElk graphDef={await graph_mini(mini_def)}></HuiElk>
						</Pane>
					{/if}
					{#if flags.from_mini_lang}
						<Pane class="relative flex flex-col gap-2 p-2">
							<HuiDagre graphDef={await graph_cfg(cfg_def)}></HuiDagre>
							<div>{cfg_error}</div>
						</Pane>
					{/if}
				{/if}
				{#if mode.pre}
					<Pane class="relative flex flex-col gap-2 p-2">
						<div class="flex flex-row flex-wrap items-center gap-2">
							<button class="border" onclick={() => ma.extend()}>Extend</button>
							<button class="border bg-red-400" onclick={() => ma.reset()}>Reset</button>
							<label class="light-border flex flex-row items-center gap-2">
								<input type="checkbox" bind:checked={flags.ltl} />
								Show LTL
							</label>
							<label class="light-border flex flex-row items-center gap-2"
								><input bind:value={ma.until_index} type="range" min={0} max={ma.index} />
								{ma.index} / {ma.index}</label
							>

							<div>
								Finding {@html tex(
									`Pre^*(C);  C = ${ma.targets.map((t) => tex_reg_config(t)).join('\\cup')} `
								)}
							</div>

							<div class="absolute top-0 right-0 flex flex-col p-2">
								<div>Reachable from...</div>
								{#each pds_def.initial_configs as init}
									<div class="flex flex-row items-center gap-1">
										{@html tex(tex_config(init))}
										{#if ma.check_config(init)}
											<div class="font-black text-green-700">✓</div>
										{:else}
											<div class="font-black text-red-700">⨉</div>
										{/if}
									</div>
								{/each}
							</div>
						</div>
						{#if flags.ltl}
							<div class="flex flex-row flex-wrap items-center gap-4">
								<div>{@html tex(`\\Lambda:`)}</div>
								{#each pds_def.lambda.entries() as [state, props]}
									<div>
										{@html tex(
											`${tex_loc(state)} \\mapsto ${[...props.values()].map((v) => `\\boldsymbol{${v}}`).join(' \\wedge ')}`
										)}
									</div>
								{/each}
							</div>
							<div>{@html tex('\\varphi = ' + tex_ltl_expr(pds_def.phi))}</div>
							<div>{@html tex('\\neg\\varphi = ' + tex_ltl_expr(nnf_phi))}</div>
						{/if}

						<h2 class="absolute bottom-2 left-2">{@html tex(`\\mathcal{A}_${ma.index}`)}</h2>
						<HuiElk settings={{}} graphDef={await ma.graph()}></HuiElk>
					</Pane>
				{/if}
			</Splitpanes>
		</Pane>
	</Splitpanes>
</div>
