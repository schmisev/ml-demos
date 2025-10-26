<script lang="ts">
	import { rand, randint, randoisson } from '$lib';
	import { bernoulli, beta_distro, gamma_distro, poisson } from '$lib/inference';
	import gamma from '@stdlib/math-base-special-gamma';
	import { sequence } from '@sveltejs/kit/hooks';
	import { Chart, type ChartConfiguration, type ChartItem } from 'chart.js/auto';
	import { onMount } from 'svelte';

	// type CoinFace = 'H' | 'T';

	interface FootballScore {
		team_a: number;
		team_b: number;
	}

	type GoalSum = number;

	let lambda_goals_a = $state(2);
  let lambda_goals_b = $state(1);
	let played_games: FootballScore[] = $state([]);
	let event_sequence: GoalSum[] = $derived(
		played_games.map((g) => {
			return g.team_a + g.team_b;
		})
	);

	let last_n = $derived(event_sequence[event_sequence.length - 1]);
	let N = $derived(event_sequence.length);
	let S = $derived(event_sequence.reduce((a, b) => a + b, 0));
	let avg_n = $derived(S / event_sequence.length);

	let MLE: number[] = $state([]);
	let last_MLE = $derived(MLE[MLE.length - 1]);

	let MAP_beta: number[] = $state([]);
	let last_MAP_beta = $derived(MAP_beta[MAP_beta.length - 1]);

	let alpha = $state(4); // = b
	let beta = $state(2); // = p

	let fully_bayesian: number[] = $state([]);
	let last_fully_bayesian = $derived(fully_bayesian.at(-1));

  let range = 6;
	let resolution = $state(200);
	let distro_labels = $derived(new Array(resolution + 1).fill(1).map((v, i) => range * i / resolution));
	let beta_prior_distro = $derived(
    distro_labels.map((v) => gamma_distro(v, alpha, beta))
  );
	let beta_posterior_distro = $derived(
		distro_labels.map((v) => gamma_distro(v, alpha+S, beta+N))
	);

	$effect(() => {
		update_chart(distro_chart, false, distro_labels, beta_prior_distro, beta_posterior_distro);
	});

	function reset() {
		played_games = [];

		MLE = [];
		MAP_beta = [];
		fully_bayesian = [];

		reset_chart(estimates_chart);
	}

	function flip(force?: FootballScore) {
		if (force) {
			played_games.push(force);
		} else {
      // TODO: replace
      played_games.push({
        team_a: randoisson(lambda_goals_a, 100),
        team_b: randoisson(lambda_goals_b, 100),
      });
    }

		// calculate new estimates
		MLE.push(avg_n);
		MAP_beta.push((S + alpha - 1) / (beta + N));

    // negative binomial ???
    const r = alpha + S;
    const p = (beta + N) / (beta + N + 1);
		fully_bayesian.push(r * (1-p) / p);

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
						text: 'Predicted number of goals',
						display: true
					}
				},
				aspectRatio: 1.5,
				scales: {
					y: {
						min: 0,
						// max: 0
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
						text: 'Probability distributions of HEADS',
						display: true
					}
				},
				aspectRatio: 1.5,
				scales: {
					y: {
						min: 0
					},
				}
			},
			data: {
				labels: distro_labels,
				datasets: [
					{
						label: 'prior: Gamma(p, b)',
						data: beta_prior_distro,
						pointRadius: 0,
						pointHoverRadius: 0
					},
					{
						label: 'posterior: Gamma(p+S, b+N)',
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
	<h1>Scoring points | <a href="../">back</a></h1>
	<div class="flex flex-col gap-2">
		<div class="flex flex-row gap-2">
			<button class="border" onclick={() => flip()}>Play!</button>
			<button class="border" onclick={() => flipN(10)}>Play 10 times!</button>
			<button class="border" onclick={() => flipN(100)}>Play 100 times!</button>
			<button class="negative border" onclick={reset}>Reset!</button>
		</div>
	</div>
	<div>True &lambda;<sub>a</sub> = <input type="number" min="0" max="10" step="1" bind:value={lambda_goals_a} /></div>
  <div>True &lambda;<sub>b</sub> = <input type="number" min="0" max="10" step="1" bind:value={lambda_goals_b} /></div>
	<div>avg. goals: <b>{avg_n}</b> | sum of goals: <b>{S}</b></div>
	<div class="flex flex-row flex-wrap gap-2 border">
		Sequence:
		{#each played_games as game}
			<span><b>{game.team_a}:{game.team_b}</b></span>
		{/each}
	</div>
	<div class="flex flex-col gap-2">
		<div class="flex flex-row gap-2">
			<div class="light-border flex flex-col gap-2">
				<h2>MLE</h2>
				<div>&lambda;<sub>MLE</sub> = <b>{(last_MLE || 0).toFixed(2)}</b></div>
			</div>
			<div class="light-border flex flex-col gap-2">
				<h2>MAP</h2>
				<div>&lambda;<sub>MAP</sub> = <b>{(last_MAP_beta || 0).toFixed(2)}</b></div>
				<label>&alpha; = <input type="number" min="0" step="1" bind:value={alpha} /></label>
				<label>&beta; = <input type="number" min="0" step="1" bind:value={beta} /></label>
			</div>
			<div class="light-border">
				<h2>Fully Bayesian</h2>
				<div>&lambda;<sub>FB</sub> = <b>{(last_fully_bayesian || 0).toFixed(2)}</b></div>
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
