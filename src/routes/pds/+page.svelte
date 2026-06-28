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
	import { paper_1, PDS_EXAMPLES } from '$lib/pushdown-verification/configs';
	import { EMPTY_DEF, parse_pds } from '$lib/pushdown-verification/pds-parser';
	import { nnf_neg, tex_ltl_expr } from '$lib/pushdown-verification/pds-ltl';
	import TexPDS from '$lib/pushdown-verification/TexPDS.svelte';

	let src = $state(PDS_EXAMPLES['match brackets']);
	let mode: { structure?: boolean; pre?: boolean; history?: boolean } = $state({
		structure: true,
		history: true,
		pre: true
	});
	let flags: { ltl: boolean; tex: boolean } = $state({ ltl: false, tex: false });

	const [pds_def, error] = $derived.by(() => {
		try {
			const def = parse_pds(src);
			return [def, 'No error found!'];
		} catch (e) {
			return [EMPTY_DEF(), '' + e];
		}
	});
	const nnf_phi = $derived(nnf_neg(pds_def.phi));
	const pds = $derived(new PDS(pds_def.initial_configs, pds_def.rules));

	const ma = $derived(new MA(pds_def.target_configs, pds));

	async function copySvgAsImage(name: string): Promise<void> {
		let svg: SVGSVGElement | null = document.querySelector(`svg#${name}.hui`);

		const svgData = new XMLSerializer().serializeToString(svg!);
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d')!;
		const img = new Image();

		return new Promise<void>((resolve, reject) => {
			img.onload = async () => {
				const scale = 1.0;
				canvas.width = img.width * scale;
				canvas.height = img.height * scale;

				ctx.scale(scale, scale);
				ctx.save();
				ctx.fillStyle = 'white';
				ctx.globalAlpha = 0.0;
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.restore();
				ctx.drawImage(img, 0, 0);

				canvas.toBlob(
					async (blob) => {
						if (!blob) return reject(new Error('Blob creation failed'));

						await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
						resolve();
					},
					'image/png',
					2.0
				);
			};

			img.onerror = () => reject(new Error('SVG processing failed'));
			img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
		});
	}
</script>

<head>
	<title>Pushdown Verification</title>
</head>

<div class="flex h-dvh flex-col gap-2 p-2">
	<div class="flex flex-row items-center gap-5">
		<h1 class="grow">Pushdown Verification | <a href="../">back</a></h1>
	</div>

	<Splitpanes class="min-h-0 grow">
		<Pane size={30}>
			<Splitpanes horizontal>
				<Pane class="relative flex flex-col gap-2 p-2">
					<div class="flex flex-row gap-2">
						<select onchange={(ev) => (src = ev.currentTarget.value)}>
							{#each Object.entries(PDS_EXAMPLES) as example}
								<option value={example[1]}>{example[0]}</option>
							{/each}
						</select>
						<select bind:value={mode}>
							<option selected value={{ structure: true }}>Structure</option>
							<option value={{ history: true }}>History</option>
							<option value={{ pre: true }}>Pre*</option>
							<option value={{ pre: true, structure: true }}>Structure + Pre*</option>
							<option value={{ structure: true, history: true }}>Structure + History</option>
							<option value={{ pre: true, history: true }}>History + Pre*</option>
						</select>
					</div>
					<textarea class="h-full resize-none font-mono" bind:value={src}></textarea>
					<div>{error}</div>
				</Pane>
				<Pane class="relative flex flex-col gap-2 p-2">
					<h2 class="absolute bottom-2 left-2">{@html tex(`\\mathcal{P}`)}</h2>
					<TexPDS {pds}></TexPDS>
				</Pane>
			</Splitpanes>
		</Pane>

		<Pane>
			<Splitpanes horizontal>
				{#if mode.structure}
					<Pane class="relative">
						<h2 class="absolute bottom-2 left-2">PDS graph</h2>
						<HuiDagre settings={{ rankdir: 'LR', marginx: 10 }} graphDef={pds.graph()}></HuiDagre>
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
								graphDef={pds.graph_history(flags.tex)}
							></HuiDagre>
						</div>
					</Pane>
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
						<HuiDagre settings={{ rankdir: 'LR' }} graphDef={ma.graph()}></HuiDagre>
					</Pane>
				{/if}
			</Splitpanes>
		</Pane>
	</Splitpanes>
</div>
