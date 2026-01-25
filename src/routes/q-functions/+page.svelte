<script lang="ts">
	import ArrowIcon from '$lib/images/arrow-up.svg';
	import CrossIcon from '$lib/images/simple-cross.svg';
	import BotIcon from '$lib/images/bot-2.svg';
	import CheckIcon from '$lib/images/check.svg';
	import { Q_World } from '$lib/q-functions.svelte';

	let world = new Q_World(5, 5, 0.1, 0.77, 0, 0.01);
	let stochastic_iterations = $state(5);
	let init_reward = $state(-0.01);
	let init_Q = $state(0.0);

	function Q_to_color(Q: number): string {
		const s = Q;
    const neg = Math.max(0, -Q);
    const pos = Math.max(0, Q);
		return `rgba(${255 - neg * 255}, 255, ${255 - pos * 255})`;
	}

	function Q_to_scale(Q: number): string {
		return 20 + (Q < 0 ? 0 : Q > 1 ? 80 : Q * 80) + '%';
	}

	function step() {
		world.full_step();
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
</script>

<head>
	<title>Q-Functions</title>
</head>

<div class="flex flex-col gap-2 p-2">
	<div class="flex flex-row items-center gap-5">
		<h1 class="grow">Q-Functions | <a href="../">back</a></h1>
	</div>

	<div class="flex flex-row gap-2">
		<button class="border" onclick={() => world.reset_Q(init_Q)}>Reset Q-Function</button>
		<label
			>Q<sub>0</sub> =
			<input type="number" min="-1" max="1" step="0.01" bind:value={init_Q} /></label
		>
		<button class="border" onclick={() => world.reset_R(init_reward)}>Reset Rewards</button>
		<label>R = <input type="number" min="-1" max="1" step="0.01" bind:value={init_reward} /></label>
	</div>
	<div class="flex flex-row gap-2">
		<button class="border" onclick={() => world.full_step()}>Full iteration</button>
		<button class="border" class:negative={is_autostepping} onclick={() => autostep()}
			>Autostep iterations</button
		>
		<label
			>&alpha; = <input
				type="number"
				step="0.1"
				min="0"
				max="1"
				bind:value={world.learning_rate}
			/></label
		>
		<label
			>&gamma; = <input
				type="number"
				step="0.1"
				min="0"
				max="1"
				bind:value={world.discount_factor}
			/></label
		>
	</div>
	<div class="flex flex-row gap-2">
		<button class="flex flex-row items-center gap-2 border" onclick={() => world.bot_step()}>
			<img
				alt="bot"
				class="w-5"
				style="filter: drop-shadow(0.1rem 0.1rem 0.3rem rgba(0,0,0,0.2));"
				src={BotIcon}
			/>
			<span> Move Bot</span></button
		>
	</div>

	<div
		class="grid w-max border"
		style="grid-template-columns: repeat({world.width}, minmax(0, 1fr)); grid-template-rows: repeat({world.height}, minmax(0, 1fr));"
	>
		{#each world.grid as row, y}
			{#each row as cell, x}
				{@const left = cell.moves.get('left') || 0}
				{@const right = cell.moves.get('right') || 0}
				{@const up = cell.moves.get('up') || 0}
				{@const down = cell.moves.get('down') || 0}
				{@const R = cell.reward}
				<div
					class="flex aspect-square w-35 flex-col border-1 {cell.is_accesible
						? 'bg-white'
						: 'bg-gray-500'}"
				>
					<div class="grid h-full text-center grid-cols-3 grid-rows-3">
						<div class="text-xs">({x},{y})</div>
						<div title={up.toFixed(2)}>
							<img alt="up" style="scale: {Q_to_scale(up)};" src={ArrowIcon} />
						</div>
						<button
							class="not-hover:opacity-0"
							onclick={() => (cell.is_accesible = !cell.is_accesible)}
						>
							{#if cell.is_accesible}
								<img alt="hide" class="scale-50" src={CrossIcon} />
							{:else}
								<img alt="show" class="scale-50" src={CheckIcon} />
							{/if}
						</button>
						<div title={left.toFixed(2)}>
							<img
								alt="left"
								style="scale: {Q_to_scale(left)}"
								class="rotate-270"
								src={ArrowIcon}
							/>
						</div>
						<button
							class="flex flex-col rounded border-2"
              style="background-color: {Q_to_color(R)}; border-color: rgba(0, 0, 0, 0.2)"
						>
              <div class="not-hover:opacity-0">
							{#if cell.is_accesible}
								<div class="text-xs">R={cell.reward.toFixed(2)}</div>
								<input
									color="blue"
									type="range"
									step="0.01"
									max="1"
									min="-1"
									style="accent-color: white;"
									class="h-full w-full text-xs"
									bind:value={cell.reward}
								/>
							{/if}
              </div>
						</button>
						<div title={right.toFixed(2)}>
							<img
								alt="right"
								style="scale: {Q_to_scale(right)}"
								class="rotate-90"
								src={ArrowIcon}
							/>
						</div>
						<button class="hover:bg-blue-200" onclick={() => world.put_bot_on_cell(cell)}>
							{#if world.bot.x === x && world.bot.y === y}
								<img
									alt="bot"
									class="scale-75"
									style="filter: drop-shadow(0.1rem 0.1rem 0.3rem rgba(0,0,0,0.2));"
									src={BotIcon}
								/>
							{/if}
						</button>
						<div title={down.toFixed(2)}>
							<img alt="bot" style="scale: {Q_to_scale(down)}" class="rotate-180" src={ArrowIcon} />
						</div>
						<div></div>
					</div>
				</div>
			{/each}
		{/each}
	</div>
</div>
