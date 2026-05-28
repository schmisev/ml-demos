<script lang="ts">
	import { Splitpanes, Pane } from 'svelte-splitpanes';
	import HuiDagre from '$lib/hui-graphs/HuiDagre.svelte';
	import {
		EMPTY,
		MA,
		PDS,
		tex_stack_regex,
		tex_stack_symbol
	} from '$lib/pushdown-verification/pds.svelte';
	import HuiElk from '$lib/hui-graphs/HuiElk.svelte';
	import { tex } from '$lib/mathjax';
	import { cat, char, choice, format_regex, seq, star } from '$lib/regex/regex';
	import { paper_1, PDS_EXAMPLES } from '$lib/pushdown-verification/configs';
	import { EMPTY_DEF, parse_pds } from '$lib/pushdown-verification/pds-parser';

	let src = $state(PDS_EXAMPLES["back and forth"]);

	const [pds_def, error] = $derived.by(() => {
		try {
			const def = parse_pds(src);
			return [def, 'No error found!'];
		} catch (e) {
			return [EMPTY_DEF(), '' + e];
		}
	});
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
		<Pane>
			<Splitpanes horizontal>
				<Pane class="relative flex flex-col gap-2 p-2">
          <select onchange={(ev) => src = ev.currentTarget.value}>
            {#each Object.entries(PDS_EXAMPLES) as example}
              <option value={example[1]}>{example[0]}</option>
            {/each}
          </select>
					<textarea class="h-full resize-none font-mono" bind:value={src}></textarea>
					<div>{error}</div>
				</Pane>
				<Pane class="relative flex flex-col gap-2 p-2">
					<h2 class="absolute bottom-2 left-2">{@html tex(`\\mathcal{P}`)}</h2>
					<div class="flex flex-col gap-2">
						{@html tex(
							`P = \\{ ${[...pds.locs.values().map((l) => `p^${l}`)].toSorted().join(',')} \\}`
						)}
						{@html tex(
							`\\Gamma = \\{ ${[...pds.alphabet.values().map((l) => tex_stack_symbol(l))].toSorted().join(',')} \\}`
						)}
						{@html tex(`\\Delta = \\{`)}
						{#each pds.rules as [from, popped, to, pushed]}
							<span class="pl-3"
								>{@html tex(
									`(p^${from}, ${tex_stack_symbol(popped)}) \\hookrightarrow (p^${to}, ${pushed.map((v) => tex_stack_symbol(v)).join('') || '\\epsilon'}),`
								)}</span
							>
						{/each}
						{@html tex(`\\}`)}
					</div>
				</Pane>

				<Pane class="relative flex flex-col gap-2 p-2">
					<div class="flex flex-row flex-wrap items-center gap-2">
						<button class="border" onclick={() => pds.step()}>Step</button>
						<button class="border bg-red-400" onclick={() => pds.reset()}>Reset</button>
						<button class="border bg-blue-300" onclick={() => copySvgAsImage('history')}
							>Copy</button
						>
					</div>

					<h2 class="absolute bottom-2 left-2">Run history</h2>

					<div class="min-h-0 grow p-10">
						<HuiDagre name={'history'} settings={{ rankdir: 'LR' }} graphDef={pds.graph_history()}
						></HuiDagre>
					</div>
				</Pane>
			</Splitpanes>
		</Pane>

		<Pane>
			<Splitpanes horizontal>
				<Pane class="relative flex flex-col gap-2 p-2">
					<div class="flex flex-row flex-wrap items-center gap-2">
						<button class="border" onclick={() => ma.extend()}>Extend</button>
						<button class="border bg-red-400" onclick={() => ma.reset()}>Reset</button>
						<div>
							Finding {@html tex(
								`Pre^*(C);  C = \\{ ${ma.targets.map((t) => `\\langle p^${t.loc}, ${tex_stack_regex(t.w)}\\rangle`)} \\}`
							)}
						</div>
					</div>
					<h2 class="absolute bottom-2 left-2">{@html tex(`\\mathcal{A}_${ma.index}`)}</h2>
					<HuiDagre settings={{ rankdir: 'LR' }} graphDef={ma.graph()}></HuiDagre>
				</Pane>
				<Pane class="relative">
					<h2 class="absolute bottom-2 left-2">PDS graph</h2>
					<HuiDagre settings={{ rankdir: 'LR', marginx: 10 }} graphDef={pds.graph()}></HuiDagre>
				</Pane>
			</Splitpanes>
		</Pane>
	</Splitpanes>
</div>
