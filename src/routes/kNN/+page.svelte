<script lang="ts">
	import { euclid, rand, randint, weight, type Bias, type DataPoint } from '$lib';
	import { onMount } from 'svelte';

	let cvs: HTMLCanvasElement;

	// generate data
	let k = $state(1);
	let data: DataPoint[] = [];
	let categoryColors = [
		['red', 'lightcoral'],
		['blue', 'lightblue'],
		['green', 'lightgreen'],
		['orange', 'yellow'],
		['gray', 'whitesmoke'],
		['pink', 'lightpink'],
		['black', 'gray']
	];

	let categoryCount: number = 0;
	let categoryProps: Bias[] = [];
	let dataCount: number = $state(50);
	let weighted: boolean = $state(false);
	let mix: boolean = $state(false);

	onMount(() => {
		makeUpData();
		drawData();
	});

	$effect(() => {
		drawData();
	});

	function update() {
		makeUpData();
		drawData();
	}

	function makeUpData() {
		categoryCount = 0;
		categoryProps = [];
		data = [];

		categoryCount = randint(2, categoryColors.length);
		categoryProps = new Array<Bias>();
		for (let i = 0; i < categoryCount; i++) {
			categoryProps.push({
				dx: rand(0, 1),
				dy: rand(0, 1),
				ax: rand(0, 0.5),
				ay: rand(0, 0.5),
				tilt: rand(0, Math.PI * 2)
			});
		}

		for (let i = 0; i < dataCount; i++) {
			let category = randint(0, categoryCount);
			let props = categoryProps[category];
			const { dx, dy, ax, ay, tilt } = props;

			const offx = ax * rand(-1, 1);
			const offy = ay * rand(-1, 1);

			data.push({
				category,
				x: dx + Math.cos(tilt) * offx + Math.sin(tilt) * offy,
				y: dy + Math.sin(tilt) * offx + Math.cos(tilt) * offy
			});
		}
	}

	function drawData() {
		const g = 5;
		const w = 500;
		const h = 500;

		cvs.width = w;
		cvs.height = h;

		const ctx = cvs.getContext('2d')!;
    ctx.clearRect(0, 0, w, h);
		ctx.save();

		// draw colored grid
		start: for (let x = 0; x < w; x += g) {
			for (let y = 0; y < h; y += g) {
				const cx = x + g / 2;
				const cy = y + g / 2;

				// kNN
				const neighbors: { sample: DataPoint; distance: number }[] = [];
				const buckets = new Array<number>(categoryCount).fill(0);
				for (let sample of data) {
					const distance = euclid(sample.x * w, sample.y * h, cx, cy);
					if (neighbors.length < k) {
						neighbors.push({ sample, distance });
						buckets[sample.category] += weighted ? weight(distance) : 1;
						neighbors.sort((a, b) => a.distance - b.distance);
					} else if (neighbors.at(-1)!.distance > distance) {
						const removed = neighbors.pop()!;
						buckets[removed.sample.category] -= weighted ? weight(removed.distance) : 1;

						neighbors.push({ sample, distance });
						buckets[sample.category] += weighted ? weight(distance) : 1;

						neighbors.sort((a, b) => a.distance - b.distance);
					}
				}

				// argmax
				
				ctx.save();
				if (mix) {
					const sum = buckets.reduce((a, b) => a + b);
					for (let [catergory, count] of buckets.entries()) {
						ctx.globalAlpha = Math.max(0, count / sum);

						ctx.beginPath();
						ctx.fillStyle = categoryColors[catergory][1];
						ctx.rect(x, y, g, g);
						ctx.fill();
					}
				} else {
					let maxcount = 0;
					let chosenCategory = -1;
					for (let [category, count] of buckets.entries()) {
						if (count >= maxcount) {
							maxcount = count;
							chosenCategory = category;
						}
					}

					if (chosenCategory >= 0) {
						ctx.beginPath();
						ctx.fillStyle = categoryColors[chosenCategory][1];
						ctx.rect(x, y, g, g);
						ctx.fill();
					}
				}
				ctx.restore();
			}
		}

		// draw data
		ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
		ctx.shadowOffsetX = 2;
		ctx.shadowOffsetY = 2;
		ctx.shadowBlur = 2;
		for (const sample of data) {
			ctx.beginPath();
			ctx.ellipse(sample.x * w, sample.y * h, 3, 3, 0, 0, Math.PI * 2);
			ctx.fillStyle = categoryColors[sample.category][0];
			ctx.fill();
		}
		ctx.restore();
	}
</script>

<div class="p-2">
	<h1>kNN</h1>

	<canvas bind:this={cvs}> </canvas>

	<label>k=<input type="number" bind:value={k} /></label>
	<label>N=<input type="number" bind:value={dataCount} max="200" min="1" onchange={update} /></label
	>
	<label>weighted=<input type="checkbox" bind:checked={weighted} /></label>
	<label>mix colors=<input type="checkbox" bind:checked={mix} /></label>
</div>
