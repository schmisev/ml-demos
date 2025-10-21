<script lang="ts">
	import { rand } from '$lib';
	import { bernoulli, beta_distro } from '$lib/inference';
	import { Chart, type ChartConfiguration, type ChartItem } from 'chart.js/auto';
	import { onMount } from 'svelte';

	type CoinFace = 'H' | 'T';

	let p_heads = $state(0.5);
	let event_sequence: CoinFace[] = $state([]);
	let n_heads = $state(0);
	let n_tails = $state(0);

	let MLE: number[] = $state([]);
	let last_MLE = $derived(MLE[MLE.length - 1]);

	let MAP_beta: number[] = $state([]);
	let last_MAP_beta = $derived(MAP_beta[MAP_beta.length - 1]);

	let a = $state(1);
	let b = $state(1);

	let fully_bayesian_theta = $derived((n_heads + a) / (n_heads + a + n_tails + b));
	let fully_bayesian: number[] = $state([]);
	let last_fully_bayesian = $derived(fully_bayesian.at(-1));

	let resolution = $state(50);
	let distro_labels = $derived(new Array(resolution + 1).fill(1).map((v, i) => i / resolution));
	let beta_prior_distro = $derived(distro_labels.map((v) => beta_distro(v, a, b)));
	let beta_posterior_distro = $derived(
		distro_labels.map((v) => beta_distro(v, a + n_heads, b + n_tails))
	);

	$effect(() => {
		update_chart(distro_chart, false, distro_labels, beta_prior_distro, beta_posterior_distro);
	});

	function reset() {
		event_sequence = [];
		n_heads = 0;
		n_tails = 0;

		MLE = [];
		MAP_beta = [];
		fully_bayesian = [];

		reset_chart(estimates_chart);
	}

	function flip(force?: CoinFace) {
		if (force) {
			event_sequence.push(force);
			force === 'H' ? n_heads++ : n_tails++;
		} else if (rand(0, 1) < p_heads) {
			event_sequence.push('H');
			n_heads++;
		} else {
			event_sequence.push('T');
			n_tails++;
		}

		// calculate new estimates
		MLE.push(n_heads / (n_heads + n_tails));
		MAP_beta.push((n_heads + a - 1) / (n_tails + n_heads + a + b - 2));
		fully_bayesian.push(bernoulli(fully_bayesian_theta, 1, 0));

		update_chart(
			estimates_chart,
			true,
			[MLE.length],
			[MLE.at(-1)!],
			[MAP_beta.at(-1)!],
			[fully_bayesian.at(-1)!]
		);
	}

	function flipN(n: number) {
		for (let i = 0; i < n; i++) {
			flip();
		}
	}

	function toPercent(v: number) {
		// if (isNaN(v)) return '???';
		return (v * 100).toFixed(2) + '%';
	}

	// charting stuff
	function update_chart(chart: Chart, just_push: boolean, labels: any[], ...datasets: number[][]) {
		if (!chart) {
			console.log(`No chart!`);
			return;
		}
		just_push ? chart.data.labels?.push(...labels) : (chart.data.labels = labels);
		chart.data.datasets.forEach((dataset, i) =>
			just_push ? dataset.data.push(...datasets[i]) : (dataset.data = datasets[i])
		);
		chart.update();
	}

	function reset_chart(chart: Chart) {
		chart.data.labels = [];
		chart.data.datasets.forEach((dataset) => (dataset.data = []));
		chart.update();
	}

	let estimates_canvas: HTMLCanvasElement;
	let estimates_chart: Chart;

	let distro_canvas: HTMLCanvasElement;
	let distro_chart: Chart;

	onMount(() => {
		estimates_chart = new Chart(estimates_canvas, {
			type: 'line',
			options: {
        plugins: {
          title: {
            text: "Predictive probability for HEADS",
            display: true,
          }
        },
				aspectRatio: 1.5,
				scales: {
					y: {
						min: 0,
						max: 1
					}
				}
			},
			data: {
				labels: [],
				datasets: [
					{
						label: 'MLE',
						data: [],
						pointRadius: 0,
						pointHoverRadius: 0
					},
					{
						label: 'MAP',
						data: [],
						pointRadius: 0,
						pointHoverRadius: 0
					},
					{
						label: 'Fully Bayesian',
						data: [],
						pointRadius: 0,
						pointHoverRadius: 0
					}
				]
			}
		});

		distro_chart = new Chart(distro_canvas, {
			type: 'line',
			options: {
        plugins: {
          title: {
            text: "Probability distributions of HEADS",
            display: true,
          }
        },
				aspectRatio: 1.5,
				scales: {
					y: {
						min: 0
					}
				}
			},
			data: {
				labels: distro_labels,
				datasets: [
					{
						label: 'prior: Beta(a, b)',
						data: beta_prior_distro,
						pointRadius: 0,
						pointHoverRadius: 0
					},
					{
						label: 'posterior: Beta(a+|H|, b+|T|)',
						data: beta_posterior_distro,
						pointRadius: 0,
						pointHoverRadius: 0
					}
				]
			}
		});
	});
</script>

<div class="flex flex-col gap-2 p-2">
	<h1>Flipping coins | <a href="../">back</a></h1>
	<div class="flex flex-col gap-2">
		<div class="flex flex-row gap-2">
			<button class="border" onclick={() => flip()}>Flip!</button>
			<button class="border" onclick={() => flip('H')}>&nbsp;H&nbsp;</button>
			<button class="border" onclick={() => flip('T')}>&nbsp;T&nbsp;</button>
			<button class="border" onclick={() => flipN(10)}>Flip 10 times!</button>
			<button class="border" onclick={() => flipN(100)}>Flip 100 times!</button>
			<button class="negative border" onclick={reset}>Reset!</button>
		</div>
	</div>
	<div>True p(H) = <input type="number" min="0" max="1" step="0.01" bind:value={p_heads} /></div>
	<div>heads (H): <b>{n_heads}</b> | tails (T): <b>{n_tails}</b></div>
	<div class="flex flex-row flex-wrap gap-2 border">
		Sequence:
		{#each event_sequence as event}
			<span style="color: {event === "H" ? "green" : "red"};" ><b>{event}</b></span>
		{/each}
	</div>
	<div class="flex flex-col gap-2">
		<div class="flex flex-row gap-2">
			<div class="light-border flex flex-col gap-2">
				<h2>MLE</h2>
				<div>p(F = H, &theta;<sub>MLE</sub>) = <b>{toPercent(last_MLE)}</b></div>
			</div>
			<div class="light-border flex flex-col gap-2">
				<h2>MAP</h2>
				<div>p(F = H, &theta;<sub>MAP</sub>) = <b>{toPercent(last_MAP_beta)}</b></div>
				<label>a = <input type="number" min="0" step="1" bind:value={a} /></label>
				<label>b = <input type="number" min="0" step="1" bind:value={b} /></label>
			</div>
			<div class="light-border">
				<h2>Fully Bayesian</h2>
				<div>p(F = H, <i>D</i>) = <b>{toPercent(last_fully_bayesian || NaN)}</b></div>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-2">
		<div>
			<canvas bind:this={estimates_canvas}></canvas>
		</div>
		<div>
			<canvas bind:this={distro_canvas}></canvas>
		</div>
	</div>
</div>
