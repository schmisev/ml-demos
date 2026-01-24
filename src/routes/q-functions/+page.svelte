<script lang="ts">
	import ArrowIcon from '$lib/images/arrow-up.svg';
	import { Q_World } from '$lib/q-functions.svelte';

	let world = new Q_World(5, 5, 0.1, 0.77, 0, 0.01);

	function Q_to_color(Q: number): string {
		const s = Q;
		return `rgba(${(1 - s) * 255}, ${s * 255}, 100)`;
	}

	function Q_to_scale(Q: number): string {
		return (Q < 0 ? 0 : Q > 1 ? 100 : Q * 100) + '%';
	}
</script>

<head>
	<title>Q-Functions</title>
</head>

<div class="flex flex-col gap-2 p-2">
	<div class="flex flex-row items-center gap-5">
		<h1 class="grow">Q-Functions | <a href="../">back</a></h1>
	</div>

	<div>
		<button class="border" onclick={() => world.full_step()}>Full iteration!</button>
	</div>

	<div
		class="grid border"
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
					class="flex aspect-square flex-col border-1 {cell.is_accesible ? 'bg-white' : 'bg-black'}"
				>
					<div class="grid h-full grid-cols-3 grid-rows-3 text-center">
						<div class="text-xs">({x},{y})</div>
						<div>
							<img style="scale: {Q_to_scale(up)};" src={ArrowIcon} />
						</div>
						<div></div>
						<div>
							<img style="scale: {Q_to_scale(left)}" class="rotate-270" src={ArrowIcon} />
						</div>
						<div>
							<input type="checkbox" bind:checked={cell.is_accesible} />
							{#if cell.is_accesible}
								<input
									color="blue"
									type="range"
									step="0.01"
									max="2"
									min="-2"
									style="accent-color: {Q_to_color(R)};"
									class="h-full w-full text-xs"
									bind:value={cell.reward}
								/>
							{/if}
						</div>
						<div>
							<img style="scale: {Q_to_scale(right)}" class="rotate-90" src={ArrowIcon} />
						</div>
						<div></div>
						<div>
							<img style="scale: {Q_to_scale(down)}" class="rotate-180" src={ArrowIcon} />
						</div>
						<div></div>
					</div>
				</div>
			{/each}
		{/each}
	</div>
</div>
