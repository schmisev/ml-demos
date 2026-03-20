<script lang="ts">
	import { BF_VM } from '$lib/brainfck/bainfck_vm.svelte';
	import {
		BF_Cmd,
		BF_HELLO_WORLD,
		BF_NAME_TO_SPEC,
		BF_OP_TO_SPEC,
		compile,
		type BF_Program
	} from '$lib/brainfck/brainfck';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { replaceState } from '$app/navigation';
	import { vmul } from '$lib/vector';
	import { MediaQuery } from 'svelte/reactivity';

	let compress_inputs = $state(false);
	let src = $state(BF_HELLO_WORLD);
	let [program, error]: [BF_Program, string] = $derived.by(() => {
		try {
			const program = compile(src, { compress_inputs });
			return [program, 'Compiled successfully!'];
		} catch (e) {
			return [{ cmds: [{ instr: BF_Cmd.END, data: 0 }] }, '' + e];
		}
	});

	onMount(() => {
		const url_src = page.url.searchParams.get('src');
		if (!url_src) return;

		src = decodeURI(url_src);
	});

	$effect(() => {
		const url_src = encodeURI(src);
		const query = new URL(page.url);
		query.searchParams.set('src', url_src);
		replaceState(query.toString(), page.state);
	});

	let vm = $derived(
		new BF_VM(program, 'Hallo', () => {
			stop_autostep();
		})
	);

	function step() {
		vm._step();
	}

	function run() {
		if (vm.in_done_state || vm.in_done_state) {
			vm.reset();
		}
		autostep();
	}

	function reset() {
		stop_autostep();
		vm.reset();
	}

	function execute() {
		stop_autostep();
		vm.execute();
	}

	// autostepping
	let is_autostepping = $state(false);
	let autostep_timer: number | undefined = undefined;

	function autostep() {
		is_autostepping = !is_autostepping;

		if (is_autostepping) {
			autostep_timer = setInterval(step, 100);
		} else if (autostep_timer !== undefined) {
			clearInterval(autostep_timer);
		}
	}

	function stop_autostep() {
		is_autostepping = false;
		if (autostep_timer) clearInterval(autostep_timer);
	}

  const large = new MediaQuery('min-width: 800px');
</script>

<head>
	<title>Super-Brainf*ck</title>
</head>

<div class="flex {large.current ? "h-dvh" : ""} flex-col gap-2 p-2">
	<h1>Super-Brainf*ck | <a href="../">back</a></h1>

	<div class="flex flex-row items-center flex-wrap gap-2">
			<div>{error}</div>
			<!--label><input type="checkbox" bind:checked={compress_inputs} /> Compress commands</label-->

		<button
			class="special border"
			onclick={() => {
				stop_autostep();
				step();
			}}>Do</button
		>
		<button class="border" onclick={run}>Run</button>
		<button class="border" onclick={execute}>Execute</button>
		<button class="negative border" onclick={reset}>Reset</button>
		<div>Input:</div><input bind:value={vm.input} />
	</div>

	<div class="flex flex-col gap-2">
		<div class="flex flex-row flex-wrap items-center gap-2">
			<h2>Tape</h2>
			<div class="light-border">
				<b class="text-blue-500">blue</b> = Instruction Pointer, 
				<b class="text-red-500">red</b> = Data Pointer, is in {#if vm.in_cmd_mode}
					<b>INSTR</b>
				{:else}
					<b>DATA</b>
				{/if} read/write mode
			</div>
		</div>

		<div class="flex flex-row flex-wrap gap-1.5 p-2 text-xs">
			{#each vm.tape as val, tape_ptr}
				{@const name = BF_OP_TO_SPEC.get(val.instr)?.char || val.instr}
				<div
					title={`${name}(${val.data}) @ ${tape_ptr}`}
					class="rounded text-center font-mono outline-2"
				>
					<div
						class="pl-1 pr-1 {val.instr === BF_Cmd.END ? 'bg-gray-300' : ''} {tape_ptr === vm.instr_ptr
							? 'rounded font-black text-blue-500 outline-3 -outline-offset-3 outline-blue-500'
							: ''} {tape_ptr === vm.data_ptr && vm.in_cmd_mode ? 'bg-red-300' : ''}"
					>
						<b>{name}</b>
					</div>
					<div class="border-t-1 {tape_ptr === vm.data_ptr && !vm.in_cmd_mode ? 'bg-red-300' : ''}">
						{val.data}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<div class="border border-black bg-gray-700 font-mono text-green-400">
		<div>OUTPUT</div>
		<div>======</div>
		{vm.output}
	</div>

	<div class="grid min-h-0 grow {large.current ? "grid-cols-2" : "grid-cols-1"} gap-2">

		<textarea class="w-full {large.current ? "" : "min-h-50"} border font-mono" bind:value={src}></textarea>
		<div class="min-h-0 overflow-auto">
			<h2>Rules</h2>
			<table class="w-full overflow-hidden rounded-md border-2 shadow">
				<thead>
					<tr class="bg-gray-300">
						<th>Symbol</th>
						<th>Value</th>
						<th>Description</th>
					</tr>
				</thead>
				<tbody class="bg-white">
					{#each Object.entries(BF_NAME_TO_SPEC).toSorted((a, b) => a[1].op - b[1].op) as [name, spec]}
						<tr>
							<td class="text-center font-mono font-bold">{spec.char}</td>
							<td class="text-center font-mono">{spec.op}</td>
							<td>{@html spec.description}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

	</div>
</div>
